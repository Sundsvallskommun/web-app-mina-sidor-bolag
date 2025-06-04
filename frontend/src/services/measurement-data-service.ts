import { Data } from '@interfaces/measurement-data';
import dayjs from 'dayjs';

export const handleMeasurementDataByMonthResponse: (data: Data) => {
  current: number;
  previous: number;
} = (data) => {
  const previous = data.fromDate?.slice(0, 4) + '-0' + (dayjs().month() + 1).toString() + '-01';
  const current = data.toDate?.slice(0, 4) + '-0' + (dayjs().month() + 1).toString() + '-01';

  const measurementSeries =
    data.measurementSeries?.filter(
      (measurement) => measurement.measurementType === 'Energy' || measurement.measurementType === 'energy'
    ) ?? [];

  const currentMeasurements = measurementSeries?.[0].measurementPoints
    ? measurementSeries[0].measurementPoints.filter((measurement) => {
        return measurement?.timestamp?.includes(current);
      })
    : 0;

  const previousMeasurements = measurementSeries?.[0].measurementPoints
    ? measurementSeries[0].measurementPoints.filter((measurement) => {
        return measurement?.timestamp?.includes(previous);
      })
    : 0;

  return {
    current: Math.round(currentMeasurements[0].value),
    previous: Math.round(previousMeasurements[0].value),
  };
};

export const measurementDataByMonthHandler = (
  data: Data
): {
  current: number;
  previous: number;
} => handleMeasurementDataByMonthResponse(data);

export const getCategoryFromInstalledBaseType = (type: string | undefined): string => {
  switch (type) {
    case 'El':
      return 'ELECTRICITY';
    case 'Fjärrvärme':
      return 'DISTRICT_HEATING';
    case 'Elproduktion':
      return 'ELECTRICITY';
    default:
      return '';
  }
};

export const calculateYearDifference = (current: number | undefined, previous: number | undefined) => {
  return current && previous ? Math.round(((previous - current) / previous) * 100) : false;
};
