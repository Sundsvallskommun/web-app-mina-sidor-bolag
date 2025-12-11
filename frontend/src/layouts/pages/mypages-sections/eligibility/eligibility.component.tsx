'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';

export default function Eligibility() {
  const { t } = useTranslation('eligibility');

  return (
    <div>
      <h1>{t('eligibility:title')}</h1>
      <p>{t('eligibility:description')}</p>
    </div>
  );
}
