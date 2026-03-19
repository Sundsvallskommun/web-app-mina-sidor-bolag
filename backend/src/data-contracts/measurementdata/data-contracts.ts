/* eslint-disable */
/* tslint:disable */
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

/** Measurement meta data */
export interface MetaData {
  /** key */
  key?: string;
  /** value */
  value?: string;
}

/** A single measurement data point */
export interface MeasurementPoint {
  /** Value of the point */
  value?: number;
  /**
   * Timestamp of the datapoint
   * @format date-time
   */
  timestamp?: string;
  metaData?: MetaData[];
}

/** Measurement from a single source */
export interface MeasurementSerie {
  /** Unit of all measurement points */
  unit?: string;
  /** Type of measurement */
  measurementType?: string;
  metaData?: MetaData[];
  measurementPoints?: MeasurementPoint[];
}

/** Aggregation granularity */
export enum Aggregation {
  QUARTER = 'QUARTER',
  HOUR = 'HOUR',
  DAY = 'DAY',
  MONTH = 'MONTH',
}

/** Category */
export enum Category {
  DISTRICT_HEATING = 'DISTRICT_HEATING',
  ELECTRICITY = 'ELECTRICITY',
  COMMUNICATION = 'COMMUNICATION',
  WASTE_MANAGEMENT = 'WASTE_MANAGEMENT',
}

/** Measurement data for a category */
export interface Data {
  /** Category */
  category?: Category;
  /** Aggregation granularity */
  aggregateOn?: Aggregation;
  /**
   * From date
   * @format date-time
   */
  fromDate?: string;
  /**
   * To date
   * @format date-time
   */
  toDate?: string;
  measurementSeries?: MeasurementSerie[];
  facilityId?: string[];
}

export interface Problem {
  /** @format uri */
  instance?: string;
  /** @format uri */
  type?: string;
  title?: string;
  detail?: string;
  /** @format int32 */
  status?: number;
}

export interface ConstraintViolationProblem {
  /** @format uri */
  type?: string;
  /** @format int32 */
  status?: number;
  violations?: Violation[];
  title?: string;
  /** @format uri */
  instance?: string;
  detail?: string;
  causeAsProblem?: ThrowableProblem;
}

export interface ThrowableProblem {
  /** @format uri */
  type?: string;
  title?: string;
  /** @format int32 */
  status?: number;
  detail?: string;
  /** @format uri */
  instance?: string;
  causeAsProblem?: any;
}

export interface Violation {
  field?: string;
  message?: string;
}

/** Category */
export enum GetMeasurementDataParamsCategoryEnum {
  DISTRICT_HEATING = 'DISTRICT_HEATING',
  ELECTRICITY = 'ELECTRICITY',
  COMMUNICATION = 'COMMUNICATION',
  WASTE_MANAGEMENT = 'WASTE_MANAGEMENT',
}

/** Aggregation granularity */
export enum GetMeasurementDataParamsAggregateOnEnum {
  QUARTER = 'QUARTER',
  HOUR = 'HOUR',
  DAY = 'DAY',
  MONTH = 'MONTH',
}

/** Display mode for aggregated series */
export enum GetMeasurementDataParamsDisplayEnum {
  AGGREGATE = 'AGGREGATE',
  ONLYAGGREGATED = 'ONLYAGGREGATED',
}
