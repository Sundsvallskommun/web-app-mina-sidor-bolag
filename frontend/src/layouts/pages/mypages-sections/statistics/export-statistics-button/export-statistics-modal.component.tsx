'use client';

import { ChevronDown, ChevronUp } from 'lucide-react';
import {
  Button,
  Checkbox,
  DatePicker,
  Divider,
  FormErrorMessage,
  FormLabel,
  Input,
  Text,
  Modal,
  RadioButton,
  Select,
  Accordion,
  FormControl,
  SearchField,
} from '@sk-web-gui/react';
import { useTranslation } from 'react-i18next';
import { ChangeEvent, KeyboardEvent, useEffect, useMemo, useState } from 'react';
import { useCheckboxTree } from './use-checkbox-tree';
import { useApi } from '@services/api-service';
import { User } from '@interfaces/user';
import { getCategoryFromInstalledBaseType } from '@utils/facility';
import { Category } from '@interfaces/measurement-data';

const categories = Object.values(Category);
const timeResolutions = ['year', 'month', 'day', 'hour', 'quarter'];
const minYear = 2000;
const currentYear = new Date().getFullYear();

const getDatePickerType = (resolution: string): 'date' | 'month' | 'year' => {
  if (resolution === 'month') return 'month';
  if (resolution === 'year') return 'year';
  return 'date';
};

const formatDateForInputType = (date: string, inputType: 'date' | 'month' | 'year'): string => {
  if (!date) return '';
  if (inputType === 'year') return date.slice(0, 4);
  if (inputType === 'month') return date.slice(0, 7);
  return date.slice(0, 10);
};

const lastDayOfMonth = (yearMonth: string): string => {
  const [year, month] = yearMonth.split('-').map(Number);
  const lastDay = new Date(year, month, 0).getDate();
  return `${yearMonth}-${String(lastDay).padStart(2, '0')}`;
};

export interface ExportModalData {
  category: Category;
  fromDate: string;
  toDate: string;
  timeResolution: string;
  selectedFacilities: Array<{ facilityId: string; address: string }>;
  temperatureIncluded: boolean;
}

interface ExportStatisticsModalProps {
  show: boolean;
  onClose: () => void;
  onExport: (data: ExportModalData) => void;
  initialCategory?: Category;
  initialFromDate?: string;
  initialToDate?: string;
  initialTimeResolution?: string;
  initialFacilityId?: string;
}

