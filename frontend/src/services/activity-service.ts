import { EventMetaData, EventResponse, PagedEventsResponse } from '@data-contracts/backend/data-contracts';
import { MonthNumber } from '@components/timeline/timeline.component';
import { useApi } from '@services/api-service';
import {
  ActivityData,
  ActivityItem,
  ActivityType,
  ActivityYearGroup,
} from '@layouts/pages/mypages-sections/activity/activity.types';
import dayjs from 'dayjs';

interface ActivityQuery {
  activityTypeFilter: string;
  from: string;
  to: string;
}

type Meta = Record<string, string>;

const toMeta = (metadata: EventMetaData[]): Meta => Object.fromEntries(metadata.map(({ key, value }) => [key, value]));

const toActivityType = (sourceType: string | null | undefined, meta: Meta): ActivityType => {
  switch (sourceType) {
    case 'Login':
      return 'login';
    case 'Impersonation':
      return 'impersonation';
    case 'HAN':
      // TODO(HYDRAN-1821): confirm the HAN aktiverad/inaktiverad signal from the BFUS->eventlog writer.
      return meta.operation === 'revoke' ? 'hanDeactivated' : 'hanActivated';
    default:
      return 'login';
  }
};

const mapEvent = (event: EventResponse, index: number): ActivityItem => {
  const meta = toMeta(event.metadata as unknown as EventMetaData[]);
  const type = toActivityType(event.sourceType, meta);
  const base = { id: `${event.created ?? ''}-${index}`, type, timestamp: event.created ?? '' };

  switch (type) {
    case 'login':
      return {
        ...base,
        name: meta.loggedInUserName ?? '',
        personNumber: meta.loggedInUserPersonNumber ?? '',
        organizationName: meta.organizationName,
      };
    case 'impersonation':
      return {
        ...base,
        name: meta.requestedByName ?? '',
        personNumber: meta.requestedByPersonNumber ?? '',
        supportReason: meta.accessReason,
      };
    case 'hanActivated':
    case 'hanDeactivated':
      return {
        ...base,
        name: meta.loggedInUserName ?? '',
        personNumber: meta.personNumber ?? '',
        address: meta.address,
        facilityId: meta.facilityId,
      };
  }
};

const groupByYearMonth = (items: ActivityItem[]): ActivityYearGroup[] => {
  const years = new Map<number, Map<MonthNumber, ActivityItem[]>>();

  for (const item of items) {
    const date = dayjs(item.timestamp);
    const year = date.year();
    const month = (date.month() + 1) as MonthNumber;

    const months = years.get(year) ?? new Map<MonthNumber, ActivityItem[]>();
    months.set(month, [...(months.get(month) ?? []), item]);
    years.set(year, months);
  }

  return [...years.entries()]
    .sort(([a], [b]) => b - a)
    .map(([year, months]) => ({
      year,
      months: [...months.entries()]
        .sort(([a], [b]) => b - a)
        .map(([month, monthItems]) => ({ month, items: monthItems })),
    }));
};

export const mapActivityResponse = (data: PagedEventsResponse): ActivityData => {
  const events = (data.content ?? []) as EventResponse[];
  return {
    years: groupByYearMonth(events.map(mapEvent)),
    totalPages: data.totalPages ?? 0,
    totalElements: data.totalElements ?? 0,
  };
};

interface UseActivityOptions {
  page?: number;
  size?: number;
}

export const useActivity = (filter: ActivityQuery, { page = 0, size = 20 }: UseActivityOptions = {}) => {
  const params = new URLSearchParams({
    // The frontend `activityTypeFilter` maps to the backend `sourceTypeFilter` query param.
    sourceTypeFilter: filter.activityTypeFilter,
    page: String(page),
    size: String(size),
    sort: 'created,desc',
  });
  if (filter.from) params.append('from', filter.from);
  if (filter.to) params.append('to', filter.to);

  return useApi<PagedEventsResponse, Error, ActivityData>({
    method: 'get',
    url: `/event/activity?${params}`,
    dataHandler: mapActivityResponse,
    queryKey: ['activity', filter.activityTypeFilter, filter.from, filter.to, String(page), String(size)],
  });
};
