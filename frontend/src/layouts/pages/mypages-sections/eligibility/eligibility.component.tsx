'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { NewPermissions } from '@layouts/pages/mypages-sections/eligibility/new-permissions/new-permissions.component';
import { Spinner } from '@sk-web-gui/react';
import CurrentAndClosedEligibilityPermissions from './current-and-closed-permissions/current-and-closed-eligibility-permissions';
import { useGetCustomerId } from '@services/eligibility-service';
import { useApi } from '@services/api-service';
import { User } from '@interfaces/user';

export default function Eligibility() {
  const { t } = useTranslation('eligibility');
  const { data: userData } = useApi<User>({ url: '/me', method: 'get', queryKey: ['user'] });
  const { data: customerIds, isFetching } = useGetCustomerId(userData);

  return (
    <div>
      <h1>{t('eligibility:title')}</h1>
      <p>{t('eligibility:description')}</p>

      {isFetching ? (
        <Spinner />
      ) : customerIds ? (
        <div className="pt-40">
          <NewPermissions customerIds={customerIds} />
          <CurrentAndClosedEligibilityPermissions customerIds={customerIds} />
        </div>
      ) : (
        <p className="pt-40">{t('eligibility.noData')}</p>
      )}
    </div>
  );
}
