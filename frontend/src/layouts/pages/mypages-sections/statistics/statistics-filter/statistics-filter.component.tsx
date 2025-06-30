'use client';

import { Button, DatePicker, FormLabel, MenuBar, Select } from '@sk-web-gui/react';
import { useApi } from '@services/api-service';
import { User } from '@interfaces/user';
import { useFormContext } from 'react-hook-form';
import { useEffect, useState } from 'react';
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
  const { register, watch, setValue } = useFormContext();
  const [facilities, setFacilities] = useState<InstalledBaseItem[]>();
  const [mode, setMode] = useState<'day' | 'month' | 'year'>('year');
  const { address, fromDate } = watch();

  const { data: user } = useApi<User>({
    method: 'get',
    url: '/me',
    queryKey: ['user'],
  });

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

  const setDate = (date: Dayjs) => {
    setValue('selectedYear', date.format('YYYY'));
    setValue('selectedMonth', date.startOf('month').format('YYYY-MM-DD'));
    setValue('selectedDay', date.format('YYYY-MM-DD'));
  };

  return (
    <section className="lg:flex lg:justify-between block gap-24 lg:pt-0 pt-24">
      <div className="block w-full">
        <FormLabel>Adress</FormLabel>

        <Select {...register('address')} className="w-full mt-8">
          {user?.addresses.map((address) => (
            <Select.Option key={address.address}>{address.address ? address.address : 'Okänd adress'}</Select.Option>
          ))}
        </Select>
      </div>

      <div className="block w-full lg:pt-0 pt-16">
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

      <p className="sm:hidden block text-large font-bold pt-32">Tidsperiod</p>
      <div className="block w-full lg:pt-0 pt-16 lg:justify-end justify-center">
        <div className="h-full flex items-end justify-end">
          <MenuBar className="lg:w-auto w-full lg:mt-0 mt-40 !py-6 bg-tertiary-surface">
            {[
              { value: 'year', label: 'Per år' },
              { value: 'month', label: 'Per månad' },
              { value: 'day', label: 'Per dag' },
            ].map((item, index) => (
              <MenuBar.Item key={index} className="lg:w-auto w-full">
                <Button
                  className="lg:w-auto w-full"
                  size="sm"
                  inverted={mode === item.value}
                  onClick={() => {
                    setMode(item.value as 'year' | 'month' | 'day');
                  }}
                >
                  {item.label}
                </Button>
              </MenuBar.Item>
            ))}
          </MenuBar>
        </div>
      </div>
      {mode === 'year' ? (
        <div className="block w-full lg:pt-0 pt-16">
          <FormLabel>År</FormLabel>
          <Select
            {...register('selectedYear')}
            className="w-full mt-8"
            onChange={(e) => {
              const selectedDate = dayjs(e.target.value);
              setValue('fromDate', selectedDate.startOf('year').format('YYYY-MM-DD'));
              setValue('toDate', selectedDate.endOf('year').format('YYYY-MM-DD'));
              setDate(selectedDate);
            }}
          >
            {generateYearsBetween(dayjs().add(1, 'year').format('YYYY-MM-DD')).map((y) => (
              <Select.Option key={y}>{y}</Select.Option>
            ))}
          </Select>
        </div>
      ) : mode === 'month' ? (
        <div className="block w-full lg:pt-0 pt-16">
          <FormLabel>Månad</FormLabel>
          <Select
            className="w-full mt-8"
            {...register('selectedMonth')}
            onChange={(e) => {
              const selectedDate = dayjs(e.target.value);
              setValue('fromDate', selectedDate.startOf('month').format('YYYY-MM-DD'));
              setValue('toDate', selectedDate.endOf('month').format('YYYY-MM-DD'));
              setDate(selectedDate);
            }}
          >
            {generateSelectableMonths(dayjs().format('YYYY-MM-DD')).map((y) => (
              <Select.Option key={y.label} value={y.value.format('YYYY-MM-DD')}>
                {y.label}
              </Select.Option>
            ))}
          </Select>
        </div>
      ) : (
        <div className="block lg:pt-0 pt-16">
          <FormLabel>Dag</FormLabel>
          <DatePicker
            {...register('selectedDay')}
            defaultValue={dayjs().format('YYYY-MM-DD')}
            className="w-full mt-8"
            type="date"
            min={dayjs('2022-01-01').format('YYYY-MM-DD')}
            max={dayjs().format('YYYY-MM-DD')}
            onChange={(e) => {
              const selectedDate = dayjs(e.target.value);
              setValue('fromDate', selectedDate.format('YYYY-MM-DD'));
              setValue('toDate', selectedDate.format('YYYY-MM-DD'));
              setDate(selectedDate);
            }}
          />
        </div>
      )}
      <div className="block w-full lg:w-3/4 lg:pt-0 pt-16">
        <FormLabel>Jämför med år</FormLabel>
        <Select {...register('year')} className="w-full mt-8">
          <Select.Option key={0} value="">
            Välj år
          </Select.Option>
          {generateYearsBetween(fromDate).map((y) => (
            <Select.Option key={y}>{y}</Select.Option>
          ))}
        </Select>
      </div>

      <Button onClick={closeHandler} className="sm:hidden block w-full mt-48">
        Använd
      </Button>
    </section>
  );
};
