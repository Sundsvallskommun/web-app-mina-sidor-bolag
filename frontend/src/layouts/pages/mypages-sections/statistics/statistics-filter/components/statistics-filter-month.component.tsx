'use client';

import { cx, FormLabel, Select } from '@sk-web-gui/react';
import dayjs from 'dayjs';
import { useMemo } from 'react';
import { generateSelectableMonths } from '../generateDateLists';
import { useStatisticsFilter, useStatisticsPeriod } from '../statistics-filter.store';

export const StatisticsFilterMonth: React.FC<{ size?: 'sm' | 'md' }> = ({ size = 'md' }) => {
  const selectableMonths = useMemo(() => {
    return generateSelectableMonths(dayjs().format('YYYY-MM-DD'));
  }, []);

  const setDate = useStatisticsFilter((state) => state.setDate);
  const { date } = useStatisticsPeriod();

  return (
    <div className={cx(`flex flex-col gap-8 w-full lg:pt-0`)}>
      <FormLabel className="text-label-medium sm:text-label-small">Månad</FormLabel>
      <Select
        size={size}
        className="w-full"
        value={dayjs(date).startOf('month').format('YYYY-MM-DD')}
        name="month"
        onChange={(event) => setDate(event.target.value, 'month')}
        data-cy="month-select"
      >
        {selectableMonths.map((dateObj) => (
          <Select.Option key={dateObj.value} value={dateObj.value}>
            {dateObj.label}
          </Select.Option>
        ))}
      </Select>
    </div>
  );
};
