import React, { useMemo, useState } from 'react';
import Consumption from '@layouts/pages/mypages-sections/statistics/charts/consumption/consumption.component';
import { Button, Icon } from '@sk-web-gui/react';
import {
  mergeCorrectedUsageDataSets,
  mergeMeasurementDataSets,
  statisticsMeasurementDataHandler,
} from '@services/measurement-data-service';
import { isNormalYear } from '@utils/normal-year';
import { useApi } from '@services/api-service';
import dayjs from 'dayjs';
import { AgreementData } from '@interfaces/agreement';
import { Aggregation, Category } from '@interfaces/measurement-data';
import { ExportStatisticsButton } from '@layouts/pages/mypages-sections/statistics/export-statistics-button/export-statistics-button.component';
import { OnlyTrade } from '../../overview/consumption/only-trade.component';
import { EventLog } from '@layouts/pages/mypages-sections/statistics/event-log/event-log.component';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { StatisticsFilter } from '@layouts/pages/mypages-sections/statistics/statistics-filter/statistics-filter.component';
import {
  useSelectedAddresses,
  useStatisticsCategory,
  useStatisticsFilter,
  useStatisticsPeriod,
} from '@layouts/pages/mypages-sections/statistics/statistics-filter/statistics-filter.store';

export interface ChartsProps {
  readonly allAgreements: AgreementData;
  readonly isAllAgreementsDone: boolean;
  readonly allAgreementsCurrentPage: number;
  readonly allAgreementsTotalPages: number;
}

const formatRequestBoundary = (date: dayjs.Dayjs, edge: 'start' | 'end', utcBoundaries: boolean): string => {
  if (utcBoundaries) {
    const utcDay = dayjs.utc(date.format('YYYY-MM-DD'));
    const bounded = edge === 'start' ? utcDay.startOf('date') : utcDay.endOf('date');
    return bounded.format('YYYY-MM-DDTHH:mm:ss[Z]');
  }
  const bounded = edge === 'start' ? date.startOf('date') : date.endOf('date');
  return bounded.format();
};

