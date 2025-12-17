'use client';

import React from 'react';
import { useGetEligiblePartyPermissions, useGetCustomerId } from '@services/eligibility-service';
import { useTranslation } from 'react-i18next';
import CurrentAndClosedEligibilityPermissions from './current-and-closed-eligibility-permissions';

export default function Eligibility() {
  const { t } = useTranslation('eligibility');
  const { data: customerIds } = useGetCustomerId();
  const { data: permissions, isLoading, isFetching } = useGetEligiblePartyPermissions(customerIds);
  const currentAndClosedPermissions = permissions?.filter((p) => p.StatusCategory !== 'new');
  const isLoaded = !isLoading && !isFetching && permissions !== undefined;

  return (
    <div>
      <h1>{t('eligibility:title')}</h1>
      <p>{t('eligibility:description')}</p>
      <CurrentAndClosedEligibilityPermissions permissions={currentAndClosedPermissions} isLoaded={isLoaded} />
    </div>
  );
}
