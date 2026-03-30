'use client';

import { ChangeEvent } from 'react';
import { DatePicker, Input, Select } from '@sk-web-gui/react';
import { useMemo } from 'react';
import { generateSelectableYears } from '@layouts/pages/mypages-sections/statistics/statistics-filter/generateDateLists';
import dayjs from 'dayjs';

interface CustomDatePickerProps {
  type: 'year' | 'month' | 'date';
  name: string;
  value: string;
  onChange: (value: string) => void;
}

export const CustomDatePicker = ({ type, name, value, onChange }: CustomDatePickerProps) => {
  const selectableYears = useMemo(() => generateSelectableYears(dayjs().format('YYYY-MM-DD')), []);

  if (type === 'year') {
    return (
      <Select
        name={name}
        value={value}
        onChange={(e: ChangeEvent<HTMLSelectElement>) => onChange(e.target.value)}
        className="self-stretch w-full"
      >
        {selectableYears.map((year) => {
          const y = year.slice(0, 4);
          return (
            <Select.Option key={y} value={y}>
              {y}
            </Select.Option>
          );
        })}
      </Select>
    );
  }

  if (type === 'date') {
    return (
      <DatePicker
        type="date"
        name={name}
        value={value}
        onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
        className="self-stretch"
      />
    );
  }

  return (
    <Input
      type="month"
      name={name}
      value={value}
      onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
      className="self-stretch"
    />
  );
};
