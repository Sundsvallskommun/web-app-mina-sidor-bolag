import { MUNICIPALITY_ID } from '@/config';
import { getApiBase } from '@/config/api-config';
import { HttpException } from '@/exceptions/HttpException';
import { RequestWithUser } from '@/interfaces/auth.interface';
import { ApiResponse } from '@/interfaces/service';
import ApiService from '@/services/api.service';
import authMiddleware from '@middlewares/auth.middleware';
import { Controller, Get, Param, QueryParam, Req, UseBefore } from 'routing-controllers';
import { OpenAPI } from 'routing-controllers-openapi';
import { Agreement, AgreementResponse, Category } from '@/data-contracts/agreement/data-contracts';
import { getRepresentingPartyId } from '@utils/getRepresentingPartyId';
import dayjs from 'dayjs';
import { fetchAgreementsForPartyAndDelegations, fetchPagedAgreements } from '@/services/agreement.service';
import { PagedAgreementsResult } from '@/interfaces/agreements.interface';

function activeAgreement(agreement: Agreement): boolean {
  // Agreements are considered active if the `toDate` is in the future or undefined (ongoing agreements).
  return dayjs(agreement.toDate).isAfter(dayjs()) || typeof agreement.toDate === 'undefined';
}

const relevantCategories: Category[] = [Category.ELECTRICITY, Category.ELECTRICITY_TRADE, Category.DISTRICT_HEATING];

@Controller()
export class AgreementController {
  private apiService = new ApiService();
  private apiBase = getApiBase('agreement');

  private getSessionData(req: RequestWithUser) {
    const representing = req.session?.representing ?? undefined;
    const delegations = req?.session?.cache?.delegations ?? [];
    const partyId = getRepresentingPartyId(representing);
    const partyIdList: string[] = delegations.map(delegation => delegation.owner);
    return { representing, delegations, partyId, partyIdList };
  }

  private async fetchAgreements(req: RequestWithUser, includeInactive: boolean): Promise<ApiResponse<Agreement[]>> {
    const { partyId, partyIdList, delegations } = this.getSessionData(req);

    if (!partyId) {
      throw new HttpException(400, 'Bad Request');
    }

    const data = await fetchAgreementsForPartyAndDelegations(
      partyId,
      partyIdList,
      delegations,
      req.user,
      includeInactive,
      relevantCategories,
    );
    return { data, message: 'success' };
  }

  private async handleAgreementsRequest(
    req: RequestWithUser,
    page: number | undefined,
    limit: number | undefined,
    includeInactive: boolean,
  ): Promise<ApiResponse<Agreement[] | PagedAgreementsResult>> {
    if (page === undefined) {
      return this.fetchAgreements(req, includeInactive);
    }

    const { partyId, partyIdList, delegations } = this.getSessionData(req);
    if (!partyId) {
      throw new HttpException(400, 'No partyId found');
    }

    const data = await fetchPagedAgreements(
      partyId,
      partyIdList,
      delegations,
      req.user,
      page,
      limit ?? 100,
      relevantCategories,
      includeInactive,
    );
    return { data, message: 'success' };
  }

  @Get('/paged/agreements')
  @OpenAPI({ summary: 'Get agreements by party id' })
  @UseBefore(authMiddleware)
  async getAgreements(
    @Req() req: RequestWithUser,
    @QueryParam('page') page?: number,
    @QueryParam('limit') limit?: number,
  ): Promise<ApiResponse<Agreement[] | PagedAgreementsResult>> {
    return this.handleAgreementsRequest(req, page, limit, false);
  }

  @Get('/paged/all-agreements')
  @OpenAPI({ summary: 'Get all agreements (active and inactive) by party id' })
  @UseBefore(authMiddleware)
  async getAllAgreements(
    @Req() req: RequestWithUser,
    @QueryParam('page') page?: number,
    @QueryParam('limit') limit?: number,
  ): Promise<ApiResponse<Agreement[] | PagedAgreementsResult>> {
    return this.handleAgreementsRequest(req, page, limit, true);
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
