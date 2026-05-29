import React, { useEffect, useMemo, useState } from 'react';
import Consumption from '@layouts/pages/mypages-sections/statistics/charts/consumption/consumption.component';
import { Button, Divider, Icon } from '@sk-web-gui/react';
import OutdoorTemperature from '@layouts/pages/mypages-sections/statistics/charts/outdoor-temperature/outdoor-temperature.component';
import { useFormContext } from 'react-hook-form';
import {
  getAreaFromFacility,
  getCategoryFromFacilityType,
  mergeMeasurementDataSets,
  mergeTemperatureDataSets,
  statisticsMeasurementDataHandler,
} from '@services/measurement-data-service';
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
import { getCategoryFromInstalledBaseType } from '@utils/facility';

export interface ChartsProps {
  readonly allAgreements: AgreementData;
  readonly isAllAgreementsDone: boolean;
}

export default function Charts({ allAgreements, isAllAgreementsDone }: ChartsProps) {
  const { watch, setValue } = useFormContext();
  const { facilityId, toDate, fromDate, year } = watch();
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

  const categoryParam = useMemo(() => {
    const facility = user?.facilities?.find((f) => f.facilityId === facilityId && f.type !== 'Elhandel');
    return facility ? getCategoryFromInstalledBaseType(facility.type) : '';
  }, [user, facilityId]);

  const aggregateOnParam = useMemo(() => {
    const difference = dayjs(toDate).diff(fromDate, 'days');

    let aggregationType = Aggregation.MONTH;
    if (difference < 2 && isHourQuarter && categoryParam === Category.ELECTRICITY)
      aggregationType = Aggregation.QUARTER;
    else if (difference < 2) aggregationType = Aggregation.HOUR;
    else if (difference < 31) aggregationType = Aggregation.DAY;

    return aggregationType;
  }, [fromDate, toDate, isHourQuarter, categoryParam]);

  const fromDateParam = useMemo(() => {
    return dayjs(fromDate).startOf('date').format();
  }, [fromDate]);
  const toDateParam = useMemo(() => {
    return dayjs(toDate).endOf('date').format();
  }, [toDate]);
  const fromDatePreviousParam = useMemo(() => {
    return dayjs(fromDate)
      .subtract(parseInt(dayjs(fromDate).format('YYYY')) - year, 'year')
      .startOf('date')
      .format();
  }, [fromDate, year]);
  const toDatePreviousParam = useMemo(() => {
    return dayjs(toDate)
      .subtract(parseInt(dayjs(toDate).format('YYYY')) - year, 'year')
      .endOf('date')
      .format();
  }, [toDate, year]);

  const buildParamsString = (
    categoryParam: string,
    facilityId: string,
    fromDate: string,
    toDate: string,
    aggregateOn: string
  ) => {
    const params = new URLSearchParams({
      category: categoryParam ?? '',
      facilityIds: facilityId,
      fromDate,
      toDate,
      aggregateOn,
    });
    return params.toString();
  };

  const paramsString = useMemo(
    () => buildParamsString(categoryParam, facilityId, fromDateParam, toDateParam, aggregateOnParam),
    [categoryParam, facilityId, fromDateParam, toDateParam, aggregateOnParam]
  );

  const paramsPreviousString = useMemo(
    () => buildParamsString(categoryParam, facilityId, fromDatePreviousParam, toDatePreviousParam, aggregateOnParam),
    [categoryParam, facilityId, fromDatePreviousParam, toDatePreviousParam, aggregateOnParam]
  );

  const { data: measurementData, isFetching: isFetchingMeasurementData } = useApi({
    url: `/measurementdata?${paramsString}`,
    method: 'get',
    dataHandler: statisticsMeasurementDataHandler,
    queryKey: ['statistics', facilityId, paramsString],
    queryOptions: {
      enabled:
        !!facilityId &&
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
      enabled: !!year,
    },
  });

  useEffect(() => {
    const categoryForDisplay = getCategoryFromFacilityType(user?.facilities, facilityId);
    setValue('category', categoryForDisplay);
    setValue('area', getAreaFromFacility(user?.facilities, facilityId));
    if (categoryForDisplay === 'Fjärrvärme') {
      setOnlyTrade(false);
      return;
    }
    const netAgreementExistsForFacility = Object.values(allAgreements ?? {})
      .flat()
      .some((agreement) => agreement.facilityId === facilityId && agreement.category.code === 'ELECTRICITY');

    if (netAgreementExistsForFacility) {
      setOnlyTrade(false);
    } else if (isAllAgreementsDone) {
      setOnlyTrade(true);
    }
  }, [facilityId, user?.facilities, allAgreements, isAllAgreementsDone, setValue]);

  useEffect(() => {
    if (measurementData && previousMeasurementData) {
      setMergedMeasurementData(mergeMeasurementDataSets(measurementData, previousMeasurementData, fromDate));
      setMergedTemperatureData(mergeTemperatureDataSets(measurementData, previousMeasurementData, fromDate));
    } else {
      setMergedMeasurementData(undefined);
      setMergedTemperatureData(undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [measurementData, previousMeasurementData]);

  return (
    <div>
      {onlyTrade && user?.facilities?.some((f) => f.facilityId === facilityId) ? (
        <div className="bg-background-content rounded-cards shadow-50 mt-24 py-40 lg:px-32 px-20 flex justify-center items-center">
          <OnlyTrade
            key={`handel-facility-${facilityId}`}
            facility={user?.facilities?.find((f) => f.facilityId === facilityId)}
          />
        </div>
      ) : (
        <div className="bg-background-content rounded-cards shadow-50 mt-24 py-40 lg:px-32 px-20">
          <Consumption
            data={mergedMeasurementData ?? measurementData}
            isFetching={isFetchingMeasurementData}
            isPreviousFetching={isPreviousFetching}
            updateIsHourQuarter={setIsHourQuarter}
          />

          {measurementData?.temperatureData?.length ? (
            <>
              <Divider className="my-40" />
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
