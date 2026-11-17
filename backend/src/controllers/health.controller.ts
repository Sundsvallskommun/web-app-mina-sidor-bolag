import { getApiBase } from '@/config/api-config';
import ApiService from '@/services/api.service';
import { logger } from '@/utils/logger';
import { isRedisReady } from '@/utils/redis';
import { HttpException } from '@/exceptions/HttpException';
import { Controller, Get } from 'routing-controllers';
import { OpenAPI } from 'routing-controllers-openapi';
import { Public } from '@middlewares/global-auth';

@Controller()
export class HealthController {
  private apiService = new ApiService();
  private apiBase = getApiBase('simulatorserver');

  @Get('/health/up')
  @OpenAPI({ summary: 'Return health check' })
  @Public('Liveness probe - polled by infrastructure without a session')
  async up() {
    // Sessions and the API token live in Redis when it is configured, so the pod cannot serve without it.
    if (!isRedisReady()) {
      logger.error('Health check failed: Redis is not ready');
      throw new HttpException(503, 'Health check failed');
    }

    const url = `${this.apiBase}/simulations/response?status=200%20OK`;
    const data = {
      status: 'OK',
    };
    const emptyUser = { username: '' };
    const res = await this.apiService
      .post<{ status: string }, { status: string }>({ url, data }, emptyUser)
      .catch(e => {
        logger.error('Error when doing health check:', e);
        return e;
      });

    return res.data;
  }
}
