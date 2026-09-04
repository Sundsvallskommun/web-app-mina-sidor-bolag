'use client';

import { Button, FormControl, FormLabel, Select, useThemeQueries } from '@sk-web-gui/react';
import { InvoicesList } from './invoices/invoice-list/invoices-list.component';
import React, { useMemo, useState } from 'react';
import { useApi } from '@services/api-service';
import { User } from '@interfaces/user';
import { useTranslation } from 'react-i18next';
import { ADDRESS_PARAM, emptyInvoicesList, useInvoicesQuery } from '@services/invoice-service';
import { InvoicesSection } from '@layouts/pages/mypages-sections/invoices/invoices-section/invoices-section.component';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

export default function Invoices() {
  const { data: userData } = useApi<User>({ url: '/me', method: 'get', queryKey: ['user'] });
  const { isMinDesktop } = useThemeQueries();
  const { t } = useTranslation('invoice');
  const [limit, setLimit] = useState<number>(isMinDesktop ? 12 : 6);
  const [pendingLimit, setPendingLimit] = useState<number>(isMinDesktop ? 12 : 6);
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const requestedAddress = searchParams.get(ADDRESS_PARAM) ?? '';

  const { selectedAddress, facilityIds } = useMemo(() => {
    const match = userData?.addresses?.find(({ facilityIds }) => facilityIds.join(',') === requestedAddress);
    if (match) return { selectedAddress: requestedAddress, facilityIds: match.facilityIds };

    const allIds = [
      ...new Set(userData?.facilities?.map((f) => f.facilityId).filter((id): id is string => id !== undefined) ?? []),
    ];
    return { selectedAddress: '', facilityIds: allIds };
  }, [userData, requestedAddress]);

  const handleOnSelectAddress = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(ADDRESS_PARAM, value);
    } else {
      params.delete(ADDRESS_PARAM);
    }
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  const {
    data: onlyPending = emptyInvoicesList,
    isFetching: pendingFetching,
    isError: pendingError,
  } = useInvoicesQuery({ pending: true, limit: pendingLimit, facilityIds });

  const {
    data: allInvoices = emptyInvoicesList,
    isFetching,
    isError,
  } = useInvoicesQuery({ pending: false, limit, facilityIds });
  const canFetch = allInvoices.invoices.length > 0 && allInvoices.invoices.length < allInvoices.totalCount;
  const canFetchPending = onlyPending.invoices.length > 0 && onlyPending.invoices.length < onlyPending.totalCount;

  return (
    <div className="flex flex-col gap-[4.0rem]">
      <div>
        <div className="text-content">
          <h1>{t('invoice:title')}</h1>
        </div>
      </div>
      {userData && userData.addresses?.length > 1 && (
        <FormControl className="w-full desktop:w-fit">
          <FormLabel>{t('invoice:byAddress')}</FormLabel>
          <Select
            className="w-full"
            title="address"
            size="md"
            value={selectedAddress}
            onSelectValue={handleOnSelectAddress}
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

                  <Button
                    variant="secondary"
                    size="lg"
                    onClick={() => setPendingLimit((prev) => prev + (isMinDesktop ? 12 : 6))}
                    loading={pendingFetching}
                  >
                    {t('invoice:showMore')}
                  </Button>
                </div>
              )}
            </div>
          </InvoicesSection>
        </div>

        <div data-cy="all-invoices">
          <h2 className="text-h3 mb-24">{t('invoice:all')}</h2>
          <InvoicesSection data={allInvoices} isFetching={isFetching} isError={isError} emptyDataCy="no-data">
            <div>
              <InvoicesList data={allInvoices} />

              <div className="flex flex-col items-center gap-12">
                <p className="text-small text-center text-secondary mt-lg">
                  {t('invoice:showing', { count: allInvoices.invoices.length, total: allInvoices.totalCount })}
                </p>
                {canFetch && (
                  <Button
                    variant="secondary"
                    size="lg"
                    onClick={() => setLimit((prev) => prev + (isMinDesktop ? 12 : 6))}
                    loading={isFetching}
                  >
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
