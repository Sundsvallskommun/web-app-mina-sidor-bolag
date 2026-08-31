import { Metadata } from '@/data-contracts/eventlog/data-contracts';
import { ACTIVITY_SOURCE_TYPES, ActivityFilter, HAN_SOURCE_TYPE, LOGIN_SOURCE_TYPE } from '@/constants/event-log';

export const getActivitySourceTypes = (sourceTypeFilter: unknown): readonly string[] => {
  const value = typeof sourceTypeFilter === 'string' ? sourceTypeFilter.toLowerCase() : '';
  switch (value) {
    case ActivityFilter.LOGIN:
      return [LOGIN_SOURCE_TYPE];
    case ActivityFilter.HAN:
      return [HAN_SOURCE_TYPE];
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

export const buildActivityFilter = ({ namespace, sourceTypeFilter, from, to }: ActivityFilterParams): string => {
  const sourceTypes = getActivitySourceTypes(sourceTypeFilter);
  const sourceTypeClause = sourceTypes.map(sourceType => `sourceType:'${sourceType}'`).join(' or ');

  const parts = [`owner:'${namespace}'`, sourceTypes.length > 1 ? `(${sourceTypeClause})` : sourceTypeClause];

  if (from) {
    parts.push(`created >= '${from}'`);
  }
  if (to) {
    parts.push(`created <= '${to}'`);
  }

  return parts.join(' and ');
};

const INTERNAL_METADATA_KEYS = ['requestedByPartyId'];

export const sanitizeActivityMetadata = (metadata: Metadata[] = []): Metadata[] => {
  const requestedByPartyId = metadata.find(item => item.key === 'requestedByPartyId')?.value;

  return metadata.filter(
    item =>
      !INTERNAL_METADATA_KEYS.includes(item.key) &&
      !(item.key === 'requestedByName' && item.value === requestedByPartyId),
  );
};
