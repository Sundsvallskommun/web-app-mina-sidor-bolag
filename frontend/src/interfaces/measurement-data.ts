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
