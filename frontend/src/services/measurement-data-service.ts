import { Data } from '@interfaces/measurement-data';

export const handleMeasurementDataByMonthResponse: (data: Data) => number = (data) => {
  const measurementSeries =
    data.measurementSeries?.filter(
      (measurement) => measurement.measurementType === 'Energy' || measurement.measurementType === 'energy'
    ) ?? [];

  const sum = measurementSeries?.[0]?.measurementPoints
    ? measurementSeries[0]?.measurementPoints.reduce((accumulator, currentValue) => {
        if (currentValue.value) return accumulator + currentValue?.value;
      }, 0)
    : 0;

  return sum ? Math.round(sum) : 0;
};

export const measurementDataByMonthHandler = (data: Data): number => handleMeasurementDataByMonthResponse(data);

export const getCategoryFromInstalledBaseType = (type: string | undefined): string => {
  switch (type) {
    case 'El':
      return 'ELECTRICITY';
    case 'Fjärrvärme':
      return 'DISTRICT_HEATING';
    default:
      return '';
  }
};

export const calculateYearDifference = (current: number | undefined, previous: number | undefined) => {
  return current && previous ? Math.round(((previous - current) / previous) * 100) : false;
};
