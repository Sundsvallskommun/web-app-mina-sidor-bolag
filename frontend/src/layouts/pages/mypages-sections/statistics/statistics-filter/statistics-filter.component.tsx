'use client';

import { Button, cx, DatePicker, FormLabel, MenuBar, Select } from '@sk-web-gui/react';
import { useApi } from '@services/api-service';
import { User } from '@interfaces/user';
import { useFormContext } from 'react-hook-form';
import { useEffect, useMemo, useState } from 'react';
import { InstalledBaseItem } from '@data-contracts/installedbase/data-contracts';
import dayjs, { Dayjs } from 'dayjs';
import {
  generateSelectableMonths,
  generateYearsBetween,
} from '@layouts/pages/mypages-sections/statistics/statistics-filter/generateDateLists';

export interface StatisticsFilterProps {
  closeHandler: () => void;
}

export const StatisticsFilter = (props: StatisticsFilterProps) => {
  const { closeHandler } = props;
  const { register, watch, setValue, getValues } = useFormContext();
  const [facilities, setFacilities] = useState<InstalledBaseItem[]>();
  const [mode, setMode] = useState<'day' | 'month' | 'year'>('month');
  const { address, fromDate } = watch();

  const { data: user } = useApi<User>({
    method: 'get',
    url: '/me',
    queryKey: ['user'],
  });

  const selectableYears = useMemo(() => {
    return generateYearsBetween(dayjs().add(1, 'year').format('YYYY-MM-DD'));
  }, []);

  const selectableMonths = useMemo(() => {
    return generateSelectableMonths(dayjs().format('YYYY-MM-DD'));
  }, []);

  useEffect(() => {
    setValue('address', user?.addresses[0]?.address);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    const filteredFacilities = user?.facilities
      .filter(
        (facility) =>
          facility?.address?.street === address && facility.type !== 'Elhandel' && facility.type !== 'Fjärrkyla'
      )
      .sort((a, b) => ((a.type ?? '') > (b.type ?? '') ? 1 : -1));

    setFacilities(filteredFacilities);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address, user]);

  useEffect(() => {
    if (facilities) {
      setValue('facilityId', facilities[0]?.facilityId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [facilities, address]);

  const setDate = (date: Dayjs, by: 'year' | 'month' | 'day') => {
    setValue('selectedYear', date.startOf('year').format('YYYY-MM-DD'), {
      shouldDirty: true,
    });
    setValue('selectedMonth', date.startOf('month').format('YYYY-MM-DD'), {
      shouldDirty: true,
    });
    setValue('selectedDay', date.startOf('day').format('YYYY-MM-DD'), {
      shouldDirty: true,
    });
    setValue('fromDate', date.startOf(by).format('YYYY-MM-DD'), {
      shouldDirty: true,
    });
    setValue('toDate', date.endOf(by).format('YYYY-MM-DD'), {
      shouldDirty: true,
    });
  };

  useEffect(() => {
    setDate(dayjs(), mode);
  }, []);

  return (
    <>
      <section className="lg:flex lg:justify-between block gap-48 lg:pt-0 pt-24">
        <div className="flex flex-col lg:flex-row gap-16 w-full lg:w-2/5 lg:pt-0 pt-24">
          <div className="block w-full">
            <FormLabel>Adress</FormLabel>

            <Select {...register('address')} className="w-full mt-8">
              {user?.addresses.map((address) => (
                <Select.Option key={address.address}>
                  {address.address ? address.address : 'Okänd adress'}
                </Select.Option>
              ))}
            </Select>
          </div>

          <div className="block w-full">
            <FormLabel>Avtalstyp</FormLabel>
            <Select {...register('facilityId')} className="w-full mt-8">
              {facilities?.map((facility) => {
                return (
                  <Select.Option key={facility.facilityId + '-' + facility.type} value={facility.facilityId}>
                    {facility.type === 'El' ? 'Elförbrukning' : facility.type} ({facility.facilityId})
                  </Select.Option>
                );
              })}
            </Select>
          </div>
        </div>
        {/* <p className="sm:hidden block text-large font-bold pt-32">Tidsperiod</p> */}
        <div className="flex flex-col lg:flex-row gap-16 w-full lg:w-1/2 lg:pt-0 pt-16">
          <div className="block w-full lg:pt-0 pt-16 lg:justify-end justify-center">
            <div className="block w-full lg:pt-0 pt-16">
              <FormLabel>Visa statistik per</FormLabel>
              <MenuBar className="!py-6 bg-tertiary-surface flex justify-around" size="md">
                {[
                  { value: 'year', label: 'År' },
                  { value: 'month', label: 'Månad' },
                  { value: 'day', label: 'Dag' },
                ].map((item, index) => (
                  <MenuBar.Item key={index} className="lg:w-auto w-full !p-0 !m-0">
                    <Button
                      className="lg:w-auto w-full !h-[12px] !py-0"
                      size="sm"
                      inverted={mode === item.value}
                      onClick={() => {
                        setMode(item.value as 'year' | 'month' | 'day');
                        if (item.value === 'year') {
                          setDate(dayjs(getValues().fromDate), 'year');
                        } else if (item.value === 'month') {
                          setDate(dayjs(getValues().fromDate), 'month');
                        } else {
                          setDate(dayjs(getValues().fromDate), 'day');
                        }
                      }}
                    >
                      {item.label}
                    </Button>
                  </MenuBar.Item>
                ))}
              </MenuBar>
            </div>
          </div>
          <div className={cx(`w-full lg:w-2/3 lg:pt-0 pt-16`, mode === 'year' ? 'block' : 'hidden')}>
            <FormLabel>År</FormLabel>
            <Select
              {...register('selectedYear')}
              className="w-full mt-8"
              onChange={(e) => {
                const selectedDate = dayjs(e.target.value);
                setDate(selectedDate, 'year');
              }}
            >
              {selectableYears.map((y) => (
                <Select.Option key={`selectedYear-${y}`} value={y}>
                  {dayjs(y).format('YYYY')}
                </Select.Option>
              ))}
            </Select>
          </div>
          <div className={cx(`w-full lg:w-2/3 lg:pt-0 pt-16`, mode === 'month' ? 'block' : 'hidden')}>
            <FormLabel>Månad</FormLabel>
            <Select
              className="w-full mt-8"
              {...register('selectedMonth')}
              onChange={(e) => {
                const selectedDate = dayjs(e.target.value);
                setDate(selectedDate, 'month');
              }}
            >
              {selectableMonths.map((y) => (
                <Select.Option key={y.label} value={y.value}>
                  {y.label}
                </Select.Option>
              ))}
            </Select>
          </div>
          <div className={cx(`w-full lg:w-2/3 lg:pt-0 pt-16`, mode === 'day' ? 'block' : 'hidden')}>
            <FormLabel>Dag</FormLabel>
            <DatePicker
              {...register('selectedDay')}
              className="w-full mt-8"
              type="date"
              min={dayjs('2022-01-01').format('YYYY-MM-DD')}
              max={dayjs().format('YYYY-MM-DD')}
              onChange={(e) => {
                const selectedDate = dayjs(e.target.value);
                setDate(selectedDate, 'day');
              }}
            />
          </div>
          <div className="block w-full lg:w-2/3 lg:pt-0 pt-16">
            <FormLabel>Jämför med år</FormLabel>
            <Select {...register('year')} className="w-full mt-8">
              <Select.Option key={0} value="">
                Välj år
              </Select.Option>
              {generateYearsBetween(fromDate).map((y) => (
                <Select.Option key={`compareTo-${y}`}>{dayjs(y).format('YYYY')}</Select.Option>
              ))}
            </Select>
          </div>

          <Button onClick={closeHandler} className="sm:hidden block w-full mt-48">
            Använd
          </Button>
        </div>
      </section>
    </>
  );
};
