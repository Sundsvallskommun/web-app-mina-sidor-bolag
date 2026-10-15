'use client';

import { Combobox } from '@sk-web-gui/react';
import { useTranslation } from 'react-i18next';

export interface FacilityComboboxProps {
  groups: { address: string; facilities: string[] }[];
  optionsKey: string;
  value: string[];
  onChange: (facilityIds: string[]) => void;
  inputClassName?: string;
  dataCy?: string;
  size?: 'sm' | 'md';
}

export const FacilityCombobox = ({
  groups,
  optionsKey,
  value,
  onChange,
  inputClassName,
  dataCy,
  size = 'md',
}: Readonly<FacilityComboboxProps>) => {
  const { t } = useTranslation(['common', 'statistics']);

  return (
    <Combobox
      size={size}
      multiple
      value={value}
      onChange={(e) => onChange(e.target.value as string[])}
      data-cy={dataCy}
      placeholder={t('statistics:chooseAddress')}
      searchPlaceholder={t('statistics:chooseAddress')}
    >
      <Combobox.Input className={inputClassName} />
      <Combobox.List key={optionsKey}>
        {groups.map((group) => (
          <Combobox.Optgroup key={group.address} label={group.address || t('common:unknownAddress')}>
            {group.facilities.map((facilityId) => (
              <Combobox.Option key={facilityId} value={facilityId}>
                {facilityId}
              </Combobox.Option>
            ))}
          </Combobox.Optgroup>
        ))}
      </Combobox.List>
    </Combobox>
  );
};
