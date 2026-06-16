import { Body, Controller, Get, Post, Req, UseBefore } from 'routing-controllers';
import ApiService from '@services/api.service';
import { getApiBase } from '@/config/api-config';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';
import authMiddleware from '@middlewares/auth.middleware';
import { RequestWithUser } from '@interfaces/auth.interface';
import { ApiResponse } from '@interfaces/service';
import { getRepresentingPartyId } from '@utils/getRepresentingPartyId';
import { HttpException } from '@exceptions/HttpException';
import { MUNICIPALITY_ID, NAMESPACE } from '@config';
import { logger } from '@utils/logger';
import { EventResponse, EventType, PagedEventsResponse } from '@/responses/eventlog.response';
import { CitizenExtended } from '@/data-contracts/citizen/data-contracts';
import { PageEvent, Event } from '@/data-contracts/eventlog/data-contracts';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { CreateLogEventData } from '@interfaces/event';
dayjs.extend(utc);

const EXPORT_SOURCE_TYPE = 'Export';

@Controller()
class EventLogController {
  readonly apiService = new ApiService();
  readonly apiBase = getApiBase('eventlog');

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
        filter: encodeURI(`owner:'${NAMESPACE}' and sourceType:'${EXPORT_SOURCE_TYPE}'`),
      };

      const res = await this.apiService.get<PageEvent>({ url, params }, req.user);

      for (const event of res.data.content ?? []) {
        const exportedByPartyId = event.metadata?.find(item => item.key === 'exportedByPartyId')?.value;
        if (!exportedByPartyId) continue;
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
        logger.error('Could not fetch event logs', error);
        throw new HttpException(500, 'Could not fetch event logs');
      }
    }
  }

  @Post('/event/create')
  @OpenAPI({ summary: 'Create log event' })
  @UseBefore(authMiddleware)
  @ResponseSchema(EventResponse)
  async createEvent(
    @Req() req: RequestWithUser,
    @Body() exportLogData: CreateLogEventData[],
  ): Promise<ApiResponse<number>> {
    const representing = req.session?.representing ?? undefined;
    const partyId = getRepresentingPartyId(representing);
    const user = req.session.cache;

    if (!partyId) {
      throw new HttpException(400, 'Bad Request');
    }

    const checkIfDelegatedFacility = () => {
      return (
        user.facilities.find(facility => facility.facilityId === exportLogData[0].facilityId).facilityOwnerPartyId ??
        representing.PRIVATE.partyId
      );
    };

    const ownerPartyId = representing.mode === 0 ? checkIfDelegatedFacility() : representing.BUSINESS.partyId;

    exportLogData.forEach(logItem => {
      if (logItem.year) {
        exportLogData.push({
          facilityId: logItem.facilityId,
          facilityAddress: logItem.facilityAddress,
          fromDate: dayjs(logItem.fromDate)
            .utc(true)
            .subtract(Number.parseInt(dayjs(logItem.fromDate).format('YYYY')) - logItem.year, 'year')
            .startOf('date')
            .utc(true)
            .format(),
          toDate: dayjs(logItem.toDate)
            .subtract(Number.parseInt(dayjs(logItem.toDate).format('YYYY')) - logItem.year, 'year')
            .startOf('date')
            .utc(true)
            .format(),
          category: logItem.category,
          aggregation: logItem.aggregation,
        });
      }
    });

    const metadata = exportLogData.reduce(
      (data, item, index) => {
        return [
          ...data,
          { key: `facilities[${index}].facilityId`, value: item.facilityId },
          { key: `facilities[${index}].address`, value: item.facilityAddress },
          { key: `facilities[${index}].category`, value: item.category },
          { key: `facilities[${index}].fromDate`, value: item.fromDate },
          { key: `facilities[${index}].toDate`, value: item.toDate },
          { key: `facilities[${index}].aggregateOn`, value: item.aggregation },
        ];
      },
      [
        { key: 'exportedByPartyId', value: representing.PRIVATE.partyId },
        { key: 'ownerPartyId', value: ownerPartyId },
      ],
    );

    const createLogData: Event = {
      type: EventType.READ,
      message: 'Export av mätdata',
      owner: NAMESPACE,
      sourceType: EXPORT_SOURCE_TYPE,
      expires: dayjs().add(1, 'year').utc(true).toISOString(),
      metadata,
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
