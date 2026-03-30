'use client';

import { ChevronDown, ChevronUp } from 'lucide-react';
import {
  Button,
  Checkbox,
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
  NavigationBar,
} from '@sk-web-gui/react';
import { useTranslation } from 'react-i18next';
import { ChangeEvent, useEffect, useMemo, useState } from 'react';
import { CustomDatePicker } from './custom-date-picker.component';
import { useCheckboxTree } from './use-checkbox-tree';
import { useApi } from '@services/api-service';
import { User } from '@interfaces/user';
import { getCategoryFromInstalledBaseType } from '@utils/facility';
import { Category } from '@interfaces/measurement-data';

const categories = Object.values(Category);
const datePeriods = ['year', 'month', 'day'];
const timeIntervals = ['hour', 'quarter'];
const getDatePickerType = (period: 'year' | 'month' | 'day'): 'year' | 'month' | 'date' => {
  if (period === 'year') return 'year';
  if (period === 'month') return 'month';
  return 'date';
};

const formatDateForInputType = (date: string, inputType: 'year' | 'month' | 'date'): string => {
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

const getInitialDatePeriod = (resolution?: string): 'year' | 'month' | 'day' => {
  if (resolution === 'month') return 'year';
  if (resolution === 'day') return 'month';
  return 'day';
};

const getInitialTimeInterval = (resolution?: string): 'hour' | 'quarter' => {
  return resolution === 'quarter' ? 'quarter' : 'hour';
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
  const [datePeriod, setDatePeriod] = useState<'year' | 'month' | 'day'>(() =>
    getInitialDatePeriod(initialTimeResolution)
  );
  const [timeInterval, setTimeInterval] = useState<'hour' | 'quarter'>(() =>
    getInitialTimeInterval(initialTimeResolution)
  );
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
    const initialPeriod = getInitialDatePeriod(initialTimeResolution);
    const inputType = getDatePickerType(initialPeriod);
    setCategory(initialCategory ?? categories[0]);
    setDatePeriod(initialPeriod);
    setTimeInterval(getInitialTimeInterval(initialTimeResolution));
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
    setTimeInterval('hour');
  }, [category]);

  const datePickerType = getDatePickerType(datePeriod);
  const aggregation = datePeriod === 'year' ? 'month' : datePeriod === 'month' ? 'day' : timeInterval;

  const handleDatePeriodChange = (period: 'year' | 'month' | 'day') => {
    const oldType = getDatePickerType(datePeriod);
    const newType = getDatePickerType(period);
    setDatePeriod(period);

    if (period !== 'day') setTimeInterval('hour');

    if (oldType === newType) return;

    if (newType === 'year') {
      // month/date --> year: truncate to YYYY
      setFromDate(fromDate ? fromDate.slice(0, 4) : '');
      setToDate(toDate ? toDate.slice(0, 4) : '');
    } else if (newType === 'month') {
      if (oldType === 'year') {
        // year --> month: append -01 / -12
        setFromDate(fromDate ? `${fromDate}-01` : '');
        setToDate(toDate ? `${toDate}-12` : '');
      } else {
        // date --> month: truncate to YYYY-MM
        setFromDate(fromDate ? fromDate.slice(0, 7) : '');
        setToDate(toDate ? toDate.slice(0, 7) : '');
      }
    } else {
      if (oldType === 'year') {
        // year --> date: first/last day of year
        setFromDate(fromDate ? `${fromDate}-01-01` : '');
        setToDate(toDate ? `${toDate}-12-31` : '');
      } else {
        // month --> date: first day / last day of month
        setFromDate(fromDate ? `${fromDate}-01` : '');
        setToDate(toDate ? lastDayOfMonth(toDate) : '');
      }
    }
  };

  const dateRangeInvalid = !!fromDate && !!toDate && fromDate > toDate;
  const isValid = checkedFacilitiesCount > 0 && !!fromDate && !!toDate && !dateRangeInvalid;
  const showTimeIntervalOption = datePeriod === 'day' && category === Category.ELECTRICITY;

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

          <div className="lg:pt-0 pt-16 lg:justify-end justify-center lg:flex-[0_0_auto] w-full lg:w-auto">
            <div className="flex flex-col gap-8 w-full lg:pt-0 pt-16">
              <FormLabel>{t('statistics:exportBy')}</FormLabel>
              <NavigationBar className="!py-6 bg-tertiary-surface flex justify-around" size="md" data-cy="date-toggle">
                {datePeriods
                  .map((interval) => ({ value: interval, label: t(`statistics:${interval}`) }))
                  .map((item, index) => (
                    <NavigationBar.Item key={`time-interval-${item.label}`} className="lg:w-auto w-full !p-0 !m-0">
                      <Button
                        className="lg:w-auto w-full !h-[12px] !py-0"
                        size="sm"
                        inverted={datePeriod === item.value}
                        onClick={() => {
                          handleDatePeriodChange(item.value as 'year' | 'month' | 'day');
                        }}
                        data-cy={`date-toggle-${item.value}-button`}
                      >
                        {item.label}
                      </Button>
                    </NavigationBar.Item>
                  ))}
              </NavigationBar>
            </div>
          </div>

          <FormControl className="w-full" invalid={dateRangeInvalid}>
            <FormLabel className="text-label-medium">{t('statistics:exportModal.chooseTimePeriod')}</FormLabel>
            <div className="flex lg:flex-row flex-col items-start gap-40 self-stretch">
              <div className="flex flex-col justify-center items-start gap-8 lg:flex-1 self-stretch">
                <FormLabel className="text-label-medium">{t('statistics:exportModal.from')}</FormLabel>
                <CustomDatePicker type={datePickerType} value={fromDate} onChange={setFromDate} />
              </div>
              <div className="flex flex-col justify-center items-start gap-8 lg:flex-1 self-stretch">
                <FormLabel className="text-label-medium">{t('statistics:exportModal.to')}</FormLabel>
                <CustomDatePicker type={datePickerType} value={toDate} onChange={setToDate} />
              </div>
            </div>
            {dateRangeInvalid && (
              <FormErrorMessage className="text-error text-small mt-4">
                {t('statistics:exportModal.dateRangeError')}
              </FormErrorMessage>
            )}
          </FormControl>
          {showTimeIntervalOption && (
            <FormControl fieldset name="timeInterval">
              <FormLabel className="text-label-medium">{t('statistics:exportModal.timeInterval')}</FormLabel>
              <div className="flex lg:flex-row flex-col items-start gap-16">
                {timeIntervals.map((interval) => (
                  <RadioButton
                    key={interval}
                    value={interval}
                    name="timeInterval"
                    checked={timeInterval === interval}
                    onChange={() => {
                      setTimeInterval(interval as 'hour' | 'quarter');
                    }}
                  >
                    {t(`statistics:exportModal.timeResolution.${interval}`)}
                  </RadioButton>
                ))}
              </div>
            </FormControl>
          )}
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
            onExport({
              category,
              fromDate,
              toDate,
              timeResolution: aggregation,
              selectedFacilities,
              temperatureIncluded,
            });
          }}
          disabled={!isValid}
        >
          {t('statistics:exportModal.export')}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
