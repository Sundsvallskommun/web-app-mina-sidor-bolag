'use client';

import { StatisticsForm } from '@layouts/pages/mypages-sections/statistics.component';
import { Select } from '@sk-web-gui/react';
import dayjs from 'dayjs';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { NORMAL_YEAR } from '@utils/normal-year';
import { generateComparableYears } from '../generateDateLists';
import { StatisticsFilterMode } from '../use-statistics-filter';

export interface CompareYearSelectProps {
  fromDate: string;
  mode: StatisticsFilterMode;
  isDistrictHeating: boolean;
  className?: string;
  dataCy?: string;
}

export const CompareYearSelect = ({ fromDate, mode, isDistrictHeating, className, dataCy }: CompareYearSelectProps) => {
  const { t } = useTranslation(['statistics']);
  const { register } = useFormContext<StatisticsForm>();

  return (
    <Select {...register('year')} className={className} data-cy={dataCy}>
      <Select.Option key={0} value="">
        {t('statistics:chooseYear')}
      </Select.Option>
      {generateComparableYears(fromDate).map((y) => (
        <Select.Option key={`compareTo-${y}`}>{dayjs(y).format('YYYY')}</Select.Option>
      ))}
      {isDistrictHeating && mode === 'year' && (
        <>
          <hr />
          <Select.Option key="compareTo-normalYear" value={NORMAL_YEAR}>
            {t('statistics:normalYear')}
          </Select.Option>
        </>
      )}
    </Select>
  );
};
