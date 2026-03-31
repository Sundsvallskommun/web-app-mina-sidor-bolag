'use client';

import { InstalledBaseItem } from '@data-contracts/installedbase/data-contracts';
import { User } from '@interfaces/user';
import { generateComparableYears } from '@layouts/pages/mypages-sections/statistics/statistics-filter/generateDateLists';
import { useApi } from '@services/api-service';
import { Button, FormLabel, NavigationBar, Select } from '@sk-web-gui/react';
import dayjs, { Dayjs } from 'dayjs';
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
}

export const StatisticsFilter = (props: StatisticsFilterProps) => {
  const searchParams = useSearchParams();
  const linkedFacilityId = searchParams?.get('installation');
  const { t } = useTranslation(['common', 'statistics']);

  const { closeHandler } = props;
  const { register, watch, setValue } = useFormContext<StatisticsForm>();
  const [facilities, setFacilities] = useState<InstalledBaseItem[]>();
  const [mode, setMode] = useState<'day' | 'month' | 'year'>('month');
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
    const setDate = (by: 'year' | 'month' | 'day', _date?: Dayjs) => {
      const y = selectedYear ?? dayjs().format('YYYY');
      const m = selectedMonth ?? dayjs().format('MM');
      const d = selectedDay ?? dayjs().format('DD');
      const date = _date ?? dayjs(`${y}-${m}-${by === 'day' ? d : '01'}`);
      const fromDate = date.startOf(by).format('YYYY-MM-DD');
      const toDate = date.endOf(by).format('YYYY-MM-DD');
      const year = date.format('YYYY');
      const month = date.format('MM');
      const day = date.format('DD');
      setValue('fromDate', fromDate);
      setValue('toDate', toDate);
      setValue('selectedYear', year);
      setValue('selectedMonth', month);
      setValue('selectedDay', day);
    };

    setDate(mode);
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
