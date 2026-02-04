import { MUNICIPALITY_ID } from '@/config';
import { getApiBase } from '@/config/api-config';
import { HttpException } from '@/exceptions/HttpException';
import { RequestWithUser } from '@/interfaces/auth.interface';
import { ApiResponse } from '@/interfaces/service';
import ApiService from '@/services/api.service';
import authMiddleware from '@middlewares/auth.middleware';
import { Controller, Get, Param, Req, UseBefore } from 'routing-controllers';
import { OpenAPI } from 'routing-controllers-openapi';
import { Agreement, AgreementResponse, Category } from '@/data-contracts/agreement/data-contracts';
import { getRepresentingPartyId } from '@utils/getRepresentingPartyId';
import dayjs from 'dayjs';
import { fetchAgreementsForPartyAndDelegations } from '@/services/agreement.service';

function activeAgreement(agreement: Agreement): boolean {
  // Agreements are considered active if the `toDate` is in the future or undefined (ongoing agreements).
  return dayjs(agreement.toDate).isAfter(dayjs()) || typeof agreement.toDate === 'undefined';
}

const relevantCategories: Category[] = [Category.ELECTRICITY, Category.ELECTRICITY_TRADE, Category.DISTRICT_HEATING];

@Controller()
export class AgreementController {
  private apiService = new ApiService();
  private apiBase = getApiBase('agreement');

  @Get('/paged/agreements')
  @OpenAPI({ summary: 'Get agreements by party id' })
  @UseBefore(authMiddleware)
  async getAgreements(@Req() req: RequestWithUser): Promise<ApiResponse<Agreement[]>> {
    const representing = req.session?.representing ?? undefined;
    const delegations = req?.session?.cache?.delegations ?? [];
    const partyId = getRepresentingPartyId(representing);
    const partyIdList: string[] = delegations.map(delegation => delegation.owner);

    if (!partyId) {
      throw new HttpException(400, 'Bad Request');
    }

    const data = await fetchAgreementsForPartyAndDelegations(partyId, partyIdList, delegations, req.user, false, {
      category: relevantCategories,
    });

    return { data, message: 'success' };
  }

  @Get('/paged/all-agreements')
  @OpenAPI({ summary: 'Get all agreements (active and inactive) by party id' })
  @UseBefore(authMiddleware)
  async getAllAgreements(@Req() req: RequestWithUser): Promise<ApiResponse<Agreement[]>> {
    const representing = req.session?.representing ?? undefined;
    const delegations = req?.session?.cache?.delegations ?? [];
    const partyId = getRepresentingPartyId(representing);
    const partyIdList: string[] = delegations.map(delegation => delegation.owner);

    if (!partyId) {
      throw new HttpException(400, 'Bad Request');
    }

    const data = await fetchAgreementsForPartyAndDelegations(partyId, partyIdList, delegations, req.user, true, {
      category: relevantCategories,
    });

    return { data, message: 'success' };
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

    const res = await this.apiService.get<AgreementResponse>(
      { url, params: { category: relevantCategories } },
      req.user,
    );

    const filteredAgreements = res.data.agreementParties[0].agreements.filter(activeAgreement);
    return { data: filteredAgreements, message: 'success' };
  }
}
