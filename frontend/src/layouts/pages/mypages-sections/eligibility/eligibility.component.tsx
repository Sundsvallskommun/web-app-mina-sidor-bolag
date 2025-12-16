'use client';

import React, { useMemo } from 'react';
import { useGetEligiblePartyPermissions, useGetCustomerId } from '@services/eligibility-service';
import { useTranslation } from 'react-i18next';
import { useApi } from '@services/api-service';
import { User } from '@interfaces/user';

export default function Eligibility() {
  const { t } = useTranslation('eligibility');
  const { data: user } = useApi<User>({
    url: '/me',
    method: 'get',
    queryKey: ['user'],
  });
  const isUserFetched = useMemo(() => !!user?.name, [user?.name]);
  const { data: customerIds } = useGetCustomerId(isUserFetched);
  const { data: permissions, isLoading } = useGetEligiblePartyPermissions(
    customerIds,
    isUserFetched && !!customerIds?.length
  );

  return (
    <div>
      <h1>{t('eligibility:title')}</h1>
      <p>{t('eligibility:description')}</p>
    </div>
  );
}
