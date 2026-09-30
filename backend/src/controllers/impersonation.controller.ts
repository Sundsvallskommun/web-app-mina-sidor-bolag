import { MUNICIPALITY_ID, NAMESPACE } from '@/config';
import { getApiBase } from '@/config/api-config';
import { HttpException } from '@/exceptions/HttpException';
import { RequestWithUser } from '@/interfaces/auth.interface';
import { ApiResponse } from '@/interfaces/service';
import ApiService from '@/services/api.service';
import { Body, Controller, Post, Req, UseBefore } from 'routing-controllers';
import { OpenAPI } from 'routing-controllers-openapi';
import impersonationMiddleware from '@middlewares/impersonation.middleware';
import { CitizenExtended } from '@/data-contracts/citizen/data-contracts';
import { PersonEngagement } from '@/data-contracts/legalentity/data-contracts';
import { User, UserEngagement } from '@interfaces/users.interface';
import { logger } from '@utils/logger';
import { EventType } from '@/responses/eventlog.response';
import dayjs from 'dayjs';
import { Event, PageEvent } from '@/data-contracts/eventlog/data-contracts';
import { RepresentingMode } from '@interfaces/representing.interface';
import { populateRepresentingCache } from '@services/session-cache.service';

@Controller()
@UseBefore(impersonationMiddleware)
export class ImpersonationController {
  private readonly apiService = new ApiService();
  private readonly citizenApiBase = getApiBase('citizen');
  private readonly LEApiBase = getApiBase('legalentity');
  private readonly eventLogApiBase = getApiBase('eventlog');

  @Post('/user-engagements')
  @OpenAPI({ summary: 'Get engagements by person number' })
  async getUserEngagements(
    @Req() req: RequestWithUser,
    @Body() body: { personNumber: string },
  ): Promise<ApiResponse<UserEngagement>> {
    const { personNumber } = body;

    const userEngagements: UserEngagement = {
      userPersonNumber: '',
      userName: '',
      userPartyId: '',
      canRepresent: [],
    };

    if (!personNumber) {
      throw new HttpException(400, 'Bad Request');
    }

    try {
      const url = `${this.citizenApiBase}/${MUNICIPALITY_ID}/${personNumber}/guid`;
      const partyId = await this.apiService.get<string>({ url }, req.user);
      const userPartyId = partyId.data;

      if (userPartyId) {
        const citizenUrl = `${this.citizenApiBase}/${MUNICIPALITY_ID}/${userPartyId}`;
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
      toImpersonatePartyId: string;
      accessReason: string;
    },
  ): Promise<boolean> {
    const { toImpersonatePersonNumber, toImpersonatePartyId, toImpersonateName, accessReason } = body;
    const session = req.session ?? undefined;

    if (!toImpersonatePersonNumber || !toImpersonateName || !toImpersonatePartyId || !accessReason) {
      throw new HttpException(400, 'Bad Request');
    }

    await this.createEvent(req.user, toImpersonatePartyId, accessReason);

    session.representing = {
      mode: RepresentingMode.PRIVATE,
      PRIVATE: {
        personNumber: toImpersonatePersonNumber,
        partyId: toImpersonatePartyId,
        name: toImpersonateName,
      },
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

    await populateRepresentingCache(req, req.user);
    return true;
  }

  async createEvent(requestedBy: User, toImpersonatePartyId: string, accessReason: string): Promise<void> {
    if (!requestedBy || !toImpersonatePartyId || !accessReason) {
      throw new HttpException(400, 'Bad Request');
    }

    const displayName = requestedBy.name !== requestedBy.username ? requestedBy.name : undefined;

    const metadata = [
      { key: 'requestedByPartyId', value: requestedBy.partyId },
      ...(displayName ? [{ key: 'requestedByName', value: displayName }] : []),
      { key: 'toImpersonatePartyId', value: toImpersonatePartyId },
      { key: 'accessReason', value: accessReason },
    ];

    const createLogData: Event = {
      type: EventType.ACCESS,
      message: 'Växling till kund',
      owner: NAMESPACE,
      sourceType: 'Impersonation',
      expires: dayjs().add(1, 'year').utc(true).toISOString(),
      metadata,
    };

    try {
      const url = `${this.eventLogApiBase}/${MUNICIPALITY_ID}/${toImpersonatePartyId}`;
      await this.apiService.post<PageEvent, Event>({ url, data: createLogData }, requestedBy);
    } catch (error) {
      logger.error('Could not create impersonation event log', error);
      throw error;
    }
  }
}
