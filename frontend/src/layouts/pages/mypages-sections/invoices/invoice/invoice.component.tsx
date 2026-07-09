'use client';

import { Breadcrumb, Spinner } from '@sk-web-gui/react';
import NextLink from 'next/link';
import { PagesBreadcrumbsLayout } from '@layouts/pages-breadcrumbs-layout.component';
import { useParams, useSearchParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { useApi } from '@services/api-service';
import { GroupedDetails, InvoicesData } from '@interfaces/invoice';
import { CustomerInvoicesResponse } from '@data-contracts/backend/data-contracts';
import { invoicesHandler } from '@services/invoice-service';
import { User } from '@interfaces/user';
import { InvoiceLabel } from '@layouts/pages/mypages-sections/invoices/invoice-label/invoice-label.component';
import { InvoiceDetails } from '@layouts/pages/mypages-sections/invoices/invoice-details/invoice-details.component';
import { DownloadPdfButton } from '@layouts/pages/mypages-sections/invoices/get-pdf-button.component';
import React, { useCallback, useState } from 'react';
import { PagesLayout } from '@layouts/pages-layout.component';

export const Invoice = () => {
  const params = useParams<{ slug: [string, string] }>();
  const [invoiceNumber] = params.slug;
  const { t } = useTranslation(['common', 'invoices']);
  const [pdfIsLoading, setPdfIsLoading] = useState<{ [key: string]: boolean }>({});

  const { data: userData } = useApi<User>({ url: '/me', method: 'get', queryKey: ['user'] });

  const getInvoiceAddress = useCallback(
    (facilityIds: string[]): string =>
      userData?.addresses.find((address) => facilityIds.some((id) => address.facilityIds.includes(id)))?.address ?? '',
    [userData]
  );

  const facilityIds =
    userData?.facilities
      ?.map((f) => f.facilityId)
      .filter(Boolean)
      .join(',') ?? '';

  const search = useSearchParams();
  const page = search.get('page') ?? '1';
  const limit = search.get('limit') ?? '24';

  const { data, isLoading, isError } = useApi<CustomerInvoicesResponse, Error, InvoicesData>({
    queryKey: ['allInvoices', limit.toString(), facilityIds.toString()],
    url: `/invoices?page=${page}&limit=${limit}&facilityId=${facilityIds}`,
    method: 'get',
    dataHandler: invoicesHandler,
    queryOptions: { enabled: !!facilityIds },
  });

  const invoice = data?.invoices.find((i) => i.invoiceNumber === invoiceNumber);

  const groupedDetails = invoice?.details.reduce<GroupedDetails>((acc, d) => {
    const fac = d.facilityId ?? t('invoice:unknown');
    const desc = d.description ?? t('invoice:other');
    ((acc[fac] ??= {})[desc] ??= []).push(d);
    return acc;
  }, {});

  if (isLoading) return <Spinner className="mx-auto my-80" />;
  if (isError)
    return (
      <PagesLayout>
        <h3 className="mb-24">{t('invoice:loadError')}</h3>
        <NextLink className="underline" href="./../fakturor">
          {t('invoice:goBack')}
        </NextLink>
      </PagesLayout>
    );
  if (!invoice)
    return (
      <PagesLayout>
        <h3 className="mb-24">{t('invoice:notFound', { invoiceNumber: invoiceNumber })}</h3>
        <NextLink className="underline" href="./../fakturor">
          {t('invoice:goBack')}
        </NextLink>
      </PagesLayout>
    );

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
            <p>{getInvoiceAddress(invoice.facilityIds ?? [])}</p>
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
