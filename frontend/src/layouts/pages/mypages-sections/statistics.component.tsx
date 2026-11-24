'use client';

import { StatisticsFilterMobile } from '@layouts/pages/mypages-sections/statistics/statistics-filter/statistics-filter-mobile.component';
import { StatisticsFilterProvider } from '@layouts/pages/mypages-sections/statistics/statistics-filter/statistics-filter.store';
import { Faq } from '@layouts/pages/mypages-sections/statistics/faq/faq.component';
import Charts from '@layouts/pages/mypages-sections/statistics/charts/charts.component';
import { useApi } from '@services/api-service';
import { User } from '@interfaces/user';
import { Spinner, Tabs } from '@sk-web-gui/react';
import { useTranslation } from 'react-i18next';
import { usePagedAgreements } from '@utils/use-paged-agreements.hook';
import { useSearchParams } from 'next/navigation';

const NO_FACILITIES: User['facilities'] = [];

export default function Statistics() {
  const { t } = useTranslation('statistics');
  const searchParams = useSearchParams();
  const linkedFacilityId = searchParams?.get('installation');

  const { data: user, isLoading } = useApi<User>({
    method: 'get',
    url: '/me',
    queryKey: ['user'],
  });

  const { agreements: allAgreements, isDone, currentPage, totalPages } = usePagedAgreements(200, true);

  return (
    <div>
      <h1 className="mb-44 sm:mb-56 text-h1-sm sm:text-h1-lg">{t('statistics:title')}</h1>
      {user ? (
        <StatisticsFilterProvider facilities={user.facilities ?? NO_FACILITIES} linkedFacilityId={linkedFacilityId}>
          <Tabs color="tertiary" size="lg" underline={false} data-cy="statistics-tabs">
            <Tabs.Item>
              <Tabs.Button>{t('statistics:tabs.overview')}</Tabs.Button>
              <Tabs.Content>
                <StatisticsFilterMobile />

                <Charts
                  allAgreements={allAgreements}
                  isAllAgreementsDone={isDone}
                  allAgreementsCurrentPage={currentPage}
                  allAgreementsTotalPages={totalPages}
                />
              </Tabs.Content>
            </Tabs.Item>
          </Tabs>
        </StatisticsFilterProvider>
      ) : (
        isLoading && <Spinner className="mx-auto" />
      )}

      <Faq />
    </div>
  );
}
