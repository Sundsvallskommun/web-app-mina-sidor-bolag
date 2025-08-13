import dayjs, { ManipulateType } from 'dayjs';
import { Aggregation, Category, Data, MeasurementPoints } from '@interfaces/measurement-data';
import { ApiResponse } from '@services/api-service';

export const getOverviewDistrictHeatingData: (fromDate: string, toDate: string) => ApiResponse<Data> = (
  fromDate,
  toDate
) => ({
  data: {
    category: Category.DISTRICT_HEATING,
    facilityId: '333',
    aggregateOn: Aggregation.MONTH,
    toDate: toDate,
    fromDate: fromDate,
    measurementSeries: [
      {
        unit: 'kWh',
        measurementType: 'energy',
        measurementPoints: [
          {
            value: 1,
            timestamp: dayjs(fromDate).startOf('month').format('YYYY-MM-DD').toString(),
          },
          {
            value: 2,
            timestamp: dayjs(toDate).format('YYYY-MM-DD').toString(),
          },
        ],
      },
    ],
  },
  message: 'success',
});

export const getOverviewElectricityData: (fromDate: string, toDate: string) => ApiResponse<Data> = (
  fromDate,
  toDate
) => ({
  data: {
    category: Category.ELECTRICITY,
    facilityId: '111',
    aggregateOn: Aggregation.MONTH,
    toDate: toDate,
    fromDate: fromDate,
    measurementSeries: [
      {
        unit: 'kWh',
        measurementType: 'energy',
        measurementPoints: [
          {
            value: 100,
            timestamp: dayjs(fromDate).startOf('month').format('YYYY-MM-DD').toString(),
          },
          {
            value: 12,
            timestamp: dayjs(toDate).format('YYYY-MM-DD').toString(),
          },
        ],
      },
    ],
  },
  message: 'success',
});

export const getOverviewElectricityProductionData: (fromDate: string, toDate: string) => ApiResponse<Data> = (
  fromDate,
  toDate
) => ({
  data: {
    category: Category.ELECTRICITY,
    facilityId: '222',
    aggregateOn: Aggregation.MONTH,
    toDate: toDate,
    fromDate: fromDate,
    measurementSeries: [
      {
        unit: 'kWh',
        measurementType: 'energy',
        measurementPoints: [
          {
            value: 2222,
            timestamp: dayjs(fromDate).startOf('month').format('YYYY-MM-DD').toString(),
          },
          {
            value: 2222,
            timestamp: dayjs(toDate).format('YYYY-MM-DD').toString(),
          },
        ],
      },
    ],
  },
  message: 'success',
});

export const generateStatisticsData = (fromDate: string, aggregateOn: string) => {
  const getMeasurementMax = () => {
    switch (aggregateOn) {
      case 'HOUR':
        return 24;
      case 'DAY':
        return parseInt(dayjs().format('DD'));
      case 'MONTH':
        return parseInt(dayjs().format('M'));
      default:
        return parseInt(dayjs().format('DD'));
    }
  };

  const getStartOf = () => {
    switch (aggregateOn) {
      case 'HOUR':
        return 'day';
      case 'DAY':
        return 'month';
      case 'MONTH':
        return 'year';
      default:
        return 'day';
    }
  };

  const measurements: MeasurementPoints[] = [];
  const measurementMax = getMeasurementMax();
  const startOf = getStartOf();

  for (let i = 0; i < measurementMax; i++) {
    measurements.push({
      value: i * i,
      timestamp: dayjs(fromDate)
        .startOf(startOf)
        .add(i, aggregateOn as ManipulateType)
        .format('YYYY-MM-DD HH:mm')
        .toString(),
    });
  }

  return measurements;
};

export const getStatisticsData: (
  fromDate: string,
  toDate: string,
  category: Category,
  aggregateOn: Aggregation
) => ApiResponse<Data> = (fromDate, toDate, category, aggregateOn) => ({
  data: {
    category: category,
    facilityId: '111',
    aggregateOn: aggregateOn,
    toDate: toDate,
    fromDate: fromDate,
    measurementSeries: [
      {
        unit: 'kWh',
        measurementType: 'energy',
        measurementPoints: generateStatisticsData(fromDate, aggregateOn),
      },
      {
        unit: 'C',
        measurementType: 'outdoor_temperature',
        measurementPoints: generateStatisticsData(fromDate, aggregateOn),
      },
    ],
  },
  message: 'success',
});
