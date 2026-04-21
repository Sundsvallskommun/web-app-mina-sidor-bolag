'use client';

import { StatisticsForm } from '@layouts/pages/mypages-sections/statistics.component';
import { cx, FormLabel, Select } from '@sk-web-gui/react';
import dayjs from 'dayjs';
import { ChangeEvent, useMemo } from 'react';
import { useFormContext } from 'react-hook-form';
import { generateSelectableMonths } from '../generateDateLists';

export const StatisticsFilterMonth: React.FC = () => {
  const selectableMonths = useMemo(() => {
    return generateSelectableMonths(dayjs().format('YYYY-MM-DD'));
  }, []);

  const { setValue, watch } = useFormContext<StatisticsForm>();
  const { selectedYear, selectedMonth } = watch();

  const date =
    selectedYear && selectedMonth
      ? `${selectedYear}-${selectedMonth}-01`
      : dayjs().subtract(1, 'day').startOf('month').format('YYYY-MM-DD');

  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const newDate = dayjs(event.target.value);
    setValue('selectedYear', newDate.format('YYYY'));
    setValue('selectedMonth', newDate.format('MM'));
  };

  return (
    <div className={cx(`w-full lg:pt-0 pt-16`)}>
      <FormLabel>Månad</FormLabel>
      <Select className="w-full mt-8" value={date} name="month" onChange={handleChange} data-cy="month-select">
        {selectableMonths.map((dateObj) => (
          <Select.Option key={dateObj.value} value={dateObj.value}>
            {dateObj.label}
          </Select.Option>
        ))}
      </Select>
    </div>
  );
};
