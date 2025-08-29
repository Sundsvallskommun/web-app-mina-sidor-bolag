import { MUNICIPALITY_ID } from '@/config';
import { getApiBase } from '@/config/api-config';
import { Data } from '@/data-contracts/measurementdata/data-contracts';
import { HttpException } from '@/exceptions/HttpException';
import { RequestWithUser } from '@/interfaces/auth.interface';
import ApiService from '@/services/api.service';
import authMiddleware from '@middlewares/auth.middleware';
import { Controller, Get, Req, UseBefore } from 'routing-controllers';
import { OpenAPI } from 'routing-controllers-openapi';
import { ApiResponse } from '@interfaces/service';
import { getRepresentingPartyId } from '@utils/getRepresentingPartyId';

@Controller()
export class MeasurementDataController {
  readonly apiService = new ApiService();
  readonly apiBase = getApiBase('measurementdata');

  @Get('/measurementdata')
  @OpenAPI({ summary: 'Return measurement data by category' })
  @UseBefore(authMiddleware)
  async getMeasurementData(@Req() req: RequestWithUser): Promise<ApiResponse<Data>> {
    const representing = req.session?.representing ?? undefined;
    const { category, facilityId, fromDate, toDate, aggregateOn } = req.query;

    const partyId = getRepresentingPartyId(representing);

    if (!partyId) {
      throw new HttpException(400, 'Bad Request');
    }

    try {
      const url = `${this.apiBase}/${MUNICIPALITY_ID}/measurement-data`;
      const params = {
        partyId,
        category,
        facilityId,
        fromDate,
        toDate,
        aggregateOn,
      };

      const res = await this.apiService.get<Data>({ url, params }, req.user);
      return { data: res.data, message: 'success' };
    } catch (error) {
      // Handle 404 as empty
      if (error.status === 404) {
        return { data: {} as Data, message: '404, empty response' };
      } else {
        throw new HttpException(500, 'Could not fetch measurement data');
      }
    }
  }
}
