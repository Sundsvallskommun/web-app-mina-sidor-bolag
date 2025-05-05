'use client';

import { FormControl, FormLabel, Select } from '@sk-web-gui/react';
import { InvoicesList } from './invoices/invoices-list.component';
import { useState } from 'react';
import { useApi } from '@services/api-service';
import { InvoiceStatus } from '@data-contracts/invoices/data-contracts';

export default function Invoices() {
  const [facilityIds, setFacilityIds] = useState<string[] | undefined>();

  const {
    data: addresses = [],
    isLoading: addressesIsLoading,
  } = useApi<{address: string; facilityIds: string[]}[]>({
    url: '/addresses',
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
    <div className="flex flex-col gap-[4.0rem]">
      <div>
        <div className="text-content">
          <h1>Dina fakturor</h1>
        </div>
      </div> 
      { !addressesIsLoading ?
        (
          <FormControl className="w-full desktop:w-fit">
            <FormLabel>Visa fakturor per adress</FormLabel>                                
            <Select className="w-full" title="address" size="md" onSelectValue={handleOnSelectAddress}>
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
          <p>Laddar adresser</p>
        )
      }
      <div className="flex flex-col gap-[6.4rem]">
        <InvoicesList
          heading={<h2 className="text-h3">Ohanterade fakturor</h2>}
          pageSize={12}
          facilityIds={facilityIds}
          statusFilter={'SENT' as InvoiceStatus}
        />
        <InvoicesList
          heading={<h2 className="text-h3">Alla fakturor</h2>}
          pageSize={12}
          facilityIds={facilityIds}
        />
      </div>
    </div>
  );
}
