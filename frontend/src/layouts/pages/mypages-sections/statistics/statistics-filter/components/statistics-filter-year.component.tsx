'use client';

import { cx, FormLabel, Select } from '@sk-web-gui/react';
import dayjs from 'dayjs';
import { useMemo } from 'react';
import { generateSelectableYears } from '../generateDateLists';
import { useStatisticsFilter, useStatisticsPeriod } from '../statistics-filter.store';

export const StatisticsFilterYear: React.FC<{ size?: 'sm' | 'md' }> = ({ size = 'md' }) => {
  const selectableYears = useMemo(() => {
    return generateSelectableYears(dayjs().format('YYYY-MM-DD'));
  }, []);

  const setDate = useStatisticsFilter((state) => state.setDate);
  const { date } = useStatisticsPeriod();

  return (
    <div className={cx(`flex flex-col gap-8 w-full lg:pt-0`)}>
      <FormLabel className="text-label-medium sm:text-label-small">År</FormLabel>
      <Select
        size={size}
        value={dayjs(date).startOf('year').format('YYYY-MM-DD')}
        name="year"
        className="w-full"
        onChange={(event) => setDate(event.target.value, 'year')}
        data-cy="year-select"
      >
        {selectableYears.map((dateString) => (
          <Select.Option key={`selectedYear-${dateString}`} value={dateString}>
            {dayjs(dateString).format('YYYY')}
          </Select.Option>
        ))}
      </Select>
    </div>
  );
};
