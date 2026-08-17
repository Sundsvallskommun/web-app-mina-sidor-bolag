import { v4 as uuidv4 } from 'uuid';
import { HttpException } from '@exceptions/HttpException';
import { apiURL } from '@utils/util';
import { logger } from '@utils/logger';
import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';
import ApiTokenService from './api-token.service';
import { UserType } from '@interfaces/users.interface';
import https from 'https';

const agent = new https.Agent({ keepAlive: false });

export class ApiResponse<T> {
  data: T;
  status?: number;
  message: string;
}

export type Sender = { username: string; userType?: UserType };

export const buildSentBy = (user: Sender): string =>
  `type=${user.userType === 'admin' ? 'adAccount' : 'partyId'}; ${user.username}`;

const apiTokenService = new ApiTokenService();

const MAX_TRIES = 3;

const buildRequestConfig = (config: AxiosRequestConfig, user: Sender): AxiosRequestConfig => ({
  ...config,
  maxContentLength: Infinity,
  maxBodyLength: Infinity,
  headers: { ...config.headers, 'X-Sent-By': [buildSentBy(user)] },
  params: { ...config.params },
  url: config.baseURL ? config.url : apiURL(config.url),
  httpAgent: agent,
  httpsAgent: agent,
});

const isClassifiedFailure = (error: unknown): error is AxiosError =>
  axios.isAxiosError(error) &&
  (error.response?.status === 404 || error.response?.status === 409 || Boolean(error.response?.data));

const logRequestFailure = (error: AxiosError): void => {
  logger.error(`ERROR: API request failed with status: ${error.response?.status}`);
  logger.error(`Error details: ${JSON.stringify(error.response?.data)}`);
  logger.error(`Error url: ${error.response?.config.baseURL ?? ''}/${error.response?.config.url}`);
  logger.error(`Error data: ${error.response?.config.data}`);
  logger.error(`Error method: ${error.response?.config.method}`);
};

const toHttpException = (error: AxiosError): HttpException => {
  const status = error.response?.status;

  if (status === 404) return new HttpException(404, 'Not found');
  if (status === 409) return new HttpException(409, 'Duplicate');

  return new HttpException(status ?? 500, 'API request failed');
};

const shouldRetry = (config: AxiosRequestConfig, tries: number): boolean =>
  config.method === 'GET' && tries < MAX_TRIES;

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
        const defaultHeaders = {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          'X-Request-Id': uuidv4(),
        };
        logger.info(`x-request-id: ${defaultHeaders['X-Request-Id']}`);
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
  private async request<T>(config: AxiosRequestConfig, user: Sender): Promise<ApiResponse<T>> {
    const preparedConfig = buildRequestConfig(config, user);
    let tries = 0;

    while (tries < MAX_TRIES) {
      try {
        tries += 1;
        const res = await this.instance(preparedConfig);
        return { data: res.data, message: 'success' };
      } catch (error: unknown) {
        if (isClassifiedFailure(error)) {
          logRequestFailure(error);
          throw toHttpException(error);
        }

        logger.error(`Unknown error: ${error}`);

        if (!shouldRetry(preparedConfig, tries)) {
          throw new HttpException(500, 'Internal server error');
        }

        logger.info(`Retrying... (${tries})`);
      }
    }
  }

  public async get<T>(config: AxiosRequestConfig, user: Sender): Promise<ApiResponse<T>> {
    logger.info(`MAKING GET REQUEST TO URL ${config.baseURL ?? ''}/${config.url}`);
    return this.request<T>({ ...config, method: 'GET' }, user);
  }

  public async post<T, D>(config: AxiosRequestConfig<D>, user: Sender): Promise<ApiResponse<T>> {
    logger.info(`MAKING POST REQUEST TO URL ${config.baseURL ?? ''}/${config.url}`);
    return this.request<T>({ ...config, method: 'POST' }, user);
  }

  public async patch<T, D>(config: AxiosRequestConfig<D>, user: Sender): Promise<ApiResponse<T>> {
    logger.info(`MAKING PATCH REQUEST TO URL ${config.baseURL ?? ''}/${config.url}`);
    return this.request<T>({ ...config, method: 'PATCH' }, user);
  }

  public async put<T, D>(config: AxiosRequestConfig<D>, user: Sender): Promise<ApiResponse<T>> {
    logger.info(`MAKING PUT REQUEST TO URL ${config.baseURL ?? ''}/${config.url}`);
    return this.request<T>({ ...config, method: 'PUT' }, user);
  }

  public async delete<T>(config: AxiosRequestConfig, user: Sender): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, method: 'DELETE' }, user);
  }
}
export default ApiService;
