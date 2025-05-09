'use client';

import { cx, FormControl, FormLabel, Select } from '@sk-web-gui/react';
import { InvoicesList } from './invoices/invoices-list.component';
import { useState } from 'react';
import { useApi } from '@services/api-service';
import { InvoiceStatus } from '@data-contracts/invoices/data-contracts';
import { User } from '@interfaces/user';
import { InvoicesResponse } from '@interfaces/invoice';

export default function Invoices() {
  const [facilityIds, setFacilityIds] = useState<string[] | undefined>();
  const pageSize = 12;

  const {
    data: userData,
    isLoading: userDataIsLoading,
  } = useApi<User>({ url: '/me', method: 'get' });

  const invoicesSearchParams = new URLSearchParams();
  invoicesSearchParams.append('limit', `${pageSize}`);
  invoicesSearchParams.append('page', `${1}`);

  const {
    data: invoices,
    isLoading: invoicesIsLoading,
  } = useApi<InvoicesResponse>({
    queryKey: ['/invoices', invoicesSearchParams.toString()],
    url: `/invoices?${invoicesSearchParams.toString()}`,
    method: 'get',
  });

  const handleOnSelectAddress = (value: string) => {
    if (!value) {
      setFacilityIds([]);
      return;
    }
    const facilityIds = JSON.parse(value);
    setFacilityIds(facilityIds);
  };

  return (
    <div className={cx('flex flex-col', (!invoicesIsLoading && userData?.addresses.length) ? 'gap-[4.0rem]' : undefined)}>
      <div>
        <div className="text-content">
          <h1>Dina fakturor</h1>
        </div>
      </div> 
      { (userDataIsLoading || invoicesIsLoading) ? (
        <p className="mt-[0.8rem]">Laddar Fakturor</p>
      ): invoices && !invoices?.invoices.length ? (
        <p className="mt-[0.8rem]">Du har inga fakturor än. När det finns något att betala kan du se det här.</p>
      ): (
        <>
          { userData && userData.addresses.length > 1 ? (
            <FormControl className="w-full desktop:w-fit">
              <FormLabel>Visa fakturor per adress</FormLabel>                                
              <Select className="w-full" title="address" size="md" onSelectValue={handleOnSelectAddress}>
                <Select.Option key="all" value="">
                  Välj adress
                </Select.Option>
                {
                  userData?.addresses.map(({address, facilityIds}, index) => (
                    <Select.Option key={`${index}`} value={JSON.stringify(facilityIds)}>
                      { address }
                    </Select.Option>
                  ))
                }
              </Select>
            </FormControl>
          ): undefined }
          <div className="flex flex-col gap-[6.4rem]">
            <InvoicesList
              heading={<h2 className="text-h3">Ohanterade fakturor</h2>}
              pageSize={pageSize}
              facilityIds={facilityIds}
              statusFilter={'SENT' as InvoiceStatus}
            />
            <InvoicesList
              heading={<h2 className="text-h3">Alla fakturor</h2>}
              pageSize={pageSize}
              facilityIds={facilityIds}
            />
          </div>
        </>
      )}
    </div>
  );
}
