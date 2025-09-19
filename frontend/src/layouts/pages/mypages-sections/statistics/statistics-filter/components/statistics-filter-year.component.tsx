'use client';

import { StatisticsForm } from '@layouts/pages/mypages-sections/statistics.component';
import { cx, FormLabel, Select } from '@sk-web-gui/react';
import dayjs from 'dayjs';
import { ChangeEvent, useMemo, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { generateSelectableYears } from '../generateDateLists';

export const StatisticsFilterYear: React.FC = () => {
  const selectableYears = useMemo(() => {
    return generateSelectableYears(dayjs().format('YYYY-MM-DD'));
  }, []);

  const { setValue: setFormValue, watch } = useFormContext<StatisticsForm>();

  const { selectedYear, selectedMonth, selectedDay } = watch();

  const [value, setValue] = useState<string>(`${selectedYear}-01-01`);

  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const dateArr = event.target.value.split('-');
    const newDate = dayjs(`${dateArr[0]}-${selectedMonth}-${selectedDay}`);
    const year = newDate.format('YYYY');
    setFormValue('selectedYear', year);
    setValue(event.target.value);
  };

  return (
    <div className={cx(`w-full lg:pt-0 pt-16`)}>
      <FormLabel>År</FormLabel>
      <Select value={value} name="year" className="w-full mt-8" onChange={handleChange} data-cy="year-select">
        {selectableYears.map((dateString) => (
          <Select.Option key={`selectedYear-${dateString}`} value={dateString}>
            {dayjs(dateString).format('YYYY')}
          </Select.Option>
        ))}
      </Select>
    </div>
  );
};
