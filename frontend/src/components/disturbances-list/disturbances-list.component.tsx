'use client';

import React from 'react';
import { useApi } from '@services/api-service';
import { Spinner } from '@sk-web-gui/react';
import { Disturbance } from '@data-contracts/backend/data-contracts';
import { useTranslation } from 'react-i18next';
import { DisturbanceListItem } from '@components/disturbances-list/disturbance-list-item/disturbance-list-item.component';

export interface DisturbancesProps {
  statuses?: string;
}

export default function DisturbancesList({ statuses }: Readonly<DisturbancesProps>) {
  const { t } = useTranslation();
  const statusParams = new URLSearchParams();
  if (statuses) statusParams.append('status', statuses);
  const queryString = statusParams.toString();
  const url = queryString ? `/disturbances?${queryString}` : '/disturbances';

  const { data, isFetching } = useApi<Disturbance[]>({
    url,
    method: 'get',
    queryKey: ['disturbances', statuses ?? ''],
  });

  const renderContent = () => {
    if (isFetching) return <Spinner className="mx-auto" />;
    if (!data || data.length === 0) {
      return <p>{t('disturbances:noDisturbances')}</p>;
    }
    return data.map((disturbance) => <DisturbanceListItem key={disturbance.id} disturbance={disturbance} />);
  };

  return (
    <div data-cy="disturbances">
      <div className="flex flex-col gap-16 mt-40" data-cy="disturbances-container">
        {renderContent()}
      </div>
    </div>
  );
}