export const ExportStatisticsModal = ({
  show,
  onClose,
  onExport,
  initialCategory,
  initialFromDate,
  initialToDate,
  initialTimeResolution,
  initialFacilityId,
}: ExportStatisticsModalProps) => {
  const [searchValue, setSearchValue] = useState('');
  const [isSearchDirty, setIsSearchDirty] = useState(false);
  const [temperatureIncluded, setTemperatureIncluded] = useState(false);
  const [category, setCategory] = useState<Category>(initialCategory ?? categories[0]);
  const [fromDate, setFromDate] = useState(initialFromDate ?? '');
  const [toDate, setToDate] = useState(initialToDate ?? '');
  const [timeResolution, setTimeResolution] = useState(initialTimeResolution ?? timeResolutions[0]);
  const { t } = useTranslation(['statistics']);

  const { data: user } = useApi<User>({
    method: 'get',
    url: '/me',
    queryKey: ['user'],
  });

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

  const filteredGroups = useMemo(() => {
    const query = searchValue.toLowerCase().trim();
    if (!query) return facilitiesGroupedByAddresses;
    return facilitiesGroupedByAddresses
      .map((group) => {
        if (group.address.toLowerCase().includes(query)) return group;
        const matchingFacilities = group.facilities.filter((f) => f.toLowerCase().includes(query));
        return matchingFacilities.length > 0 ? { ...group, facilities: matchingFacilities } : null;
      })
      .filter(Boolean) as typeof facilitiesGroupedByAddresses;
  }, [searchValue, facilitiesGroupedByAddresses]);

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

  useEffect(() => {
    if (!show) return;
    const resolution = initialTimeResolution ?? timeResolutions[0];
    const inputType = getDatePickerType(resolution);
    setCategory(initialCategory ?? categories[0]);
    setTimeResolution(resolution);
    setFromDate(formatDateForInputType(initialFromDate ?? '', inputType));
    setToDate(formatDateForInputType(initialToDate ?? '', inputType));
    setTemperatureIncluded(false);
    setSearchValue('');
    setIsSearchDirty(false);
  }, [show]);

  useEffect(() => {
    if (!show || !user || !initialFacilityId) return;
    const facility = user.facilities?.find((f) => f.facilityId === initialFacilityId);
    const address = facility?.address?.street;
    resetFacilities(address ? [`${address}::${initialFacilityId}`] : []);
  }, [show, user, initialFacilityId]);

  useEffect(() => {
    resetFacilities([]);
  }, [category]);

  const datePickerType = getDatePickerType(timeResolution);

  const handleTimeResolutionChange = (resolution: string) => {
    const oldType = getDatePickerType(timeResolution);
    const newType = getDatePickerType(resolution);
    setTimeResolution(resolution);

    if (oldType === newType) return;

    if (newType === 'year') {
      setFromDate(fromDate ? fromDate.slice(0, 4) : '');
      setToDate(toDate ? toDate.slice(0, 4) : '');
    } else if (newType === 'month') {
      if (oldType === 'year') {
        setFromDate(fromDate ? `${fromDate}-01` : '');
        setToDate(toDate ? `${toDate}-12` : '');
      } else {
        // date --> month: truncate to YYYY-MM
        setFromDate(fromDate ? fromDate.slice(0, 7) : '');
        setToDate(toDate ? toDate.slice(0, 7) : '');
      }
    } else {
      if (oldType === 'year') {
        setFromDate(fromDate ? `${fromDate}-01-01` : '');
        setToDate(toDate ? `${toDate}-12-31` : '');
      } else {
        // month --> date: first day for "from", last day for "to"
        setFromDate(fromDate ? `${fromDate}-01` : '');
        setToDate(toDate ? lastDayOfMonth(toDate) : '');
      }
    }
  };

  const renderDateField = (name: string, value: string, setValue: (v: string) => void) => {
    if (datePickerType === 'year') {
      return (
        <Input
          type="number"
          name={name}
          value={value}
          min={minYear}
          max={currentYear}
          onChange={(e: ChangeEvent<HTMLInputElement>) => {
            const raw = e.target.value;
            if (raw.length <= 4) {
              setValue(raw);
            }
          }}
          onBlur={() => {
            const num = Number(value);
            if (value && (num < minYear || num > currentYear || !Number.isInteger(num))) {
              setValue(String(Math.min(currentYear, Math.max(minYear, Math.round(num)))));
            }
          }}
          onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
            if (e.key === 'e' || e.key === 'E' || e.key === '+' || e.key === '-' || e.key === '.') {
              e.preventDefault();
            }
          }}
          className="self-stretch"
        />
      );
    }
    if (datePickerType === 'month') {
      return (
        <Input
          type="month"
          name={name}
          value={value}
          onChange={(e: ChangeEvent<HTMLInputElement>) => {
            setValue(e.target.value);
          }}
          className="self-stretch"
        />
      );
    }
    return (
      <DatePicker
        type={datePickerType}
        name={name}
        value={value}
        onChange={(e: ChangeEvent<HTMLInputElement>) => {
          setValue(e.target.value);
        }}
        className="self-stretch"
      />
    );
  };

  const dateRangeInvalid = !!fromDate && !!toDate && fromDate > toDate;
  const isValid = checkedFacilitiesCount > 0 && !!fromDate && !!toDate && !dateRangeInvalid;

  return (
    <Modal
      label={t('statistics:exportModal.title')}
      show={show}
      onClose={onClose}
      className="lg:w-[720px] w-[395px] max-w-[calc(100vw-0.8rem)]"
    >
      <Modal.Content>
        <div className="flex flex-col gap-40 items-start self-stretch px-0 pt-8 pb-16">
          <FormControl id="export-category" name="category" className="lg:w-[276px] w-full">
            <FormLabel className="text-label-medium">{t('statistics:exportModal.category.title')}</FormLabel>
            <Select
              className="self-stretch w-full"
              value={category}
              onChange={(e: ChangeEvent<HTMLSelectElement>) => setCategory(e.target.value as Category)}
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {t(`statistics:exportModal.category.${cat}`)}
                </option>
              ))}
            </Select>
          </FormControl>
          <FormControl fieldset name="timeResolution">
            <FormLabel className="text-label-medium">{t('statistics:exportModal.timeResolution.title')}</FormLabel>
            <div className="flex lg:flex-row flex-col items-start gap-16">
              {timeResolutions
                .filter((r) => r !== 'quarter' || category === Category.ELECTRICITY)
                .map((resolution) => (
                  <RadioButton
                    key={resolution}
                    value={resolution}
                    name="timeResolution"
                    checked={timeResolution === resolution}
                    onChange={() => handleTimeResolutionChange(resolution)}
                  >
                    {t(`statistics:exportModal.timeResolution.${resolution}`)}
                  </RadioButton>
                ))}
            </div>
          </FormControl>
          <FormControl className="w-full" invalid={dateRangeInvalid}>
            <FormLabel className="text-label-medium">{t('statistics:exportModal.chooseTimePeriod')}</FormLabel>
            <div className="flex lg:flex-row flex-col items-start gap-40 self-stretch">
              <div className="flex flex-col justify-center items-start gap-8 lg:flex-1 self-stretch">
                <FormLabel className="text-label-medium">{t('statistics:exportModal.from')}</FormLabel>
                {renderDateField('fromDate', fromDate, setFromDate)}
              </div>
              <div className="flex flex-col justify-center items-start gap-8 lg:flex-1 self-stretch">
                <FormLabel className="text-label-medium">{t('statistics:exportModal.to')}</FormLabel>
                {renderDateField('toDate', toDate, setToDate)}
              </div>
            </div>
            {dateRangeInvalid && (
              <FormErrorMessage className="text-error text-small mt-4">
                {t('statistics:exportModal.dateRangeError')}
              </FormErrorMessage>
            )}
          </FormControl>
          <div className="w-full">
            <Accordion className="mr-0">
              <Accordion.Item className="mr-0">
                <Accordion.Item.Header className="flex flex-row items-start">
                  <Accordion.Item.Title className="flex flex-col items-start gap-6 flex-1">
                    <Text className="text-label-medium">{t('statistics:exportModal.facilities')}</Text>
                    <Text className="text-small font-normal">
                      {t('statistics:exportModal.selection', {
                        count: checkedFacilitiesCount,
                        total: totalFacilitiesCount,
                      })}
                    </Text>
                  </Accordion.Item.Title>
                  <Accordion.Item.Button>
                    {(open: boolean) => (open ? <ChevronUp /> : <ChevronDown />)}
                  </Accordion.Item.Button>
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
                        className="py-8 px-2 flex items-center self-stretch gap-10"
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
                              className="flex self-stretch gap-10 py-8 px-2 text-small font-normal"
                            >
                              {group.address}
                            </Checkbox>
                            <div className="pl-16 flex flex-col gap-4 items-start self-stretch">
                              {group.facilities.map((facilityId) => {
                                const facility = user?.facilities?.find((f) => f.facilityId === facilityId);
                                const displayName = `${facility?.type === 'El' ? t('statistics:exportModal.category.ELECTRICITY') : (facility?.type ?? facilityId)} (${facilityId})`;
                                return (
                                  <Checkbox
                                    key={facilityId}
                                    checked={isFacilityChecked(group.address, facilityId)}
                                    onChange={() => toggleFacility(group.address, facilityId)}
                                    className="py-8 px-2"
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
          </div>
          <div className="w-full">
            <Checkbox checked={temperatureIncluded} onChange={() => setTemperatureIncluded((prev) => !prev)}>
              {t('statistics:exportModal.includeTemperature')}
            </Checkbox>
          </div>
          <div className="w-full">
            <Text>
              {t('statistics:exportModal.exportComment', {
                count: checkedFacilitiesCount,
                total: totalFacilitiesCount,
              })}
            </Text>
          </div>
        </div>
      </Modal.Content>
      <Modal.Footer className="w-full flex flex-row lg:items-start items-center gap-16 self-stretch justify-start">
        <Button variant="secondary" className="lg:flex-none flex-1" onClick={onClose}>
          {t('statistics:exportModal.cancel')}
        </Button>
        <Button
          variant="primary"
          className="lg:flex-none flex-1"
          onClick={() => {
            const selectedFacilities = Array.from(checkedItems).map((key) => {
              const [address, facilityId] = key.split('::');
              return { facilityId, address };
            });
            onExport({ category, fromDate, toDate, timeResolution, selectedFacilities, temperatureIncluded });
          }}
          disabled={!isValid}
        >
          {t('statistics:exportModal.export')}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
