'use client';

import { getAddressesFromFacilities } from '@services/measurement-data-service';
import { FacilityType } from '@utils/facility';
import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { createStore, StoreApi, useStore } from 'zustand';
import { useShallow } from 'zustand/react/shallow';
import {
  createInitialFilterState,
  getAvailableFacilityTypes,
  getCategory,
  getComparableYears,
  getDefaultFacilityIds,
  getFacilitiesForType,
  groupFacilitiesByAddress,
  normalizeFilterState,
  resolvePeriod,
  StatisticsFacility,
  StatisticsFilterMode,
  StatisticsFilterState,
} from './statistics-filter.rules';

interface StatisticsFilterActions {
  setFacilityType: (facilityType: FacilityType) => void;
  setFacilityIds: (facilityIds: string[]) => void;
  setMode: (mode: StatisticsFilterMode) => void;
  /** Accepts YYYY-MM-DD. Only the parts relevant for the precision are updated, the rest keep the user's intent. */
  setDate: (date: string, precision: StatisticsFilterMode) => void;
  setCompareYear: (compareYear: string) => void;
  setIsHourQuarter: (isHourQuarter: boolean) => void;
  /** Keeps the store in sync if the user's facilities are refetched */
  setFacilities: (facilities: StatisticsFacility[]) => void;
}

export type StatisticsFilterStore = StatisticsFilterState & {
  facilities: StatisticsFacility[];
} & StatisticsFilterActions;

const createStatisticsFilterStore = (facilities: StatisticsFacility[], linkedFacilityId?: string | null) =>
  createStore<StatisticsFilterStore>()((set) => {
    /** Every update goes through the rules, so the state is always valid after a single render */
    const update = (patch: (state: StatisticsFilterStore) => Partial<StatisticsFilterState>) =>
      set((state) => normalizeFilterState({ ...state, ...patch(state) }, state.facilities));

    return {
      ...createInitialFilterState(facilities, linkedFacilityId),
      facilities,

      setFacilityType: (facilityType) =>
        update((state) =>
          facilityType === state.facilityType
            ? {}
            : { facilityType, facilityIds: getDefaultFacilityIds(state.facilities, facilityType) }
        ),
      setFacilityIds: (facilityIds) => update(() => ({ facilityIds })),
      setMode: (mode) => update(() => ({ mode })),
      setDate: (date, precision) => {
        const [year, month, day] = date.split('-');
        if (!year) return;
        update(() => ({
          selectedYear: year,
          ...(precision !== 'year' && month ? { selectedMonth: month } : {}),
          ...(precision === 'day' && day ? { selectedDay: day } : {}),
        }));
      },
      setCompareYear: (compareYear) => update(() => ({ compareYear })),
      setIsHourQuarter: (isHourQuarter) => update(() => ({ isHourQuarter })),
      setFacilities: (nextFacilities) =>
        set((state) => ({ ...normalizeFilterState(state, nextFacilities), facilities: nextFacilities })),
    };
  });

const StatisticsFilterContext = createContext<StoreApi<StatisticsFilterStore> | null>(null);

export interface StatisticsFilterProviderProps {
  facilities: StatisticsFacility[];
  linkedFacilityId?: string | null;
  children: ReactNode;
}

export const StatisticsFilterProvider = ({ facilities, linkedFacilityId, children }: StatisticsFilterProviderProps) => {
  const [store] = useState(() => createStatisticsFilterStore(facilities, linkedFacilityId));

  useEffect(() => {
    if (store.getState().facilities !== facilities) {
      store.getState().setFacilities(facilities);
    }
  }, [store, facilities]);

  return <StatisticsFilterContext.Provider value={store}>{children}</StatisticsFilterContext.Provider>;
};

export function useStatisticsFilter<T>(selector: (state: StatisticsFilterStore) => T): T {
  const store = useContext(StatisticsFilterContext);
  if (!store) {
    throw new Error('useStatisticsFilter must be used within a StatisticsFilterProvider');
  }
  return useStore(store, selector);
}

export const useStatisticsPeriod = () => {
  const parts = useStatisticsFilter(
    useShallow((state) => ({
      mode: state.mode,
      selectedYear: state.selectedYear,
      selectedMonth: state.selectedMonth,
      selectedDay: state.selectedDay,
    }))
  );
  return useMemo(() => resolvePeriod(parts), [parts]);
};

export const useStatisticsCategory = () => {
  const facilityType = useStatisticsFilter((state) => state.facilityType);
  return getCategory(facilityType);
};

export const useComparableYears = () => {
  const { fromDate } = useStatisticsPeriod();
  return useMemo(() => getComparableYears(fromDate), [fromDate]);
};

export const useFacilityOptions = () => {
  const facilities = useStatisticsFilter((state) => state.facilities);
  const facilityType = useStatisticsFilter((state) => state.facilityType);

  const availableFacilityTypes = useMemo(() => getAvailableFacilityTypes(facilities), [facilities]);
  const groups = useMemo(
    () => groupFacilitiesByAddress(getFacilitiesForType(facilities, facilityType)),
    [facilities, facilityType]
  );
  const optionsKey = useMemo(
    () => groups.map((group) => `${group.address}:${group.facilities.join(',')}`).join('|'),
    [groups]
  );

  return {
    availableFacilityTypes,
    groups,
    optionsKey,
    totalFacilities: groups.reduce((sum, group) => sum + group.facilities.length, 0),
    hasOneFacility: facilities.length === 1,
  };
};

export const useSelectedAddresses = () => {
  const facilities = useStatisticsFilter((state) => state.facilities);
  const facilityIds = useStatisticsFilter((state) => state.facilityIds);
  return useMemo(() => getAddressesFromFacilities(facilities, facilityIds), [facilities, facilityIds]);
};
