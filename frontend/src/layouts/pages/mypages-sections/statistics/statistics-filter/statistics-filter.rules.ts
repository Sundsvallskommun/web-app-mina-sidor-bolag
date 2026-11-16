import { Category } from '@interfaces/measurement-data';
import { User } from '@interfaces/user';
import { FacilityType, FacilityTypeName, facilityTypes, getCategoryFromInstalledBaseType } from '@utils/facility';
import { isNormalYear } from '@utils/normal-year';
import dayjs, { Dayjs } from 'dayjs';
import { generateComparableYears } from './generateDateLists';

export type StatisticsFilterMode = 'day' | 'month' | 'year';
export type StatisticsFacility = User['facilities'][number];

export interface StatisticsFilterState {
  facilityType?: FacilityType;
  facilityIds: string[];
  mode: StatisticsFilterMode;
  selectedYear: string;
  selectedMonth: string;
  selectedDay: string;
  compareYear: string;
  isHourQuarter: boolean;
}

export interface FacilityGroup {
  address: string;
  facilities: string[];
}

export interface StatisticsPeriod {
  date: string;
  fromDate: string;
  toDate: string;
}

// ---------------------------------------------------------------------------------------------------------------------
// Facilities
// ---------------------------------------------------------------------------------------------------------------------

/** The installed base reports electricity consumption as 'El' */
export const toFacilityType = (type: string | undefined): string | undefined =>
  type === 'El' ? FacilityTypeName.ELECTRICITY_CONSUMPTION : type;

export const isFacilityType = (type: string | undefined): type is FacilityType =>
  !!type && facilityTypes.includes(type as FacilityType);

export const getAvailableFacilityTypes = (facilities: StatisticsFacility[]): FacilityType[] => {
  const userTypes = new Set(facilities.map((facility) => toFacilityType(facility.type)));
  return facilityTypes.filter((type) => userTypes.has(type));
};

export const getFacilitiesForType = (
  facilities: StatisticsFacility[],
  facilityType: FacilityType | undefined
): StatisticsFacility[] =>
  facilityType ? facilities.filter((facility) => toFacilityType(facility.type) === facilityType) : [];

export const groupFacilitiesByAddress = (facilities: StatisticsFacility[]): FacilityGroup[] => {
  const groups = new Map<string, string[]>();
  for (const facility of facilities) {
    if (!facility.facilityId) continue;
    const address = facility.address?.street ?? '';
    if (!groups.has(address)) groups.set(address, []);
    groups.get(address)!.push(facility.facilityId);
  }
  return Array.from(groups.entries()).map(([address, ids]) => ({ address, facilities: ids }));
};

/** The first facility of the first address for the given type */
export const getDefaultFacilityIds = (
  facilities: StatisticsFacility[],
  facilityType: FacilityType | undefined
): string[] => {
  const firstGroup = groupFacilitiesByAddress(getFacilitiesForType(facilities, facilityType))[0];
  return firstGroup ? firstGroup.facilities.slice(0, 1) : [];
};

export const getCategory = (facilityType: FacilityType | undefined): string =>
  getCategoryFromInstalledBaseType(facilityType);

// ---------------------------------------------------------------------------------------------------------------------
// Period
// ---------------------------------------------------------------------------------------------------------------------

type PeriodParts = Pick<StatisticsFilterState, 'mode' | 'selectedYear' | 'selectedMonth' | 'selectedDay'>;

/** The date the parts point at, with the day clamped to the month length (e.g. April 31 -> April 30) */
const composeDate = ({ mode, selectedYear, selectedMonth, selectedDay }: PeriodParts): Dayjs => {
  const lastDayOfMonth = dayjs(`${selectedYear}-${selectedMonth}-01`).daysInMonth();
  const day = mode === 'day' ? String(Math.min(Number(selectedDay), lastDayOfMonth)).padStart(2, '0') : '01';
  return dayjs(`${selectedYear}-${selectedMonth}-${day}`);
};

