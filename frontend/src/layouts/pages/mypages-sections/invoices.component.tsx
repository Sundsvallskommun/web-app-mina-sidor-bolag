'use client';

import { Button, FormControl, FormLabel, Select, useThemeQueries } from '@sk-web-gui/react';
import { InvoicesList } from './invoices/invoice-list/invoices-list.component';
import React, { useMemo, useState } from 'react';
import { useApi } from '@services/api-service';
import { User } from '@interfaces/user';
import { useTranslation } from 'react-i18next';
import {
  ADDRESS_PARAM,
  YEAR_PARAM,
  emptyInvoicesList,
  getInvoiceYearOptions,
  groupInvoicesByYear,
  useInvoicesQuery,
} from '@services/invoice-service';
import { InvoicesSection } from '@layouts/pages/mypages-sections/invoices/invoices-section/invoices-section.component';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

const useLoadMore = (initial: number, step: number, filterKey: string) => {
  const [extra, setExtra] = useState({ key: filterKey, rows: 0 });
  const rows = extra.key === filterKey ? extra.rows : 0;
  return { limit: initial + rows, loadMore: () => setExtra({ key: filterKey, rows: rows + step }) };
};

export default function Invoices() {
  const { data: userData } = useApi<User>({ url: '/me', method: 'get', queryKey: ['user'] });
  const { isMinDesktop } = useThemeQueries();
  const { t } = useTranslation('invoice');
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const requestedAddress = searchParams.get(ADDRESS_PARAM) ?? '';
  const yearOptions = useMemo(() => getInvoiceYearOptions(), []);
  const requestedYear = searchParams.get(YEAR_PARAM) ?? '';
  const selectedYear = yearOptions.includes(requestedYear) ? requestedYear : '';

  const { selectedAddress, facilityIds } = useMemo(() => {
    const match = userData?.addresses?.find(({ facilityIds }) => facilityIds.join(',') === requestedAddress);
    if (match) return { selectedAddress: requestedAddress, facilityIds: match.facilityIds };

    const allIds = [
      ...new Set(userData?.facilities?.map((f) => f.facilityId).filter((id): id is string => id !== undefined) ?? []),
    ];
    return { selectedAddress: '', facilityIds: allIds };
  }, [userData, requestedAddress]);

  const setSearchParam = (name: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(name, value);
    } else {
      params.delete(name);
    }
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  const initialLimit = isMinDesktop ? 24 : 6;
  const step = isMinDesktop ? 12 : 6;
  const { limit, loadMore } = useLoadMore(initialLimit, step, `${requestedAddress}|${selectedYear}`);
  const { limit: pendingLimit, loadMore: loadMorePending } = useLoadMore(initialLimit, step, requestedAddress);

  const {
    data: onlyPending = emptyInvoicesList,
    isFetching: pendingFetching,
    isError: pendingError,
  } = useInvoicesQuery({ pending: true, limit: pendingLimit, facilityIds });

  const {
    data: allInvoices = emptyInvoicesList,
    isFetching,
    isError,
  } = useInvoicesQuery({ pending: false, limit, facilityIds, year: selectedYear });
  const canFetch = allInvoices.invoices.length > 0 && allInvoices.invoices.length < allInvoices.totalCount;
  const canFetchPending = onlyPending.invoices.length > 0 && onlyPending.invoices.length < onlyPending.totalCount;
  const invoicesByYear = useMemo(() => groupInvoicesByYear(allInvoices.invoices), [allInvoices.invoices]);

  return (
    <div className="flex flex-col gap-[4.0rem]">
      <div>
        <div className="text-content">
          <h1>{t('invoice:title')}</h1>
        </div>
      </div>
      <div className="flex flex-col desktop:flex-row gap-24">
        {userData && userData.addresses?.length > 1 && (
          <FormControl className="w-full desktop:w-fit">
            <FormLabel>{t('invoice:byAddress')}</FormLabel>
            <Select
              className="w-full"
              title="address"
              size="md"
              value={selectedAddress}
              onSelectValue={(value) => setSearchParam(ADDRESS_PARAM, value)}
            >
              <Select.Option key="all" value="">
                {t('invoice:chooseAddress')}
              </Select.Option>
              {userData.addresses?.map(({ address, facilityIds }) => (
                <Select.Option key={address} value={facilityIds.join(',')}>
                  {address}
                </Select.Option>
              ))}
            </Select>
          </FormControl>
        )}
      </div>

      <div className="flex flex-col gap-64" data-cy="invoices-wrapper">
        <div data-cy="unhandled-invoices">
          <h2 className="text-h3 mb-24">{t('invoice:unhandled')}</h2>

          <InvoicesSection data={onlyPending} isFetching={pendingFetching} isError={pendingError} emptyDataCy="no-data">
            <div>
              <InvoicesList data={onlyPending} />

              {canFetchPending && (
                <div className="flex flex-col items-center gap-12">
                  <p className="text-small text-center text-secondary mt-lg">
                    {t('invoice:showing', { count: onlyPending.invoices.length, total: onlyPending.totalCount })}
                  </p>

                  <Button variant="secondary" size="lg" onClick={loadMorePending} loading={pendingFetching}>
                    {t('invoice:showMore')}
                  </Button>
                </div>
              )}
            </div>
          </InvoicesSection>
        </div>

        <div data-cy="all-invoices">
          <div className="flex flex-col desktop:flex-row desktop:justify-between desktop:items-center items-start mb-24">
            <h2 className="text-h3 mb-24 desktop:mb-0">{t('invoice:all')}</h2>
            <FormControl className="w-full desktop:w-fit">
              <FormLabel>{t('invoice:byYear')}</FormLabel>
              <Select
                className="w-full"
                title="year"
                size="sm"
                value={selectedYear}
                onSelectValue={(value) => setSearchParam(YEAR_PARAM, value)}
                data-cy="invoice-year-select"
              >
                <Select.Option key="all" value="">
                  {t('invoice:allYears')}
                </Select.Option>
                {yearOptions.map((year) => (
                  <Select.Option key={year} value={year}>
                    {year}
                  </Select.Option>
                ))}
              </Select>
            </FormControl>
          </div>

          <InvoicesSection
            data={allInvoices}
            isFetching={isFetching}
            isError={isError}
            emptyDataCy="no-data"
            emptyText={selectedYear ? t('invoice:noDataForYear', { year: selectedYear }) : undefined}
          >
            <div>
              {selectedYear ? (
                <InvoicesList data={allInvoices} />
              ) : (
                <div className="flex flex-col gap-32">
                  {invoicesByYear.map(({ year, invoices }) => (
                    <section key={year} data-cy={`invoices-year-${year || 'unknown'}`}>
                      <h3 className="text-h4-sm mb-16">{year || t('invoice:unknown')}</h3>
                      <InvoicesList data={{ ...allInvoices, invoices }} />
                    </section>
                  ))}
                </div>
              )}

              <div className="flex flex-col items-center gap-12">
                <p className="text-small text-center text-secondary mt-lg">
                  {t('invoice:showing', { count: allInvoices.invoices.length, total: allInvoices.totalCount })}
                </p>
                {canFetch && (
                  <Button variant="secondary" size="lg" onClick={loadMore} loading={isFetching}>
                    {t('invoice:showMore')}
                  </Button>
                )}
              </div>
            </div>
          </InvoicesSection>
        </div>
      </div>
    </div>
  );
}
