import {
  Aggregation,
  Data,
  MeasurementPoints,
  MeasurementSerie,
  MergedMeasurementPoints,
  MergedStatisticsMeasurementData,
  StatisticsMeasurementData,
} from '@interfaces/measurement-data';
import dayjs, { Dayjs } from 'dayjs';
import { InstalledBaseItem } from '@data-contracts/installedbase/data-contracts';
import { toFixedNumber } from '@react-stately/utils';
import { TFunction } from 'i18next';

export const handleMeasurementDataByMonthResponse = (
  data: Data,
  date: Dayjs
): { current: number; previous: number } => {
  const currentMonth = date.startOf('month');
  const previousMonth = date.subtract(1, 'year').startOf('month');

  const energySeries = data.measurementSeries?.find(
    (m) => m.measurementType === 'Energy' || m.measurementType === 'energy'
  );
  const points = energySeries?.measurementPoints ?? [];

  const valueForMonth = (month: Dayjs): number => {
    const point = points.find((p) => dayjs(p.timestamp).isSame(month, 'month'));
    return Math.round(point?.value ?? 0);
  };

  return {
    current: valueForMonth(currentMonth),
    previous: valueForMonth(previousMonth),
  };
};

export const measurementDataByMonthHandler =
  (date: Dayjs) =>
  (data: Data): { current: number; previous: number } =>
    handleMeasurementDataByMonthResponse(data, date);

