/** The granularity level a user selects for the date range (year / month / day). */
export type DatePeriod = 'year' | 'month' | 'day';

/** The input type passed to the date picker component, matching HTML date input variants. */
export type DatePickerType = 'year' | 'month' | 'date';

/** Maps a DatePeriod to the corresponding DatePickerType used by the date picker input. */
export const getDatePickerType = (period: DatePeriod): DatePickerType => {
  if (period === 'year') return 'year';
  if (period === 'month') return 'month';
  return 'date';
};

/**
 * Trims a full ISO date string (YYYY-MM-DD) down to the precision required by a given input type.
 * e.g. 'date' --> 'YYYY-MM-DD', 'month' --> 'YYYY-MM', 'year' --> 'YYYY'
 */
export const formatDateForInputType = (date: string, inputType: DatePickerType): string => {
  if (!date) return '';
  if (inputType === 'year') return date.slice(0, 4); // YYYY
  if (inputType === 'month') return date.slice(0, 7); // YYYY-MM
  return date.slice(0, 10); // YYYY-MM-DD
};

/**
 * Returns the last calendar day of the given month as a full date string.
 * e.g. '2024-02' --> '2024-02-29'
 */
export const lastDayOfMonth = (yearMonth: string): string => {
  const [year, month] = yearMonth.split('-').map(Number);
  const lastDay = new Date(year, month, 0).getDate();
  return `${yearMonth}-${String(lastDay).padStart(2, '0')}`;
};

/**
 * Adapts a start date string when the picker type changes (e.g. from month to day).
 * Expands partial dates toward their earliest valid value:
 *   year  --> month : appends '-01' (first month)
 *   year  --> date  : appends '-01-01' (Jan 1st)
 *   month --> date  : appends '-01' (1st of the month)
 * Truncates when moving to a coarser precision (e.g. date --> year keeps only YYYY).
 */
export const adaptStartDate = (date: string, from: DatePickerType, to: DatePickerType): string => {
  if (!date || from === to) return date;
  if (to === 'year') return date.slice(0, 4);
  if (to === 'month') return from === 'year' ? `${date}-01` : date.slice(0, 7);
  return from === 'year' ? `${date}-01-01` : `${date}-01`;
};

/**
 * Adapts an end date string when the picker type changes (e.g. from month to day).
 * Expands partial dates toward their latest valid value:
 *   year  --> month : appends '-12' (last month)
 *   year  --> date  : appends '-12-31' (Dec 31st)
 *   month --> date  : resolves to the actual last day of that month
 * Truncates when moving to a coarser precision (e.g. date --> year keeps only YYYY).
 */
export const adaptEndDate = (date: string, from: DatePickerType, to: DatePickerType): string => {
  if (!date || from === to) return date;
  if (to === 'year') return date.slice(0, 4);
  if (to === 'month') return from === 'year' ? `${date}-12` : date.slice(0, 7);
  return from === 'year' ? `${date}-12-31` : lastDayOfMonth(date);
};

/**
 * Derives the initial DatePeriod from the current chart time resolution.
 * The period is one level coarser than the resolution so the default range is meaningful:
 *   'month' resolution --> 'year' period (pick a full year)
 *   'day'   resolution --> 'month' period (pick a full month)
 *   anything else      --> 'day' period
 */
export const getInitialDatePeriod = (resolution?: string): DatePeriod => {
  if (resolution === 'month') return 'year';
  if (resolution === 'day') return 'month';
  return 'day';
};

/**
 * Derives the initial time interval from the current chart time resolution.
 * Defaults to 'hour' unless the resolution is explicitly 'quarter'.
 */
export const getInitialTimeInterval = (resolution?: string): 'hour' | 'quarter' => {
  return resolution === 'quarter' ? 'quarter' : 'hour';
};
