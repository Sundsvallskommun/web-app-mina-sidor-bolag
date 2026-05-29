'use client';

import { generateComparableYears } from '@layouts/pages/mypages-sections/statistics/statistics-filter/generateDateLists';
import { Button, Checkbox, FormLabel, NavigationBar, RadioButton, Select } from '@sk-web-gui/react';
import dayjs from 'dayjs';
import { useFormContext } from 'react-hook-form';
import { StatisticsForm } from '../../statistics.component';
import { StatisticsFilterMonth } from './components/statistics-filter-month.component';
import { StatisticsFilterYear } from './components/statistics-filter-year.component';
import { StatisticsFilterDay } from './components/statistics-filter-day.component';
import { useTranslation } from 'react-i18next';
import { CheckboxDropdown } from './components/checkbox-dropdown.component';
import { StatisticsFilterMode, useStatisticsFilter } from './use-statistics-filter';
import { Category } from '@interfaces/measurement-data';
import { NORMAL_YEAR } from '@utils/normal-year';

export interface StatisticsFilterProps {
  closeHandler: () => void;
}

export const StatisticsFilter = (props: StatisticsFilterProps) => {
  const { t } = useTranslation(['common', 'statistics']);
  const { closeHandler } = props;
  const { register, watch, setValue } = useFormContext<StatisticsForm>();
  const mode = watch('mode');
  const facilityType = watch('facilityType');
  const isDistrictHeating = watch('category') === Category.DISTRICT_HEATING;

  const { availableFacilityTypes, isHourQuarter, fromDate, addresses, facilities } = useStatisticsFilter();

  const modeOptions: { value: StatisticsFilterMode; label: string }[] = [
    { value: 'year', label: t('statistics:year') },
    { value: 'month', label: t('statistics:month') },
    { value: 'day', label: t('statistics:day') },
  ];

  return (
    <div className="flex flex-col gap-40" data-cy="statistics-filter">
      {/* Row 1: Avtalstyp + show by toggle */}
      {availableFacilityTypes.length > 1 && (
        <section className="lg:flex gap-48 lg:pt-0 justify-stretch">
          <div className="flex flex-col lg:flex-row justify-between items-start w-full lg:pt-0">
            <div className="flex flex-col gap-12 w-full lg:w-auto">
              <FormLabel className="text-label-large">{t('statistics:agreementType')}</FormLabel>
              <div className="flex flex-row items-center gap-16">
                {availableFacilityTypes.map((type) => (
                  <RadioButton
                    key={type}
                    value={type}
                    name="facilityType"
                    checked={facilityType === type}
                    onChange={() => setValue('facilityType', type)}
                    data-cy={`facility-type-${type}`}
                  >
                    {type}
                  </RadioButton>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Row 2: Address, Facilities, Date picker, Compare year */}
      <section className="lg:flex lg:justify-between block gap-auto">
        <div className="flex flex-col lg:flex-row justify-between lg:items-end w-full lg:pt-0 pt-24 pb-24 gap-48">
          <div className="flex flex-col md:flex-row md:items-center flex-1 gap-16">
            {/* Address dropdown with checkboxes */}
            <div className="flex flex-col justify-start flex-1 gap-8">
              <FormLabel className="text-label-large">{t('common:address')}</FormLabel>
              <div>
                <CheckboxDropdown
                  label={t('statistics:selection', {
                    count: addresses.selected.length,
                    total: addresses.groups.length,
                  })}
                  data-cy="address-select"
                >
                  <Checkbox
                    className="py-8 pr-2"
                    checked={!addresses.noneChecked}
                    indeterminate={!addresses.allChecked && !addresses.noneChecked}
                    onChange={addresses.toggleAll}
                    data-cy="address-select-all"
                  >
                    {t('statistics:selectAll')}
                  </Checkbox>
                  <div className="pl-16 flex flex-col gap-4">
                    {addresses.groups.map((group) => (
                      <Checkbox
                        className="py-8 pr-2"
                        key={group.address}
                        checked={addresses.isChecked('addresses', group.address)}
                        onChange={() => addresses.toggle('addresses', group.address)}
                      >
                        {group.address || t('common:unknownAddress')}
                      </Checkbox>
                    ))}
                  </div>
                </CheckboxDropdown>
              </div>
            </div>

            {/* Facility dropdown with checkboxes */}
            <div className="flex flex-col gap-8 flex-1">
              <FormLabel className="text-label-large">{t('statistics:facilities')}</FormLabel>
              <div>
                <CheckboxDropdown
                  label={t('statistics:selection', { count: facilities.checked.length, total: facilities.list.length })}
                  data-cy="facility-select"
                >
                  <Checkbox
                    className="py-8 pr-2"
                    checked={!facilities.noneChecked}
                    indeterminate={!facilities.allChecked && !facilities.noneChecked}
                    onChange={facilities.toggleAll}
                    data-cy="facility-select-all"
                  >
                    {t('statistics:selectAll')}
                  </Checkbox>
                  <div className="pl-16 flex flex-col gap-4">
                    {facilities.list.map((facilityId) => (
                      <Checkbox
                        className="py-8 pr-2"
                        key={facilityId}
                        checked={facilities.isChecked('facilities', facilityId)}
                        onChange={() => facilities.toggle('facilities', facilityId)}
                      >
                        {facilityId}
                      </Checkbox>
                    ))}
                  </div>
                </CheckboxDropdown>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-end gap-16">
            <div className="lg:pt-0 lg:justify-end justify-center lg:flex-[0_0_auto] w-full lg:w-auto">
              <div className="flex flex-col gap-8 w-full lg:pt-0">
                <FormLabel className="text-label-large">{t('statistics:showBy')}</FormLabel>
                <NavigationBar className="bg-tertiary-surface flex justify-around" size="md" data-cy="date-toggle">
                  {modeOptions.map((item) => (
                    <NavigationBar.Item key={item.value} className="lg:w-auto w-full !p-0 !m-0">
                      <Button
                        className="lg:w-auto w-full !h-[12px] !py-0"
                        size="sm"
                        inverted={mode === item.value}
                        onClick={() => {
                          setValue('mode', item.value);
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
            <div className="lg:flex-[0_0_auto] w-full lg:w-auto">
              {mode === 'year' && <StatisticsFilterYear />}
              {mode === 'month' && <StatisticsFilterMonth />}
              {mode === 'day' && <StatisticsFilterDay />}
            </div>

            {!isHourQuarter && (
              <div className="w-full lg:w-[115px] lg:pt-0 lg:flex-shrink-0">
                <FormLabel className="text-label-large">{t('statistics:compareYear')}</FormLabel>
                <Select {...register('year')} className="w-full mt-8" data-cy="compare-year-select">
                  <Select.Option key={0} value="">
                    {t('statistics:chooseYear')}
                  </Select.Option>
                  {generateComparableYears(fromDate).map((y) => (
                    <Select.Option key={`compareTo-${y}`}>{dayjs(y).format('YYYY')}</Select.Option>
                  ))}
                  {isDistrictHeating && mode === 'year' && (
                    <>
                      <hr />
                      <Select.Option key="compareTo-normalYear" value={NORMAL_YEAR}>
                        {t('statistics:normalYear')}
                      </Select.Option>
                    </>
                  )}
                </Select>
              </div>
            )}
          </div>

          <Button onClick={closeHandler} className="sm:hidden block w-full lg:w-auto lg:flex-[0_0_auto] mt-48">
            {t('statistics:use')}
          </Button>
        </div>
      </section>
    </div>
  );
};
