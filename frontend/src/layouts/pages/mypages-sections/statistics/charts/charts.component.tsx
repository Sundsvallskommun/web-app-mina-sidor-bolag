import React, { useEffect, useState } from 'react';
import ElectricityConsumption from '@layouts/pages/mypages-sections/statistics/charts/electricity-consumption/electricity-consumption.component';
import { Divider } from '@sk-web-gui/react';
import OutdoorTemperature from '@layouts/pages/mypages-sections/statistics/charts/outdoor-temperature/outdoor-temperature.component';
import { useFormContext } from 'react-hook-form';
import { getCategoryFromInstalledBaseType, statisticsMeasurementDataHandler } from '@services/measurement-data-service';
import { useApi } from '@services/api-service';
import dayjs from 'dayjs';
import { MeasurementSerie } from '@interfaces/measurement-data';

export default function Charts() {
  const { watch } = useFormContext();
  const { category, facilityId, toDate, fromDate, year } = watch();

  const [currentMeasurementData, setCurrentMeasurementData] = useState<MeasurementSerie[]>();
  const [currentOutdoorTemperatureData, setCurrentOutdoorTemperatureData] = useState<MeasurementSerie[]>();

  console.log('currentMeasurementData', currentMeasurementData);
  console.log('currentOutdoorTemperatureData', currentOutdoorTemperatureData);

  const getParams = (previous?: boolean) => {
    const params = new URLSearchParams({});

    params.append('category', getCategoryFromInstalledBaseType(category));
    params.append('facilityId', facilityId);

    params.append(
      'fromDate',
      year && previous
        ? dayjs(fromDate)
            .subtract(parseInt(dayjs().format('YYYY')) - year, 'year')
            .utc()
            .add(1, 'hour')
            .format()
        : dayjs(fromDate).utc().add(1, 'hour').format()
    );

    params.append(
      'toDate',
      year && previous
        ? dayjs(toDate)
            .subtract(parseInt(dayjs().format('YYYY')) - year, 'year')
            .utc()
            .add(1, 'hour')
            .format()
        : dayjs(toDate).utc().format()
    );

    const difference = dayjs(toDate).diff(fromDate, 'days');
    params.append('aggregateOn', difference < 2 ? 'HOUR' : difference < 31 ? 'DAY' : 'MONTH');

    return params.toString();
  };

  const { data: measurementData } = useApi({
    url: `/measurementdata?${getParams()}`,
    method: 'get',
    dataHandler: statisticsMeasurementDataHandler,
    queryKey: ['statistics', facilityId, getParams()],
    queryOptions: {
      enabled: !!facilityId && !!category,
    },
  });

  const { data: previousMeasurementData } = useApi({
    url: `/measurementdata?${getParams(true)}`,
    method: 'get',
    dataHandler: statisticsMeasurementDataHandler,
    queryKey: ['previousStatistics', year, getParams()],
    queryOptions: {
      enabled: !!year,
    },
  });

  console.log('previousMeasurementData', previousMeasurementData);

  useEffect(() => {
    setCurrentMeasurementData(measurementData?.consumption);
    if (measurementData?.temperature.length) {
      setCurrentOutdoorTemperatureData(measurementData.temperature);
    }
  }, [measurementData, category, facilityId]);

  return (
    <div className="bg-background-content rounded-cards shadow-50 mt-40 py-40 lg:px-32 px-20">
      <ElectricityConsumption />
      <Divider className="my-40" />
      <OutdoorTemperature />
    </div>
  );
}
