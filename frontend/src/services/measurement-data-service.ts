import {
  Data,
  MeasurementPoints,
  MeasurementSerie,
  MergedStatisticsMeasurementData,
  StatisticsMeasurementData,
} from '@interfaces/measurement-data';
import dayjs from 'dayjs';
import { InstalledBaseItem } from '@data-contracts/installedbase/data-contracts';
import { toFixedNumber } from '@react-stately/utils';

export const handleMeasurementDataByMonthResponse: (data: Data) => {
  current: number;
  previous: number;
} = (data) => {
  const previous = dayjs(data.fromDate).startOf('month').format('YYYY-MM-DD');
  const current = dayjs(data.toDate).startOf('month').format('YYYY-MM-DD');

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

export const handleStatisticsMeasurementDataResponse: (data: Data) => StatisticsMeasurementData = (data) => {
  const addTimestampToMeasurementPoint: (m: MeasurementPoints) => MeasurementPoints = (m) =>
    Object.assign(m, {
      chartTimestamp: formatMeasurementDates(m.timestamp ?? '', data.aggregateOn ?? ''),
    }) as MeasurementPoints;

  const addTimestamps: (series: MeasurementSerie) => void = (series: MeasurementSerie) => {
    series?.measurementPoints?.forEach(addTimestampToMeasurementPoint);
  };

  const measurementData = data?.measurementSeries?.filter((measurement) => measurement.unit === 'kWh') ?? [];
  measurementData.forEach(addTimestamps);

  const peakHourUsage =
    data?.measurementSeries?.filter((measurement) => measurement.measurementType === 'Peakhourusage') ?? [];
  peakHourUsage.forEach(addTimestamps);

  const temperatureData =
    data?.measurementSeries?.filter((measurement) => measurement.measurementType === 'outdoor_temperature') ?? [];
  temperatureData.forEach(addTimestamps);

  temperatureData.forEach((series) =>
    series.measurementPoints?.forEach((measurement) => (measurement.value = toFixedNumber(measurement.value ?? 0, 2)))
  );

  return {
    category: data?.category,
    formattedDate: getFormattedDate(data?.aggregateOn, data.fromDate),
    aggregatedOn: data?.aggregateOn,
    measurementData: measurementData,
    peakHourUsage: peakHourUsage,
    temperatureData: temperatureData,
    totalConsumption: calculateTotalConsumption(measurementData),
    peakConsumptionValue: calculateHighestValue(data?.aggregateOn, measurementData),
    averageConsumption: calculateAverageConsumption(measurementData),
    peakEffectValue: calculateHighestValue(data?.aggregateOn, peakHourUsage),
  };
};

export const statisticsMeasurementDataHandler = (data: Data) => handleStatisticsMeasurementDataResponse(data);

export const getCategoryFromInstalledBaseType = (type: string | undefined): string => {
  switch (type) {
    case 'El':
      return 'ELECTRICITY';
    case 'Fjärrvärme':
      return 'DISTRICT_HEATING';
    case 'Elproduktion':
      return 'ELECTRICITY';
    case 'Bredband':
      return 'COMMUNICATION';
    default:
      return '';
  }
};

export const getCategoryFromFacilityType = (
  facilities: InstalledBaseItem[] | undefined,
  facilityId: string
): string => {
  const type =
    facilities?.find((facility) => facility?.facilityId === facilityId && facility.type !== 'Elhandel')?.type ?? '';

  if (type === 'El') {
    return 'Elförbrukning';
  }

  return type;
};

export const getAreaFromFacility = (facilities: InstalledBaseItem[] | undefined, facilityId: string): string => {
  return facilities?.find((facility) => facility?.facilityId === facilityId)?.address?.city?.toLowerCase() ?? '';
};

export const calculateYearDifference = (current: number | undefined, previous: number | undefined) => {
  return current && previous ? Math.round(((previous - current) / previous) * 100) : false;
};

export const formatMeasurementDates = (date: string, aggregation: string) => {
  switch (aggregation) {
    case 'HOUR':
      return dayjs(date).format('HH').toLowerCase();
    case 'DAY':
      return dayjs(date).format('D').toLowerCase();
    case 'MONTH':
      return dayjs(date).format('MMM').toLowerCase();
    case '':
      return 'Saknas';
  }
};

export const calculateTotalConsumption = (measurementData: MeasurementSerie[] | undefined) => {
  if (measurementData?.[0]?.measurementPoints) {
    return Math.round(
      measurementData[0]?.measurementPoints?.reduce((accumulator, currentValue) => {
        return currentValue.value ? accumulator + currentValue?.value : accumulator;
      }, 0)
    );
  } else {
    return 0;
  }
};

export const calculateHighestValue = (aggregateOn: string | undefined, measurementData: MeasurementSerie[]) => {
  if (measurementData?.[0]?.measurementPoints) {
    const value = measurementData[0]?.measurementPoints?.reduce((a, b) => Math.max(a, b.value ?? 0), 0);

    const measurementPoints = measurementData[0].measurementPoints.filter((measurement) => measurement.value === value);

    return {
      value: toFixedNumber(value, 2),
      timestamp: formatHighestValueDate(aggregateOn, measurementPoints[0].timestamp),
    };
  } else {
    return { value: 0, timestamp: '' };
  }
};

export const formatHighestValueDate = (aggregateOn: string | undefined, timestamp: string | undefined) => {
  switch (aggregateOn) {
    case 'HOUR':
      return dayjs(timestamp).format('HH:mm');
    case 'DAY':
      return dayjs(timestamp).format('D MMM').toLowerCase();
    case 'MONTH':
      return dayjs(timestamp).format('MMMM');
    default:
      return 'Saknas';
  }
};

export const calculateAverageConsumption = (measurementData: MeasurementSerie[]) => {
  if (measurementData?.[0]?.measurementPoints) {
    const sum = measurementData[0]?.measurementPoints?.reduce((accumulator, currentValue) => {
      return currentValue.value ? accumulator + currentValue?.value : accumulator;
    }, 0);

    return Math.round(sum / measurementData[0]?.measurementPoints.length);
  } else {
    return 0;
  }
};

export const getFormattedDate = (aggregation: string | undefined, fromDate: string | undefined) => {
  switch (aggregation) {
    case 'HOUR':
      return dayjs(fromDate).format('D MMMM YYYY').toLowerCase();
    case 'DAY':
      return dayjs(fromDate).format('MMMM YYYY').toLowerCase();
    case 'MONTH':
      return dayjs(fromDate).format('YYYY');
    default:
      return 'Datum saknas';
  }
};

export const translateAggregateOn = (aggregateOn: string | undefined) => {
  switch (aggregateOn) {
    case 'HOUR':
      return 'timme';
    case 'DAY':
      return 'dag';
    case 'MONTH':
      return 'månad';
    default:
      return '';
  }
};

export const mergeMeasurementDataSets = (current: StatisticsMeasurementData, previous: StatisticsMeasurementData) => {
  if (current?.measurementData?.[0]?.measurementPoints && previous?.measurementData) {
    return {
      ...current,
      measurementData: [
        {
          ...current.measurementData[0],
          measurementPoints: current.measurementData[0].measurementPoints.map((measurement, index) => {
            if (previous?.measurementData?.[0]?.measurementPoints?.[index]) {
              return { ...measurement, previousValue: previous.measurementData[0].measurementPoints[index].value };
            } else {
              return { ...measurement, previousValue: 0 };
            }
          }),
        },
      ],
    } as MergedStatisticsMeasurementData;
  }
};

export const mergeTemperatureDataSets = (current: StatisticsMeasurementData, previous: StatisticsMeasurementData) => {
  if (current?.temperatureData?.[0]?.measurementPoints && previous?.measurementData) {
    return {
      ...current,
      temperatureData: [
        {
          ...current.temperatureData[0],
          measurementPoints: current.temperatureData[0].measurementPoints.map((measurement, index) => {
            if (previous?.temperatureData?.[0]?.measurementPoints?.[index]) {
              return { ...measurement, previousValue: previous.temperatureData[0].measurementPoints[index].value };
            }
          }),
        },
      ],
    } as MergedStatisticsMeasurementData;
  }
};
