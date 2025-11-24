import { Body, Controller, Get, Post, Req, UseBefore } from 'routing-controllers';
import ApiService from '@services/api.service';
import { getApiBase } from '@/config/api-config';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';
import authMiddleware from '@middlewares/auth.middleware';
import { RequestWithUser } from '@interfaces/auth.interface';
import { ApiResponse } from '@interfaces/service';
import { getRepresentingPartyId } from '@utils/getRepresentingPartyId';
import { HttpException } from '@exceptions/HttpException';
import { MUNICIPALITY_ID } from '@config';
import { logger } from '@utils/logger';
import { EventResponse, EventType, PagedEventsResponse } from '@/responses/eventlog.response';
import { CitizenExtended } from '@/data-contracts/citizen/data-contracts';
import { PageEvent, Event } from '@/data-contracts/eventlog/data-contracts';

@Controller()
class EventLogController {
  readonly apiService = new ApiService();
  readonly apiBase = getApiBase('eventlog');
  private readonly eventLogOwner = 'BolagensMinaSidor';

  @Get('/event/get')
  @OpenAPI({ summary: 'Get log events' })
  @UseBefore(authMiddleware)
  @ResponseSchema(PagedEventsResponse)
  async getEvents(@Req() req: RequestWithUser): Promise<ApiResponse<PageEvent>> {
    const { size, sort } = req.query;
    const representing = req.session?.representing ?? undefined;
    const partyId = getRepresentingPartyId(representing);

    if (!partyId) {
      throw new HttpException(400, 'Bad Request');
    }

    try {
      const url = `${this.apiBase}/${MUNICIPALITY_ID}/${partyId}`;
      const params = {
        partyId,
        size,
        sort,
        filter: encodeURI(`owner:'${this.eventLogOwner}'`),
      };

      const res = await this.apiService.get<PageEvent>({ url, params }, req.user);

      for (const event of res.data.content) {
        const exportedByPartyId = event.metadata.find(item => item.key === 'exportedByPartyId').value;
        const url = `citizen/3.0/${MUNICIPALITY_ID}/${exportedByPartyId}`;
        const citizenRes = await this.apiService.get<CitizenExtended>({ url, params }, req.user);
        Object.assign(event, { exportName: `${citizenRes.data.givenname} ${citizenRes.data.lastname}` });
      }

      return { data: res.data, message: 'success' };
    } catch (error) {
      // Handle 404 as empty
      if (error.status === 404) {
        return { data: {}, message: '404, empty response' };
      } else {
        throw new HttpException(500, 'Could not fetch event logs');
      }
    }
  }

  @Post('/event/create')
  @OpenAPI({ summary: 'Create log event' })
  @UseBefore(authMiddleware)
  @ResponseSchema(EventResponse)
  async createEvent(@Req() req: RequestWithUser, @Body() exportLogData: FormData): Promise<ApiResponse<number>> {
    const representing = req.session?.representing ?? undefined;
    const partyId = getRepresentingPartyId(representing);
    const user = req.session.cache;

    if (!partyId) {
      throw new HttpException(400, 'Bad Request');
    }

    const checkIfDelegatedFacility = () => {
      return (
        user.facilities.find(facility => facility.facilityId === exportLogData[0].facilityId).facilityOwnerPartyId ?? representing.PRIVATE.partyId
      );
    };

    const ownerPartyId = representing.mode === 0 ? checkIfDelegatedFacility() : representing.BUSINESS.partyId;

    const createLogData: Event = {
      type: EventType.READ,
      message: 'Export av mätdata',
      owner: 'BolagensMinaSidor',
      sourceType: 'Export',
      expires: exportLogData[0].expires,
      metadata: [
        { key: 'exportedByPartyId', value: representing.PRIVATE.partyId },
        { key: 'ownerPartyId', value: ownerPartyId },
        { key: 'facilities[0].facilityId', value: exportLogData[0].facilityId },
        { key: 'facilities[0].address', value: exportLogData[0].facilityAddress },
        { key: 'facilities[0].category', value: exportLogData[0].category },
        { key: 'facilities[0].fromDate', value: exportLogData[0].fromDate },
        { key: 'facilities[0].toDate', value: exportLogData[0].toDate },
        { key: 'facilities[0].aggregateOn', value: exportLogData[0].aggregation },
      ],
    };

    try {
      const url = `${this.apiBase}/${MUNICIPALITY_ID}/${ownerPartyId}`;

      const res = await this.apiService.post<number, Event>({ url, data: createLogData }, req.user);
      return { data: res.data, message: 'success' };
    } catch (error) {
      logger.error('Could not create event log', error);
      throw error;
    }
  }
}

export default EventLogController;
