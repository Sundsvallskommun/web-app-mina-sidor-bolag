'use client';

import { Button, FormControl, FormLabel, Select, useThemeQueries } from '@sk-web-gui/react';
import { InvoicesList } from './invoices/invoice-list/invoices-list.component';
import React, { useEffect, useState } from 'react';
import { useApi } from '@services/api-service';
import { User } from '@interfaces/user';
import { useTranslation } from 'react-i18next';
import { emptyInvoicesList, useInvoicesQuery } from '@services/invoice-service';
import { InvoicesSection } from '@layouts/pages/mypages-sections/invoices/invoices-section/invoices-section.component';

export default function Invoices() {
  const { data: userData } = useApi<User>({ url: '/me', method: 'get', queryKey: ['user'] });
  const { isMinDesktop } = useThemeQueries();
  const [facilityIds, setFacilityIds] = useState<string[]>([]);
  const { t } = useTranslation('invoice');
  const [limit, setLimit] = useState<number>(isMinDesktop ? 12 : 6);
  const [pendingLimit, setPendingLimit] = useState<number>(isMinDesktop ? 12 : 6);

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

  const handleOnSelectAddress = (value: string) => {
    if (!value) {
      const userFacilityIds =
        userData?.facilities?.filter((f) => typeof f.facilityId !== 'undefined').map((f) => f.facilityId) ?? [];
      setFacilityIds(userFacilityIds.map((id) => id ?? '') ?? []);
      return;
    }
    const parsedFacilityIds = JSON.parse(value);
    setFacilityIds(parsedFacilityIds);
  };

  useEffect(() => {
    const ids = userData?.facilities?.map((f) => f.facilityId).filter((id): id is string => id !== undefined) ?? [];
    setFacilityIds(ids);
  }, [userData]);

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
          <Select className="w-full" title="address" size="md" onSelectValue={handleOnSelectAddress}>
            <Select.Option key="all" value="">
              {t('invoice:chooseAddress')}
            </Select.Option>
            {userData.addresses?.map(({ address, facilityIds }, index) => (
              <Select.Option key={`${index}`} value={JSON.stringify(facilityIds)}>
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
              <InvoicesList
                data={onlyPending}
                limit={Math.max(limit, pendingLimit)}
                facilityIds={facilityIds?.join(',') ?? ''}
              />

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
              <InvoicesList
                data={allInvoices}
                limit={Math.max(limit, pendingLimit)}
                facilityIds={facilityIds?.join(',') ?? ''}
              />

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
