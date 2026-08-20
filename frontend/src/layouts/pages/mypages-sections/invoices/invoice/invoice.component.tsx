'use client';

import { Breadcrumb, Spinner } from '@sk-web-gui/react';
import NextLink from 'next/link';
import { PagesBreadcrumbsLayout } from '@layouts/pages-breadcrumbs-layout.component';
import { useParams, useSearchParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { useApi } from '@services/api-service';
import { IInvoice } from '@interfaces/invoice';
import { CustomerInvoice } from '@data-contracts/backend/data-contracts';
import { invoiceHandler } from '@services/invoice-service';
import { User } from '@interfaces/user';
import { InvoiceLabel } from '@layouts/pages/mypages-sections/invoices/invoice-label/invoice-label.component';
import { InvoiceDetails } from '@layouts/pages/mypages-sections/invoices/invoice-details/invoice-details.component';
import { DownloadPdfButton } from '@layouts/pages/mypages-sections/invoices/get-pdf-button.component';
import React, { useState } from 'react';
import { PagesLayout } from '@layouts/pages-layout.component';
import {
  getInvoiceAddress,
  groupInvoiceDetails,
} from '@layouts/pages/mypages-sections/invoices/invoice-details/invoice-details-helpers';
import { AxiosError } from 'axios';

export const Invoice = () => {
  const { t } = useTranslation(['common', 'invoices']);
  const [pdfIsLoading, setPdfIsLoading] = useState<{ [key: string]: boolean }>({});
  const { data: userData } = useApi<User>({ url: '/me', method: 'get', queryKey: ['user'] });

  const [invoiceNumber] = useParams<{ slug: [string] }>().slug;
  const search = useSearchParams();
  const periodFrom = search.get('periodFrom') ?? '';
  const periodTo = search.get('periodTo') ?? '';
  const facilityIds = search.get('facilityId') ?? '';

  const {
    data: invoice,
    isLoading,
    isError,
    error,
  } = useApi<CustomerInvoice, AxiosError, IInvoice>({
    queryKey: ['invoice', invoiceNumber, periodFrom],
    url: `/invoice/${invoiceNumber}?facilityId=${facilityIds}&periodFrom=${periodFrom}&periodTo=${periodTo}`,
    method: 'get',
    dataHandler: invoiceHandler,
    queryOptions: { enabled: !!facilityIds },
  });

  const groupedDetails = groupInvoiceDetails(invoice?.details ?? [], {
    unknown: t('invoice:unknown'),
    other: t('invoice:other'),
  });

  if (isLoading) return <Spinner className="mx-auto my-80" />;

  if (isError) {
    const status = error?.response?.status;
    const isNotFound = status === 404;
    return (
      <PagesLayout>
        <h3 className="mb-24">{isNotFound ? t('invoice:notFound', { invoiceNumber }) : t('invoice:loadError')}</h3>
        <NextLink className="underline" href="./../fakturor">
          {t('invoice:goBack')}
        </NextLink>
      </PagesLayout>
    );
  }

  if (!invoice) return null;

  const invoiceAddress = getInvoiceAddress(userData, invoice?.facilityIds ?? []);

  return (
    <PagesBreadcrumbsLayout
      breadcrumbs={
        <Breadcrumb>
          <Breadcrumb.Item>
            <NextLink href="./../fakturor">
              <Breadcrumb.Link variant="body" as="span" href={t('agreement:breadcrumbUrl')}>
                {t('invoice:invoices')}
              </Breadcrumb.Link>
            </NextLink>
          </Breadcrumb.Item>
          <Breadcrumb.Item currentPage>
            <Breadcrumb.Link href="./">
              {t('invoice:invoice')}{' '}
              {invoice
                ? t(`organization:${invoice.organizationNumber}.name`, { defaultValue: t('common:unknown') })
                : null}
            </Breadcrumb.Link>
          </Breadcrumb.Item>
        </Breadcrumb>
      }
    >
      <section className="bg-background-content md:px-32 px-20 md:pb-32 pb-20 rounded-cards shadow-50 pt-24 md:pt-28">
        <div className="flex gap-16 md:items-center items-start">
          <h3 className="text-h3-lg" data-cy="description">
            {invoice.invoiceDescription}
          </h3>
          <InvoiceLabel invoiceStatus={invoice.invoiceStatus} />
        </div>
        <p className="text-large" data-cy="administration">
          {t(`organization:${invoice.organizationNumber}.name`, { defaultValue: t('common:unknown') })}
        </p>

        <div className="flex lg:flex-row flex-col lg:gap-0 gap-8 justify-between mt-24 pr-40">
          <div>
            <p className="font-bold">{t('invoice:toPay')}</p>
            <p> {t('invoice:amount', { amount: invoice.totalAmount })}</p>
          </div>
          <div className="pr-24">
            <p className="font-bold">{t('invoice:address')}</p>
            <p>{invoiceAddress}</p>
          </div>
          <div>
            <p className="font-bold">{t('invoice:period')}</p>
            <p>{t('invoice:periodFromAndTo', { from: invoice.periodFrom, to: invoice.periodTo })}</p>
          </div>
          <div>
            <p className="font-bold">{t('invoice:dueDate')}</p>
            <p>{invoice.dueDate}</p>
          </div>
          <div>
            <p className="font-bold">{t('invoice:number')}</p>
            <p>{invoice.invoiceNumber}</p>
          </div>
        </div>

        {groupedDetails && <InvoiceDetails groupedDetails={groupedDetails} />}

        <div className="text-dark-secondary my-40 lg:text-right text-left">
          <p>{t('invoice:amountVatExcluded', { amountVatExcluded: invoice.amountVatExcluded })}</p>
          <p>
            {t('invoice:vat', {
              vat: ((invoice.amountVatIncluded ?? 0) - (invoice.amountVatExcluded ?? 0)).toFixed(2),
            })}
          </p>
          <p>{t('invoice:rounding', { rounding: invoice.rounding })}</p>
          <p className="font-bold">{t('invoice:totalAmount', { totalAmount: invoice.totalAmount })}</p>
        </div>

        <div className="mt-24">
          <DownloadPdfButton isLoading={pdfIsLoading} setIsLoading={setPdfIsLoading} item={invoice} />
        </div>
      </section>
    </PagesBreadcrumbsLayout>
  );
};
