'use client';

import React from 'react';
import { useGetCustomerId } from '@services/eligibility-service';
import { useTranslation } from 'react-i18next';
import CurrentAndClosedEligibilityPermissions from './current-and-closed-permissions/current-and-closed-eligibility-permissions';
import { useApi } from '@services/api-service';
import { User } from '@interfaces/user';

export default function Eligibility() {
  const { t } = useTranslation('eligibility');
  const { data: userData } = useApi<User>({ url: '/me', method: 'get', queryKey: ['user'] });
  const { data: customerIds } = useGetCustomerId(userData);

  return (
    <div>
      <h1>{t('eligibility:title')}</h1>
      <p>{t('eligibility:description')}</p>
      <CurrentAndClosedEligibilityPermissions customerIds={customerIds} />
    </div>
  );
}
