'use client';

import { useApi } from '@services/api-service';
import { useTranslation } from 'react-i18next';
import { Button, Spinner } from '@sk-web-gui/react';
import { ArrowRight } from 'lucide-react';
import { Disturbance } from '@data-contracts/backend/data-contracts';
import { DisturbanceListItem } from '@layouts/pages/mypages-sections/disturbances/disturbance-list-item/disturbance-list-item.component';
import { useRouter } from 'next/navigation';
import { getAdjustedPathname } from '@utils/representingModeRoute';
import { useAppContext } from '@contexts/app.context';

const Disturbances = () => {
  const { t } = useTranslation('disturbances');
  const router = useRouter();
  const { representingMode } = useAppContext();
  const adjustedPath = getAdjustedPathname('driftinformation', representingMode);

  const statuses = ['OPEN', 'PLANNED'] as const;
  const searchParams = new URLSearchParams({});
  searchParams.append('status', statuses.join(','));

  const {
    data: disturbances,
    isFetching,
    isFetched,
  } = useApi<Disturbance[]>({
    url: `/disturbances?${searchParams.toString()}`,
    method: 'get',
    queryKey: ['overview-disturbances'],
  });

  const hasNoOpenOrPlanned = isFetched && !disturbances?.length;

  return (
    <section className="mt-80" data-cy="overview-disturbances">
      <div className="flex sm:flex-row flex-col justify-between sm:items-center sm:mb-32 gap-32">
        <div>
          <h1 className="sm:m-0">{t('disturbances:title')}</h1>
          <p>{t('disturbances:description')}</p>
          {hasNoOpenOrPlanned && <p className="pt-16">{t('disturbances:noOpenOrPlanned')}</p>}
        </div>

        <Button
          variant="secondary"
          className="sm:mb-0 mb-32"
          rightIcon={<ArrowRight />}
          onClick={() => router.push(adjustedPath)}
        >
          {t('disturbances:seeAll')}
        </Button>
      </div>

      {isFetching ? (
        <Spinner className="mx-auto" />
      ) : (
        <div className="flex flex-col gap-16">
          {disturbances?.map((disturbance) => {
            return <DisturbanceListItem key={disturbance.id} disturbance={disturbance} />;
          })}
        </div>
      )}
    </section>
  );
};
export default Disturbances;
