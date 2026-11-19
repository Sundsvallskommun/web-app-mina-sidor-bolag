import { Metadata } from '@/data-contracts/eventlog/data-contracts';
import {
  ACTIVITY_SOURCE_TYPES,
  ActivityFilter,
  IMPERSONATION_SOURCE_TYPE,
  LOGIN_SOURCE_TYPE,
} from '@/constants/event-log';
import { HttpException } from '@exceptions/HttpException';

export const getActivitySourceTypes = (sourceTypeFilter: unknown): readonly string[] => {
  const value = typeof sourceTypeFilter === 'string' ? sourceTypeFilter.toLowerCase() : '';
  switch (value) {
    case ActivityFilter.LOGIN:
      return [LOGIN_SOURCE_TYPE];
    case ActivityFilter.IMPERSONATION:
      return [IMPERSONATION_SOURCE_TYPE];
    case ActivityFilter.ALL:
    default:
      return ACTIVITY_SOURCE_TYPES;
  }
};

interface ActivityFilterParams {
  namespace: string;
  sourceTypeFilter: unknown;
  from?: string;
  to?: string;
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}(:\d{2}(\.\d{1,9})?)?(Z|[+-]\d{2}:\d{2})?)?$/;

const toFilterDate = (value: unknown): string | undefined => {
  if (value === undefined || value === null || value === '') return undefined;
  if (typeof value !== 'string' || !ISO_DATE.test(value) || Number.isNaN(Date.parse(value))) {
    throw new HttpException(400, 'Bad Request');
  }
  return value;
};

export const buildActivityFilter = ({ namespace, sourceTypeFilter, from, to }: ActivityFilterParams): string => {
  const sourceTypes = getActivitySourceTypes(sourceTypeFilter);
  const sourceTypeClause = sourceTypes.map(sourceType => `sourceType:'${sourceType}'`).join(' or ');

  const fromDate = toFilterDate(from);
  const toDate = toFilterDate(to);
  const parts = [`owner:'${namespace}'`, sourceTypes.length > 1 ? `(${sourceTypeClause})` : sourceTypeClause];

  if (fromDate) {
    parts.push(`created >= '${fromDate}'`);
  }
  if (toDate) {
    parts.push(`created <= '${toDate}'`);
  }

  return parts.join(' and ');
};

const INTERNAL_METADATA_KEYS = new Set(['requestedByPartyId']);

export const sanitizeActivityMetadata = (metadata: Metadata[] = []): Metadata[] => {
  const requestedByPartyId = metadata.find(item => item.key === 'requestedByPartyId')?.value;

  return metadata.filter(
    item =>
      !INTERNAL_METADATA_KEYS.has(item.key) && !(item.key === 'requestedByName' && item.value === requestedByPartyId),
  );
};
