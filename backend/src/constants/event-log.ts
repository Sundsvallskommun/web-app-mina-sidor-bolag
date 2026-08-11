export const EXPORT_SOURCE_TYPE = 'Export';
export const LOGIN_SOURCE_TYPE = 'Login';
export const IMPERSONATION_SOURCE_TYPE = 'Impersonation';
export const HAN_SOURCE_TYPE = 'HAN';

export const ACTIVITY_SOURCE_TYPES = [LOGIN_SOURCE_TYPE, IMPERSONATION_SOURCE_TYPE, HAN_SOURCE_TYPE] as const;

export enum ActivityFilter {
  ALL = 'all',
  LOGIN = 'login',
  HAN = 'han',
}
