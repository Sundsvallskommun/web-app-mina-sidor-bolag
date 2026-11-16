'use client';

import { Select } from '@sk-web-gui/react';
import { useTranslation } from 'react-i18next';
import { NORMAL_YEAR } from '@utils/normal-year';
import { canCompareWithNormalYear } from '../statistics-filter.rules';
import { useComparableYears, useStatisticsFilter } from '../statistics-filter.store';

export interface CompareYearSelectProps {
  className?: string;
  dataCy?: string;
  size?: 'sm' | 'md';
}

export const CompareYearSelect = ({ className, dataCy, size = 'md' }: CompareYearSelectProps) => {
  const { t } = useTranslation(['statistics']);
  const compareYear = useStatisticsFilter((state) => state.compareYear);
  const setCompareYear = useStatisticsFilter((state) => state.setCompareYear);
  const showNormalYear = useStatisticsFilter(canCompareWithNormalYear);
  const comparableYears = useComparableYears();

  return (
    <Select
      name="compareYear"
      value={compareYear}
      onChange={(e) => setCompareYear(e.target.value)}
      size={size}
      className={className}
      data-cy={dataCy}
    >
      <Select.Option key={0} value="">
        {t('statistics:chooseYear')}
      </Select.Option>
      {comparableYears.map((year) => (
        <Select.Option key={`compareTo-${year}`} value={year}>
          {year}
        </Select.Option>
      ))}
      {showNormalYear && (
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
