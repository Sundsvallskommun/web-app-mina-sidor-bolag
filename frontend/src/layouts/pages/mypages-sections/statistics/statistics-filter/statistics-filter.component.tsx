'use client';

import { Button, FormLabel, NavigationBar, ProgressBar, Select } from '@sk-web-gui/react';
import { useFormContext } from 'react-hook-form';
import { StatisticsForm } from '../../statistics.component';
import { StatisticsFilterMonth } from './components/statistics-filter-month.component';
import { StatisticsFilterYear } from './components/statistics-filter-year.component';
import { StatisticsFilterDay } from './components/statistics-filter-day.component';
import { useTranslation } from 'react-i18next';
import { CompareYearSelect } from './components/compare-year-select.component';
import { FacilityCombobox } from './components/facility-combobox.component';
import { StatisticsFilterMode, useStatisticsFilter } from './use-statistics-filter';
import { Category } from '@interfaces/measurement-data';
import { FacilityType } from '@utils/facility';

export interface StatisticsFilterProps {
  allAgreements: {
    isDone: boolean;
    currentPage: number;
    totalPages: number;
  };
}

export const StatisticsFilter = (props: StatisticsFilterProps) => {
  const { t } = useTranslation(['common', 'statistics']);
  const { allAgreements } = props;
  const { watch, setValue } = useFormContext<StatisticsForm>();
  const mode = watch('mode');
  const isDistrictHeating = watch('category') === Category.DISTRICT_HEATING;
  const facilityType = watch('facilityType');

  const { availableFacilityTypes, isHourQuarter, fromDate, addresses, facilities } = useStatisticsFilter();

  const modeOptions: { value: StatisticsFilterMode; label: string }[] = [
    { value: 'year', label: t('statistics:year') },
    { value: 'month', label: t('statistics:month') },
    { value: 'day', label: t('statistics:day') },
  ];

  return (
    <div className="flex flex-col gap-40" data-cy="statistics-filter">
      <section className="lg:flex lg:justify-between block gap-auto">
        <div className="flex flex-col lg:flex-row justify-between lg:items-end w-full lg:pt-0 pt-24 pb-24 gap-48 lg:gap-16">
          <div className="flex flex-col md:flex-row md:items-start flex-1 gap-16">
            {availableFacilityTypes.length > 1 && (
              <div className="flex flex-col gap-8 md:flex-1 lg:flex-none">
                <FormLabel className="text-label-small">{t('statistics:agreementType')}</FormLabel>
                <Select
                  size="sm"
                  className="w-full"
                  data-cy={`facility-type-${facilityType}`}
                  value={facilityType ?? ''}
                  onChange={(e) => setValue('facilityType', e.target.value as FacilityType)}
                >
                  {availableFacilityTypes.map((type) => (
                    <Select.Option key={type}>{type}</Select.Option>
                  ))}
                </Select>
              </div>
            )}
            <div className="flex flex-col justify-start md:flex-1 gap-8">
              <FormLabel className="text-label-small">{t('common:address')}</FormLabel>
              <div>
                <FacilityCombobox
                  groups={addresses.groups}
                  optionsKey={addresses.optionsKey}
                  value={facilities.checked}
                  onChange={facilities.setSelected}
                  size="sm"
                  dataCy="facility-select"
                />
              </div>
              {!allAgreements.isDone && (
                <div className="flex gap-8 mt-8">
                  <ProgressBar
                    current={allAgreements.currentPage}
                    steps={allAgreements.totalPages}
                    size="md"
                    color="vattjom"
                    className="w-full"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-end gap-16">
            <div className="lg:pt-0 lg:justify-end justify-center lg:flex-[0_0_auto] w-full lg:w-auto">
              <div className="flex flex-col gap-8 w-full lg:pt-0">
                <FormLabel className="text-label-small">{t('statistics:showBy')}</FormLabel>
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
              {mode === 'year' && <StatisticsFilterYear size="sm" />}
              {mode === 'month' && <StatisticsFilterMonth size="sm" />}
              {mode === 'day' && <StatisticsFilterDay size="sm" />}
            </div>

            {!isHourQuarter && (
              <div className="w-full lg:w-[115px] lg:pt-0 lg:flex-shrink-0">
                <FormLabel className="text-label-small">{t('statistics:compareYear')}</FormLabel>
                <CompareYearSelect
                  fromDate={fromDate}
                  mode={mode}
                  isDistrictHeating={isDistrictHeating}
                  isAggregating={facilities.checked.length > 1}
                  size="sm"
                  className="w-full mt-8"
                  dataCy="compare-year-select"
                />
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
