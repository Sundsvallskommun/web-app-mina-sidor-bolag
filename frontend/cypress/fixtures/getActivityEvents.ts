import { ApiResponse } from '@services/api-service';
import { EventMetaData, PagedEventsResponse } from '@data-contracts/backend/data-contracts';

interface ActivityEvent {
  logKey: string;
  type: 'ACCESS';
  municipalityId: string;
  message: string;
  owner: string;
  created: string;
  sourceType: string;
  metadata: EventMetaData[];
}

const event = (created: string, sourceType: string, metadata: EventMetaData[]): ActivityEvent => ({
  logKey: '12345678-1234-1234-1234-1234567890ab',
  type: 'ACCESS',
  municipalityId: '2281',
  message: sourceType,
  owner: 'BolagenMinaSidor',
  created,
  sourceType,
  metadata,
});

const paged = (
  content: ActivityEvent[],
  overrides: Partial<PagedEventsResponse> = {}
): ApiResponse<PagedEventsResponse> => ({
  data: {
    content,
    pageable: {
      pageNumber: 0,
      pageSize: 5,
      sort: { sorted: true, empty: false, unsorted: false },
      offset: 0,
      paged: true,
      unpaged: false,
    },
    last: true,
    totalElements: content.length,
    totalPages: 1,
    size: 5,
    number: 0,
    sort: { sorted: true, empty: false, unsorted: false },
    first: true,
    numberOfElements: content.length,
    empty: content.length === 0,
    ...overrides,
  },
  message: 'success',
});

const LOGIN = event('2026-05-20T14:13:00.000Z', 'Login', [
  { key: 'loggedInUserName', value: 'Kalle Karlsson' },
  { key: 'loggedInUserPersonNumber', value: '199010100000' },
  { key: 'organizationName', value: 'Blåmesen AB' },
]);

const IMPERSONATION = event('2026-05-18T09:46:00.000Z', 'Impersonation', [
  { key: 'requestedByName', value: 'Maja Andersson' },
  { key: 'requestedByPersonNumber', value: '198501011234' },
  { key: 'accessReason', value: 'I samtal med kunden' },
]);

const IMPERSONATION_LEGACY_USERNAME = event('2026-05-17T09:46:00.000Z', 'Impersonation', [
  { key: 'accessReason', value: 'Annan överenskommelse med kunden' },
]);

const HAN_ACTIVATED = event('2026-04-10T10:00:00.000Z', 'HAN', [
  { key: 'operation', value: 'grant' },
  { key: 'loggedInUserName', value: 'Mirsad Andersson' },
  { key: 'personNumber', value: '199203033456' },
  { key: 'address', value: 'Kajvägen 10' },
  { key: 'facilityId', value: '735999109515160509' },
]);

const HAN_DEACTIVATED = event('2026-03-05T08:00:00.000Z', 'HAN', [
  { key: 'operation', value: 'revoke' },
  { key: 'loggedInUserName', value: 'Mirsad Andersson' },
  { key: 'address', value: 'Kajvägen 10' },
  { key: 'facilityId', value: '735999109515160509' },
]);

const LOGIN_PREVIOUS_YEAR = event('2025-12-01T11:00:00.000Z', 'Login', [
  { key: 'loggedInUserName', value: 'Kalle Karlsson' },
  { key: 'loggedInUserPersonNumber', value: '199010100000' },
  { key: 'organizationName', value: 'Blåmesen AB' },
]);

export const getActivityEvents = (): ApiResponse<PagedEventsResponse> =>
  paged([LOGIN, IMPERSONATION, IMPERSONATION_LEGACY_USERNAME, HAN_ACTIVATED, HAN_DEACTIVATED, LOGIN_PREVIOUS_YEAR], {
    totalElements: 8,
    totalPages: 2,
    last: false,
  });

export const getActivityEventsPageTwo = (): ApiResponse<PagedEventsResponse> =>
  paged(
    [
      event('2026-01-15T07:30:00.000Z', 'Login', [
        { key: 'loggedInUserName', value: 'Sven Svensson' },
        { key: 'loggedInUserPersonNumber', value: '197001011111' },
        { key: 'organizationName', value: 'Blåmesen AB' },
      ]),
    ],
    { number: 1, first: false, last: true, totalElements: 8, totalPages: 2, numberOfElements: 1 }
  );

export const getEmptyActivityEvents = (): ApiResponse<PagedEventsResponse> =>
  paged([], { totalElements: 0, totalPages: 0 });
