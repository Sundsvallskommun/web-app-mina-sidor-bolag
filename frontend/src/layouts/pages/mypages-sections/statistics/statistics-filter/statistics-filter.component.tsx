'use client';

import { InstalledBaseItem } from '@data-contracts/installedbase/data-contracts';
import { User } from '@interfaces/user';
import { generateComparableYears } from '@layouts/pages/mypages-sections/statistics/statistics-filter/generateDateLists';
import { useApi } from '@services/api-service';
import { Button, FormLabel, NavigationBar, ProgressBar, Select } from '@sk-web-gui/react';
import dayjs from 'dayjs';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { StatisticsForm } from '../../statistics.component';
import { StatisticsFilterMonth } from './components/statistics-filter-month.component';
import { StatisticsFilterYear } from './components/statistics-filter-year.component';
import { StatisticsFilterDay } from './components/statistics-filter-day.component';
import { useTranslation } from 'react-i18next';

export interface StatisticsFilterProps {
  closeHandler: () => void;
  isAllAgreementsDone: boolean;
  allAgreementsCurrentPage: number;
  allAgreementsTotalPages: number;
}

export const StatisticsFilter = (props: StatisticsFilterProps) => {
  const searchParams = useSearchParams();
  const linkedFacilityId = searchParams?.get('installation');
  const { t } = useTranslation(['common', 'statistics']);

  const { closeHandler, isAllAgreementsDone, allAgreementsCurrentPage, allAgreementsTotalPages } = props;
  const { register, watch, setValue } = useFormContext<StatisticsForm>();
  const [facilities, setFacilities] = useState<InstalledBaseItem[]>();
  const [mode, setMode] = useState<'day' | 'month' | 'year'>('day');
  const { address, fromDate, selectedDay, selectedMonth, selectedYear, isHourQuarter } = watch();

  const { data: user } = useApi<User>({
    method: 'get',
    url: '/me',
    queryKey: ['user'],
  });

  useEffect(() => {
    const latestFacility = user?.facilities?.sort((a, b) =>
      dayjs(a?.facilityCommitmentStartDate).isAfter(dayjs(b?.facilityCommitmentStartDate)) ? -1 : 1
    )?.[0];
    const matchingUserAddress = user?.addresses?.find((a) => a.address === latestFacility?.address?.street)?.address;
    setValue('address', matchingUserAddress ?? user?.addresses?.find((a) => a.address)?.address ?? '');

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    const nonTradeFacilities =
      user?.facilities?.filter(
        (facility) =>
          facility?.address?.street === address &&
          facility.type !== 'Fjärrkyla' &&
          facility.type !== 'Avfallsvåg' &&
          facility.type !== 'Elhandel'
      ) ?? [];
    const uniqueTradeFacilities =
      user?.facilities?.filter(
        (facility) =>
          facility.type === 'Elhandel' &&
          facility.address?.street === address &&
          !nonTradeFacilities?.some((_f) => _f.facilityId === facility.facilityId)
      ) ?? [];
    const filteredFacilities = [...nonTradeFacilities, ...uniqueTradeFacilities].sort((a, b) =>
      (a.type ?? '') > (b.type ?? '') ? 1 : -1
    );
    setFacilities(filteredFacilities.reverse());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address, user]);

  useEffect(() => {
    if (facilities) {
      setValue('facilityId', facilities[0]?.facilityId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [facilities, address]);

  useEffect(() => {
    if (linkedFacilityId) {
      const facility = user?.facilities?.find((f) => f.facilityId === linkedFacilityId);
      if (facility?.address?.street && facility?.facilityId) {
        setValue('address', facility.address?.street ?? '');
        setTimeout(() => {
          setValue('facilityId', facility.facilityId);
        }, 100);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (mode !== 'day') {
      setValue('isHourQuarter', false);
    }
  }, [mode, setValue]);

  useEffect(() => {
    const today = dayjs();
    const yesterday = today.subtract(1, 'day');
    const y = selectedYear ?? yesterday.format('YYYY');
    const m = selectedMonth ?? yesterday.format('MM');
    const d = selectedDay ?? yesterday.format('DD');

    // Clamp the day to the last valid day of the target month so dayjs does not overflow
    // into the next month (e.g. switching from March 31 to April would otherwise become May 1).
    const lastDayOfTargetMonth = dayjs(`${y}-${m}-01`).daysInMonth();
    const clampedDay = String(Math.min(Number(d), lastDayOfTargetMonth)).padStart(2, '0');

    let date = dayjs(`${y}-${m}-${mode === 'day' ? clampedDay : '01'}`);
    if (date.isAfter(today, 'day')) {
      date = today;
    }

    setValue('fromDate', date.startOf(mode).format('YYYY-MM-DD'));
    setValue('toDate', date.endOf(mode).format('YYYY-MM-DD'));

    setValue('selectedYear', date.format('YYYY'));
    if (mode === 'month' || mode === 'day') {
      setValue('selectedMonth', date.format('MM'));
    }
    if (mode === 'day') {
      setValue('selectedDay', date.format('DD'));
    }
  }, [mode, selectedDay, selectedMonth, selectedYear, setValue]);

  return (
    <>
      <section className="lg:flex lg:justify-between block gap-48 lg:pt-0 pt-24" data-cy="statistics-filter">
        <div className="flex flex-col lg:flex-row gap-16 items-end w-full lg:w-2/5 lg:pt-0 pt-24">
          <div className="block w-full">
            <FormLabel>{t('common:address')}</FormLabel>
            <Select {...register('address')} className="w-full mt-8" data-cy="address-select">
              {user?.addresses
                ?.filter((a) => a.address)
                .sort((a, b) => (a.address > b.address ? 1 : -1))
                .map((address) => (
                  <Select.Option key={address.address}>
                    {address.address ? address.address : t('common:unknownAddress')}
                  </Select.Option>
                ))}
            </Select>
            {!isAllAgreementsDone && (
              <div className="flex gap-8 mt-8">
                <ProgressBar
                  current={allAgreementsCurrentPage}
                  steps={allAgreementsTotalPages}
                  size="md"
                  color="vattjom"
                  className="w-full"
                />
              </div>
            )}
          </div>

          <div className="block w-full">
            <FormLabel>{t('statistics:agreementType')}</FormLabel>
            <Select {...register('facilityId')} className="w-full mt-8" data-cy="contract-select">
              {facilities?.map((facility) => {
                return (
                  <Select.Option key={facility.facilityId + '-' + facility.type} value={facility.facilityId}>
                    {facility.type === 'El' ? 'Elförbrukning' : facility.type} ({facility.facilityId})
                  </Select.Option>
                );
              })}
            </Select>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-16 items-end w-full lg:w-1/2 lg:pt-0 pt-16">
          <div className="lg:pt-0 pt-16 lg:justify-end justify-center lg:flex-[0_0_auto] w-full lg:w-auto">
            <div className="block w-full lg:pt-0 pt-16">
              <FormLabel>{t('statistics:showBy')}</FormLabel>
              <NavigationBar className="!py-6 bg-tertiary-surface flex justify-around" size="md" data-cy="date-toggle">
                {[
                  { value: 'year', label: t('statistics:year') },
                  { value: 'month', label: t('statistics:month') },
                  { value: 'day', label: t('statistics:day') },
                ].map((item, index) => (
                  <NavigationBar.Item key={index} className="lg:w-auto w-full !p-0 !m-0">
                    <Button
                      className="lg:w-auto w-full !h-[12px] !py-0"
                      size="sm"
                      inverted={mode === item.value}
                      onClick={() => {
                        setMode(item.value as 'year' | 'month' | 'day');
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
            <div className="w-full lg:w-[115px] lg:pt-0 pt-16 flex-shrink-0">
              <FormLabel>{t('statistics:compareYear')}</FormLabel>
              <Select {...register('year')} className="w-full mt-8" data-cy="compare-year-select">
                <Select.Option key={0} value="">
                  {t('statistics:chooseYear')}
                </Select.Option>
                {generateComparableYears(fromDate).map((y) => (
                  <Select.Option key={`compareTo-${y}`}>{dayjs(y).format('YYYY')}</Select.Option>
                ))}
              </Select>
            </div>
          )}

          <Button onClick={closeHandler} className="sm:hidden block w-full lg:w-auto lg:flex-[0_0_auto] mt-48">
            {t('statistics:use')}
          </Button>
        </div>
      </section>
    </>
  );
};
