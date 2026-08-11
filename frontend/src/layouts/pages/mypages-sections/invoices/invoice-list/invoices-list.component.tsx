import React, { useRef } from 'react';
import { InvoicesData } from '@interfaces/invoice';
import { InvoiceListItem } from '@layouts/pages/mypages-sections/invoices/invoice-list-item/invoice-list-item.component';

export const InvoicesList: React.FC<{
  data: InvoicesData;
}> = ({ data }) => {
  const ref = useRef<null | HTMLDivElement>(null);
  return (
    <div ref={ref} className="flex flex-col gap-16">
      {data.invoices.map((invoice) => {
        return (
          <InvoiceListItem
            key={invoice.invoiceId}
            invoice={invoice}
            periodFrom={invoice.periodFrom!}
            periodTo={invoice.periodTo!}
          />
        );
      })}
    </div>
  );
};
