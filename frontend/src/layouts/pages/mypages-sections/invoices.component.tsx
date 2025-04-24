'use client';

import { FormControl, FormLabel, Select, Spinner } from '@sk-web-gui/react';
import { InvoicesTable } from './invoices/invoices-table.component';
import { InvoicesData, InvoicesResponse } from '@interfaces/invoice';
import {
  emptyInvoicesList,
  invoicesHandler,
} from '@services/invoice-service';
import { useEffect, useState } from 'react';
import { useApi } from '@services/api-service';

export default function Invoices() {
  const [facilityId, setFacilityId] = useState<string[] | undefined>();

  const unpaidInvoicesSearchParams = new URLSearchParams({});
  unpaidInvoicesSearchParams.append('invoiceStatus', 'SENT');
  if (facilityId?.length)
    unpaidInvoicesSearchParams.append('facilityId', facilityId.toString());

  const allInvoicesSearchParams = new URLSearchParams({});
  allInvoicesSearchParams.append('limit', '25');
  allInvoicesSearchParams.append('page', '1');
  if (facilityId?.length)
    allInvoicesSearchParams.append('facilityId', facilityId.toString());

  const {
    data: unpaidInvoices = emptyInvoicesList,
    isLoading: unpaidIsLoading,
    isFetching: unpaidIsFetching,
    refetch: refetchUnpaid,
  } = useApi<InvoicesResponse, Error, InvoicesData>({
    queryKey: ['/invoices', unpaidInvoicesSearchParams.toString()],
    url: `/invoices?${unpaidInvoicesSearchParams.toString()}`,
    queryOptions: {
      enabled: false,
    },
    method: 'get',
    dataHandler: invoicesHandler,
  });

  const {
    data: invoices = emptyInvoicesList,
    isLoading: invoicesIsLoading,
    isFetching: invoicesIsFetching,
    refetch: refetchInvoices,
  } = useApi<InvoicesResponse, Error, InvoicesData>({
    queryKey: ['/invoices', allInvoicesSearchParams.toString()],
    url: `/invoices?${allInvoicesSearchParams.toString()}`,
    queryOptions: {
      enabled: false,
    },
    method: 'get',
    dataHandler: invoicesHandler,
  });

  const {
    data: addresses = [],
    isLoading: addressesIsLoading,
  } = useApi<{address: string; facilityIds: string[]}[]>({
    url: '/addresses',
    method: 'get',
  });

  const handleOnSelectValue = (value: string) => {
    if (!value) {
      setFacilityId([]);
      return;
    }
    const facilityIds = JSON.parse(value);
    setFacilityId(facilityIds);
  };

  useEffect(() => {
    refetchUnpaid();
    refetchInvoices();
  }, [facilityId, refetchInvoices, refetchUnpaid]);

  return (
    <div className="flex flex-col gap-[6.4rem]">
      <div>
        <div className="text-content">
          <h1>Dina fakturor</h1>
        </div>
        
        { !addressesIsLoading ?
          (
            <FormControl className="w-full mt-24">
              <FormLabel>Välj fakturor per adress</FormLabel>                                
              <Select title="address" size="sm" onSelectValue={handleOnSelectValue}>
                <Select.Option key="all" value="">
                  Välj adress
                </Select.Option>
                {
                  addresses.map(({address, facilityIds}, index) => (
                    <Select.Option key={`${index}`} value={JSON.stringify(facilityIds)}>
                      { address }
                    </Select.Option>
                  ))
                }
              </Select>
            </FormControl>
          ): (
            <Spinner className="mt-24" aria-label="Hämtar addresser"></Spinner>
          )
        }
      </div>

      { (!invoicesIsLoading && !unpaidIsLoading && !addressesIsLoading) ?
          invoices.invoices.length > 0 ?
            (
              <>
                <InvoicesTable
                  data={unpaidInvoices}
                  heading={<h2 className="text-h3">Ohanterade fakturor</h2>}
                  isFetchingData={unpaidIsFetching}
                />
                <InvoicesTable
                  data={invoices}
                  heading={<h2 className="text-h3">Alla fakturor</h2>}
                  isFetchingData={invoicesIsFetching}
                />
              </>
            ): (
              <p>Du har inga fakturor än, men så fort det finns något att behandla kan du se det här.</p>
            )
        : undefined
      }
    </div>
  );
}
