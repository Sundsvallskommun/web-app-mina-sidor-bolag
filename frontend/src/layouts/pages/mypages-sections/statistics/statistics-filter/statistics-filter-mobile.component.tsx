'use client';

import { generateComparableYears } from '@layouts/pages/mypages-sections/statistics/statistics-filter/generateDateLists';
import { Accordion, Button, Checkbox, NavigationBar, RadioButton, Select } from '@sk-web-gui/react';
import dayjs from 'dayjs';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { StatisticsForm } from '../../statistics.component';
import { StatisticsFilterAccordionItem } from './components/statistics-filter-accordion-item.component';
import { StatisticsFilterDay } from './components/statistics-filter-day.component';
import { StatisticsFilterMonth } from './components/statistics-filter-month.component';
import { StatisticsFilterYear } from './components/statistics-filter-year.component';
import { StatisticsFilterMode, useStatisticsFilter } from './use-statistics-filter';
import { Category } from '@interfaces/measurement-data';
import { isNormalYear, NORMAL_YEAR } from '@utils/normal-year';

export interface StatisticsFilterMobileProps {
  closeHandler: () => void;
}

export const StatisticsFilterMobile = ({ closeHandler }: StatisticsFilterMobileProps) => {
  const { t } = useTranslation(['common', 'statistics']);
  const { register, watch, setValue } = useFormContext<StatisticsForm>();
  const compareYearValue = watch('year');
  const mode = watch('mode');
  const facilityType = watch('facilityType');
  const isDistrictHeating = watch('category') === Category.DISTRICT_HEATING;

  const { availableFacilityTypes, isHourQuarter, fromDate, addresses, facilities } = useStatisticsFilter();

  const modeOptions: { value: StatisticsFilterMode; label: string }[] = [
    { value: 'year', label: t('statistics:year') },
    { value: 'month', label: t('statistics:month') },
    { value: 'day', label: t('statistics:day') },
  ];

  const periodSubtitle = (() => {
    if (!fromDate) return '';
    const d = dayjs(fromDate);
    if (mode === 'year') return d.format('YYYY');
    if (mode === 'month') return d.format('MMMM YYYY');
    return d.format('D MMMM YYYY');
  })();

  const compareYearSubtitle = (() => {
    if (!compareYearValue) return t('statistics:compareYearNone');
    if (isNormalYear(compareYearValue)) return t('statistics:normalYear');
    return dayjs(compareYearValue).format('YYYY');
  })();

  return (
    <div className="flex flex-col gap-24 pb-24" data-cy="statistics-filter-mobile">
      <Accordion>
        {availableFacilityTypes.length > 1 && (
          <StatisticsFilterAccordionItem label={t('statistics:agreementType')} subtitle={facilityType ?? ''}>
            <div className="flex flex-col gap-12">
              {availableFacilityTypes.map((type) => (
                <RadioButton
                  key={type}
                  value={type}
                  name="facilityTypeMobile"
                  checked={facilityType === type}
                  onChange={() => setValue('facilityType', type)}
                  data-cy={`facility-type-mobile-${type}`}
                >
                  {type}
                </RadioButton>
              ))}
            </div>
          </StatisticsFilterAccordionItem>
        )}

        <StatisticsFilterAccordionItem
          label={t('common:address')}
          subtitle={t('statistics:selection', { count: addresses.selected.length, total: addresses.groups.length })}
        >
          <div className="flex flex-col gap-4">
            <Checkbox
              className="py-8 px-2"
              checked={!addresses.noneChecked}
              indeterminate={!addresses.allChecked && !addresses.noneChecked}
              onChange={addresses.toggleAll}
              data-cy="address-select-all-mobile"
            >
              {t('statistics:selectAll')}
            </Checkbox>
            <div className="pl-16 flex flex-col gap-4 max-h-[22vh] overflow-y-auto">
              {addresses.groups.map((group) => (
                <Checkbox
                  className="py-8 px-2"
                  key={group.address}
                  checked={addresses.isChecked('addresses', group.address)}
                  onChange={() => addresses.toggle('addresses', group.address)}
                >
                  {group.address || t('common:unknownAddress')}
                </Checkbox>
              ))}
            </div>
          </div>
        </StatisticsFilterAccordionItem>

        <StatisticsFilterAccordionItem
          label={t('statistics:facilities')}
          subtitle={t('statistics:selection', { count: facilities.checked.length, total: facilities.list.length })}
        >
          <div className="flex flex-col gap-4">
            <Checkbox
              className="py-8 px-2"
              checked={!facilities.noneChecked}
              indeterminate={!facilities.allChecked && !facilities.noneChecked}
              onChange={facilities.toggleAll}
              data-cy="facility-select-all-mobile"
            >
              {t('statistics:selectAll')}
            </Checkbox>
            <div className="pl-16 flex flex-col gap-4 max-h-[22vh] overflow-y-auto">
              {facilities.list.map((facilityId) => (
                <Checkbox
                  className="py-8 px-2"
                  key={facilityId}
                  checked={facilities.isChecked('facilities', facilityId)}
                  onChange={() => facilities.toggle('facilities', facilityId)}
                >
                  {facilityId}
                </Checkbox>
              ))}
            </div>
          </div>
        </StatisticsFilterAccordionItem>

        <StatisticsFilterAccordionItem label={t('statistics:showBy')} subtitle={periodSubtitle}>
          <div className="flex flex-col gap-16">
            <NavigationBar className="bg-tertiary-surface flex justify-around" size="md" data-cy="date-toggle-mobile">
              {modeOptions.map((item) => (
                <NavigationBar.Item key={item.value} className="w-full !p-0 !m-0">
                  <Button
                    className="w-full !h-[12px] !py-0"
                    size="sm"
                    inverted={mode === item.value}
                    onClick={() => setValue('mode', item.value)}
                    data-cy={`date-toggle-mobile-${item.value}-button`}
                  >
                    {item.label}
                  </Button>
                </NavigationBar.Item>
              ))}
            </NavigationBar>
            {mode === 'year' && <StatisticsFilterYear />}
            {mode === 'month' && <StatisticsFilterMonth />}
            {mode === 'day' && <StatisticsFilterDay />}
          </div>
        </StatisticsFilterAccordionItem>

        {!isHourQuarter && (
          <StatisticsFilterAccordionItem label={t('statistics:compareYear')} subtitle={compareYearSubtitle}>
            <Select {...register('year')} className="w-full" data-cy="compare-year-select-mobile">
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
          </StatisticsFilterAccordionItem>
        )}
      </Accordion>

      <Button onClick={closeHandler} size="lg" className="w-full" data-cy="statistics-filter-mobile-apply">
        {t('statistics:use')}
      </Button>
    </div>
  );
};
