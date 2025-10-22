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
  /**
   * Party ID, either private or enterprise uuid
   * @example "81471222-5798-11e9-ae24-57fa13b361e1"
   */
  partyId: string;
  /**
   * Category
   * @example "DISTRICT_HEATING"
   */
  category: MeasurementDataSearchParametersCategoryEnum;
  /**
   * Facility ID
   * @minLength 1
   * @example "112233"
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
  /**
   * Aggregation granularity
   * @example "HOUR"
   */
  aggregateOn: MeasurementDataSearchParametersAggregateOnEnum;
}

/**
 * Aggregation granularity
 * @example "HOUR"
 */
export enum Aggregation {
  HOUR = 'HOUR',
  DAY = 'DAY',
  MONTH = 'MONTH',
  YEAR = 'YEAR',
}

/**
 * Category
 * @example "DISTRICT_HEATING"
 */
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
  /** @example "1234567" */
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

/** Measurement from a single source */
export interface MeasurementSerie {
  /**
   * Unit of all measurement points
   * @example "m3"
   */
  unit?: string;
  /**
   * Type of measurement
   * @example "volume"
   */
  measurementType?: string;
  metaData?: MetaData[];
  measurementPoints?: MeasurementPoints[];
}

/** A single measurement data point */
export interface MeasurementPoints {
  /**
   * Value of the point
   * @example 22.321
   */
  value?: number;
  /**
   * Timestamp of the datapoint
   * @format date-time
   */
  timestamp?: string;
  metaData?: MetaData[];
}

/** Measurement meta data */
export interface MetaData {
  /**
   * key
   * @example "id"
   */
  key?: string;
  /**
   * value
   * @example "123"
   */
  value?: string;
}

export interface Problem {
  title?: string;
  detail?: string;
  /** @format uri */
  instance?: string;
  /** @format uri */
  type?: string;
  parameters?: Record<string, object>;
  status?: StatusType;
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
  detail?: string;
  /** @format uri */
  instance?: string;
  parameters?: Record<string, object>;
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
  message?: string;
  title?: string;
  detail?: string;
  /** @format uri */
  instance?: string;
  /** @format uri */
  type?: string;
  parameters?: Record<string, object>;
  status?: StatusType;
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

/**
 * Category
 * @example "DISTRICT_HEATING"
 */
export enum MeasurementDataSearchParametersCategoryEnum {
  DISTRICT_HEATING = 'DISTRICT_HEATING',
  ELECTRICITY = 'ELECTRICITY',
  COMMUNICATION = 'COMMUNICATION',
  WASTE_MANAGEMENT = 'WASTE_MANAGEMENT',
}

/**
 * Aggregation granularity
 * @example "HOUR"
 */
export enum MeasurementDataSearchParametersAggregateOnEnum {
  HOUR = 'HOUR',
  DAY = 'DAY',
  MONTH = 'MONTH',
  YEAR = 'YEAR',
}
