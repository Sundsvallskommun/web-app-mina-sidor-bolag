'use client';

import { useTranslation } from 'react-i18next';
import { Button } from '@sk-web-gui/react';
import { ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getAdjustedPathname } from '@utils/representingModeRoute';
import { useAppContext } from '@contexts/app.context';
import DisturbancesList from '@components/disturbances-list/disturbances-list.component';

export const OngoingDisturbances = () => {
  const { t } = useTranslation('disturbances');
  const router = useRouter();
  const { representingMode } = useAppContext();
  const adjustedPath = getAdjustedPathname('driftinformation', representingMode);

  return (
    <section className="mt-80" data-cy="overview-disturbances">
      <div className="flex sm:flex-row flex-col justify-between sm:items-center sm:mb-32 gap-32">
        <div>
          <h2 className="sm:m-0">{t('disturbances:title')}</h2>
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

      <DisturbancesList statuses={'OPEN,PLANNED'} />
    </section>
  );
};
