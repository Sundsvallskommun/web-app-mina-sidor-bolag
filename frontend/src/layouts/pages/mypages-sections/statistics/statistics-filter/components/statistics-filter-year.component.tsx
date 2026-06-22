'use client';

import { StatisticsForm } from '@layouts/pages/mypages-sections/statistics.component';
import { cx, FormLabel, Select } from '@sk-web-gui/react';
import dayjs from 'dayjs';
import { ChangeEvent, useMemo } from 'react';
import { useFormContext } from 'react-hook-form';
import { generateSelectableYears } from '../generateDateLists';

export const StatisticsFilterYear: React.FC = () => {
  const selectableYears = useMemo(() => {
    return generateSelectableYears(dayjs().format('YYYY-MM-DD'));
  }, []);

  const { setValue, watch } = useFormContext<StatisticsForm>();
  const { selectedYear } = watch();

  const date = selectedYear ? `${selectedYear}-01-01` : dayjs().subtract(1, 'day').startOf('year').format('YYYY-MM-DD');

  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const [year] = event.target.value.split('-');
    setValue('selectedYear', year);
  };

  return (
    <div className={cx(`w-full lg:pt-0`)}>
      <FormLabel className="text-label-large">År</FormLabel>
      <Select value={date} name="year" className="w-full mt-8" onChange={handleChange} data-cy="year-select">
        {selectableYears.map((dateString) => (
          <Select.Option key={`selectedYear-${dateString}`} value={dateString}>
            {dayjs(dateString).format('YYYY')}
          </Select.Option>
        ))}
      </Select>
    </div>
  );
};
