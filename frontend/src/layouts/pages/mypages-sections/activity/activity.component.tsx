'use client';

import { useState } from 'react';
import NextLink from 'next/link';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import { Breadcrumb, Pagination, Spinner, useThemeQueries } from '@sk-web-gui/react';
import { useActivity } from '@services/activity-service';
import { ActivityYearGroup } from './activity.types';
import { PagesBreadcrumbsLayout } from '@layouts/pages-breadcrumbs-layout.component';
import { Timeline, TimelineYear } from '@components/timeline/timeline.component';
import { ActivityFilter, ActivityFilterValue, DEFAULT_ACTIVITY_FILTER } from './components/activity-filter.component';
import { ActivityListItem } from './components/activity-list-item.component';
import { ActivityYearPagination } from './components/activity-year-pagination.component';

const LOOKBACK_MONTHS = 36;

const CURRENT_YEAR = dayjs().year();
const OLDEST_YEAR = dayjs().subtract(LOOKBACK_MONTHS, 'month').year();
const NAVIGABLE_YEARS = Array.from({ length: CURRENT_YEAR - OLDEST_YEAR + 1 }, (_, index) => CURRENT_YEAR - index);

const ITEMS_PER_PAGE = 5;
const YEAR_PAGE_SIZE = 300;

const toTimelineYears = (years: ActivityYearGroup[]): TimelineYear[] =>
  years.map((yearGroup) => ({
    year: yearGroup.year,
    months: yearGroup.months.map((monthGroup) => ({
      month: monthGroup.month,
      children: monthGroup.items.map((item) => <ActivityListItem key={item.id} item={item} />),
    })),
  }));

export const ActivityComponent = () => {
  const { t } = useTranslation(['activity', 'profile']);
  const { isMinSm } = useThemeQueries();

  const [filter, setFilter] = useState<ActivityFilterValue>(DEFAULT_ACTIVITY_FILTER);
  const [page, setPage] = useState(0);
  const [selectedYear, setSelectedYear] = useState(CURRENT_YEAR);

  const hasExplicitPeriod = Boolean(filter.from || filter.to);
  const usesYearPaging = !isMinSm && !hasExplicitPeriod;

  const effectiveFilter = usesYearPaging
    ? { ...filter, from: `${selectedYear}-01-01`, to: `${selectedYear}-12-31` }
    : filter;

  const { data, isFetching, error } = useActivity(effectiveFilter, {
    page: usesYearPaging ? 0 : page,
    size: usesYearPaging ? YEAR_PAGE_SIZE : ITEMS_PER_PAGE,
  });

  const handleFilterChange = (next: ActivityFilterValue) => {
    setFilter(next);
    setPage(0);
  };

  const handleYearChange = (year: number) => {
    setSelectedYear(year);
    setPage(0);
  };

  const renderResults = () => {
    if (isFetching) {
      return (
        <div className="flex w-full justify-center py-40">
          <Spinner aria-label={t('activity:loading')} />
        </div>
      );
    }

    if (error) {
      return (
        <p className="m-0" data-cy="activity-error">
          {t('activity:error')}
        </p>
      );
    }

    if (!data || data.years.length === 0) {
      return (
        <p className="m-0" data-cy="activity-empty">
          {t('activity:empty')}
        </p>
      );
    }

    return <Timeline years={toTimelineYears(data.years)} />;
  };

  const renderPagination = () => {
    if (usesYearPaging) {
      return <ActivityYearPagination years={NAVIGABLE_YEARS} selectedYear={selectedYear} onSelect={handleYearChange} />;
    }

    return (
      data &&
      data.totalPages > 1 && (
        <div className="flex justify-center" data-cy="activity-pagination">
          <Pagination
            fitContainer={true}
            pages={data.totalPages}
            activePage={page + 1}
            changePage={(next) => setPage(next - 1)}
          />
        </div>
      )
    );
  };

  return (
    <PagesBreadcrumbsLayout
      breadcrumbs={
        <Breadcrumb>
          <Breadcrumb.Item>
            <NextLink href="profil">
              <Breadcrumb.Link variant="body" as="span">
                {t('profile:title')}
              </Breadcrumb.Link>
            </NextLink>
          </Breadcrumb.Item>
          <Breadcrumb.Item currentPage>
            <Breadcrumb.Link href="./">{t('activity:title')}</Breadcrumb.Link>
          </Breadcrumb.Item>
        </Breadcrumb>
      }
    >
      <section className="flex flex-col gap-32">
        <div className="flex flex-col gap-12">
          <h1 className="mb-0 text-display-3-md text-dark-primary">{t('activity:title')}</h1>
          <p className="m-0 text-large text-dark-primary font-normal">{t('activity:description')}</p>
        </div>

        <ActivityFilter value={filter} onChange={handleFilterChange} />

        <div className="flex flex-col gap-24">
          <div className="rounded-cards bg-background-content p-20 shadow-50 md:px-32 md:py-48">{renderResults()}</div>
          {renderPagination()}
        </div>
      </section>
    </PagesBreadcrumbsLayout>
  );
};