export const resolvePeriod = (parts: PeriodParts, today: Dayjs = dayjs()): StatisticsPeriod => {
  let date = composeDate(parts);
  if (date.isAfter(today, 'day')) {
    date = today;
  }
  return {
    date: date.format('YYYY-MM-DD'),
    fromDate: date.startOf(parts.mode).format('YYYY-MM-DD'),
    toDate: date.endOf(parts.mode).format('YYYY-MM-DD'),
  };
};

/** Years that can be compared against the selected period, newest first, as four digit strings */
export const getComparableYears = (fromDate: string): string[] =>
  generateComparableYears(fromDate).map((year) => dayjs(year).format('YYYY'));

// ---------------------------------------------------------------------------------------------------------------------
// Invariants
// ---------------------------------------------------------------------------------------------------------------------

export const canUseHourQuarter = (state: Pick<StatisticsFilterState, 'mode' | 'facilityType'>): boolean =>
  state.mode === 'day' && getCategory(state.facilityType) === Category.ELECTRICITY;

export const canCompareWithNormalYear = (
  state: Pick<StatisticsFilterState, 'mode' | 'facilityType' | 'facilityIds'>
): boolean =>
  state.mode === 'year' &&
  getCategory(state.facilityType) === Category.DISTRICT_HEATING &&
  state.facilityIds.length <= 1;

export const isValidCompareYear = (state: StatisticsFilterState, fromDate: string): boolean => {
  if (!state.compareYear) return true;
  if (isNormalYear(state.compareYear)) return canCompareWithNormalYear(state);
  return getComparableYears(fromDate).includes(state.compareYear);
};

/**
 * Applies every rule of the filter in one pass. All store updates go through here, so the state can never end up
 * in a combination the UI or the API requests can't handle (e.g. comparing a year with itself).
 */
export const normalizeFilterState = (
  state: StatisticsFilterState,
  facilities: StatisticsFacility[],
  today: Dayjs = dayjs()
): StatisticsFilterState => {
  const next = { ...state };

  // Facility type must be one the user has
  const availableTypes = getAvailableFacilityTypes(facilities);
  if (!next.facilityType || !availableTypes.includes(next.facilityType)) {
    next.facilityType = availableTypes[0];
    next.facilityIds = getDefaultFacilityIds(facilities, next.facilityType);
  }

  // Selected facilities must belong to the facility type
  const validIds = new Set(getFacilitiesForType(facilities, next.facilityType).map((facility) => facility.facilityId));
  if (next.facilityIds.some((id) => !validIds.has(id))) {
    next.facilityIds = next.facilityIds.filter((id) => validIds.has(id));
  }

  // The selected date can't be in the future
  if (composeDate(next).isAfter(today, 'day')) {
    next.selectedYear = today.format('YYYY');
    next.selectedMonth = today.format('MM');
    next.selectedDay = today.format('DD');
  }

  // Quarter hour resolution only exists for electricity per day
  if (next.isHourQuarter && !canUseHourQuarter(next)) {
    next.isHourQuarter = false;
  }

  // Compare year must be offered for the current selection
  if (!isValidCompareYear(next, resolvePeriod(next, today).fromDate)) {
    next.compareYear = '';
  }

  return next;
};

export const createInitialFilterState = (
  facilities: StatisticsFacility[],
  linkedFacilityId?: string | null,
  today: Dayjs = dayjs()
): StatisticsFilterState => {
  const yesterday = today.subtract(1, 'day');
  const base: StatisticsFilterState = {
    facilityType: undefined,
    facilityIds: [],
    mode: 'day',
    selectedYear: yesterday.format('YYYY'),
    selectedMonth: yesterday.format('MM'),
    selectedDay: yesterday.format('DD'),
    compareYear: '',
    isHourQuarter: false,
  };

  const linkedFacility = linkedFacilityId
    ? facilities.find((facility) => facility.facilityId === linkedFacilityId)
    : undefined;
  const linkedType = toFacilityType(linkedFacility?.type);

  if (linkedFacility?.facilityId && isFacilityType(linkedType)) {
    return normalizeFilterState(
      { ...base, facilityType: linkedType, facilityIds: [linkedFacility.facilityId] },
      facilities,
      today
    );
  }

  return normalizeFilterState(base, facilities, today);
};
