'use client';

import { FormLabel, Input, Select } from '@sk-web-gui/react';
import { useApi } from '@services/api-service';
import { User } from '@interfaces/user';
import { useFormContext } from 'react-hook-form';

export const StatisticsFilter = () => {
  const { register } = useFormContext();

  const { data: user } = useApi<User>({
    url: `/me`,
    method: 'get',
  });

  function generateYearsBetween() {
    let startYear = 2022;
    const endDate = new Date().getFullYear();
    const years: number[] = [];

    for (let i = startYear; i < endDate; i++) {
      years.push(startYear);
      startYear++;
    }

    return years;
  }

  return (
    user && (
      <section className="lg:flex lg:justify-between block gap-24 lg:pt-0 pt-24">
        <div className="block w-full">
          <FormLabel>Adress</FormLabel>
          <Select {...register('address')} className="w-full mt-8">
            {user.addresses.map((address, index: number) => (
              <Select.Option key={`address-${index}`}>{address.address ?? 'Okänd adress'}</Select.Option>
            ))}
          </Select>
        </div>

        <div className="block w-full lg:pt-0 pt-16">
          <FormLabel>Kategori</FormLabel>
          <Select {...register('category')} className="w-full mt-8"></Select>
        </div>

        <div className="block w-full lg:pt-0 pt-16">
          <FormLabel>Från</FormLabel>
          <Input {...register('fromDate')} className="w-full mt-8" type="date" />
        </div>

        <div className="block w-full lg:pt-0 pt-16">
          <FormLabel>Till</FormLabel>
          <Input {...register('toDate')} className="w-full mt-8" type="date" />
        </div>

        <div className="block w-full lg:pt-0 pt-16">
          <FormLabel>Jämför med år</FormLabel>
          <Select {...register('year')} className="w-full mt-8">
            <Select.Option>Välj år</Select.Option>
            {generateYearsBetween()
              .map((year) => <Select.Option key={year}>{year}</Select.Option>)
              .reverse()}
          </Select>
        </div>
      </section>
    )
  );
};
