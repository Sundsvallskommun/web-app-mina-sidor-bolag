'use client';

import React, { ChangeEvent, useState } from 'react';
import { FormLabel, Select } from '@sk-web-gui/react';
import { useTranslation } from 'react-i18next';
import DisturbancesList from '@components/disturbances-list/disturbances-list.component';

export default function Disturbances() {
  const { t } = useTranslation();
  const [status, setStatus] = useState<string>('');

  const handleChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setStatus(e.currentTarget.value);
  };

  return process.env.NEXT_PUBLIC_FEATURE_DISTURBANCES ? (
    <div data-cy="overview-disturbances">
      <h1>{t('disturbances:title')}</h1>
      <p>{t('disturbances:description')}</p>

      <div className="flex flex-col w-[225px] pt-32">
        <FormLabel className="pt-8">{t('disturbances:status')}</FormLabel>
        <Select className="w-full" data-cy="status-select" onChange={(e) => handleChange(e)}>
          <Select.Option value="">{t('disturbances:all')}</Select.Option>
          <Select.Option value="OPEN">{t('disturbances:open')}</Select.Option>
          <Select.Option value="PLANNED">{t('disturbances:planned')}</Select.Option>
          <Select.Option value="CLOSED">{t('disturbances:closed')}</Select.Option>
        </Select>
      </div>

      <DisturbancesList statuses={status} />
    </div>
  ) : null;
}
