'use client';

import { DatePicker, FormLabel, Input, Select } from '@sk-web-gui/react';
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
  const { address, category } = watch();

  const { data: user } = useApi<User>({
    method: 'get',
    url: '/me',
    queryKey: ['user'],
  });

  useEffect(() => {
    const filteredFacilities = user?.facilities
      .filter(
        (facility) =>
          facility?.address?.street === address && facility.type !== 'Elhandel' && facility.type !== 'Fjärrkyla'
      )
      .sort((a, b) => ((a.type ?? '') > (b.type ?? '') ? 1 : -1));

    console.log('ue ', filteredFacilities);

    if (filteredFacilities?.length) {
      setFacilities(filteredFacilities);
    }
  }, [address, user?.facilities]);

  useEffect(() => {
    if (facilities) {
      setValue(category, facilities[0]?.type);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address, facilities, user?.facilities]);

  console.log('filtered ', facilities);

  useEffect(() => {
    facilities?.map((facility) => {
      if (facility.type === category) {
        setValue('facilityId', facility.facilityId);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category]);

  return (
    user && (
      <section className="lg:flex lg:justify-between block gap-24 lg:pt-0 pt-24">
        <div className="block w-full">
          <Input {...register('facilityId')} hidden />
          <FormLabel>Adress</FormLabel>

          <Select {...register('address')} className="w-full mt-8">
            {user.addresses.map((address) => (
              <Select.Option key={address.address}>{address.address ? address.address : 'Okänd adress'}</Select.Option>
            ))}
          </Select>
        </div>

        <div className="block w-full lg:pt-0 pt-16">
          <FormLabel>Kategori</FormLabel>
          <Select {...register('category')} className="w-full mt-8">
            {facilities?.map((facility) => {
              return (
                <Select.Option key={facility.facilityId + '-' + facility.type} value={facility.type}>
                  {facility.type}
                </Select.Option>
              );
            })}
          </Select>
        </div>

        <div className="block w-full lg:pt-0 pt-16">
          <FormLabel>Från</FormLabel>
          <DatePicker
            {...register('fromDate')}
            className="w-full mt-8"
            defaultValue={dayjs().startOf('year').format('YYYY-MM-DD HH:mm')}
            type="datetime-local"
            max={dayjs().format('YYYY-MM-DD HH:mm')}
          />
        </div>

        <div className="block w-full lg:pt-0 pt-16">
          <FormLabel>Till</FormLabel>
          <DatePicker
            {...register('toDate')}
            defaultValue={dayjs().format('YYYY-MM-DD HH:mm')}
            className="w-full mt-8"
            type="datetime-local"
            max={dayjs().format('YYYY-MM-DD HH:mm')}
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
    )
  );
};
