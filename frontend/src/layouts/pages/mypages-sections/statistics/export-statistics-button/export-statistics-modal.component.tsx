'use client';

import { ChevronDown, ChevronUp } from 'lucide-react';
import {
  Button,
  Checkbox,
  Divider,
  FormErrorMessage,
  FormLabel,
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
import { getCategoryFromInstalledBaseType, getEventCategory } from '@utils/facility';
import { Category } from '@interfaces/measurement-data';
import {
  DatePeriod,
  getDatePickerType,
  formatDateForInputType,
  adaptStartDate,
  adaptEndDate,
  getInitialDatePeriod,
  getInitialTimeInterval,
} from './date-picker.util';

const categories = [Category.DISTRICT_HEATING, Category.ELECTRICITY];
const datePeriods = ['year', 'month', 'day'];
const timeIntervals = ['hour', 'quarter'];

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
  const [datePeriod, setDatePeriod] = useState<DatePeriod>(() => getInitialDatePeriod(initialTimeResolution));
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show]);

  useEffect(() => {
    if (!show || !user || !initialFacilityId) return;
    const facility = user.facilities?.find((f) => f.facilityId === initialFacilityId);
    const address = facility?.address?.street;
    resetFacilities(address ? [`${address}::${initialFacilityId}`] : []);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show, user, initialFacilityId]);

  useEffect(() => {
    resetFacilities([]);
    setTimeInterval('hour');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category]);

  const datePickerType = getDatePickerType(datePeriod);

  const aggregationByPeriod: Partial<Record<DatePeriod, string>> = {
    year: 'month',
    month: 'day',
  };
  const aggregation = aggregationByPeriod[datePeriod] ?? timeInterval;

  const handleExport = () => {
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
  };

  const handleDatePeriodChange = (period: DatePeriod) => {
    const oldType = getDatePickerType(datePeriod);
    const newType = getDatePickerType(period);
    setDatePeriod(period);
    if (period !== 'day') setTimeInterval('hour');
    if (oldType === newType) return;
    setFromDate(adaptStartDate(fromDate, oldType, newType));
    setToDate(adaptEndDate(toDate, oldType, newType));
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
              data-cy="export-category-select"
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
              <NavigationBar
                className="!py-6 bg-tertiary-surface flex justify-around"
                size="md"
                data-cy="export-modal-date-toggle"
              >
                {datePeriods.map((interval) => (
                  <NavigationBar.Item key={`time-interval-${interval}`} className="lg:w-auto w-full !p-0 !m-0">
                    <Button
                      className="lg:w-auto w-full !h-[12px] !py-0"
                      size="sm"
                      inverted={datePeriod === interval}
                      onClick={() => handleDatePeriodChange(interval as DatePeriod)}
                      data-cy={`export-modal-date-toggle-${interval}-button`}
                    >
                      {t(`statistics:${interval}`)}
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
                <Accordion.Item.Header
                  className="flex flex-row items-start"
                  data-cy="export-facilities-accordion-header"
                >
                  <Accordion.Item.Title className="flex flex-col items-start gap-6 flex-1">
                    <div className="text-content text-label-medium">{t('statistics:exportModal.facilities')}</div>
                    <div className="text-content text-small font-normal">
                      {t('statistics:exportModal.selection', {
                        count: checkedFacilitiesCount,
                        total: totalFacilitiesCount,
                      })}
                    </div>
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
          </div>
          <div className="w-full">
            <Checkbox checked={temperatureIncluded} onChange={() => setTemperatureIncluded((prev) => !prev)}>
              {t('statistics:exportModal.includeTemperature')}
            </Checkbox>
          </div>
          <div className="w-full">
            <div className="text-content">
              {t('statistics:exportModal.exportComment', {
                count: checkedFacilitiesCount,
                total: totalFacilitiesCount,
              })}
            </div>
          </div>
        </div>
      </Modal.Content>
      <Modal.Footer className="w-full flex flex-row lg:items-start items-center gap-16 self-stretch justify-start">
        <Button
          variant="secondary"
          className="lg:flex-none flex-1"
          onClick={onClose}
          data-cy="export-modal-cancel-button"
        >
          {t('statistics:exportModal.cancel')}
        </Button>
        <Button
          variant="primary"
          className="lg:flex-none flex-1"
          onClick={handleExport}
          disabled={!isValid}
          data-cy="export-modal-confirm-button"
        >
          {t('statistics:exportModal.export')}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
