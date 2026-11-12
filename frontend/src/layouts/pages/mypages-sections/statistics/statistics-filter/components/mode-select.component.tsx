'use client';

import { Select } from '@sk-web-gui/react';
import { useTranslation } from 'react-i18next';
import { StatisticsFilterMode } from '../statistics-filter.rules';
import { useStatisticsFilter } from '../statistics-filter.store';

export interface ModeSelectProps {
  dataCy?: string;
  size?: 'sm' | 'md';
}

export const ModeSelect = ({ dataCy, size = 'md' }: Readonly<ModeSelectProps>) => {
  const { t } = useTranslation(['statistics']);
  const mode = useStatisticsFilter((state) => state.mode);
  const setMode = useStatisticsFilter((state) => state.setMode);

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
      value={mode}
      onChange={(e) => setMode(e.target.value as StatisticsFilterMode)}
    >
      {modeOptions.map((item) => (
        <Select.Option key={item.value} value={item.value}>
          {item.label}
        </Select.Option>
      ))}
    </Select>
  );
};
