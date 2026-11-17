'use client';

import { getAddressesFromFacilities } from '@services/measurement-data-service';
import { FacilityType } from '@utils/facility';
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
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
  /** Applies several filter values at once, e.g. from a draft */
  setFilter: (filter: Partial<StatisticsFilterState>) => void;
}

export type StatisticsFilterStore = StatisticsFilterState & {
  facilities: StatisticsFacility[];
} & StatisticsFilterActions;

const createStatisticsFilterStore = (initialState: StatisticsFilterState, facilities: StatisticsFacility[]) =>
  createStore<StatisticsFilterStore>()((set) => {
    /** Every update goes through the rules, so the state is always valid after a single render */
    const update = (patch: (state: StatisticsFilterStore) => Partial<StatisticsFilterState>) =>
      set((state) => normalizeFilterState({ ...state, ...patch(state) }, state.facilities));

    return {
      ...initialState,
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
      setFilter: (filter) => update(() => filter),
    };
  });

/** The values the filter UI edits. isHourQuarter is left out since it is toggled outside the filter. */
const pickEditableFilter = (state: StatisticsFilterStore): Omit<StatisticsFilterState, 'isHourQuarter'> => ({
  facilityType: state.facilityType,
  facilityIds: state.facilityIds,
  mode: state.mode,
  selectedYear: state.selectedYear,
  selectedMonth: state.selectedMonth,
  selectedDay: state.selectedDay,
  compareYear: state.compareYear,
});

const StatisticsFilterContext = createContext<StoreApi<StatisticsFilterStore> | null>(null);
const ApplyDraftContext = createContext<(() => void) | null>(null);

const useStatisticsFilterStoreApi = () => {
  const store = useContext(StatisticsFilterContext);
  if (!store) {
    throw new Error('useStatisticsFilter must be used within a StatisticsFilterProvider');
  }
  return store;
};

export interface StatisticsFilterProviderProps {
  facilities: StatisticsFacility[];
  linkedFacilityId?: string | null;
  children: ReactNode;
}

export const StatisticsFilterProvider = ({ facilities, linkedFacilityId, children }: StatisticsFilterProviderProps) => {
  const [store] = useState(() =>
    createStatisticsFilterStore(createInitialFilterState(facilities, linkedFacilityId), facilities)
  );

  useEffect(() => {
    if (store.getState().facilities !== facilities) {
      store.getState().setFacilities(facilities);
    }
  }, [store, facilities]);

  return <StatisticsFilterContext.Provider value={store}>{children}</StatisticsFilterContext.Provider>;
};

/**
 * Gives its children a copy of the filter store. Changes stay in the copy (no refetching)
 * until useApplyStatisticsFilterDraft() is called. The copy is taken on mount, so remount
 * it (e.g. with a key) to start a new draft.
 */
export const StatisticsFilterDraftProvider = ({ children }: { children: ReactNode }) => {
  const store = useStatisticsFilterStoreApi();
  const facilities = useStore(store, (state) => state.facilities);
  const [draft] = useState(() => {
    const state = store.getState();
    return createStatisticsFilterStore(
      { ...pickEditableFilter(state), isHourQuarter: state.isHourQuarter },
      state.facilities
    );
  });

  // Facilities can still be loading (paged agreements) while the draft is open
  useEffect(() => {
    if (draft.getState().facilities !== facilities) {
      draft.getState().setFacilities(facilities);
    }
  }, [draft, facilities]);

  const apply = useCallback(() => store.getState().setFilter(pickEditableFilter(draft.getState())), [store, draft]);

  return (
    <ApplyDraftContext.Provider value={apply}>
      <StatisticsFilterContext.Provider value={draft}>{children}</StatisticsFilterContext.Provider>
    </ApplyDraftContext.Provider>
  );
};

export const useApplyStatisticsFilterDraft = () => {
  const apply = useContext(ApplyDraftContext);
  if (!apply) {
    throw new Error('useApplyStatisticsFilterDraft must be used within a StatisticsFilterDraftProvider');
  }
  return apply;
};

export function useStatisticsFilter<T>(selector: (state: StatisticsFilterStore) => T): T {
  return useStore(useStatisticsFilterStoreApi(), selector);
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
