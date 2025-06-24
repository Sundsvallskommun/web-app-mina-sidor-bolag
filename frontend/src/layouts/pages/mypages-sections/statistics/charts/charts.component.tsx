import React, { useEffect, useState } from 'react';
import Consumption from '@layouts/pages/mypages-sections/statistics/charts/consumption/consumption.component';
import { Divider } from '@sk-web-gui/react';
import OutdoorTemperature from '@layouts/pages/mypages-sections/statistics/charts/outdoor-temperature/outdoor-temperature.component';
import { useFormContext } from 'react-hook-form';
import {
  getAreaFromFacility,
  getCategoryFromFacilityType,
  getCategoryFromInstalledBaseType,
  mergeMeasurementDataSets,
  mergeTemperatureDataSets,
  statisticsMeasurementDataHandler,
} from '@services/measurement-data-service';
import { useApi } from '@services/api-service';
import dayjs from 'dayjs';
import { User } from '@interfaces/user';
import { MergedStatisticsMeasurementData } from '@interfaces/measurement-data';

export default function Charts() {
  const { watch, setValue } = useFormContext();
  const { facilityId, toDate, fromDate, year } = watch();
  const [mergedMeasurementData, setMergedMeasurementData] = useState<MergedStatisticsMeasurementData>();
  const [mergedTemperatureData, setMergedTemperatureData] = useState<MergedStatisticsMeasurementData>();

  const { data: user } = useApi<User>({
    method: 'get',
    url: '/me',
    queryKey: ['user'],
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
      enabled: !!facilityId && !!toDate && !!fromDate,
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
    setValue('category', getCategoryFromFacilityType(user?.facilities, facilityId));
    setValue('area', getAreaFromFacility(user?.facilities, facilityId));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [measurementData, facilityId]);

  useEffect(() => {
    if (measurementData && previousMeasurementData) {
      setMergedMeasurementData(mergeMeasurementDataSets(measurementData, previousMeasurementData));
      setMergedTemperatureData(mergeTemperatureDataSets(measurementData, previousMeasurementData));
    } else {
      setMergedMeasurementData(undefined);
      setMergedTemperatureData(undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [previousMeasurementData]);

  return (
    <div className="bg-background-content rounded-cards shadow-50 mt-40 py-40 lg:px-32 px-20">
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
    </div>
  );
}
