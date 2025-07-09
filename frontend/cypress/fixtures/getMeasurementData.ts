import dayjs from 'dayjs';
import { Aggregation, Category, Data } from '@interfaces/measurement-data';
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
