import { BANK_ID_CA, BANK_ID_CERT, BANK_ID_KEY, BANK_ID_URL } from '@/config';
import { bankIdURL } from '@/utils/bankIdUrl';
import { logger } from '@utils/logger';
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import https from 'node:https';

const agent = new https.Agent({ ca: BANK_ID_CA, cert: BANK_ID_CERT, key: BANK_ID_KEY });

class BankIdApiService {
  private readonly instance: AxiosInstance;
  constructor() {
    this.instance = axios.create({ httpsAgent: agent, baseURL: BANK_ID_URL });
    this.instance.interceptors.request.use(
      async function (request) {
        const defaulContentType = 'application/json';
        request.headers['Content-Type'] = request.headers['Content-Type'] ?? defaulContentType;
        return request;
      },
      function (error) {
        return Promise.reject(new Error(error));
      },
    );
  }
  private async request<T>(config: AxiosRequestConfig): Promise<T> {
    const preparedConfig: AxiosRequestConfig = {
      ...config,
      headers: { ...config.headers },
      params: { ...config.params },
      url: config.baseURL ? config.url : bankIdURL(config.url),
    };
    try {
      const result = await this.instance(preparedConfig);
      return result.data;
    } catch (error) {
      logger.error('Error during BankID API request:', error);
      throw error;
    }
  }

  public async get<T>(config: AxiosRequestConfig): Promise<T> {
    logger.info(`MAKING GET REQUEST TO URL ${config.baseURL ?? ''}/${bankIdURL(config.url)}`);
    return this.request<T>({ ...config, method: 'GET' });
  }

  public async post<T, D>(config: AxiosRequestConfig<D>): Promise<T> {
    logger.info(`MAKING POST REQUEST TO URL ${config.baseURL ?? ''}/${bankIdURL(config.url)}`);
    return this.request<T>({ ...config, method: 'POST' });
  }
}
export default BankIdApiService;
