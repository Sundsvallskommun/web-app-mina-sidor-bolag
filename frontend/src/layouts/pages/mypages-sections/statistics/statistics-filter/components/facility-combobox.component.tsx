'use client';

import { Combobox } from '@sk-web-gui/react';
import { useTranslation } from 'react-i18next';

export interface FacilityComboboxProps {
  groups: { address: string; facilities: string[] }[];
  optionsKey: string;
  value: string[];
  onChange: (facilityIds: string[]) => void;
  dataCy?: string;
  size?: 'sm' | 'md';
}

const SELECT_ALL = 'select-all';

export const FacilityCombobox = ({
  groups,
  optionsKey,
  value,
  onChange,
  dataCy,
  size = 'md',
}: Readonly<FacilityComboboxProps>) => {
  const { t } = useTranslation(['common', 'statistics']);

  const allFacilityIds = groups.flatMap((group) => group.facilities);
  const allSelected = allFacilityIds.length > 1 && allFacilityIds.every((id) => value.includes(id));

  const handleChange = (selected: string[]) => {
    const selectAllChecked = selected.includes(SELECT_ALL);
    if (selectAllChecked && !allSelected) {
      onChange([...allFacilityIds]);
    } else if (!selectAllChecked && allSelected) {
      onChange([]);
    } else {
      onChange(selected.filter((id) => id !== SELECT_ALL));
    }
  };

  return (
    <Combobox
      className="w-full"
      size={size}
      multiple
      value={allSelected ? [SELECT_ALL, ...value] : value}
      onChange={(e) => handleChange(e.target.value as string[])}
      data-cy={dataCy}
      placeholder={t('statistics:chooseAddress')}
      searchPlaceholder={t('statistics:chooseAddress')}
    >
      <Combobox.Input className="w-full" />
      <Combobox.List key={optionsKey}>
        {allFacilityIds.length > 1 && (
          <Combobox.Option
            value={SELECT_ALL}
            data-cy="facility-select-all"
            className="!font-bold !border-b-1 !border-divider !rounded-none !pb-8 mb-4"
          >
            {t('statistics:selectAll')}
          </Combobox.Option>
        )}
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
