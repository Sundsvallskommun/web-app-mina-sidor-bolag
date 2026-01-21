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

/** Measurement date request parameters */
export interface MeasurementDataSearchParameters {
  /** Party ID, either private or enterprise uuid */
  partyId: string;
  /** Category */
  category: MeasurementDataSearchParametersCategoryEnum;
  /**
   * Facility ID
   * @minLength 1
   */
  facilityId: string;
  /**
   * From date
   * @format date-time
   */
  fromDate: string;
  /**
   * To date
   * @format date-time
   */
  toDate: string;
  /** Data point aggregation granularity */
  aggregateOn: MeasurementDataSearchParametersAggregateOnEnum;
}

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
  facilityId?: string;
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
}

export interface Problem {
  /** @format uri */
  instance?: string;
  /** @format uri */
  type?: string;
  parameters?: Record<string, any>;
  status?: StatusType;
  title?: string;
  detail?: string;
}

export interface StatusType {
  /** @format int32 */
  statusCode?: number;
  reasonPhrase?: string;
}

export interface ConstraintViolationProblem {
  cause?: ThrowableProblem;
  stackTrace?: {
    classLoaderName?: string;
    moduleName?: string;
    moduleVersion?: string;
    methodName?: string;
    fileName?: string;
    /** @format int32 */
    lineNumber?: number;
    className?: string;
    nativeMethod?: boolean;
  }[];
  /** @format uri */
  type?: string;
  status?: StatusType;
  violations?: Violation[];
  title?: string;
  message?: string;
  /** @format uri */
  instance?: string;
  parameters?: Record<string, any>;
  detail?: string;
  suppressed?: {
    stackTrace?: {
      classLoaderName?: string;
      moduleName?: string;
      moduleVersion?: string;
      methodName?: string;
      fileName?: string;
      /** @format int32 */
      lineNumber?: number;
      className?: string;
      nativeMethod?: boolean;
    }[];
    message?: string;
    localizedMessage?: string;
  }[];
  localizedMessage?: string;
}

export interface ThrowableProblem {
  cause?: any;
  stackTrace?: {
    classLoaderName?: string;
    moduleName?: string;
    moduleVersion?: string;
    methodName?: string;
    fileName?: string;
    /** @format int32 */
    lineNumber?: number;
    className?: string;
    nativeMethod?: boolean;
  }[];
  message?: string;
  /** @format uri */
  instance?: string;
  /** @format uri */
  type?: string;
  parameters?: Record<string, any>;
  status?: StatusType;
  title?: string;
  detail?: string;
  suppressed?: {
    stackTrace?: {
      classLoaderName?: string;
      moduleName?: string;
      moduleVersion?: string;
      methodName?: string;
      fileName?: string;
      /** @format int32 */
      lineNumber?: number;
      className?: string;
      nativeMethod?: boolean;
    }[];
    message?: string;
    localizedMessage?: string;
  }[];
  localizedMessage?: string;
}

export interface Violation {
  field?: string;
  message?: string;
}

/** Category */
export enum MeasurementDataSearchParametersCategoryEnum {
  DISTRICT_HEATING = 'DISTRICT_HEATING',
  ELECTRICITY = 'ELECTRICITY',
  COMMUNICATION = 'COMMUNICATION',
  WASTE_MANAGEMENT = 'WASTE_MANAGEMENT',
}

/** Data point aggregation granularity */
export enum MeasurementDataSearchParametersAggregateOnEnum {
  QUARTER = 'QUARTER',
  HOUR = 'HOUR',
  DAY = 'DAY',
  MONTH = 'MONTH',
}