export const handleStatisticsMeasurementDataResponse: (data: Data) => StatisticsMeasurementData = (data) => {
  const addTimestampToMeasurementPoint: (m: MeasurementPoints) => MeasurementPoints = (m) =>
    Object.assign(m, {
      chartTimestamp: formatMeasurementDates(m.timestamp ?? '', data.aggregateOn ?? ''),
    }) as MeasurementPoints;

  const addTimestamps: (series: MeasurementSerie) => void = (series: MeasurementSerie) => {
    series?.measurementPoints?.forEach(addTimestampToMeasurementPoint);
  };
  const addQuarterValues: (series: MeasurementSerie) => void = (series: MeasurementSerie) => {
    if (data.aggregateOn === Aggregation.QUARTER && series?.measurementPoints) {
      series.measurementPoints = groupQuartersByHour(series.measurementPoints);
    }
  };

  const groupQuartersByHour = (measurementPoints: MeasurementPoints[]) => {
    const newPoints: MeasurementPoints[] = [];
    for (let i = 0; i < measurementPoints.length; i += 4) {
      const quarterPoints = measurementPoints.slice(i, i + 4);
      const quarterValues = quarterPoints.map((point) => point.value ?? 0);
      const value = quarterValues.reduce((acc, v) => acc + v, 0);
      const timestamp = quarterPoints[0]?.timestamp;
      newPoints.push({
        value,
        values: quarterValues,
        timestamp,
        chartTimestamp: formatMeasurementDates(timestamp ?? '', Aggregation.QUARTER),
      });
    }
    return newPoints;
  };

  const measurementData = data?.measurementSeries?.filter((measurement) => measurement.unit === 'kWh') ?? [];
  measurementData.forEach(addTimestamps);
  measurementData.forEach(addQuarterValues);

  const peakHourUsage =
    data?.measurementSeries?.filter((measurement) => measurement.measurementType === 'Peakhourusage') ?? [];
  peakHourUsage.forEach(addTimestamps);

  const temperatureData =
    data?.measurementSeries?.filter((measurement) => measurement.measurementType === 'outdoor_temperature') ?? [];
  temperatureData.forEach(addTimestamps);

  temperatureData.forEach((series) =>
    series.measurementPoints?.forEach((measurement) =>
      measurement.value ? toFixedNumber(measurement.value ?? 0, 2) : undefined
    )
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
    case 'QUARTER':
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

export const calculateHighestValue = (aggregateOn?: Aggregation, measurementData: MeasurementSerie[] = []) => {
  const points = measurementData[0]?.measurementPoints ?? [];

  if (!points.length) {
    return { value: 0, timestamp: '' };
  }

  return aggregateOn === Aggregation.QUARTER
    ? calculateHighestQuarterValue(points)
    : calculateHighestRegularValue(points, aggregateOn);
};

const calculateHighestQuarterValue = (points: MeasurementPoints[]) => {
  const quarterValues = points.flatMap((point) => point.values ?? []);

  if (quarterValues.length === 0) {
    return { value: 0, timestamp: '' };
  }

  const maxValue = Math.max(...quarterValues);
  const maxPoint = points.find((point) => point.values?.includes(maxValue));
  const maxIndex = maxPoint?.values?.indexOf(maxValue) ?? 0;

  const baseTime = dayjs(maxPoint?.timestamp);
  const startTime = baseTime.add(maxIndex * 15, 'minute').format();
  const endTime = baseTime.add((maxIndex + 1) * 15, 'minute').format();

  return {
    value: toFixedNumber(maxValue, 2),
    timestamp: `${formatHighestValueDate(Aggregation.QUARTER, startTime)} – ${formatHighestValueDate(Aggregation.QUARTER, endTime)}`,
  };
};

const calculateHighestRegularValue = (points: MeasurementPoints[], aggregateOn?: Aggregation) => {
  const maxValue = Math.max(...points.map((p) => p.value ?? 0));
  const maxPoint = points.find((p) => p.value === maxValue);

  return {
    value: toFixedNumber(maxValue, 2),
    timestamp: formatHighestValueDate(aggregateOn, maxPoint?.timestamp),
  };
};

export const formatHighestValueDate = (aggregateOn?: Aggregation, timestamp?: string) => {
  if (!timestamp) return 'Saknas';
  switch (aggregateOn) {
    case Aggregation.QUARTER:
    case Aggregation.HOUR:
      return dayjs(timestamp).format('HH:mm');
    case Aggregation.DAY:
      return dayjs(timestamp).format('D MMM').toLowerCase();
    case Aggregation.MONTH:
      return dayjs(timestamp).format('MMMM');
    default:
      return 'Saknas';
  }
};

export const calculateAverageConsumption = (measurementData: MeasurementSerie[]) => {
  if (measurementData?.[0]?.measurementPoints) {
    const points = measurementData[0]?.measurementPoints ?? [];

    const sum = points.reduce((accumulator, currentValue) => {
      return currentValue.value ? accumulator + currentValue?.value : accumulator;
    }, 0);

    // If the data is aggregated by quarter
    if (points.length && points[0].values?.length === 4) {
      const count = points.length * points[0].values.length;
      return Math.round(sum / count);
    }

    return Math.round(sum / measurementData[0]?.measurementPoints.length);
  } else {
    return 0;
  }
};

export const getFormattedDate = (aggregation?: Aggregation, fromDate?: string) => {
  if (!fromDate) return 'Datum saknas';
  switch (aggregation) {
    case Aggregation.QUARTER:
    case Aggregation.HOUR:
      return dayjs(fromDate).format('D MMMM YYYY').toLowerCase();
    case Aggregation.DAY:
      return dayjs(fromDate).format('MMMM YYYY').toLowerCase();
    case Aggregation.MONTH:
      return dayjs(fromDate).format('YYYY');
    default:
      return 'Datum saknas';
  }
};

export const translateAggregateOn = (aggregateOn?: Aggregation, t?: TFunction) => {
  switch (aggregateOn) {
    case Aggregation.QUARTER:
      return t ? t('statistics:quarter').toLocaleLowerCase() : 'kvartal';
    case Aggregation.HOUR:
      return t ? t('statistics:hour').toLocaleLowerCase() : 'timme';
    case Aggregation.DAY:
      return t ? t('statistics:day').toLocaleLowerCase() : 'dag';
    case Aggregation.MONTH:
      return t ? t('statistics:month').toLocaleLowerCase() : 'månad';
    default:
      return '';
  }
};

const getDataLength = (aggregation: string, fromDate: string) => {
  switch (aggregation) {
    case Aggregation.HOUR:
      return 24;
    case Aggregation.DAY:
      return dayjs(fromDate).daysInMonth();
    case Aggregation.MONTH:
      return 12;
    default:
      return 0;
  }
};

const getCurrentDate = (index: number, fromDate: string, aggregation: string) => {
  const oldDate = dayjs(fromDate);
  switch (aggregation) {
    case Aggregation.HOUR:
      return `${oldDate.format('YYYY-MM-DD')}T${index < 10 ? '0' + index : index}:00:00`;
    case Aggregation.DAY:
      return `${oldDate.startOf('month').add(index, 'day').format('YYYY-MM-DD')}T00:00:00`;
    case Aggregation.MONTH:
      return `${oldDate.startOf('year').add(index, 'month').format('YYYY-MM-DD')}T00:00:00`;
    default:
      return '';
  }
};
const getDateFindFormat = (aggregation: string) => {
  switch (aggregation) {
    case Aggregation.HOUR:
      return 'HH';
    case Aggregation.DAY:
      return 'DD';
    case Aggregation.MONTH:
      return 'MM';
    default:
      return 'DD';
  }
};

export const mergeMeasurementDataSets = (
  current: StatisticsMeasurementData,
  previous: StatisticsMeasurementData,
  fromDate: string
): MergedStatisticsMeasurementData | undefined => {
  const aggregation = current.aggregatedOn;
  if (!fromDate || !aggregation) {
    return;
  }

  const array = Array.from(new Array(getDataLength(aggregation, fromDate)));

  const measurementPoints: MergedMeasurementPoints[] = array.map((_, index) => {
    const currentDate = getCurrentDate(index, fromDate, aggregation);
    const format = getDateFindFormat(aggregation);

    const currentMeasurement = current.measurementData?.[0]?.measurementPoints?.find(
      (point) => dayjs(point.timestamp).format(format) === dayjs(currentDate).format(format)
    );
    const previousMeasurement = previous.measurementData?.[0]?.measurementPoints?.find(
      (point) => dayjs(point.timestamp).format(format) === dayjs(currentDate).format(format)
    );
    const { value, ...rest } = currentMeasurement || {};
    return {
      ...rest,
      timestamp: currentDate,
      chartTimestamp: (index + 1).toString(),
      value: value ?? 0,
      previousValue: previousMeasurement?.value ?? 0,
    };
  });

  if (current && measurementPoints?.length > 0) {
    return {
      ...current,
      measurementData: [
        {
          ...current.measurementData?.[0],
          measurementPoints,
        },
      ],
    };
  }
};

export const mergeTemperatureDataSets = (
  current: StatisticsMeasurementData,
  previous: StatisticsMeasurementData,
  fromDate: string
) => {
  const aggregation = current.aggregatedOn;
  if (!fromDate || !aggregation) {
    return;
  }

  const array = Array.from(new Array(getDataLength(aggregation, fromDate)));

  const measurementPoints: MergedMeasurementPoints[] = array.map((_, index) => {
    const currentDate = getCurrentDate(index, fromDate, aggregation);
    const format = getDateFindFormat(aggregation);

    const currentMeasurement = current.temperatureData?.[0]?.measurementPoints?.find(
      (point) => dayjs(point.timestamp).format(format) === dayjs(currentDate).format(format)
    );
    const previousMeasurement = previous.temperatureData?.[0]?.measurementPoints?.find(
      (point) => dayjs(point.timestamp).format(format) === dayjs(currentDate).format(format)
    );
    const { value, ...rest } = currentMeasurement || {};
    return {
      ...rest,
      timestamp: currentDate,
      chartTimestamp: (index + 1).toString(),
      value: value,
      previousValue: previousMeasurement?.value,
    };
  });

  if (current && measurementPoints?.length > 0) {
    return {
      ...current,
      temperatureData: [
        {
          ...current.temperatureData?.[0],
          measurementPoints,
        },
      ],
    } as MergedStatisticsMeasurementData;
  }
};
