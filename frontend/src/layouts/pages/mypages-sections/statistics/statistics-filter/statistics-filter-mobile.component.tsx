'use client';

import { generateComparableYears } from '@layouts/pages/mypages-sections/statistics/statistics-filter/generateDateLists';
import { Accordion, Button, Checkbox, Icon, NavigationBar, RadioButton, Select } from '@sk-web-gui/react';
import dayjs from 'dayjs';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { StatisticsForm } from '../../statistics.component';
import { StatisticsFilterDay } from './components/statistics-filter-day.component';
import { StatisticsFilterMonth } from './components/statistics-filter-month.component';
import { StatisticsFilterYear } from './components/statistics-filter-year.component';
import { useStatisticsFilter } from './use-statistics-filter';
import { ChevronDown, ChevronUp } from 'lucide-react';

export interface StatisticsFilterMobileProps {
  closeHandler: () => void;
}

const SectionTitle = ({ label, subtitle }: { label: string; subtitle: string }) => (
  <div className="flex flex-col gap-6 text-left">
    <label className="text-h4-sm">{label}</label>
    {subtitle && <span className="text-small text-dark-secondary font-normal">{subtitle}</span>}
  </div>
);

export const StatisticsFilterMobile = ({ closeHandler }: StatisticsFilterMobileProps) => {
  const { t } = useTranslation(['common', 'statistics']);
  const { register, watch, setValue } = useFormContext<StatisticsForm>();
  const compareYearValue = watch('year');
  const mode = watch('mode');
  const facilityType = watch('facilityType');

  const { availableFacilityTypes, isHourQuarter, fromDate, addresses, facilities } = useStatisticsFilter();

  const periodSubtitle = (() => {
    if (!fromDate) return '';
    const d = dayjs(fromDate);
    if (mode === 'year') return d.format('YYYY');
    if (mode === 'month') return d.format('MMMM YYYY');
    return d.format('D MMMM YYYY');
  })();

  const compareYearSubtitle = compareYearValue
    ? dayjs(compareYearValue).format('YYYY')
    : t('statistics:compareYearNone');

  return (
    <div className="flex flex-col gap-24" data-cy="statistics-filter-mobile">
      <Accordion>
        {/* Avtalstyp */}
        {availableFacilityTypes.length > 1 && (
          <Accordion.Item>
            <Accordion.Item.Header>
              <Accordion.Item.Title>
                <SectionTitle label={t('statistics:agreementType')} subtitle={facilityType ?? ''} />
              </Accordion.Item.Title>
              <Accordion.Item.Button>
                {(open: boolean) => <Icon icon={open ? <ChevronUp /> : <ChevronDown />} />}
              </Accordion.Item.Button>
            </Accordion.Item.Header>
            <Accordion.Item.Content>
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
            </Accordion.Item.Content>
          </Accordion.Item>
        )}

        {/* Adress */}
        <Accordion.Item>
          <Accordion.Item.Header>
            <Accordion.Item.Title>
              <SectionTitle
                label={t('common:address')}
                subtitle={`${addresses.selected.length} av ${addresses.groups.length} valda`}
              />
            </Accordion.Item.Title>
            <Accordion.Item.Button>
              {(open: boolean) => <Icon icon={open ? <ChevronUp /> : <ChevronDown />} />}
            </Accordion.Item.Button>
          </Accordion.Item.Header>
          <Accordion.Item.Content>
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
              <div className="pl-16 flex flex-col gap-4">
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
          </Accordion.Item.Content>
        </Accordion.Item>

        {/* Anläggning */}
        <Accordion.Item>
          <Accordion.Item.Header>
            <Accordion.Item.Title>
              <SectionTitle
                label={t('statistics:facilities')}
                subtitle={`${facilities.checked.size} av ${facilities.list.length} valda`}
              />
            </Accordion.Item.Title>
            <Accordion.Item.Button>
              {(open: boolean) => <Icon icon={open ? <ChevronUp /> : <ChevronDown />} />}
            </Accordion.Item.Button>
          </Accordion.Item.Header>
          <Accordion.Item.Content>
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
              <div className="pl-16 flex flex-col gap-4">
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
          </Accordion.Item.Content>
        </Accordion.Item>

        {/* Visa statistik per */}
        <Accordion.Item>
          <Accordion.Item.Header>
            <Accordion.Item.Title>
              <SectionTitle label={t('statistics:showBy')} subtitle={periodSubtitle} />
            </Accordion.Item.Title>
            <Accordion.Item.Button>
              {(open: boolean) => <Icon icon={open ? <ChevronUp /> : <ChevronDown />} />}
            </Accordion.Item.Button>
          </Accordion.Item.Header>
          <Accordion.Item.Content>
            <div className="flex flex-col gap-16">
              <NavigationBar className="bg-tertiary-surface flex justify-around" size="md" data-cy="date-toggle-mobile">
                {[
                  { value: 'year', label: t('statistics:year') },
                  { value: 'month', label: t('statistics:month') },
                  { value: 'day', label: t('statistics:day') },
                ].map((item) => (
                  <NavigationBar.Item key={item.value} className="w-full !p-0 !m-0">
                    <Button
                      className="w-full !h-[12px] !py-0"
                      size="sm"
                      inverted={mode === item.value}
                      onClick={() => setValue('mode', item.value as 'year' | 'month' | 'day')}
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
          </Accordion.Item.Content>
        </Accordion.Item>

        {/* Jämför med */}
        {!isHourQuarter && (
          <Accordion.Item>
            <Accordion.Item.Header>
              <Accordion.Item.Title>
                <SectionTitle label={t('statistics:compareYear')} subtitle={compareYearSubtitle} />
              </Accordion.Item.Title>
              <Accordion.Item.Button>
                {(open: boolean) => <Icon icon={open ? <ChevronUp /> : <ChevronDown />} />}
              </Accordion.Item.Button>
            </Accordion.Item.Header>
            <Accordion.Item.Content>
              <Select {...register('year')} className="w-full" data-cy="compare-year-select-mobile">
                <Select.Option key={0} value="">
                  {t('statistics:chooseYear')}
                </Select.Option>
                {generateComparableYears(fromDate).map((y) => (
                  <Select.Option key={`compareTo-${y}`}>{dayjs(y).format('YYYY')}</Select.Option>
                ))}
              </Select>
            </Accordion.Item.Content>
          </Accordion.Item>
        )}
      </Accordion>

      <Button onClick={closeHandler} size="lg" className="w-full" data-cy="statistics-filter-mobile-apply">
        {t('statistics:use')}
      </Button>
    </div>
  );
};
