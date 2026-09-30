import { useTranslation } from 'react-i18next';
import { Spinner } from '@sk-web-gui/react';
import { InvoicesData } from '@interfaces/invoice';
import React from 'react';

type InvoicesSectionProps = {
  data: InvoicesData;
  isFetching: boolean;
  isError: boolean;
  emptyDataCy?: string;
  children: React.ReactNode;
};

export const InvoicesSection = ({ data, isFetching, isError, emptyDataCy, children }: InvoicesSectionProps) => {
  const { t } = useTranslation('invoice');
  if (data.invoices.length > 0) return <>{children}</>;
  if (isFetching) return <Spinner className="mx-auto" />;
  if (isError) return <p>{t('invoice:loadError')}</p>;
  return <p data-cy={emptyDataCy}>{t('invoice:noData')}</p>;
};
