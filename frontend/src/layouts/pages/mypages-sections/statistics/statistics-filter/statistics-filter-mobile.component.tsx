'use client';

import { Accordion, Button, NavigationBar, Select } from '@sk-web-gui/react';
import dayjs from 'dayjs';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { StatisticsForm } from '../../statistics.component';
import { StatisticsFilterAccordionItem } from './components/statistics-filter-accordion-item.component';
import { StatisticsFilterDay } from './components/statistics-filter-day.component';
import { StatisticsFilterMonth } from './components/statistics-filter-month.component';
import { StatisticsFilterYear } from './components/statistics-filter-year.component';
import { CompareYearSelect } from './components/compare-year-select.component';
import { FacilityCombobox } from './components/facility-combobox.component';
import { StatisticsFilterMode, useStatisticsFilter } from './use-statistics-filter';
import { Category } from '@interfaces/measurement-data';
import { isNormalYear } from '@utils/normal-year';

export interface StatisticsFilterMobileProps {
  closeHandler: () => void;
}

export const StatisticsFilterMobile = ({ closeHandler }: StatisticsFilterMobileProps) => {
  const { t } = useTranslation(['common', 'statistics']);
  const { watch, setValue, register } = useFormContext<StatisticsForm>();
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

  const totalFacilities = addresses.groups.reduce((sum, group) => sum + group.facilities.length, 0);

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
            <div className="flex flex-col gap-12 pl-6">
              <Select className="w-full" data-cy={`facility-type-mobile-${facilityType}`} {...register('facilityType')}>
                {availableFacilityTypes.map((type) => (
                  <Select.Option key={type}>{type}</Select.Option>
                ))}
              </Select>
            </div>
          </StatisticsFilterAccordionItem>
        )}

        <StatisticsFilterAccordionItem
          label={t('common:address')}
          subtitle={t('statistics:selection', { count: facilities.checked.length, total: totalFacilities })}
        >
          <div className="flex flex-col gap-12 pl-6">
            <FacilityCombobox
              groups={addresses.groups}
              optionsKey={addresses.optionsKey}
              value={facilities.checked}
              onChange={facilities.setSelected}
              inputClassName="w-full"
              dataCy="facility-select-mobile"
            />
          </div>
        </StatisticsFilterAccordionItem>

        <StatisticsFilterAccordionItem label={t('statistics:showBy')} subtitle={periodSubtitle}>
          <div className="flex flex-col gap-16 pl-6">
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
            <div className="pl-6">
              <CompareYearSelect
                fromDate={fromDate}
                mode={mode}
                isDistrictHeating={isDistrictHeating}
                isAggregating={facilities.checked.length > 1}
                className="w-full"
                dataCy="compare-year-select-mobile"
              />
            </div>
          </StatisticsFilterAccordionItem>
        )}
      </Accordion>

      <Button onClick={closeHandler} size="lg" className="w-full" data-cy="statistics-filter-mobile-apply">
        {t('statistics:use')}
      </Button>
    </div>
  );
};
