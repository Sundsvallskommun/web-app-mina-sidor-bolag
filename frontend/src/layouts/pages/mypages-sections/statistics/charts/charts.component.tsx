import React, { useEffect, useState } from 'react';
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
import { MergedStatisticsMeasurementData } from '@interfaces/measurement-data';
import { ExportStatisticsButton } from '@layouts/pages/mypages-sections/statistics/export-statistics-button/export-statistics-button.component';
import { OnlyTrade } from '../../overview/consumption/only-trade.component';
import { pagedAgreementsHandler } from '@services/agreement-service';
import { EventLog } from '@layouts/pages/mypages-sections/statistics/event-log/event-log.component';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getCategoryFromInstalledBaseType } from '@utils/facility';

export default function Charts() {
  const { watch, setValue } = useFormContext();
  const { facilityId, toDate, fromDate, year } = watch();
  const [onlyTrade, setOnlyTrade] = useState(false);
  const [mergedMeasurementData, setMergedMeasurementData] = useState<MergedStatisticsMeasurementData>();
  const [mergedTemperatureData, setMergedTemperatureData] = useState<MergedStatisticsMeasurementData>();
  const [showEventLog, setShowEventLog] = useState<boolean>(false);
  const { t } = useTranslation('event');

  const { data: user } = useApi<User>({
    method: 'get',
    url: '/me',
    queryKey: ['user'],
  });

  const { data: allAgreements } = useApi({
    url: `/paged/all-agreements`,
    method: 'get',
    dataHandler: pagedAgreementsHandler,
  });

  const getParams = (previous?: boolean) => {
    const params = new URLSearchParams({});

    user?.facilities?.forEach((facility) => {
      if (facility.facilityId === facilityId && facility.type !== 'Elhandel') {
        params.append('category', getCategoryFromInstalledBaseType(facility.type));
      }
    });

    params.append('facilityId', facilityId);

    params.append(
      'fromDate',
      year && previous
        ? dayjs(fromDate)
            .subtract(parseInt(dayjs(fromDate).format('YYYY')) - year, 'year')
            .utc(true)
            .startOf('date')
            .format()
        : dayjs(fromDate).startOf('date').utc(true).format()
    );

    params.append(
      'toDate',
      year && previous
        ? dayjs(toDate)
            .subtract(parseInt(dayjs(toDate).format('YYYY')) - year, 'year')
            .utc(true)
            .endOf('date')
            .format()
        : dayjs(toDate).endOf('date').utc(true).format()
    );

    const difference = dayjs(toDate).diff(fromDate, 'days');
    params.append('aggregateOn', difference < 2 ? 'HOUR' : difference < 31 ? 'DAY' : 'MONTH');

    return params.toString();
  };

  const { data: measurementData, isFetching: isFetchingMeasurementData } = useApi({
    url: `/measurementdata?${getParams()}`,
    method: 'get',
    dataHandler: statisticsMeasurementDataHandler,
    queryKey: ['statistics', facilityId, getParams()],
    queryOptions: {
      enabled: !!facilityId && !!toDate && !!fromDate && getParams().includes('category='),
    },
  });

  const { data: previousMeasurementData, isFetching: isPreviousFetching } = useApi({
    url: `/measurementdata?${getParams(true)}`,
    method: 'get',
    dataHandler: statisticsMeasurementDataHandler,
    queryKey: ['previousStatistics', year, getParams()],
    queryOptions: {
      enabled: !!year,
    },
  });

  useEffect(() => {
    const category = getCategoryFromFacilityType(user?.facilities, facilityId);
    setValue('category', category);
    setValue('area', getAreaFromFacility(user?.facilities, facilityId));
    if (category === 'Fjärrvärme') {
      setOnlyTrade(false);
    } else {
      const netAgreementExistsForFacility = allAgreements
        ? Object.values(allAgreements ?? {})
            .flat()
            .some((agreement) => agreement.facilityId === facilityId && agreement.category.code === 'ELECTRICITY')
        : false;

      setOnlyTrade(!netAgreementExistsForFacility);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [measurementData, facilityId]);

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
