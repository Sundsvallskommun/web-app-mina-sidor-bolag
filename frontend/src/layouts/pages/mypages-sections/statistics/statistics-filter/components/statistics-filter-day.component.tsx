'use client';

import { StatisticsForm } from '@layouts/pages/mypages-sections/statistics.component';
import { cx, DatePicker, FormLabel } from '@sk-web-gui/react';
import dayjs from 'dayjs';
import { ChangeEvent, useState } from 'react';
import { useFormContext } from 'react-hook-form';

export const StatisticsFilterDay: React.FC = () => {
  const { setValue: setFormValue, watch } = useFormContext<StatisticsForm>();

  const { selectedYear, selectedMonth, selectedDay } = watch();

  const [value, setValue] = useState<string>(
    `${selectedYear ?? dayjs().format('YYYY')}-${selectedMonth ?? dayjs().format('MM')}-${selectedDay ?? dayjs().format('MM')}`
  );

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const newDate = dayjs(event.target.value);

    const year = newDate.format('YYYY');
    const month = newDate.format('MM');
    const day = newDate.format('DD');

    setFormValue('selectedYear', year);
    setFormValue('selectedMonth', month);
    setFormValue('selectedDay', day);
    setValue(event.target.value);
  };

  return (
    <div className={cx(`w-full lg:pt-0 pt-16`)}>
      <FormLabel>Dag</FormLabel>
      <DatePicker
        className="w-full mt-8"
        type="date"
        value={value}
        min={dayjs().startOf('year').subtract(3, 'year').format('YYYY-MM-DD')}
        max={dayjs().format('YYYY-MM-DD')}
        name="day"
        onChange={handleChange}
        data-cy="day-select"
      />
    </div>
  );
};
