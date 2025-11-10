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

export interface Problem {
  /** @format uri */
  instance?: string;
  /** @format uri */
  type?: string;
  parameters?: Record<string, object>;
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
  parameters?: Record<string, object>;
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
  /** @format uri */
  instance?: string;
  /** @format uri */
  type?: string;
  parameters?: Record<string, object>;
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

/** Category model */
export enum Category {
  COMMUNICATION = 'COMMUNICATION',
  DISTRICT_COOLING = 'DISTRICT_COOLING',
  DISTRICT_HEATING = 'DISTRICT_HEATING',
  ELECTRICITY = 'ELECTRICITY',
  ELECTRICITY_TRADE = 'ELECTRICITY_TRADE',
  WASTE_MANAGEMENT = 'WASTE_MANAGEMENT',
  WATER = 'WATER',
}

/** Agreement request parameters model */
export interface AgreementParameters {
  /**
   * Page number
   * @format int32
   * @min 1
   * @default 1
   * @example 1
   */
  page?: number;
  /**
   * Result size per page. Maximum allowed value is dynamically configured
   * @format int32
   * @min 1
   * @example 15
   */
  limit?: number;
  /**
   * Signal if only active or all agreements should be included in response, default is to only return active agreements.
   * @example true
   */
  onlyActive?: boolean;
}

/** Agreement model */
export interface Agreement {
  /**
   * Customer identifier at the supplier of the agreement
   * @example "81471222"
   */
  customerId?: string;
  /**
   * Agreement identifier
   * @example "223344-A"
   */
  agreementId?: string;
  /**
   * Billing identifier
   * @example "111222333"
   */
  billingId?: string;
  /** Category model */
  category?: Category;
  /**
   * Description
   * @example "The master agreement"
   */
  description?: string;
  /**
   * Id of the facility connected to the agreement
   * @example "1223334"
   */
  facilityId?: string;
  /**
   * Signal indicating whether the agreement is the main agreement or not
   * @example true
   */
  mainAgreement?: boolean;
  /**
   * Signal indicating whether the agreement has a binding period or not
   * @example true
   */
  binding?: boolean;
  /**
   * Description of the binding rule in cases where the agreement has a binding period
   * @example "12 mån bindning"
   */
  bindingRule?: string | null;
  /**
   * Placement status for agreement
   * @example "Tillkopplad"
   */
  placementStatus?: string;
  /**
   * Net area id for agreement
   * @example "SUV"
   */
  netAreaId?: string;
  /**
   * Site address connected to the agreement
   * @example "Första gatan 2"
   */
  siteAddress?: string;
  /**
   * Signal if the agreement is a production agreement or not (can be null if not applicable)
   * @example true
   */
  production?: boolean | null;
  /**
   * Start date of the agreement
   * @format date
   * @example "2022-01-01"
   */
  fromDate?: string;
  /**
   * End date of the agreement
   * @format date
   * @example "2022-12-31"
   */
  toDate?: string;
  /**
   * Signal if the agreement is active or not
   * @example true
   */
  active?: boolean;
}

/** Paged agreement response model */
export interface PagedAgreementResponse {
  agreements?: Agreement[];
  /** PagingMetaData model */
  _meta?: PagingMetaData;
}

/** PagingMetaData model */
export interface PagingMetaData {
  /**
   * Current page
   * @format int32
   * @example 5
   */
  page?: number;
  /**
   * Displayed objects per page
   * @format int32
   * @example 20
   */
  limit?: number;
  /**
   * Displayed objects on current page
   * @format int32
   * @example 13
   */
  count?: number;
  /**
   * Total amount of hits based on provided search parameters
   * @format int64
   * @example 98
   */
  totalRecords?: number;
  /**
   * Total amount of pages based on provided search parameters
   * @format int32
   * @example 23
   */
  totalPages?: number;
}

/** Agreement party model */
export interface AgreementParty {
  /**
   * Customer identifier at the supplier of the agreement
   * @example "81471222"
   */
  customerId?: string;
  agreements?: Agreement[];
}

/** Agreement response model */
export interface AgreementResponse {
  agreementParties?: AgreementParty[];
}
