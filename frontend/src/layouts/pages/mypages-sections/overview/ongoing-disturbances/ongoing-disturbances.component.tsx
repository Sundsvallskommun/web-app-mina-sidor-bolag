'use client';

import { useTranslation } from 'react-i18next';
import { Button, Spinner } from '@sk-web-gui/react';
import { ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getAdjustedPathname } from '@utils/representingModeRoute';
import { useAppContext } from '@contexts/app.context';
import React from 'react';
import { useApi } from '@services/api-service';
import { Disturbance } from '@data-contracts/backend/data-contracts';
import { DisturbanceListItem } from '@components/disturbances-list/disturbance-list-item/disturbance-list-item.component';

export const OngoingDisturbances = () => {
  const { t } = useTranslation('disturbances');
  const router = useRouter();
  const { representingMode } = useAppContext();
  const adjustedPath = getAdjustedPathname('driftinformation', representingMode);
  const statusParams = new URLSearchParams();
  statusParams.append('status', 'OPEN,PLANNED');
  const queryString = statusParams.toString();

  const { data, isFetching, isFetched } = useApi<Disturbance[]>({
    url: `/disturbances?${queryString}`,
    method: 'get',
    queryKey: ['disturbances', 'OPEN,PLANNED'],
  });

  if (isFetching) {
    return <Spinner className="mx-auto" />;
  }

  if (!isFetched || !data?.length) {
    return null;
  }

  return (
    <section className="mt-80" data-cy="overview-disturbances">
      <div className="flex sm:flex-row flex-col justify-between sm:items-center sm:mb-32 gap-32">
        <div>
          <h2 className="text-display-3-md sm:m-0">{t('disturbances:title')}</h2>
          <p>{t('disturbances:description')}</p>
        </div>

        <Button
          variant="secondary"
          className="sm:mb-0 mb-32"
          rightIcon={<ArrowRight />}
          onClick={() => router.push(adjustedPath)}
        >
          {t('disturbances:viewAll')}
        </Button>
      </div>

      {data?.map((disturbance) => (
        <DisturbanceListItem key={disturbance.id} disturbance={disturbance} />
      ))}
    </section>
  );
};
