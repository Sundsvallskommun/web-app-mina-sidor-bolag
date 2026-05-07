'use client';

import { User } from '@interfaces/user';
import { useApi } from '@services/api-service';
import { facilityTypes, FacilityType, FacilityTypeName, getCategoryFromInstalledBaseType } from '@utils/facility';
import { useCheckboxTree } from '@utils/use-checkbox-tree';
import dayjs from 'dayjs';
import { useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useRef } from 'react';
import { useFormContext } from 'react-hook-form';
import { StatisticsForm } from '../../statistics.component';

export type StatisticsFilterMode = 'day' | 'month' | 'year';

export const useStatisticsFilter = () => {
  const searchParams = useSearchParams();
  const linkedFacilityId = searchParams?.get('installation');

  const { setValue, watch } = useFormContext<StatisticsForm>();
  const {
    fromDate,
    selectedDay,
    selectedMonth,
    selectedYear,
    isHourQuarter,
    mode,
    facilityType,
    addresses: checkedAddresses = [],
    facilityIds: checkedFacilityIds = [],
  } = watch();

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
      setValue('facilityType', availableFacilityTypes[0]);
    }
  }, [availableFacilityTypes, facilityType, setValue]);

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

  const addressTreeValue = useMemo(() => new Set(checkedAddresses.map((a) => `addresses::${a}`)), [checkedAddresses]);

  const addressTree = useCheckboxTree(addressGroups, {
    value: addressTreeValue,
    onChange: (next) => {
      setValue(
        'addresses',
        Array.from(next).map((k) => k.replace('addresses::', ''))
      );
    },
  });

  const facilityList = useMemo(() => {
    return facilitiesGroupedByAddress.filter((g) => checkedAddresses.includes(g.address)).flatMap((g) => g.facilities);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [facilitiesGroupedByAddress, checkedAddresses]);

  const facilityGroups = useMemo(() => [{ key: 'facilities', items: facilityList }], [facilityList]);

  const facilityTreeValue = useMemo(
    () => new Set(checkedFacilityIds.map((id) => `facilities::${id}`)),
    [checkedFacilityIds]
  );

  const facilityTree = useCheckboxTree(facilityGroups, {
    value: facilityTreeValue,
    onChange: (next) => {
      setValue(
        'facilityIds',
        Array.from(next).map((k) => k.replace('facilities::', ''))
      );
    },
  });

  // Deselect facilities that no longer belong to any selected address
  useEffect(() => {
    const validSet = new Set(facilityList);
    const pruned = checkedFacilityIds.filter((id) => validSet.has(id));
    if (pruned.length !== checkedFacilityIds.length) {
      setValue('facilityIds', pruned);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [facilityList]);

  useEffect(() => {
    setValue('category', getCategoryFromInstalledBaseType(facilityType ?? undefined));
  }, [facilityType, setValue]);

  // Reset selections when facilityType actually changes (not on mount of a new hook instance)
  const prevFacilityTypeRef = useRef(facilityType);
  useEffect(() => {
    if (prevFacilityTypeRef.current !== facilityType) {
      prevFacilityTypeRef.current = facilityType;
      setValue('addresses', []);
      setValue('facilityIds', []);
    }
  }, [facilityType, setValue]);

  // Select all addresses and facilities when the available groups actually change, not on mount of a new hook instance
  const prevGroupedRef = useRef(facilitiesGroupedByAddress);
  useEffect(() => {
    if (prevGroupedRef.current !== facilitiesGroupedByAddress) {
      prevGroupedRef.current = facilitiesGroupedByAddress;
      if (facilitiesGroupedByAddress.length > 0) {
        setValue(
          'addresses',
          facilitiesGroupedByAddress.map((g) => g.address)
        );
        setValue(
          'facilityIds',
          facilitiesGroupedByAddress.flatMap((g) => g.facilities)
        );
      }
    }
  }, [facilitiesGroupedByAddress, setValue]);

  // Handle linked facility from URL
  useEffect(() => {
    if (linkedFacilityId && user) {
      const facility = user.facilities?.find((f) => f.facilityId === linkedFacilityId);
      if (facility?.address?.street && facility?.facilityId) {
        const type = facility.type === 'El' ? FacilityTypeName.ELECTRICITY_CONSUMPTION : facility.type;
        if (type && facilityTypes.includes(type as FacilityType)) {
          setValue('facilityType', type as FacilityType);
        }
        setTimeout(() => {
          setValue('addresses', [facility.address!.street!]);
          setValue('facilityIds', [facility.facilityId!]);
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
    isHourQuarter,
    fromDate,
    addresses: {
      groups: facilitiesGroupedByAddress,
      selected: checkedAddresses,
      allChecked: addressTree.allChecked,
      noneChecked: addressTree.noneChecked,
      toggle: addressTree.toggleItem,
      toggleAll: addressTree.toggleAll,
      isChecked: addressTree.isItemChecked,
    },
    facilities: {
      list: facilityList,
      checked: checkedFacilityIds,
      allChecked: facilityTree.allChecked,
      noneChecked: facilityTree.noneChecked,
      toggle: facilityTree.toggleItem,
      toggleAll: facilityTree.toggleAll,
      isChecked: facilityTree.isItemChecked,
    },
  };
};
