import dayjs from 'dayjs';
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

export const generateStatisticsElectricityData = (fromDate: string, currentDaysOfMonth: number) => {
  const measurements: MeasurementPoints[] = [];

  for (let i = 0; i < currentDaysOfMonth; i++) {
    measurements.push({
      value: i * 100,
      timestamp: dayjs(fromDate).startOf('month').add(i, 'days').format('YYYY-MM-DD').toString(),
    });
  }

  return measurements;
};

export const getStatisticsElectricityData: (
  fromDate: string,
  toDate: string,
  currentDaysOfMonth: number
) => ApiResponse<Data> = (fromDate, toDate, currentDaysOfMonth) => ({
  data: {
    category: Category.ELECTRICITY,
    facilityId: '111',
    aggregateOn: Aggregation.DAY,
    toDate: toDate,
    fromDate: fromDate,
    measurementSeries: [
      {
        unit: 'kWh',
        measurementType: 'energy',
        measurementPoints: generateStatisticsElectricityData(fromDate, currentDaysOfMonth),
      },
    ],
  },
  message: 'success',
});
