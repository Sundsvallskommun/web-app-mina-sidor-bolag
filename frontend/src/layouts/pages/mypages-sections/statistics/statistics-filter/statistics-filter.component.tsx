'use client';

import { DatePicker, FormLabel, Select, Spinner } from '@sk-web-gui/react';
import { useApi } from '@services/api-service';
import { User } from '@interfaces/user';
import { useFormContext } from 'react-hook-form';
import { useEffect, useState } from 'react';
import { InstalledBaseItem } from '@data-contracts/installedbase/data-contracts';
import dayjs from 'dayjs';
import { generateYearsBetween } from '@layouts/pages/mypages-sections/statistics/statistics-filter/generateYearsBetween';

export const StatisticsFilter = () => {
  const { register, watch, setValue } = useFormContext();
  const [facilities, setFacilities] = useState<InstalledBaseItem[]>();
  const { address } = watch();

  const { data: user, isFetching } = useApi<User>({
    method: 'get',
    url: '/me',
    queryKey: ['user'],
  });

  useEffect(() => {
    setValue('address', user?.addresses[0].address);
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

  return user && !isFetching ? (
    <section className="lg:flex lg:justify-between block gap-24 lg:pt-0 pt-24">
      <div className="block w-full">
        <FormLabel>Adress</FormLabel>

        <Select {...register('address')} className="w-full mt-8">
          {user.addresses.map((address) => (
            <Select.Option key={address.address}>{address.address ? address.address : 'Okänd adress'}</Select.Option>
          ))}
        </Select>
      </div>

      <div className="block w-full lg:pt-0 pt-16">
        <FormLabel>Kategori</FormLabel>
        <Select {...register('facilityId')} className="w-full mt-8">
          {facilities?.map((facility) => {
            return (
              <Select.Option key={facility.facilityId + '-' + facility.type} value={facility.facilityId}>
                {facility.type} ({facility.facilityId})
              </Select.Option>
            );
          })}
        </Select>
      </div>

      <div className="block lg:pt-0 pt-16">
        <FormLabel>Från</FormLabel>
        <DatePicker
          {...register('fromDate')}
          className="w-full mt-8"
          defaultValue={dayjs().startOf('year').format('YYYY-MM-DD')}
          type="date"
          max={dayjs().format('YYYY-MM-DD')}
        />
      </div>

      <div className="block lg:pt-0 pt-16">
        <FormLabel>Till</FormLabel>
        <DatePicker
          {...register('toDate')}
          defaultValue={dayjs().format('YYYY-MM-DD')}
          className="w-full mt-8"
          type="date"
          max={dayjs().format('YYYY-MM-DD')}
        />
      </div>

      <div className="block w-full lg:pt-0 pt-16">
        <FormLabel>Jämför med år</FormLabel>
        <Select {...register('year')} className="w-full mt-8">
          <Select.Option key={0} value="">
            Välj år
          </Select.Option>
          {generateYearsBetween().map((year) => (
            <Select.Option key={year}>{year}</Select.Option>
          ))}
        </Select>
      </div>
    </section>
  ) : (
    <Spinner className="mx-auto" />
  );
};
