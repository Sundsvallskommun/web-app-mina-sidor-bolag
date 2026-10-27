'use client';

import { StatisticsForm } from '@layouts/pages/mypages-sections/statistics.component';
import { Select } from '@sk-web-gui/react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { StatisticsFilterMode } from '../use-statistics-filter';

export interface ModeSelectProps {
  dataCy?: string;
  size?: 'sm' | 'md';
}

export const ModeSelect = ({ dataCy, size = 'md' }: Readonly<ModeSelectProps>) => {
  const { t } = useTranslation(['statistics']);
  const { watch, setValue } = useFormContext<StatisticsForm>();
  const mode = watch('mode');

  const modeOptions: { value: StatisticsFilterMode; label: string }[] = [
    { value: 'year', label: t('statistics:year') },
    { value: 'month', label: t('statistics:month') },
    { value: 'day', label: t('statistics:day') },
  ];

  return (
    <Select
      size={size}
      className="w-full"
      data-cy={dataCy}
      value={mode ?? ''}
      onChange={(e) => setValue('mode', e.target.value as StatisticsFilterMode)}
    >
      {modeOptions.map((item) => (
        <Select.Option key={item.value} value={item.value}>
          {item.label}
        </Select.Option>
      ))}
    </Select>
  );
};
