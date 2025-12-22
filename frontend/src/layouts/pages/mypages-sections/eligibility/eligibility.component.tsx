'use client';

import React from 'react';
import { useGetCustomerId } from '@services/eligibility-service';
import { useTranslation } from 'react-i18next';
import CurrentAndClosedEligibilityPermissions from './current-and-closed-permissions/current-and-closed-eligibility-permissions';

export default function Eligibility() {
  const { t } = useTranslation('eligibility');
  const { data: customerIds } = useGetCustomerId();

  return (
    <div>
      <h1>{t('eligibility:title')}</h1>
      <p>{t('eligibility:description')}</p>
      <CurrentAndClosedEligibilityPermissions customerIds={customerIds} />
    </div>
  );
}
