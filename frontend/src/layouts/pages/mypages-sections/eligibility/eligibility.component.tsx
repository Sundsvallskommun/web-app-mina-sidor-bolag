'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { NewPermissions } from '@layouts/pages/mypages-sections/eligibility/new-permissions/new-permissions.component';
import { useApi } from '@services/api-service';
import { Spinner } from '@sk-web-gui/react';
import { BFUSCustomerIdsApiResponse } from '@interfaces/eligibility';

export default function Eligibility() {
  const { t } = useTranslation('eligibility');

  const { data: customerIds, isFetching } = useApi<BFUSCustomerIdsApiResponse['data']>({
    url: '/bfus/eligable-party-customer-id',
    queryKey: ['bfus-customer-ids'],
    method: 'get',
    dataHandler: (data) => data,
  });

  return (
    <div>
      <h1>{t('eligibility:title')}</h1>
      <p>{t('eligibility:description')}</p>

      {isFetching ? (
        <Spinner />
      ) : customerIds ? (
        <div className="pt-40">
          <NewPermissions customerIds={customerIds.customerIds} />
        </div>
      ) : null}
    </div>
  );
}
