/**
 * Source types for eventlog events.
 *
 * `Export` and `Login` are chosen by this application. `Impersonation` is written by the
 * impersonation flow (HYDRAN-1191). `HAN` is fetched from BFUS and is NOT implemented here yet.
 *
 * NOTE: the eventlog filter does an exact string match, so any value written by another system
 * (Impersonation, HAN) must match that system exactly.
 */
export const EXPORT_SOURCE_TYPE = 'Export';
export const LOGIN_SOURCE_TYPE = 'Login';
export const IMPERSONATION_SOURCE_TYPE = 'Impersonation';
// TODO(HYDRAN-1821): HAN events not written to the eventlog yet. Confirm the exact sourceType and how
// aktiverad/inaktiverad (BFUS permission grant vs revoke) is encoded with the BFUS->eventlog writer.
// Recommended: single 'HAN' sourceType + metadata operation (grant|revoke) for the badge.
export const HAN_SOURCE_TYPE = 'HAN';

/**
 * Source types shown in the Aktivitet view. `Export` is deliberately excluded — it lives under Statistik.
 */
export const ACTIVITY_SOURCE_TYPES = [LOGIN_SOURCE_TYPE, IMPERSONATION_SOURCE_TYPE, HAN_SOURCE_TYPE] as const;

/**
 * The "Visa" filter in the Aktivitet view. `ALL` shows every activity source type (excluding Export),
 * `LOGIN` only logins, `HAN` only HAN-port events. Customer service (Impersonation) only appears under `ALL`.
 */
export enum ActivityFilter {
  ALL = 'all',
  LOGIN = 'login',
  HAN = 'han',
}
