'use client';

import { ChevronDown, ChevronUp } from 'lucide-react';
import {
  Button,
  Checkbox,
  DatePicker,
  Divider,
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
import { ChangeEvent, useEffect, useMemo, useState } from 'react';
import { useCheckboxTree } from './use-checkbox-tree';
import { useApi } from '@services/api-service';
import { User } from '@interfaces/user';
import { getCategoryFromInstalledBaseType } from '@utils/facility';
import { Category } from '@interfaces/measurement-data';

const categories = Object.values(Category);
const timeResolutions = ['month', 'day', 'hour', 'quarter'];

const getDatePickerType = (resolution: string): 'date' | 'month' | 'datetime-local' => {
  if (resolution === 'month') return 'month';
  if (resolution === 'hour' || resolution === 'quarter') return 'datetime-local';
  return 'date';
};

const formatDateForInputType = (
  date: string,
  inputType: 'date' | 'month' | 'datetime-local',
  isEndDate = false
): string => {
  if (!date) return '';
  if (inputType === 'month') return date.slice(0, 7);
  if (inputType === 'datetime-local') return date.length === 10 ? `${date}T${isEndDate ? '23:00' : '00:00'}` : date;
  return date.slice(0, 10);
};

const snapDateTimeToResolution = (value: string, resolution: string): string => {
  if (!value || value.length < 16) return value;
  const [datePart, timePart] = value.split('T');
  const [hours, minutes] = timePart.split(':').map(Number);
  if (resolution === 'hour') return `${datePart}T${String(hours).padStart(2, '0')}:00`;
  if (resolution === 'quarter') {
    const snappedMinutes = Math.round(minutes / 15) * 15;
    const snappedHours = hours + Math.floor(snappedMinutes / 60);
    return `${datePart}T${String(snappedHours % 24).padStart(2, '0')}:${String(snappedMinutes % 60).padStart(2, '0')}`;
  }
  return value;
};

interface ExportStatisticsModalProps {
  show: boolean;
  onClose: () => void;
  onExport: () => void;
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
  const [datesResetByResolution, setDatesResetByResolution] = useState(false);
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
    setDatesResetByResolution(false);
    setTimeResolution(resolution);
    setFromDate(formatDateForInputType(initialFromDate ?? '', inputType));
    setToDate(formatDateForInputType(initialToDate ?? '', inputType, true));
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
    setTimeResolution(resolution);
    setFromDate('');
    setToDate('');
    setDatesResetByResolution(true);
  };

  const renderDateField = (name: string, value: string, setValue: (v: string) => void) => {
    if (datePickerType === 'month') {
      return (
        <Input
          type="month"
          name={name}
          value={value}
          onChange={(e: ChangeEvent<HTMLInputElement>) => {
            setValue(e.target.value);
            setDatesResetByResolution(false);
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
          setValue(snapDateTimeToResolution(e.target.value, timeResolution));
          setDatesResetByResolution(false);
        }}
        className="self-stretch"
        step={timeResolution === 'quarter' ? 900 : datePickerType === 'datetime-local' ? 3600 : undefined}
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
          <FormControl className="lg:w-[276px] w-full">
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
          <FormControl>
            <FormLabel className="text-label-medium">{t('statistics:exportModal.timeResolution.title')}</FormLabel>
            <fieldset className="flex lg:flex-row flex-col items-start gap-16">
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
            </fieldset>
          </FormControl>
          <FormControl className="w-full">
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
            {datesResetByResolution && (
              <Text className="text-error text-small mt-4">{t('statistics:exportModal.datesResetByResolution')}</Text>
            )}
            {dateRangeInvalid && (
              <Text className="text-error text-small mt-4">{t('statistics:exportModal.dateRangeError')}</Text>
            )}
          </FormControl>
          <FormControl className="w-full">
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
          </FormControl>
          <FormControl className="w-full">
            <Checkbox checked={temperatureIncluded} onChange={() => setTemperatureIncluded((prev) => !prev)}>
              {t('statistics:exportModal.includeTemperature')}
            </Checkbox>
          </FormControl>
          <FormControl className="w-full">
            <Text>
              {t('statistics:exportModal.exportComment', {
                count: checkedFacilitiesCount,
                total: totalFacilitiesCount,
              })}
            </Text>
          </FormControl>
        </div>
      </Modal.Content>
      <Modal.Footer className="w-full flex flex-row lg:items-start items-center gap-16 self-stretch justify-start">
        <Button variant="secondary" className="lg:flex-none flex-1" onClick={onClose}>
          {t('statistics:exportModal.cancel')}
        </Button>
        <Button variant="primary" className="lg:flex-none flex-1" onClick={onExport} disabled={!isValid}>
          {t('statistics:exportModal.export')}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
