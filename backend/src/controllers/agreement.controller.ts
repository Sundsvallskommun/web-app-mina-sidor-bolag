import { MUNICIPALITY_ID } from '@/config';
import { getApiBase } from '@/config/api-config';
import { HttpException } from '@/exceptions/HttpException';
import { RequestWithUser } from '@/interfaces/auth.interface';
import { ApiResponse } from '@/interfaces/service';
import ApiService from '@/services/api.service';
import authMiddleware from '@middlewares/auth.middleware';
import { Controller, Get, Param, Req, UseBefore } from 'routing-controllers';
import { OpenAPI } from 'routing-controllers-openapi';
import { Agreement, AgreementResponse, Category, PagedAgreementResponse } from '@/data-contracts/agreement/data-contracts';
import { getRepresentingPartyId } from '@utils/getRepresentingPartyId';
import dayjs from 'dayjs';

function activeAgreement(agreement: Agreement): boolean {
  // Agreements are considered active if the `toDate` is in the future or undefined (ongoing agreements).
  return dayjs(agreement.toDate).isAfter(dayjs()) || typeof agreement.toDate === 'undefined';
}

@Controller()
export class AgreementController {
  private apiService = new ApiService();
  private apiBase = getApiBase('agreement');

  @Get('/paged/agreements')
  @OpenAPI({ summary: 'Get agreements by party id' })
  @UseBefore(authMiddleware)
  async getAgreements(@Req() req: RequestWithUser): Promise<ApiResponse<Agreement[]>> {
    const { representing } = req?.session;
    const delegations = req?.session?.cache?.delegations ?? [];
    const partyId = getRepresentingPartyId(representing);
    const partyIdList: string[] = [];
    const agreements: Agreement[] = [];
    const filteredAgreements: Agreement[] = [];

    delegations.forEach(delegation => {
      partyIdList.push(delegation.owner);
    });

    if (!partyId) {
      throw new HttpException(400, 'Bad Request');
    }

    const url = `${this.apiBase}/${MUNICIPALITY_ID}/paged/agreements/${partyId}`;
    const params = {};

    const res = await this.apiService.get<PagedAgreementResponse>({ url, params }, req.user);
    filteredAgreements.push(...res.data.agreements.filter(activeAgreement));

    for (const partyIdItem of partyIdList) {
      const url = `${this.apiBase}/${MUNICIPALITY_ID}/paged/agreements/${partyIdItem}`;

      const res = await this.apiService.get<PagedAgreementResponse>({ url, params }, req.user);
      agreements.push(...res.data.agreements.filter(activeAgreement));
    }

    agreements.forEach(agreement => {
      delegations.forEach(delegation => {
        delegation.facilities.forEach(facility => {
          if (facility.id === agreement.facilityId) {
            filteredAgreements.push(agreement);
          }
        });
      });
    });

    return { data: filteredAgreements, message: 'success' };
  }

  @Get('/agreement/:category/:facilityId')
  @OpenAPI({ summary: 'Get agreements by category and facility id' })
  @UseBefore(authMiddleware)
  async getAgreement(
    @Req() req: RequestWithUser,
    @Param('category') category: Category,
    @Param('facilityId') facilityId: string,
  ): Promise<ApiResponse<Agreement[]>> {
    const url = `${this.apiBase}/${MUNICIPALITY_ID}/agreements/${category}/${facilityId}`;

    const res = await this.apiService.get<AgreementResponse>({ url }, req.user);

    const filteredAgreements = res.data.agreementParties[0].agreements.filter(activeAgreement);
    return { data: filteredAgreements, message: 'success' };
  }
}
