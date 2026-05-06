'use client';

import { User } from '@interfaces/user';
import { useApi } from '@services/api-service';
import { facilityTypes, FacilityType, FacilityTypeName, getCategoryFromInstalledBaseType } from '@utils/facility';
import { useCheckboxTree } from '@utils/use-checkbox-tree';
import dayjs from 'dayjs';
import { useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { StatisticsForm } from '../../statistics.component';

export type StatisticsFilterMode = 'day' | 'month' | 'year';

export const useStatisticsFilter = () => {
  const searchParams = useSearchParams();
  const linkedFacilityId = searchParams?.get('installation');

  const { setValue, watch, getValues } = useFormContext<StatisticsForm>();
  const [facilityType, setFacilityType] = useState<FacilityType | null>(
    (getValues('facilityType') as FacilityType | undefined) ?? null
  );
  const [mode, setMode] = useState<StatisticsFilterMode>('day');
  const { fromDate, selectedDay, selectedMonth, selectedYear, isHourQuarter } = watch();

  const { data: user } = useApi<User>({
    method: 'get',
    url: '/me',
    queryKey: ['user'],
  });

  const availableFacilityTypes = useMemo(() => {
    if (!user?.facilities) return [];
    const userTypes = new Set(
      user.facilities.map((f) => (f.type === 'El' ? FacilityTypeName.ELECTRICITY_CONSUMPTION : f.type))
    );
    return facilityTypes.filter((type) => userTypes.has(type));
  }, [user?.facilities]);

  useEffect(() => {
    if (availableFacilityTypes.length > 0 && !facilityType) {
      setFacilityType(availableFacilityTypes[0]);
    }
  }, [availableFacilityTypes, facilityType]);

  const facilitiesByType = useMemo(() => {
    if (!facilityType) return [];
    return (
      user?.facilities?.filter((f) => {
        return (
          f.type === facilityType || (facilityType === FacilityTypeName.ELECTRICITY_CONSUMPTION && f.type === 'El')
        );
      }) ?? []
    );
  }, [user, facilityType]);

  const facilitiesGroupedByAddress = useMemo(() => {
    const groupMap = new Map<string, string[]>();
    for (const facility of facilitiesByType) {
      const address = facility.address?.street ?? '';
      if (!groupMap.has(address)) groupMap.set(address, []);
      groupMap.get(address)!.push(facility.facilityId ?? '');
    }
    return Array.from(groupMap.entries()).map(([address, facilities]) => ({ address, facilities }));
  }, [facilitiesByType]);

  const addressGroups = useMemo(
    () => [{ key: 'addresses', items: facilitiesGroupedByAddress.map((g) => g.address) }],
    [facilitiesGroupedByAddress]
  );

  const {
    checkedItems: checkedAddresses,
    allChecked: allAddressesChecked,
    noneChecked: noAddressesChecked,
    toggleItem: toggleAddress,
    toggleAll: toggleAllAddresses,
    isItemChecked: isAddressChecked,
    reset: resetAddresses,
  } = useCheckboxTree(addressGroups);

  const selectedAddresses = useMemo(() => {
    return facilitiesGroupedByAddress.map((g) => g.address).filter((address) => isAddressChecked('addresses', address));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [facilitiesGroupedByAddress, checkedAddresses]);

  const facilityList = useMemo(() => {
    return facilitiesGroupedByAddress.filter((g) => selectedAddresses.includes(g.address)).flatMap((g) => g.facilities);
  }, [facilitiesGroupedByAddress, selectedAddresses]);

  const facilityGroups = useMemo(() => [{ key: 'facilities', items: facilityList }], [facilityList]);

  const {
    checkedItems: checkedFacilities,
    allChecked: allFacilitiesChecked,
    noneChecked: noFacilitiesChecked,
    toggleItem: toggleFacility,
    toggleAll: toggleAllFacilities,
    isItemChecked: isFacilityChecked,
    reset: resetFacilities,
  } = useCheckboxTree(facilityGroups);

  // Deselect facilities that no longer belong to any selected address
  useEffect(() => {
    const validKeys = new Set(facilityList.map((f) => `facilities::${f}`));
    const pruned = Array.from(checkedFacilities).filter((key) => validKeys.has(key));
    if (pruned.length !== checkedFacilities.size) {
      resetFacilities(pruned);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [facilityList]);

  useEffect(() => {
    const facilityIds = Array.from(checkedFacilities).map((key) => key.replace('facilities::', ''));
    setValue('facilityIds', facilityIds);
  }, [checkedFacilities, setValue]);

  useEffect(() => {
    setValue('category', getCategoryFromInstalledBaseType(facilityType ?? undefined));
    setValue('facilityType', facilityType ?? undefined);
  }, [facilityType, setValue]);

  useEffect(() => {
    setValue('addresses', selectedAddresses);
  }, [selectedAddresses, setValue]);

  useEffect(() => {
    resetAddresses([]);
    resetFacilities([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [facilityType]);

  // Select all addresses and facilities by default when user loads
  useEffect(() => {
    if (facilitiesGroupedByAddress.length > 0) {
      const allAddressKeys = facilitiesGroupedByAddress.map((g) => `addresses::${g.address}`);
      resetAddresses(allAddressKeys);
      const allFacilityKeys = facilitiesGroupedByAddress.flatMap((g) => g.facilities.map((f) => `facilities::${f}`));
      resetFacilities(allFacilityKeys);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [facilitiesGroupedByAddress]);

  // Handle linked facility from URL
  useEffect(() => {
    if (linkedFacilityId && user) {
      const facility = user.facilities?.find((f) => f.facilityId === linkedFacilityId);
      if (facility?.address?.street && facility?.facilityId) {
        const type = facility.type === 'El' ? FacilityTypeName.ELECTRICITY_CONSUMPTION : facility.type;
        if (type && facilityTypes.includes(type as FacilityType)) {
          setFacilityType(type as FacilityType);
        }
        setTimeout(() => {
          resetAddresses([`addresses::${facility.address?.street}`]);
          resetFacilities([`facilities::${facility.facilityId}`]);
        }, 100);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (mode !== 'day') {
      setValue('isHourQuarter', false);
    }
  }, [mode, setValue]);

  useEffect(() => {
    const today = dayjs();
    const yesterday = today.subtract(1, 'day');
    const y = selectedYear ?? yesterday.format('YYYY');
    const m = selectedMonth ?? yesterday.format('MM');
    const d = selectedDay ?? yesterday.format('DD');

    // Clamp the day to the last valid day of the target month so dayjs does not overflow
    // into the next month (e.g. switching from March 31 to April would otherwise become May 1).
    const lastDayOfTargetMonth = dayjs(`${y}-${m}-01`).daysInMonth();
    const clampedDay = String(Math.min(Number(d), lastDayOfTargetMonth)).padStart(2, '0');

    let date = dayjs(`${y}-${m}-${mode === 'day' ? clampedDay : '01'}`);
    if (date.isAfter(today, 'day')) {
      date = today;
    }

    setValue('fromDate', date.startOf(mode).format('YYYY-MM-DD'));
    setValue('toDate', date.endOf(mode).format('YYYY-MM-DD'));

    setValue('selectedYear', date.format('YYYY'));
    if (mode === 'month' || mode === 'day') {
      setValue('selectedMonth', date.format('MM'));
    }
    if (mode === 'day') {
      setValue('selectedDay', date.format('DD'));
    }
  }, [mode, selectedDay, selectedMonth, selectedYear, setValue]);

  return {
    availableFacilityTypes,
    facilityType,
    setFacilityType,
    mode,
    setMode,
    isHourQuarter,
    fromDate,
    addresses: {
      groups: facilitiesGroupedByAddress,
      selected: selectedAddresses,
      allChecked: allAddressesChecked,
      noneChecked: noAddressesChecked,
      toggle: toggleAddress,
      toggleAll: toggleAllAddresses,
      isChecked: isAddressChecked,
    },
    facilities: {
      list: facilityList,
      checked: checkedFacilities,
      allChecked: allFacilitiesChecked,
      noneChecked: noFacilitiesChecked,
      toggle: toggleFacility,
      toggleAll: toggleAllFacilities,
      isChecked: isFacilityChecked,
    },
  };
};
