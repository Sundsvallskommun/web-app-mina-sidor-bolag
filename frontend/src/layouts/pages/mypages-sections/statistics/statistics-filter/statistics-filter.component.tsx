'use client';

import { Button, DatePicker, FormLabel, Select } from '@sk-web-gui/react';
import { useApi } from '@services/api-service';
import { User } from '@interfaces/user';
import { useFormContext } from 'react-hook-form';
import { useEffect, useState } from 'react';
import { InstalledBaseItem } from '@data-contracts/installedbase/data-contracts';
import dayjs from 'dayjs';
import { generateYearsBetween } from '@layouts/pages/mypages-sections/statistics/statistics-filter/generateYearsBetween';
import { useSearchParams } from 'next/navigation';

export interface StatisticsFilterProps {
  closeHandler: () => void;
}

export const StatisticsFilter = (props: StatisticsFilterProps) => {
  const searchParams = useSearchParams();
  const linkedFacilityId = searchParams?.get('installation');

  const { closeHandler } = props;
  const { register, watch, setValue } = useFormContext();
  const [facilities, setFacilities] = useState<InstalledBaseItem[]>();
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

  useEffect(() => {
    if (linkedFacilityId) {
      const facility = user?.facilities.find((f) => f.facilityId === linkedFacilityId);
      if (facility?.address?.street && facility?.facilityId) {
        setValue('address', facility.address?.street ?? '');
        setTimeout(() => {
          setValue('facilityId', facility.facilityId);
        }, 100);
      }
    }
  }, []);

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
        <FormLabel>Kategori</FormLabel>
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
