'use client';

import { StatisticsForm } from '@layouts/pages/mypages-sections/statistics.component';
import { cx, DatePicker, FormLabel } from '@sk-web-gui/react';
import dayjs from 'dayjs';
import { ChangeEvent } from 'react';
import { useFormContext } from 'react-hook-form';

export const StatisticsFilterDay: React.FC = () => {
  const { setValue, watch } = useFormContext<StatisticsForm>();
  const { selectedYear, selectedMonth, selectedDay } = watch();

  const date =
    selectedYear && selectedMonth && selectedDay
      ? `${selectedYear}-${selectedMonth}-${selectedDay}`
      : dayjs().subtract(1, 'day').format('YYYY-MM-DD');

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const newDate = dayjs(event.target.value);
    setValue('selectedYear', newDate.format('YYYY'));
    setValue('selectedMonth', newDate.format('MM'));
    setValue('selectedDay', newDate.format('DD'));
  };

  return (
    <div className={cx(`w-full lg:pt-0 pt-16`)}>
      <FormLabel className="text-label-large">Dag</FormLabel>
      <DatePicker
        className="w-full mt-8"
        type="date"
        value={date}
        min={dayjs().startOf('year').subtract(3, 'year').format('YYYY-MM-DD')}
        max={dayjs().format('YYYY-MM-DD')}
        name="day"
        onChange={handleChange}
        data-cy="day-select"
      />
    </div>
  );
};
