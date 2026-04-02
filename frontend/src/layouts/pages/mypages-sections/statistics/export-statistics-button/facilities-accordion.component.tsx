'use client';

import { ChevronDown, ChevronUp } from 'lucide-react';
import { Accordion, Checkbox, Divider, SearchField } from '@sk-web-gui/react';
import { useTranslation } from 'react-i18next';
import { ChangeEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { User } from '@interfaces/user';
import { Category } from '@interfaces/measurement-data';
import { getCategoryFromInstalledBaseType, getEventCategory } from '@utils/facility';
import { useCheckboxTree } from './use-checkbox-tree';

interface FacilitiesAccordionProps {
  show: boolean;
  user: User | undefined;
  category: Category;
  initialFacilityId?: string;
  onSelectionChange: (checkedItems: Set<string>, count: number, total: number) => void;
}

export const FacilitiesAccordion = ({
  show,
  user,
  category,
  initialFacilityId,
  onSelectionChange,
}: FacilitiesAccordionProps) => {
  const [searchValue, setSearchValue] = useState('');
  const [isSearchDirty, setIsSearchDirty] = useState(false);
  const { t } = useTranslation(['statistics']);

  const facilitiesGroupedByAddresses = useMemo(() => {
    const filtered = user?.facilities?.filter((f) => getCategoryFromInstalledBaseType(f.type) === category) ?? [];
    const groupMap = new Map<string, string[]>();
    for (const facility of filtered) {
      const address = facility.address?.street ?? '';
      if (!groupMap.has(address)) groupMap.set(address, []);
      groupMap.get(address)!.push(facility.facilityId ?? '');
    }
    return Array.from(groupMap.entries()).map(([address, facilities]) => ({ address, facilities }));
  }, [user, category]);

  const checkboxGroups = useMemo(
    () => facilitiesGroupedByAddresses.map((group) => ({ key: group.address, items: group.facilities })),
    [facilitiesGroupedByAddresses]
  );

  const {
    checkedItems,
    checkedCount: checkedFacilitiesCount,
    totalCount: totalFacilitiesCount,
    allChecked: allFacilitiesChecked,
    noneChecked: allFacilitiesUnchecked,
    toggleItem: toggleFacility,
    toggleGroup: toggleAddress,
    toggleAll: toggleAllFacilities,
    groupStates: addressStates,
    isItemChecked: isFacilityChecked,
    reset: resetFacilities,
  } = useCheckboxTree(checkboxGroups);

  const stableOnSelectionChange = useCallback(onSelectionChange, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Used to prevent the category-change reset from clearing the initial facility
  // selection that was applied in the same modal-open sequence (two separate renders).
  const skipNextCategoryReset = useRef(false);

  useEffect(() => {
    stableOnSelectionChange(checkedItems, checkedFacilitiesCount, totalFacilitiesCount);
  }, [checkedItems, checkedFacilitiesCount, totalFacilitiesCount, stableOnSelectionChange]);

  useEffect(() => {
    if (!show || !user || !initialFacilityId) return;
    const facility = user.facilities?.find((f) => f.facilityId === initialFacilityId);
    const address = facility?.address?.street;
    resetFacilities(address ? [`${address}::${initialFacilityId}`] : []);
    skipNextCategoryReset.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show, user, initialFacilityId]);

  useEffect(() => {
    if (skipNextCategoryReset.current) {
      skipNextCategoryReset.current = false;
      return;
    }
    resetFacilities([]);
    setSearchValue('');
    setIsSearchDirty(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category]);

  const filteredGroups = useMemo(() => {
    const query = searchValue.toLowerCase().trim();
    if (!query) return facilitiesGroupedByAddresses;

    const matchesFacilityQuery = (facilityId: string): boolean => {
      if (facilityId.toLowerCase().includes(query)) return true;
      const facility = user?.facilities?.find((f) => f.facilityId === facilityId);
      const categoryKey = getCategoryFromInstalledBaseType(facility?.type);
      const typeLabel = categoryKey ? t(`statistics:exportModal.category.${categoryKey}`) : (facility?.type ?? '');
      return typeLabel.toLowerCase().includes(query);
    };

    return facilitiesGroupedByAddresses.flatMap((group) => {
      if (group.address.toLowerCase().includes(query)) return [group];
      const matchingFacilities = group.facilities.filter(matchesFacilityQuery);
      return matchingFacilities.length > 0 ? [{ ...group, facilities: matchingFacilities }] : [];
    });
  }, [searchValue, facilitiesGroupedByAddresses, user, t]);

  return (
    <Accordion className="mr-0">
      <Accordion.Item className="mr-0">
        <Accordion.Item.Header className="flex flex-row items-start" data-cy="export-facilities-accordion-header">
          <Accordion.Item.Title className="flex flex-col items-start gap-6 flex-1">
            <div className="text-content text-label-medium">{t('statistics:exportModal.facilities')}</div>
            <div className="text-content text-small font-normal">
              {t('statistics:exportModal.selection', {
                count: checkedFacilitiesCount,
                total: totalFacilitiesCount,
              })}
            </div>
          </Accordion.Item.Title>
          <Accordion.Item.Button>{(open: boolean) => (open ? <ChevronUp /> : <ChevronDown />)}</Accordion.Item.Button>
        </Accordion.Item.Header>
        <Accordion.Item.Content className="mb-8 mr-0 !pr-0 ">
          <div className="mr-0 pr-0 flex flex-col items-start self-stretch gap-16">
            <div className="pb-8 flex flex-col items-start self-stretch gap-8">
              <SearchField
                placeholder={t('statistics:exportModal.searchFacilities')}
                className="py-8 pr-4 pl-4 flex-1 flex items-center self-stretch gap-8"
                value={searchValue}
                showSearchButton={isSearchDirty}
                onChange={(event: ChangeEvent<HTMLInputElement>) => {
                  setSearchValue(event.target.value);
                  setIsSearchDirty(true);
                }}
                onSearch={() => {
                  setIsSearchDirty(false);
                }}
                onReset={() => {
                  setSearchValue('');
                  setIsSearchDirty(false);
                }}
              />
            </div>
            <div className="pl-8 flex flex-col gap-12 items-start self-stretch">
              <Checkbox
                checked={!allFacilitiesUnchecked}
                indeterminate={!allFacilitiesChecked && !allFacilitiesUnchecked}
                onChange={toggleAllFacilities}
                className="py-8 pr-2 flex items-center self-stretch"
                data-cy="export-facilities-select-all"
              >
                {t('statistics:exportModal.selectAll')}
              </Checkbox>
              <div className="pl-16 flex flex-col gap-12 items-start self-stretch">
                {filteredGroups.map((group) => (
                  <div key={group.address} className="flex flex-col gap-4 items-start self-stretch">
                    <Checkbox
                      checked={addressStates.get(group.address)?.checked ?? false}
                      indeterminate={addressStates.get(group.address)?.indeterminate ?? false}
                      onChange={() => toggleAddress(group.address, group.facilities)}
                      className="flex self-stretch py-8 pr-2 text-small font-normal"
                    >
                      {group.address}
                    </Checkbox>
                    <div className="pl-16 flex flex-col gap-4 items-start self-stretch">
                      {group.facilities.map((facilityId) => {
                        const facility = user?.facilities?.find(
                          (f) => f.facilityId === facilityId && f.type !== 'Elhandel'
                        );
                        const categoryKey = getEventCategory(facility?.type);
                        const typeLabel = categoryKey
                          ? t(`statistics:exportModal.category.${categoryKey}`)
                          : (facility?.type ?? facilityId);
                        const displayName = `${typeLabel} (${facilityId})`;
                        return (
                          <Checkbox
                            key={facilityId}
                            checked={isFacilityChecked(group.address, facilityId)}
                            onChange={() => toggleFacility(group.address, facilityId)}
                            className="py-8 pr-2 self-stretch"
                          >
                            {displayName}
                          </Checkbox>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Accordion.Item.Content>
        <Divider />
      </Accordion.Item>
    </Accordion>
  );
};
