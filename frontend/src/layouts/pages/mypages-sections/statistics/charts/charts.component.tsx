import React, { useEffect, useMemo, useState } from 'react';
import Consumption from '@layouts/pages/mypages-sections/statistics/charts/consumption/consumption.component';
import { Button, Divider, Icon } from '@sk-web-gui/react';
import OutdoorTemperature from '@layouts/pages/mypages-sections/statistics/charts/outdoor-temperature/outdoor-temperature.component';
import { useFormContext } from 'react-hook-form';
import {
  getAddressesFromFacilities,
  getAreaFromFacility,
  mergeCorrectedUsageDataSets,
  mergeMeasurementDataSets,
  mergeTemperatureDataSets,
  statisticsMeasurementDataHandler,
} from '@services/measurement-data-service';
import { isNormalYear } from '@utils/normal-year';
import { useApi } from '@services/api-service';
import dayjs from 'dayjs';
import { User } from '@interfaces/user';
import { AgreementData } from '@interfaces/agreement';
import { Aggregation, Category, MergedStatisticsMeasurementData } from '@interfaces/measurement-data';
import { ExportStatisticsButton } from '@layouts/pages/mypages-sections/statistics/export-statistics-button/export-statistics-button.component';
import { OnlyTrade } from '../../overview/consumption/only-trade.component';
import { EventLog } from '@layouts/pages/mypages-sections/statistics/event-log/event-log.component';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export interface ChartsProps {
  readonly allAgreements: AgreementData;
  readonly isAllAgreementsDone: boolean;
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

export default function Charts({ allAgreements, isAllAgreementsDone }: ChartsProps) {
  const { watch, setValue } = useFormContext();
  const { facilityIds, toDate, fromDate, year, category } = watch();
  const normalYearComparison = isNormalYear(year);
  const [onlyTrade, setOnlyTrade] = useState(false);
  const [isHourQuarter, setIsHourQuarter] = useState(false);
  const [mergedMeasurementData, setMergedMeasurementData] = useState<MergedStatisticsMeasurementData>();
  const [mergedTemperatureData, setMergedTemperatureData] = useState<MergedStatisticsMeasurementData>();
  const [showEventLog, setShowEventLog] = useState<boolean>(false);
  const { t } = useTranslation('event');

  const { data: user } = useApi<User>({
    method: 'get',
    url: '/me',
    queryKey: ['user'],
  });

  const categoryParam = category ?? '';

  const selectedAddresses = useMemo(
    () => getAddressesFromFacilities(user?.facilities, facilityIds),
    [user?.facilities, facilityIds]
  );

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
      dayjs(fromDate).subtract(Number.parseInt(dayjs(fromDate).format('YYYY')) - year, 'year'),
      'start',
      useUtcBoundaries
    );
  }, [fromDate, year, useUtcBoundaries]);
  const toDatePreviousParam = useMemo(() => {
    return formatRequestBoundary(
      dayjs(toDate).subtract(Number.parseInt(dayjs(toDate).format('YYYY')) - year, 'year'),
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

  useEffect(() => {
    const firstFacilityId = facilityIds?.[0];
    if (!firstFacilityId) return;

    setValue('area', getAreaFromFacility(user?.facilities, firstFacilityId));

    if (categoryParam === Category.DISTRICT_HEATING || categoryParam === Category.DISTRICT_COOLING) {
      setOnlyTrade(false);
      return;
    }
    const netAgreementExistsForFacility = Object.values(allAgreements ?? {})
      .flat()
      .some((agreement) => facilityIds?.includes(agreement.facilityId) && agreement.category.code === 'ELECTRICITY');

    if (netAgreementExistsForFacility) {
      setOnlyTrade(false);
    } else if (isAllAgreementsDone) {
      setOnlyTrade(true);
    }
  }, [facilityIds, categoryParam, user?.facilities, allAgreements, isAllAgreementsDone, setValue]);

  useEffect(() => {
    if (measurementData && normalYearComparison) {
      setMergedMeasurementData(mergeCorrectedUsageDataSets(measurementData, fromDate));
      setMergedTemperatureData(undefined);
    } else if (measurementData && previousMeasurementData) {
      setMergedMeasurementData(mergeMeasurementDataSets(measurementData, previousMeasurementData, fromDate));
      setMergedTemperatureData(mergeTemperatureDataSets(measurementData, previousMeasurementData, fromDate));
    } else {
      setMergedMeasurementData(undefined);
      setMergedTemperatureData(undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [measurementData, previousMeasurementData, normalYearComparison]);

  return (
    <div>
      {onlyTrade && facilityIds?.length === 1 && user?.facilities?.some((f) => f.facilityId === facilityIds[0]) ? (
        <div className="bg-background-content rounded-cards shadow-50 mt-24 py-40 lg:px-32 px-20 flex justify-center items-center">
          <OnlyTrade
            key={`handel-facility-${facilityIds[0]}`}
            facility={user?.facilities?.find((f) => f.facilityId === facilityIds[0])}
          />
        </div>
      ) : (
        <div className="bg-background-content rounded-cards shadow-50 mt-24 py-40 lg:px-32 px-20">
          <Consumption
            data={mergedMeasurementData ?? measurementData}
            addresses={selectedAddresses}
            isFetching={isFetchingMeasurementData}
            isPreviousFetching={isPreviousFetching}
            updateIsHourQuarter={setIsHourQuarter}
          />

          {measurementData?.temperatureData?.length ? (
            <>
              <Divider className="my-64" />
              <OutdoorTemperature
                data={mergedTemperatureData ?? measurementData}
                isFetching={isFetchingMeasurementData}
                isPreviousFetching={isPreviousFetching}
              />
            </>
          ) : null}

          <Divider className="my-64" />

          <div className="mt-40 flex lg:justify-between items-start lg:flex-row flex-col-reverse lg:gap-0 gap-24">
            <Button
              showBackground={false}
              variant="tertiary"
              rightIcon={showEventLog ? <Icon icon={<ChevronUp />} /> : <Icon icon={<ChevronDown />} />}
              onClick={() => (showEventLog ? setShowEventLog(false) : setShowEventLog(true))}
              size="lg"
              data-cy="event-log-toggle"
            >
              {showEventLog ? t('event:hideExports') : t('event:showExports')}
            </Button>
            <ExportStatisticsButton
              data={mergedMeasurementData ?? measurementData}
              isFetching={isFetchingMeasurementData}
            />
          </div>

          {showEventLog && <EventLog />}
        </div>
      )}
    </div>
  );
}
