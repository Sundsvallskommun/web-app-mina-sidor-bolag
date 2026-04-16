import { MUNICIPALITY_ID } from '@/config';
import { getApiBase } from '@/config/api-config';
import { HttpException } from '@/exceptions/HttpException';
import { RequestWithUser } from '@/interfaces/auth.interface';
import { ApiResponse } from '@/interfaces/service';
import ApiService from '@/services/api.service';
import authMiddleware from '@middlewares/auth.middleware';
import { Body, Controller, Post, Req, UseBefore } from 'routing-controllers';
import { OpenAPI } from 'routing-controllers-openapi';
import { getRepresentingPartyId } from '@utils/getRepresentingPartyId';
import impersonationMiddleware from '@middlewares/impersonation.middleware';
import { CitizenExtended } from '@/data-contracts/citizen/data-contracts';
import { PersonEngagement } from '@/data-contracts/legalentity/data-contracts';
import { UserEngagement } from '@interfaces/users.interface';
import { logger } from '@utils/logger';

@Controller()
@UseBefore(authMiddleware)
@UseBefore(impersonationMiddleware)
export class AdministratorController {
  private readonly apiService = new ApiService();
  private readonly CitizenApiBase = getApiBase('citizen');
  private readonly LEApiBase = getApiBase('legalentity');

  @Post('/user-engagements')
  @OpenAPI({ summary: 'Get engagements by person number' })
  async getUserEngagements(
    @Req() req: RequestWithUser,
    @Body() body: { personNumber: string },
  ): Promise<ApiResponse<UserEngagement>> {
    const { personNumber } = body;
    const representing = req.session?.representing ?? undefined;
    const partyId = getRepresentingPartyId(representing);

    const userEngagements: UserEngagement = {
      userPersonNumber: '',
      userName: '',
      userPartyId: '',
      canRepresent: [],
    };

    if (!partyId || !personNumber) {
      throw new HttpException(400, 'Bad Request');
    }

    try {
      const url = `${this.CitizenApiBase}/${MUNICIPALITY_ID}/${personNumber}/guid`;
      const partyId = await this.apiService.get<string>({ url }, req.user);
      const userPartyId = partyId.data;

      if (userPartyId) {
        const citizenUrl = `${this.CitizenApiBase}/${MUNICIPALITY_ID}/${userPartyId}`;
        const citizenResponse = await this.apiService.get<CitizenExtended>({ url: citizenUrl }, req.user);

        if (citizenResponse.data) {
          userEngagements.userName = `${citizenResponse.data.givenname} ${citizenResponse.data.lastname}`;
          userEngagements.userPersonNumber = personNumber;
          userEngagements.userPartyId = userPartyId;
        }
      }
    } catch (error) {
      if (error.status === 404 || error.status === 400) {
        return { data: {} as UserEngagement, message: 'success' };
      }
      logger.error('Error getting user engagements', error);
      throw new HttpException(500, 'Error getting user engagement');
    }

    try {
      const LEUrl = `${this.LEApiBase}/${MUNICIPALITY_ID}/engagements/person/${personNumber}`;
      const LEResponse = await this.apiService.get<PersonEngagement[]>({ url: LEUrl }, req.user);

      if (LEResponse.data) {
        LEResponse.data.forEach(engagement => {
          userEngagements.canRepresent.push({
            name: engagement.name,
            representingNumber: engagement.organizationNumber,
          });
        });
      }
    } catch (error) {
      logger.info('Error getting LE engagements', error);
      return { data: userEngagements, message: 'success' };
    }

    return { data: userEngagements, message: 'success' };
  }

  @Post('/impersonate-user')
  @OpenAPI({ summary: 'Impersonate user' })
  async impersonateUser(
    @Req() req: RequestWithUser,
    @Body()
    body: {
      toImpersonatePersonNumber: string;
      toImpersonateName: string;
      toImpersonateRepresentingNumber: string;
      toImpersonatePartyId: string;
      accessReason: string;
    },
  ): Promise<boolean> {
    const { toImpersonatePersonNumber, toImpersonatePartyId, toImpersonateName, accessReason } = body;
    const session = req.session ?? undefined;
    const partyId = getRepresentingPartyId(session.representing);

    if (!partyId || !toImpersonatePersonNumber || !toImpersonatePartyId || !accessReason) {
      throw new HttpException(400, 'Bad Request');
    }

    session.representing.PRIVATE = {
      personNumber: toImpersonatePersonNumber,
      partyId: toImpersonatePartyId,
      name: toImpersonateName,
    };

    req.user.partyId = toImpersonatePartyId;
    req.user.personNumber = toImpersonatePersonNumber;
    req.user.name = toImpersonateName;
    req.user.permissions = {
      canImpersonateUser: false,
      isImpersonatingUser: true,
    };

    req.cache = undefined;
    req.session.cache = {
      partyId: undefined,
      cases: {},
      relations: { customerNumber: [], customerRelations: [] },
      addresses: [],
      facilities: [],
      delegations: [],
    };

    return true;
  }
}
