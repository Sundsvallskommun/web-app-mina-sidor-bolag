'use client';

import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { NewPermissions } from '@layouts/pages/mypages-sections/eligibility/new-permissions/new-permissions.component';
import { Spinner } from '@sk-web-gui/react';
import CurrentAndClosedEligibilityPermissions from './current-and-closed-permissions/current-and-closed-eligibility-permissions';
import { eligibilityQueryKeys, permissionsHandler, useGetCustomerId } from '@services/permissions-service';
import { useApi } from '@services/api-service';
import { User } from '@interfaces/user';

export default function Eligibility() {
  const { t } = useTranslation('eligibility');

  const { data: userData, isLoading: userLoading } = useApi<User>({
    url: '/me',
    method: 'get',
    queryKey: ['user'],
  });

  const {
    data: customerIds,
    isLoading: customerLoading,
    isError: noCustomerIds,
    isRefetching,
  } = useGetCustomerId(userData);

  const { data: permissions, isLoading: permissionsLoading } = useApi({
    url: '/bfus/eligable-party-permissions',
    queryKey: [eligibilityQueryKeys.partyPermissions, customerIds],
    method: 'get',
    axiosParameters: {
      params: {
        customerIds: customerIds?.toString(),
      },
    },
    queryOptions: {
      enabled: !!customerIds?.length,
    },
    dataHandler: permissionsHandler,
  });

  const isLoading = userLoading || customerLoading || permissionsLoading || isRefetching;
  const hasCustomerIds = !!customerIds?.length;
  const hasPermissions =
    !!permissions &&
    Boolean(Object.keys(permissions.new).length || permissions.current.length || permissions.closed.length);

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
        {((!isLoading && !hasCustomerIds) || noCustomerIds) && <p>{t('eligibility:noCustomerId')}</p>}
        {!isLoading && hasCustomerIds && !hasPermissions && <p>{t('eligibility:noData')}</p>}
        {!isLoading && hasCustomerIds && hasPermissions && !noCustomerIds && (
          <>
            <NewPermissions customerIds={customerIds} permissions={permissions.new} />
            <CurrentAndClosedEligibilityPermissions
              customerIds={customerIds}
              current={permissions.current}
              closed={permissions.closed}
            />
          </>
        )}
      </div>
    </div>
  );
}