export default function Charts({
  allAgreements,
  isAllAgreementsDone,
  allAgreementsCurrentPage,
  allAgreementsTotalPages,
}: ChartsProps) {
  const facilities = useStatisticsFilter((state) => state.facilities);
  const facilityIds = useStatisticsFilter((state) => state.facilityIds);
  const facilityType = useStatisticsFilter((state) => state.facilityType);
  const year = useStatisticsFilter((state) => state.compareYear);
  const isHourQuarter = useStatisticsFilter((state) => state.isHourQuarter);
  const { fromDate, toDate } = useStatisticsPeriod();
  const categoryParam = useStatisticsCategory();
  const selectedAddresses = useSelectedAddresses();
  const normalYearComparison = isNormalYear(year);
  const [showEventLog, setShowEventLog] = useState<boolean>(false);
  const { t } = useTranslation(['event', 'statistics']);

  const aggregateOnParam = useMemo(() => {
    const difference = dayjs(toDate).diff(fromDate, 'days');

    let aggregationType = Aggregation.MONTH;
    if (difference < 2 && isHourQuarter && categoryParam === Category.ELECTRICITY)
      aggregationType = Aggregation.QUARTER;
    else if (difference < 2) aggregationType = Aggregation.HOUR;
    else if (difference < 31) aggregationType = Aggregation.DAY;

    return aggregationType;
  }, [fromDate, toDate, isHourQuarter, categoryParam]);

  const useUtcBoundaries = aggregateOnParam === Aggregation.MONTH;

  const fromDateParam = useMemo(() => {
    return formatRequestBoundary(dayjs(fromDate), 'start', useUtcBoundaries);
  }, [fromDate, useUtcBoundaries]);
  const toDateParam = useMemo(() => {
    return formatRequestBoundary(dayjs(toDate), 'end', useUtcBoundaries);
  }, [toDate, useUtcBoundaries]);
  const fromDatePreviousParam = useMemo(() => {
    return formatRequestBoundary(
      dayjs(fromDate).subtract(Number.parseInt(dayjs(fromDate).format('YYYY')) - Number.parseInt(year), 'year'),
      'start',
      useUtcBoundaries
    );
  }, [fromDate, year, useUtcBoundaries]);
  const toDatePreviousParam = useMemo(() => {
    return formatRequestBoundary(
      dayjs(toDate).subtract(Number.parseInt(dayjs(toDate).format('YYYY')) - Number.parseInt(year), 'year'),
      'end',
      useUtcBoundaries
    );
  }, [toDate, year, useUtcBoundaries]);

  const buildParamsString = (
    categoryParam: string,
    facilityIds: string[],
    fromDate: string,
    toDate: string,
    aggregateOn: string
  ) => {
    const params = new URLSearchParams();
    params.set('category', categoryParam ?? '');
    facilityIds.forEach((id) => params.append('facilityIds', id));
    params.set('fromDate', fromDate);
    params.set('toDate', toDate);
    params.set('aggregateOn', aggregateOn);
    if (facilityIds.length > 1) {
      params.set('display', 'ONLYAGGREGATED');
    }
    return params.toString();
  };

  const paramsString = useMemo(
    () => buildParamsString(categoryParam, facilityIds ?? [], fromDateParam, toDateParam, aggregateOnParam),
    [categoryParam, facilityIds, fromDateParam, toDateParam, aggregateOnParam]
  );

  const paramsPreviousString = useMemo(
    () =>
      buildParamsString(categoryParam, facilityIds ?? [], fromDatePreviousParam, toDatePreviousParam, aggregateOnParam),
    [categoryParam, facilityIds, fromDatePreviousParam, toDatePreviousParam, aggregateOnParam]
  );

  const { data: measurementData, isFetching: isFetchingMeasurementData } = useApi({
    url: `/measurementdata?${paramsString}`,
    method: 'get',
    dataHandler: statisticsMeasurementDataHandler,
    queryKey: ['statistics', facilityIds, paramsString],
    queryOptions: {
      enabled:
        !!facilityIds?.length &&
        !!toDate &&
        !!fromDate &&
        paramsString.includes('category=') &&
        paramsString.includes('aggregateOn='),
    },
  });

  const { data: previousMeasurementData, isFetching: isPreviousFetching } = useApi({
    url: `/measurementdata?${paramsPreviousString}`,
    method: 'get',
    dataHandler: statisticsMeasurementDataHandler,
    queryKey: ['previousStatistics', year, paramsPreviousString],
    queryOptions: {
      enabled: !!year && !normalYearComparison,
    },
  });

  // A facility without a net agreement only has trade (no measurement data). Only decided once all agreements are loaded.
  const onlyTrade = useMemo(() => {
    if (!facilityIds.length || !isAllAgreementsDone) return false;
    if (categoryParam === Category.DISTRICT_HEATING || categoryParam === Category.DISTRICT_COOLING) return false;
    return !Object.values(allAgreements ?? {})
      .flat()
      .some((agreement) => facilityIds.includes(agreement.facilityId) && agreement.category.code === 'ELECTRICITY');
  }, [facilityIds, categoryParam, allAgreements, isAllAgreementsDone]);

  const mergedMeasurementData = useMemo(() => {
    if (measurementData && normalYearComparison) {
      return mergeCorrectedUsageDataSets(measurementData, fromDate);
    }
    if (measurementData && previousMeasurementData) {
      return mergeMeasurementDataSets(measurementData, previousMeasurementData, fromDate);
    }
    return undefined;
  }, [measurementData, previousMeasurementData, normalYearComparison, fromDate]);

  const formattedDate = (mergedMeasurementData ?? measurementData)?.formattedDate;
  const comparisonYear = year && !normalYearComparison && !isFetchingMeasurementData ? ` och ${year}` : '';
  const period = formattedDate ? `${formattedDate}${comparisonYear}` : '';
  const periodAndAddress = [period, selectedAddresses.join(', ')].filter(Boolean).join(', ');
  const isOnlyTradeFacility =
    onlyTrade && facilityIds.length === 1 && facilities.some((f) => f.facilityId === facilityIds[0]);

  return (
    <>
      <div className="sm:bg-background-content sm:rounded-cards sm:shadow-50 mt-24 sm:py-40 sm:px-20 lg:px-32">
        <h2 className="text-h4-md sm:hidden">
          {t('statistics:overview.titleWithType', { facilityType: facilityType?.toLowerCase() ?? '' })}
        </h2>
        <h2 className="text-h4-lg hidden sm:block mb-32">{t('statistics:overview.title')}</h2>

        <p className="sm:hidden first-letter:uppercase">{periodAndAddress}</p>

        <div className="sm:block hidden">
          <StatisticsFilter
            allAgreements={{
              isDone: isAllAgreementsDone,
              currentPage: allAgreementsCurrentPage,
              totalPages: allAgreementsTotalPages,
            }}
          />
        </div>

        {isOnlyTradeFacility ? (
          <div className="flex justify-center items-center">
            <OnlyTrade
              key={`handel-facility-${facilityIds[0]}`}
              facility={facilities.find((f) => f.facilityId === facilityIds[0])}
            />
          </div>
        ) : (
          <Consumption
            data={mergedMeasurementData ?? measurementData}
            addresses={selectedAddresses}
            isFetching={isFetchingMeasurementData}
            isPreviousFetching={isPreviousFetching}
          />
        )}
      </div>

      {!isOnlyTradeFacility && (
        <>
          <div className="mt-40 flex items-start lg:flex-row flex-col gap-24">
            <ExportStatisticsButton
              data={mergedMeasurementData ?? measurementData}
              isFetching={isFetchingMeasurementData}
            />
            <Button
              variant="ghost"
              rightIcon={showEventLog ? <Icon icon={<ChevronUp />} /> : <Icon icon={<ChevronDown />} />}
              onClick={() => (showEventLog ? setShowEventLog(false) : setShowEventLog(true))}
              size="md"
              data-cy="event-log-toggle"
            >
              {showEventLog ? t('event:hideExports') : t('event:showExports')}
            </Button>
          </div>

          {showEventLog && <EventLog />}
        </>
      )}
    </>
  );
}
