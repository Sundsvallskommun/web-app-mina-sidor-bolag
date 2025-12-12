'use client';

import React from 'react';
import { useGetCustomerIds, useGetEligiblePartyPermissions } from '@services/eligibility-service';
import { useTranslation } from 'react-i18next';

export default function Eligibility() {
  const { t } = useTranslation('eligibility');
  const { data: customerIds, loading: customerIdsLoading, loaded: customerIdsLoaded } = useGetCustomerIds();
  const {
    data: eligiblePartyParts,
    loading: eligiblePartyPartsLoading,
    loaded: eligiblePartyPartsLoaded,
  } = useGetEligiblePartyPermissions(customerIds ?? null, customerIds && customerIds.length > 0);

  return (
    <div>
      <h1>{t('eligibility:title')}</h1>
      <p>{t('eligibility:description')}</p>
    </div>
  );
}
