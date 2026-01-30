'use client';

import { FormControl, FormLabel, Select } from '@sk-web-gui/react';
import { InvoicesList } from './invoices/invoices-list.component';
import { useState } from 'react';
import { useApi } from '@services/api-service';
import { User } from '@interfaces/user';
import { useTranslation } from 'react-i18next';

export default function Invoices() {
  const [facilityIds, setFacilityIds] = useState<string[] | undefined>();
  const { t } = useTranslation('invoice');

  const { data: userData } = useApi<User>({ url: '/me', method: 'get', queryKey: ['user'] });

  const handleOnSelectAddress = (value: string) => {
    if (!value) {
      const userFacilityIds =
        userData?.facilities?.filter((f) => typeof f.facilityId !== 'undefined').map((f) => f.facilityId) ?? [];
      setFacilityIds(userFacilityIds.map((id) => id ?? '') ?? []);
      return;
    }
    const facilityIds = JSON.parse(value);
    setFacilityIds(facilityIds);
  };

  return (
    <div className="flex flex-col gap-[4.0rem]">
      <div>
        <div className="text-content">
          <h1>{t('invoice:title')}</h1>
        </div>
      </div>
      {userData && userData.addresses?.length > 1 ? (
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
      ) : undefined}
      <div className="flex flex-col gap-[6.4rem]" data-cy="invoices-wrapper">
        <div data-cy="unhandled-invoices-table">
          <InvoicesList
            heading={<h2 className="text-h3">{t('invoice:unhandled')}</h2>}
            pageSize={24}
            facilityIds={facilityIds}
            onlyPending
          />
        </div>

        <div data-cy="all-invoices-table">
          <InvoicesList
            heading={<h2 className="text-h3">{t('invoice:all')}</h2>}
            pageSize={12}
            facilityIds={facilityIds}
          />
        </div>
      </div>
    </div>
  );
}
