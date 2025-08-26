import { getApiBase } from '@/config/api-config';
import { HttpException } from '@/exceptions/HttpException';
import { RequestWithUser } from '@/interfaces/auth.interface';
import ApiService from '@/services/api.service';
import { apiURL } from '@/utils/util';
import authMiddleware from '@middlewares/auth.middleware';
import { Body, Controller, Delete, Get, OnUndefined, Param, Patch, Post, Req, UseBefore } from 'routing-controllers';
import { OpenAPI } from 'routing-controllers-openapi';
import { MUNICIPALITY_ID } from '@config';
import { ApiResponse, ResponseData } from '@interfaces/service';
import { CreateDelegation, Delegation, UpdateDelegation } from '@/data-contracts/installedbase/data-contracts';
import { getRepresentingPartyId } from '@utils/getRepresentingPartyId';
import { CitizenExtended } from '@/data-contracts/citizen/data-contracts';
import { ResolvedFacilityDelegation } from '@interfaces/facility-delegation';

@Controller()
export class FacilityDelegationController {
  private readonly apiService = new ApiService();
  private readonly apiBase = getApiBase('installedbase');
  private readonly citizenApiBase = getApiBase('citizen');

  @Get('/facility/delegations')
  @OpenAPI({ summary: 'Get delegation by owner and or delegate' })
  @UseBefore(authMiddleware)
  async getMyFacilityDelegations(@Req() req: RequestWithUser): Promise<ApiResponse<ResolvedFacilityDelegation[] | []>> {
    const { representing } = req?.session ?? {};

    const partyId = getRepresentingPartyId(representing);

    if (!partyId) {
      throw new HttpException(400, 'Bad Request');
    }

    const url = `${this.apiBase}/${MUNICIPALITY_ID}/delegations?owner=${partyId}`;
    const res = await this.apiService.get<Delegation[]>({ url }, req.user);

    const delegationPromises = [];
    const resolvedFacilityDelegations = [];

    for (const delegate of res.data) {
      try {
        const url = `${this.citizenApiBase}/${MUNICIPALITY_ID}/${delegate.delegatedTo}`;
        const thisPromise = this.apiService.get<CitizenExtended>({ url }, req.user).then(res => {
          return res.data;
        });

        await Promise.resolve(thisPromise).then(async result => {
          const url = `${this.citizenApiBase}/${MUNICIPALITY_ID}/${delegate.delegatedTo}/personnumber`;
          const thisPromise = this.apiService.get<number>({ url }, req.user).then(res => {
            return res.data;
          });

          const delegatePersonNumber = await Promise.resolve(thisPromise).then(numberRes => {
            return numberRes.toString().slice(0, -4).concat('****');
          });

          resolvedFacilityDelegations.push({
            ...delegate,
            delegatedToName: `${result.givenname} ${result.lastname}`,
            delegatedToBirthDate: delegatePersonNumber,
          });
        });
        delegationPromises.push(thisPromise);
      } catch (error) {
        // Handle 404 as empty
        if (error.status === 404) {
          delegationPromises.push(Promise.resolve([]));
        } else {
          throw new HttpException(500, 'Could not fetch citizen');
        }
      }
    }

    return { data: resolvedFacilityDelegations, message: 'success' };
  }

  @Patch('/delegations/:id')
  @OnUndefined(204)
  @OpenAPI({ summary: 'Update an existing facility delegation' })
  @UseBefore(authMiddleware)
  async updateFacilityDelegation(
    @Req() req: RequestWithUser,
    @Body() delegateFacilityData: UpdateDelegation,
    @Param('id') delegationId: string,
  ): Promise<ResponseData<number>> {
    if (!delegateFacilityData.delegatedTo || !delegationId) {
      throw new HttpException(400, 'Bad Request');
    }

    const baseURL = apiURL(this.apiBase);
    const url = `${MUNICIPALITY_ID}/delegations/${delegationId}`;

    const res = await this.apiService.patch<number, UpdateDelegation>({ url, baseURL, data: delegateFacilityData }, req.user);

    return { data: res.data, message: 'Updated facility delegation' };
  }

  @Delete('/delegations/:id')
  @OnUndefined(204)
  @OpenAPI({ summary: 'Delete a facility delegation' })
  @UseBefore(authMiddleware)
  async deleteFacilityDelegation(@Req() req: RequestWithUser, @Param('id') delegationId: string): Promise<ResponseData<number>> {
    if (!delegationId) {
      throw new HttpException(400, 'Bad Request');
    }

    const baseURL = apiURL(this.apiBase);
    const url = `${MUNICIPALITY_ID}/delegations/${delegationId}`;

    const res = await this.apiService.delete<number>({ url, baseURL }, req.user);

    return { data: res.data, message: 'Deleted facility delegation' };
  }

  @Get('/personNumber/:personNumber')
  @OpenAPI({ summary: 'Get personId from person number' })
  @UseBefore(authMiddleware)
  async getPersonIdByPersonNumber(@Req() req: RequestWithUser, @Param('personNumber') personNumber: string): Promise<ResponseData<string>> {
    try {
      const url = `${this.citizenApiBase}/${MUNICIPALITY_ID}/${personNumber}/guid`;
      const res = await this.apiService.get<string>({ url }, req.user);

      return { data: res.data, message: 'success' };
    } catch (error) {
      if (error.status !== 404) {
        throw error;
      }
      throw new HttpException(404, 'Not Found');
    }
  }

  @Post('/delegations')
  @OnUndefined(204)
  @OpenAPI({ summary: 'Create facility delegation' })
  @UseBefore(authMiddleware)
  async createDelegate(@Req() req: RequestWithUser, @Body() facilityDelegationData: CreateDelegation): Promise<ResponseData<number>> {
    const { representing } = req?.session ?? {};

    const partyId = getRepresentingPartyId(representing);

    if (!partyId) {
      throw new HttpException(400, 'Bad Request');
    }

    let personId: ResponseData<string>;

    try {
      personId = await this.getPersonIdByPersonNumber(req, facilityDelegationData.delegatedTo);
    } catch (error) {
      if (error.status !== 404) {
        throw error;
      }
      throw new HttpException(404, 'Not Found');
    }

    const newFacilityDelegationData: CreateDelegation = {
      facilities: facilityDelegationData.facilities,
      delegatedTo: personId.data,
      owner: partyId,
    };

    const baseURL = apiURL(this.apiBase);
    const url = `${MUNICIPALITY_ID}/delegations`;
    const res = await this.apiService.post<number, CreateDelegation>({ url, baseURL, data: newFacilityDelegationData }, req.user);

    return { data: res.data, message: 'updated' };
  }
}
