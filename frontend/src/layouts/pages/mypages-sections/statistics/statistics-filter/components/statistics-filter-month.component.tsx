'use client';

import { StatisticsForm } from '@layouts/pages/mypages-sections/statistics.component';
import { cx, FormLabel, Select } from '@sk-web-gui/react';
import dayjs from 'dayjs';
import { ChangeEvent, useMemo, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { generateSelectableMonths } from '../generateDateLists';

export const StatisticsFilterMonth: React.FC = () => {
  const selectableMonths = useMemo(() => {
    return generateSelectableMonths(dayjs().format('YYYY-MM-DD'));
  }, []);

  const { setValue: setFormValue, watch } = useFormContext<StatisticsForm>();

  const { selectedYear, selectedMonth, selectedDay } = watch();

  const [value, setValue] = useState<string>(
    `${selectedYear ?? dayjs().format('YYYY')}-${selectedMonth ?? dayjs().format('MM')}-01`
  );

  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const dateArr = event.target.value.split('-');
    const newDate = dayjs(`${dateArr[0]}-${dateArr[1]}-${selectedDay}`);

    const year = newDate.format('YYYY');
    const month = newDate.format('MM');

    setFormValue('selectedYear', year);
    setFormValue('selectedMonth', month);
    setValue(event.target.value);
  };

  return (
    <div className={cx(`w-full lg:pt-0 pt-16`)}>
      <FormLabel>Månad</FormLabel>
      <Select className="w-full mt-8" value={value} name="month" onChange={handleChange} data-cy="month-select">
        {selectableMonths.map((dateObj) => (
          <Select.Option key={dateObj.value} value={dateObj.value}>
            {dateObj.label}
          </Select.Option>
        ))}
      </Select>
    </div>
  );
};
