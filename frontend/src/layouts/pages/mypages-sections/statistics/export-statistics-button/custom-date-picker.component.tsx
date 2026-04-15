'use client';

import { ChangeEvent, useRef, useMemo, KeyboardEvent } from 'react';
import { DatePicker, Icon, Input, Select } from '@sk-web-gui/react';
import { generateSelectableYears } from '@layouts/pages/mypages-sections/statistics/statistics-filter/generateDateLists';
import dayjs from 'dayjs';
import { Calendar } from 'lucide-react';

interface CustomDatePickerProps {
  type: 'year' | 'month' | 'date';
  value: string;
  onChange: (value: string) => void;
}

export const CustomDatePicker = ({ type, value, onChange }: CustomDatePickerProps) => {
  const selectableYears = useMemo(() => generateSelectableYears(dayjs().format('YYYY-MM-DD')), []);
  const monthInputRef = useRef<HTMLInputElement>(null);

  const preventTyping = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Tab') {
      e.preventDefault();
    }
  };

  if (type === 'year') {
    return (
      <Select
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
        value={value}
        min={dayjs().subtract(3, 'year').format('YYYY-MM-DD')}
        max={dayjs().format('YYYY-MM-DD')}
        onKeyDown={preventTyping}
        onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
        className="self-stretch"
      />
    );
  }

  return (
    <Input.InnerGroup className="self-stretch">
      <Input
        ref={monthInputRef}
        type="month"
        min={dayjs().subtract(3, 'year').format('YYYY-MM')}
        max={dayjs().format('YYYY-MM')}
        value={value}
        onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
        className="self-stretch"
        onKeyDown={preventTyping}
      />
      <Input.RightAddin icon onClick={() => monthInputRef.current?.showPicker()}>
        <Icon icon={<Calendar />} size="17px" />
      </Input.RightAddin>
    </Input.InnerGroup>
  );
};
