import { v4 as uuidv4 } from 'uuid';
import { HttpException } from '@exceptions/HttpException';
import { apiURL } from '@utils/util';
import { logger } from '@utils/logger';
import { redactPersonNumber } from '@utils/redactPersonNumber';
import { getSessionMarker } from '@utils/request-context';
import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';
import ApiTokenService from './api-token.service';
import https from 'https';

const agent = new https.Agent({ keepAlive: false });

const toLoggableUrl = (baseURL: string | undefined, url: string | undefined): string =>
  redactPersonNumber(`${baseURL ?? ''}/${url}`);

export class ApiResponse<T> {
  data: T;
  status?: number;
  message: string;
}

const apiTokenService = new ApiTokenService();

class ApiService {
  private readonly instance: AxiosInstance;
  constructor() {
    this.instance = axios.create();
    this.instance.interceptors.request.use(
      async function (request) {
        if (request.url === apiURL('token')) {
          return Promise.resolve(request);
        }
        const token = await apiTokenService.getToken();
        // NOTE: X-Request-Id is set in `request` below, so that the id is known at the
        // call site and can be reused when logging the response time for the call.
        const defaultHeaders = {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        };
        request.headers = { ...defaultHeaders, ...request.headers } as any;
        request.headers['Content-Type'] = request.headers['Content-Type'] ?? defaultHeaders['Content-Type'];
        return Promise.resolve(request);
      },
      function (error) {
        return Promise.reject(new Error(error));
      },
    );

    this.instance.interceptors.response.use(
      async function (response) {
        // TODO This is an ugly workaround for the fact that setting correct API version
        // in the location header is difficult for some APIs, such as Messaging
        // So, for Messaging specifically, we - for now - ignore the location header
        const token = await apiTokenService.getToken();
        const defaultHeaders = {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          'X-Request-Id': uuidv4(),
        };
        if (response.headers.location && !response.config.url.includes('messaging')) {
          logger.info(`Response contained location header: ${response.headers.location}`);
          logger.info(`Base URL was: ${response.config.baseURL}`);
          return axios
            .get(response.headers.location, { baseURL: response.config.baseURL, headers: defaultHeaders })
            .catch(e => {
              logger.error(`Error in location header request: ${e.details}`);
              logger.error(`Base URL was: ${e.config?.baseURL}`);
              logger.error(`URL was: ${e.config?.url}`);
              logger.error(`Method was: ${e.config?.method}`);
              return Promise.resolve(response);
            });
        }
        return Promise.resolve(response);
      },
      function (error) {
        return Promise.reject(error);
      },
    );
  }
  private async request<T>(config: AxiosRequestConfig, user: { username: string }): Promise<ApiResponse<T>> {
    const defaultParams = {};
    const requestId = uuidv4();
    const preparedConfig: AxiosRequestConfig = {
      ...config,
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
      headers: { ...config.headers, 'X-Sent-By': [`type=adAccount; ${user.username}`], 'X-Request-Id': requestId },
      params: { ...defaultParams, ...config.params },
      url: config.baseURL ? config.url : apiURL(config.url),
      httpAgent: agent,
      httpsAgent: agent,
    };
    let tries = 0;

    const logTiming = (startedAt: number, status: number | string) => {
      const duration = Date.now() - startedAt;
      const url = preparedConfig.baseURL ? `${preparedConfig.baseURL}/${preparedConfig.url}` : preparedConfig.url;
      logger.info(
        `API_TIMING sid=${getSessionMarker()} x-request-id=${requestId} method=${preparedConfig.method} status=${status} duration_ms=${duration} attempt=${tries} url=${redactPersonNumber(url)}`,
      );
    };

    const call = async () => {
      const startedAt = Date.now();
      try {
        const res = await this.instance(preparedConfig);
        logTiming(startedAt, res.status);
        return { data: res.data, message: 'success' };
      } catch (error) {
        const status = axios.isAxiosError(error) ? (error.response?.status ?? error.code ?? 'error') : 'error';
        logTiming(startedAt, status);
        throw error;
      }
    };

    while (tries < 3) {
      try {
        tries += 1;
        return await call();
      } catch (error: unknown | AxiosError) {
        if (axios.isAxiosError(error) && error.response?.status === 404) {
          logger.error(`ERROR: API request failed with status: ${error.response?.status}`);
          logger.error(`Error details: ${JSON.stringify(error.response.data)}`);
          logger.error(`Error url: ${toLoggableUrl(error.response.config.baseURL, error.response.config.url)}`);
          logger.error(`Error data: ${error.response.config.data}`);
          logger.error(`Error method: ${error.response.config.method}`);
          throw new HttpException(404, 'Not found');
        } else if (axios.isAxiosError(error) && error.response?.status === 409) {
          logger.error(`ERROR: API request failed with status: ${error.response?.status}`);
          logger.error(`Error details: ${JSON.stringify(error.response.data)}`);
          logger.error(`Error url: ${toLoggableUrl(error.response.config.baseURL, error.response.config.url)}`);
          logger.error(`Error data: ${error.response.config.data}`);
          logger.error(`Error method: ${error.response.config.method}`);
          throw new HttpException(409, 'Duplicate');
        } else if (axios.isAxiosError(error) && (error as AxiosError).response?.data) {
          logger.error(`ERROR: API request failed with status: ${error.response?.status}`);
          logger.error(`Error details: ${JSON.stringify(error.response.data)}`);
          logger.error(`Error url: ${toLoggableUrl(error.response.config.baseURL, error.response.config.url)}`);
          logger.error(`Error data: ${error.response.config.data}`);
          logger.error(`Error method: ${error.response.config.method}`);
          throw new HttpException(error.response.status ?? 500, 'API request failed');
        } else {
          logger.error(`Unknown error: ${error}`);
          if (preparedConfig.method === 'GET' && tries < 3) {
            logger.info(`Retrying... (${tries})`);
            continue;
          }
          throw new HttpException(500, 'Internal server error');
        }
      }
    }
  }

  public async get<T>(config: AxiosRequestConfig, user: { username: string }): Promise<ApiResponse<T>> {
    logger.info(`MAKING GET REQUEST TO URL ${toLoggableUrl(config.baseURL, config.url)}`);
    return this.request<T>({ ...config, method: 'GET' }, user);
  }

  public async post<T, D>(config: AxiosRequestConfig<D>, user: { username: string }): Promise<ApiResponse<T>> {
    logger.info(`MAKING POST REQUEST TO URL ${toLoggableUrl(config.baseURL, config.url)}`);
    return this.request<T>({ ...config, method: 'POST' }, user);
  }

  public async patch<T, D>(config: AxiosRequestConfig<D>, user: { username: string }): Promise<ApiResponse<T>> {
    logger.info(`MAKING PATCH REQUEST TO URL ${toLoggableUrl(config.baseURL, config.url)}`);
    return this.request<T>({ ...config, method: 'PATCH' }, user);
  }

  public async put<T, D>(config: AxiosRequestConfig<D>, user: { username: string }): Promise<ApiResponse<T>> {
    logger.info(`MAKING PUT REQUEST TO URL ${toLoggableUrl(config.baseURL, config.url)}`);
    return this.request<T>({ ...config, method: 'PUT' }, user);
  }

  public async delete<T>(config: AxiosRequestConfig, user: { username: string }): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, method: 'DELETE' }, user);
  }
}
export default ApiService;
