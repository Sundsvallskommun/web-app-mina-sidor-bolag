'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { useApi } from '@services/api-service';
import { FormControl, FormLabel, Select, Spinner } from '@sk-web-gui/react';
import { Disturbance } from '@data-contracts/backend/data-contracts';
import { DisturbanceListItem } from '@layouts/pages/mypages-sections/disturbances/disturbance-list-item/disturbance-list-item.component';
import { useForm } from 'react-hook-form';

export interface DisturbanceForm {
  status: string;
}

export default function Disturbances() {
  const { t } = useTranslation();
  const { register, watch } = useForm<DisturbanceForm>({
    defaultValues: { status: '' },
  });
  const status = watch('status');

  const statusParams = new URLSearchParams();
  if (status) statusParams.append('status', status);
  const queryString = statusParams.toString();
  const url = queryString ? `/disturbances?${queryString}` : '/disturbances';

  const { data, isFetching } = useApi<Disturbance[]>({
    url,
    method: 'get',
    queryKey: ['disturbances', status],
  });

  return (
    <div data-cy="overview-disturbances">
      <h1>{t('disturbances:title')}</h1>
      <p>{t('disturbances:description')}</p>

      <FormControl className="mt-32">
        <FormLabel>{t('disturbances:status')}</FormLabel>
        <Select data-cy="status-select" {...register('status')}>
          <Select.Option value="">{t('disturbances:all')}</Select.Option>
          <Select.Option value="OPEN">{t('disturbances:open')}</Select.Option>
          <Select.Option value="PLANNED">{t('disturbances:planned')}</Select.Option>
          <Select.Option value="CLOSED">{t('disturbances:closed')}</Select.Option>
        </Select>
      </FormControl>

      <div className="flex flex-col gap-16 mt-40" data-cy="disturbances-container">
        {isFetching ? (
          <Spinner className="mx-auto" />
        ) : (
          data?.map((disturbance) => <DisturbanceListItem key={disturbance.id} disturbance={disturbance} />)
        )}
      </div>
    </div>
  );
}
