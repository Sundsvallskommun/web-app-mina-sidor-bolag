export interface MeasurementDataSearchParameters {
  partyId: string;
  category: MeasurementDataSearchParametersCategoryEnum;
  facilityId: string;
  fromDate: string;
  toDate: string;
  aggregateOn: MeasurementDataSearchParametersAggregateOnEnum;
}

export enum Aggregation {
  HOUR = 'HOUR',
  DAY = 'DAY',
  MONTH = 'MONTH',
  YEAR = 'YEAR',
}

export enum Category {
  DISTRICT_HEATING = 'DISTRICT_HEATING',
  ELECTRICITY = 'ELECTRICITY',
  COMMUNICATION = 'COMMUNICATION',
  WASTE_MANAGEMENT = 'WASTE_MANAGEMENT',
}

export interface Data {
  category?: Category;
  facilityId?: string;
  aggregateOn?: Aggregation;
  fromDate?: string;
  toDate?: string;
  measurementSeries?: MeasurementSerie[];
}

export interface MeasurementSerie {
  unit?: string;
  measurementType?: string;
  metaData?: MetaData[];
  measurementPoints?: MeasurementPoints[];
}

export interface MeasurementPoints {
  value?: number;
  timestamp?: string;
  metaData?: MetaData[];
  chartTimestamp?: string;
}

export interface MetaData {
  key?: string;
  value?: string;
}

export interface StatusType {
  statusCode?: number;
  reasonPhrase?: string;
}

export enum MeasurementDataSearchParametersCategoryEnum {
  DISTRICT_HEATING = 'DISTRICT_HEATING',
  ELECTRICITY = 'ELECTRICITY',
  COMMUNICATION = 'COMMUNICATION',
  WASTE_MANAGEMENT = 'WASTE_MANAGEMENT',
}

export enum MeasurementDataSearchParametersAggregateOnEnum {
  HOUR = 'HOUR',
  DAY = 'DAY',
  MONTH = 'MONTH',
  YEAR = 'YEAR',
}

export interface StatisticsMeasurementData {
  measurementData: MeasurementSerie[] | undefined;
  peakHourUsage: MeasurementSerie[] | undefined;
  temperatureData: MeasurementSerie[] | undefined;
  category: string | undefined;
  formattedDate: string | undefined;
  aggregatedOn: Aggregation | undefined;
  totalConsumption: number;
  peakConsumptionValue: { value: number; timestamp: string | undefined };
  averageConsumption: number;
  peakEffectValue: { value: number; timestamp: string | undefined };
}

export interface MergedStatisticsMeasurementData extends Omit<StatisticsMeasurementData, 'measurementData'> {
  measurementData: MergedMeasurementSeries[];
}

export interface MergedMeasurementPoints {
  value: number;
  timestamp: string;
  chartTimestamp?: string;
  metaData?: MetaData[];
  previousValue: number;
}

export interface MergedMeasurementSeries {
  unit?: string;
  measurementType?: string;
  metaData?: MetaData[];
  measurementPoints?: MergedMeasurementPoints[];
}

export enum Months {
  jan = 'Januari',
  feb = 'Februari',
  mar = 'Mars',
  apr = 'April',
  maj = 'Maj',
  jun = 'Juni',
  jul = 'Juli',
  aug = 'Augusti',
  sep = 'September',
  okt = 'Oktober',
  nov = 'November',
  dec = 'December',
}
