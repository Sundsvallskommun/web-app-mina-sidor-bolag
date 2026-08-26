'use client';

import { Icon } from '@sk-web-gui/react';
import { useTranslation } from 'react-i18next';
import React, { useCallback } from 'react';
import { IInvoice } from '@interfaces/invoice';
import { ChevronRight } from 'lucide-react';
import NextLink from 'next/link';
import { InvoiceLabel } from '@layouts/pages/mypages-sections/invoices/invoice-label/invoice-label.component';
import { useApi } from '@services/api-service';
import { User } from '@interfaces/user';

interface InvoiceListItemProps {
  invoice: IInvoice;
  periodFrom: string;
  periodTo: string;
}

export const InvoiceListItem = ({ invoice, periodFrom, periodTo }: InvoiceListItemProps) => {
  const { data: userData } = useApi<User>({ url: '/me', method: 'get', queryKey: ['user'] });
  const { t } = useTranslation();
  const facilityIds = invoice.facilityIds?.join(',') ?? '';

  const getInvoiceAddress = useCallback(
    (facilityIds: string[]): string =>
      userData?.addresses.find((address) => facilityIds.some((id) => address.facilityIds.includes(id)))?.address ?? '',
    [userData]
  );

  return (
    invoice && (
      <NextLink
        href={`./fakturor/${invoice.invoiceNumber}?facilityId=${facilityIds}&periodFrom=${periodFrom}&periodTo=${periodTo}`}
        className="flex justify-between w-full bg-background-content shadow-50 rounded-2xl pl-24 pr-16 lg:py-12 py-16 hover:bg-background-100 focus:ring"
        data-cy={`invoice-list-item-${invoice.invoiceNumber}`}
      >
        <div className="flex-1">
          <div className="flex md:flex-row flex-col justify-between text-large">
            <div className="flex gap-16 md:justify-start justify-between sm:items-center items-start">
              <p>{invoice.invoiceDescription}</p>
              <InvoiceLabel invoiceStatus={invoice.invoiceStatus} />
            </div>
            <p data-cy="amount">{t('invoice:amount', { amount: invoice.totalAmount })}</p>
          </div>
          <div className="flex md:flex-row flex-col justify-between text-dark-secondary">
            <p data-cy="street">{!!invoice.facilityIds?.length && getInvoiceAddress(invoice.facilityIds)}</p>
            <p>{t('invoice:dueOn', { dueDate: invoice.dueDate })}</p>
          </div>
        </div>

        <Icon icon={<ChevronRight />} className="self-center sm:ml-40" />
      </NextLink>
    )
  );
};
