import { getApiBase } from '@/config/api-config';
import { HttpException } from '@/exceptions/HttpException';
import { RequestWithUser } from '@/interfaces/auth.interface';
import ApiService from '@/services/api.service';
import { assertOwnsFacilityDelegation } from '@/services/ownership.service';
import { apiURL } from '@/utils/util';
import { Body, Controller, Delete, Get, OnUndefined, Param, Patch, Post, Req } from 'routing-controllers';
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
  @OpenAPI({ summary: 'Get my delegations as owner' })
  async getMyFacilityDelegations(@Req() req: RequestWithUser): Promise<ApiResponse<ResolvedFacilityDelegation[]>> {
    const { representing } = req.session ?? {};
    const partyId = getRepresentingPartyId(representing);

    if (!partyId) {
      throw new HttpException(400, 'Bad Request');
    }

    const url = `${this.apiBase}/${MUNICIPALITY_ID}/delegations?owner=${partyId}`;
    const { data: delegations } = await this.apiService.get<Delegation[]>({ url }, req.user);

    const resolvedFacilityDelegations = await Promise.all(
      delegations.map(async delegate => {
        try {
          const citizenUrl = `${this.citizenApiBase}/${MUNICIPALITY_ID}/${delegate.delegatedTo}`;
          const { data: citizen } = await this.apiService
            .get<CitizenExtended>({ url: citizenUrl }, req.user)
            .catch(() => {
              throw new HttpException(404, 'CITIZEN_NOT_FOUND');
            });

          const personNumberUrl = `${this.citizenApiBase}/${MUNICIPALITY_ID}/${delegate.delegatedTo}/personnumber`;
          const { data: personNumber } = await this.apiService
            .get<number>({ url: personNumberUrl }, req.user)
            .catch(() => {
              throw new HttpException(404, 'PERSON_NUMBER_NOT_FOUND');
            });

          const maskedPersonNumber = personNumber.toString().slice(0, -4).concat('****');

          return {
            ...delegate,
            delegatedToName: `${citizen.givenname} ${citizen.lastname}`,
            delegatedToBirthDate: maskedPersonNumber,
          };
        } catch (error: any) {
          if (error.status === 404) {
            return null; // ignore missing citizens
          }
          throw new HttpException(500, 'Could not fetch citizen');
        }
      }),
    );

    return {
      data: resolvedFacilityDelegations.filter(Boolean),
      message: 'success',
    };
  }

  @Patch('/delegations/:id')
  @OnUndefined(204)
  @OpenAPI({ summary: 'Update an existing facility delegation' })
  async updateFacilityDelegation(
    @Req() req: RequestWithUser,
    @Body() delegateFacilityData: UpdateDelegation,
    @Param('id') delegationId: string,
  ): Promise<ResponseData<number>> {
    if (!delegateFacilityData.delegatedTo || !delegationId) {
      throw new HttpException(400, 'Bad Request');
    }

    await assertOwnsFacilityDelegation(req, delegationId);

    const baseURL = apiURL(this.apiBase);
    const url = `${MUNICIPALITY_ID}/delegations/${delegationId}`;

    // Only the two fields the update is allowed to touch; forwarding the body
    // verbatim would let anything else it carries through to the upstream API.
    const update: UpdateDelegation = {
      facilities: delegateFacilityData.facilities,
      delegatedTo: delegateFacilityData.delegatedTo,
    };

    const res = await this.apiService.patch<number, UpdateDelegation>({ url, baseURL, data: update }, req.user);

    return { data: res.data, message: 'Updated facility delegation' };
  }

  @Delete('/delegations/:id')
  @OnUndefined(204)
  @OpenAPI({ summary: 'Delete a facility delegation' })
  async deleteFacilityDelegation(
    @Req() req: RequestWithUser,
    @Param('id') delegationId: string,
  ): Promise<ResponseData<number>> {
    if (!delegationId) {
      throw new HttpException(400, 'Bad Request');
    }

    await assertOwnsFacilityDelegation(req, delegationId);

    const baseURL = apiURL(this.apiBase);
    const url = `${MUNICIPALITY_ID}/delegations/${delegationId}`;

    const res = await this.apiService.delete<number>({ url, baseURL }, req.user);

    return { data: res.data, message: 'Deleted facility delegation' };
  }

  @Get('/personNumber/:personNumber')
  @OpenAPI({ summary: 'Get personId from person number' })
  async getPersonIdByPersonNumber(
    @Req() req: RequestWithUser,
    @Param('personNumber') personNumber: string,
  ): Promise<ResponseData<string>> {
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
  async createDelegate(
    @Req() req: RequestWithUser,
    @Body() facilityDelegationData: CreateDelegation,
  ): Promise<ResponseData<number>> {
    const { representing } = req?.session ?? {};

    const partyId = getRepresentingPartyId(representing);

    if (!partyId) {
      throw new HttpException(400, 'Bad Request');
    }

    let personId: ResponseData<string>;

    try {
      await this.getPersonIdByPersonNumber(req, facilityDelegationData.delegatedTo).then(res => {
        if (res.data === partyId) {
          throw new HttpException(409, 'PERSONID_EQUALS_USER_PARTY_ID');
        } else {
          personId = res;
        }
      });
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
    const res = await this.apiService.post<number, CreateDelegation>(
      { url, baseURL, data: newFacilityDelegationData },
      req.user,
    );

    return { data: res.data, message: 'updated' };
  }
}
