'use client';

import { Checkbox } from '@sk-web-gui/react';
import { useTranslation } from 'react-i18next';

export interface FacilityCheckboxGroupProps {
  groups: { address: string; facilities: string[] }[];
  value: string[];
  onChange: (facilityIds: string[]) => void;
  dataCy?: string;
}

export const FacilityCheckboxGroup = ({ groups, value, onChange, dataCy }: Readonly<FacilityCheckboxGroupProps>) => {
  const { t } = useTranslation(['common', 'statistics']);

  const selected = new Set(value);
  const allFacilityIds = groups.flatMap((group) => group.facilities);
  const countSelected = (ids: string[]) => ids.filter((id) => selected.has(id)).length;

  const allCount = countSelected(allFacilityIds);
  const allChecked = allFacilityIds.length > 0 && allCount === allFacilityIds.length;

  const setMany = (ids: string[], checked: boolean) => {
    const next = new Set(selected);
    ids.forEach((id) => (checked ? next.add(id) : next.delete(id)));
    // Keep the order of the facility list so the selection is stable.
    onChange(allFacilityIds.filter((id) => next.has(id)));
  };

  return (
    <fieldset className="flex flex-col gap-24" data-cy={dataCy}>
      <legend className="sr-only">{t('statistics:facility')}</legend>
      {allFacilityIds.length > 1 && (
        <Checkbox
          checked={allChecked}
          indeterminate={allCount > 0 && !allChecked}
          onChange={() => setMany(allFacilityIds, !allChecked)}
          data-cy="facility-checkbox-all"
        >
          <span className="font-bold">{t('statistics:selectAll')}</span>
        </Checkbox>
      )}
      <div className="flex flex-col gap-20">
        {groups.map((group) => {
          const groupCount = countSelected(group.facilities);
          const groupChecked = groupCount === group.facilities.length;
          return (
            <div key={group.address} className="flex flex-col gap-8">
              <Checkbox
                checked={groupChecked}
                indeterminate={groupCount > 0 && !groupChecked}
                onChange={() => setMany(group.facilities, !groupChecked)}
              >
                <span className="font-bold">{group.address || t('common:unknownAddress')}</span>
              </Checkbox>
              <div className="flex flex-col gap-8 pl-32">
                {group.facilities.map((facilityId) => (
                  <Checkbox
                    key={facilityId}
                    checked={selected.has(facilityId)}
                    onChange={() => setMany([facilityId], !selected.has(facilityId))}
                    data-cy={`facility-checkbox-${facilityId}`}
                  >
                    {facilityId}
                  </Checkbox>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </fieldset>
  );
};
