import { ApiResponse } from '@services/api-service';
import { Event, PagedEvents } from '@data-contracts/backend/data-contracts';

export interface PagedEventsResponse extends Omit<PagedEvents, 'content'> {
  content?: StructuredEvent[];
}

export interface StructuredEvent extends Event {
  exportName: string;
}

export const getEvents: () => ApiResponse<PagedEventsResponse> = () => ({
  data: {
    content: [
      {
        logKey: '12345678-1234-1234-1234-1234567890ab',
        type: 'READ',
        municipalityId: '2281',
        message: 'Export av mätdata',
        owner: '0',
        created: '2025-01-07',
        sourceType: 'Export',
        metadata: [
          {
            key: 'exportedByPartyId',
            value: '12345678-1234-1234-1234-1234567890ab',
          },
          {
            key: 'ownerPartyId',
            value: '12345678-1234-1234-1234-1234567890ab',
          },
          {
            key: 'expires',
            value: '2026-01-01T12:00:00.483Z',
          },
          {
            key: 'facilities[0].facilityId',
            value: '333',
          },
          {
            key: 'facilities[0].address',
            value: 'Storgatan 1',
          },
          {
            key: 'facilities[0].category',
            value: 'DISTRICT_HEATING',
          },
          {
            key: 'facilities[0].fromDate',
            value: '2025-01-01T23:00:00.000Z',
          },
          {
            key: 'facilities[0].toDate',
            value: '2025-02-01T23:00:00.000Z',
          },
          {
            key: 'facilities[0].aggregateOn',
            value: 'DAY',
          },
        ],
        exportName: 'Förnamn Efternamn',
      },
      {
        logKey: '12345678-1234-1234-1234-1234567890ab',
        type: 'READ',
        municipalityId: '2281',
        message: 'Export av mätdata',
        owner: '0',
        created: '2025-01-06',
        sourceType: 'Export',
        metadata: [
          {
            key: 'exportedByPartyId',
            value: '12345678-1234-1234-1234-1234567890ab',
          },
          {
            key: 'ownerPartyId',
            value: '12345678-1234-1234-1234-1234567890ab',
          },
          {
            key: 'expires',
            value: '2026-01-01T12:00:00.483Z',
          },
          {
            key: 'facilities[0].facilityId',
            value: '222',
          },
          {
            key: 'facilities[0].address',
            value: 'Storgatan 1',
          },
          {
            key: 'facilities[0].category',
            value: 'ELECTRICITY',
          },
          {
            key: 'facilities[0].fromDate',
            value: '2025-01-01T23:00:00.000Z',
          },
          {
            key: 'facilities[0].toDate',
            value: '2025-02-01T23:00:00.000Z',
          },
          {
            key: 'facilities[0].aggregateOn',
            value: 'DAY',
          },
        ],
        exportName: 'Förnamn Efternamn',
      },
      {
        logKey: '12345678-1234-1234-1234-1234567890ab',
        type: 'READ',
        municipalityId: '2281',
        message: 'Export av mätdata',
        owner: '0',
        created: '2025-01-03',
        sourceType: 'Export',
        metadata: [
          {
            key: 'exportedByPartyId',
            value: '12345678-1234-1234-1234-1234567890ab',
          },
          {
            key: 'ownerPartyId',
            value: '12345678-1234-1234-1234-1234567890ab',
          },
          {
            key: 'expires',
            value: '2026-01-01T12:00:00.483Z',
          },
          {
            key: 'facilities[0].facilityId',
            value: '111',
          },
          {
            key: 'facilities[0].address',
            value: 'Storgatan 1',
          },
          {
            key: 'facilities[0].category',
            value: 'ELECTRICITY_TRADE',
          },
          {
            key: 'facilities[0].fromDate',
            value: '2025-01-01T23:00:00.000Z',
          },
          {
            key: 'facilities[0].toDate',
            value: '2025-02-01T23:00:00.000Z',
          },
          {
            key: 'facilities[0].aggregateOn',
            value: 'DAY',
          },
        ],
        exportName: 'Förnamn Efternamn',
      },
      {
        logKey: '12345678-1234-1234-1234-1234567890ab',
        type: 'READ',
        municipalityId: '2281',
        message: 'Export av mätdata',
        owner: '0',
        created: '2025-01-02',
        sourceType: 'Export',
        metadata: [
          {
            key: 'exportedByPartyId',
            value: '12345678-1234-1234-1234-1234567890ab',
          },
          {
            key: 'ownerPartyId',
            value: '12345678-1234-1234-1234-1234567890ab',
          },
          {
            key: 'expires',
            value: '2026-01-01T12:00:00.483Z',
          },
          {
            key: 'facilities[0].facilityId',
            value: '333',
          },
          {
            key: 'facilities[0].address',
            value: 'Storgatan 1',
          },
          {
            key: 'facilities[0].category',
            value: 'DISTRICT_HEATING',
          },
          {
            key: 'facilities[0].fromDate',
            value: '2024-01-01T23:00:00.000Z',
          },
          {
            key: 'facilities[0].toDate',
            value: '2025-01-01T23:00:00.000Z',
          },
          {
            key: 'facilities[0].aggregateOn',
            value: 'MONTH',
          },
        ],
        exportName: 'Förnamn Efternamn',
      },
    ],
    pageable: {
      pageNumber: 0,
      pageSize: 4,
      sort: {
        sorted: true,
        empty: false,
        unsorted: false,
      },
      offset: 0,
      paged: true,
      unpaged: false,
    },
    last: false,
    totalElements: 5,
    totalPages: 1,
    size: 4,
    number: 0,
    sort: {
      sorted: true,
      empty: false,
      unsorted: false,
    },
    first: true,
    numberOfElements: 1,
    empty: false,
  },
  message: 'success',
});

export const createEvent: () => { data: number; message: string } = () => ({
  data: 200,
  message: 'Event created',
});
