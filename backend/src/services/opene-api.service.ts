import { OPENE_URL } from '@/config';
import axios, { AxiosInstance, AxiosRequestConfig, isAxiosError } from 'axios';
import { logger } from '@/utils/logger';

export default class OpenEApiService {
  private readonly instance: AxiosInstance;

  constructor() {
    this.instance = axios.create({ baseURL: OPENE_URL });
  }

  public async get<T>(config: AxiosRequestConfig): Promise<T> {
    logger.info(`MAKING GET REQUEST TO URL ${config.baseURL ?? ''}/${config.url}`);
    try {
      const result = await this.instance({ ...config, method: 'GET', responseType: 'arraybuffer' });
      return JSON.parse(Buffer.from(result.data).toString('latin1'));
    } catch (error) {
      console.log(error);
      if (isAxiosError(error)) {
        logger.error(`Request failed with status: ${error.response?.status}`);
      }
      logger.error('Error during OpenE API request:', error);
      throw error;
    }
  }
}
