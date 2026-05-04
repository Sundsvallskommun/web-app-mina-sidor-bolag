import { MUNICIPALITY_ID } from '@/config';
import { getApiBase } from '@/config/api-config';
import { HttpException } from '@/exceptions/HttpException';
import { RequestWithUser } from '@/interfaces/auth.interface';
import authMiddleware from '@/middlewares/auth.middleware';
import ApiService, { ApiResponse } from '@/services/api.service';
import { logger } from '@/utils/logger';
import { Controller, Get, Req, UseBefore } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';
import { Disturbance } from '@/data-contracts/disturbances/data-contracts';
import { DisturbanceApiResponse } from '@/responses/disturbances.response';

@Controller()
export class DisturbancesController {
  private readonly apiService = new ApiService();
  private readonly apiBase = getApiBase('disturbances');
  private readonly baseUrl = `${this.apiBase}/${MUNICIPALITY_ID}`;

  @Get('/disturbances')
  @OpenAPI({ summary: 'Return disturbances for a person or organization' })
  @UseBefore(authMiddleware)
  @ResponseSchema(DisturbanceApiResponse)
  async getDisturbances(@Req() req: RequestWithUser): Promise<ApiResponse<Disturbance[]>> {
    const userPartyId = req.user.partyId;
    if (!userPartyId) {
      throw new HttpException(400, 'Bad request, missing partyId');
    }

    const delegations = req?.session?.cache?.delegations ?? [];
    const delegationPartyIds: string[] = delegations.map(d => d.owner);
    const partyIdList = [userPartyId, ...delegationPartyIds];

    const { status } = req.query;

    const buildUrl = (partyId: string) => {
      const base = `${this.baseUrl}/disturbances/affecteds/${partyId}`;
      if (!status) return base;
      const params = new URLSearchParams({ status: String(status) });
      return `${base}?${params.toString()}`;
    };

    const results = await Promise.allSettled(
      partyIdList.map(partyId => this.apiService.get<Disturbance[]>({ url: buildUrl(partyId) }, req.user)),
    );

    const allDisturbances: Disturbance[] = [];
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        allDisturbances.push(...result.value.data);
      } else {
        logger.error(`Error fetching disturbances for partyId ${partyIdList[index]}`, result.reason);
      }
    });

    allDisturbances.sort((a, b) => a.created.localeCompare(b.created));

    return { data: allDisturbances, message: 'success' };
  }
}
