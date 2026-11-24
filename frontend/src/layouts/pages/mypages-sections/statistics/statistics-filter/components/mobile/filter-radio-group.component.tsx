'use client';

import { RadioButton } from '@sk-web-gui/react';

export interface FilterRadioOption<T extends string> {
  value: T;
  label: string;
}

export interface FilterRadioGroupProps<T extends string> {
  name: string;
  legend: string;
  options: FilterRadioOption<T>[];
  value: T;
  onChange: (value: T) => void;
  dataCy?: string;
}

export const FilterRadioGroup = <T extends string>({
  name,
  legend,
  options,
  value,
  onChange,
  dataCy,
}: Readonly<FilterRadioGroupProps<T>>) => (
  <fieldset className="flex flex-col gap-12" data-cy={dataCy}>
    <legend className="sr-only">{legend}</legend>
    {options.map((option) => (
      <RadioButton
        key={option.value}
        name={name}
        value={option.value}
        checked={value === option.value}
        onChange={() => onChange(option.value)}
        data-cy={dataCy ? `${dataCy}-${option.value}` : undefined}
      >
        {option.label}
      </RadioButton>
    ))}
  </fieldset>
);
