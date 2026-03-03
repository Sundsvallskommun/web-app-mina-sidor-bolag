'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { NewPermissions } from '@layouts/pages/mypages-sections/eligibility/new-permissions/new-permissions.component';
import { Spinner } from '@sk-web-gui/react';
import CurrentAndClosedEligibilityPermissions from './current-and-closed-permissions/current-and-closed-eligibility-permissions';
import { eligibilityQueryKeys, useGetCustomerId } from '@services/permissions-service';
import { useApi } from '@services/api-service';
import { User } from '@interfaces/user';
import { BFUSEligiblePartyPermissionsApiResponse } from '@interfaces/eligibility';

export default function Eligibility() {
  const { t } = useTranslation('eligibility');

  const { data: userData, isLoading: userLoading } = useApi<User>({
    url: '/me',
    method: 'get',
    queryKey: ['user'],
  });

  const { data: customerIds, isLoading: customerLoading } = useGetCustomerId(userData);

  const { data: allPermissions, isLoading: permissionsLoading } = useApi<
    BFUSEligiblePartyPermissionsApiResponse['data']
  >({
    url: '/bfus/eligable-party-permissions',
    queryKey: [eligibilityQueryKeys.partyPermissions],
    method: 'get',
    axiosParameters: {
      params: {
        customerIds: customerIds?.toString(),
      },
    },
    queryOptions: {
      enabled: !!customerIds?.length,
    },
  });

  const isLoading = userLoading || customerLoading || permissionsLoading;
  const hasCustomerIds = !!customerIds?.length;
  const hasPermissions = !!allPermissions && allPermissions.eligablePartyParts.length > 0;

  return (
    <div>
      <h1>{t('eligibility:title')}</h1>
      <p>{t('eligibility:description')}</p>

      <div className="pt-40">
        {isLoading && (
          <div className="w-full flex justify-center">
            <Spinner />
          </div>
        )}
        {!isLoading && !hasCustomerIds && <p>{t('eligibility:noCustomerId')}</p>}
        {!isLoading && hasCustomerIds && !hasPermissions && <p>{t('eligibility:noData')}</p>}
        {!isLoading && hasCustomerIds && hasPermissions && (
          <>
            <NewPermissions allPermissions={allPermissions} />
            <CurrentAndClosedEligibilityPermissions allPermissions={allPermissions} />
          </>
        )}
      </div>
    </div>
  );
}
