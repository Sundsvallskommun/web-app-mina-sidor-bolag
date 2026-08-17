import { Controller, Get, UseBefore } from 'routing-controllers';
import { logger } from '@/utils/logger';
import { ApiResponse } from '@/services/api.service';
import OpenEApiService from '@/services/opene-api.service';
import { HttpException } from '@/exceptions/HttpException';
import { htmlToPlainText } from '@/utils/htmlToPlainText';

interface SelfService {
  ID: number;
  Name: string;
  URL: string;
  Category: string;
  ShortDescription: string;
  Enabled: boolean;
}

@Controller()
export class SelfServiceController {
  private readonly openEApiService = new OpenEApiService();

  @Get('/selfservices')
  async getSelfServices(): Promise<ApiResponse<SelfService[]>> {
    try {
      const { Flows } = await this.openEApiService.get<{ Flows: SelfService[] }>({ url: 'api/v1/getflows/json' });
      return {
        data: Flows.filter(s => s.Enabled === true).map(flow => ({
          ...flow,
          ShortDescription: htmlToPlainText(flow.ShortDescription),
        })),
        message: 'success',
      };
    } catch (error) {
      logger.error(`Error fetching self services: ${error}`);
      throw new HttpException(500, 'Could not fetch self services');
    }
  }
}
