'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';

export default function ImpersonateUser() {
  const { t } = useTranslation('impersonation');

  return (
    <div>
      <h1>{t('impersonation:title')}</h1>
    </div>
  );
}
