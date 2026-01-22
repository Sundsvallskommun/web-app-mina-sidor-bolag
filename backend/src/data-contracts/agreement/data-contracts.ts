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
  /** Signal if only active or all agreements should be included in response, default is to only return active agreements. */
  onlyActive?: boolean;
}

/** Agreement model */
export interface Agreement {
  /** Customer identifier at the supplier of the agreement */
  customerId?: string;
  /** Agreement identifier */
  agreementId?: string;
  /** Billing identifier */
  billingId?: string;
  /** Category model */
  category?: Category;
  /** Description */
  description?: string;
  /** Id of the facility connected to the agreement */
  facilityId?: string;
  /** Signal indicating whether the agreement is the main agreement or not */
  mainAgreement?: boolean;
  /** Signal indicating whether the agreement has a binding period or not */
  binding?: boolean;
  /** Description of the binding rule in cases where the agreement has a binding period */
  bindingRule?: string;
  /** Placement status for agreement */
  placementStatus?: string;
  /** Net area id for agreement */
  netAreaId?: string;
  /** Site address connected to the agreement */
  siteAddress?: string;
  /** Signal if the agreement is a production agreement or not (can be null if not applicable) */
  production?: boolean;
  /**
   * Start date of the agreement
   * @format date
   */
  fromDate?: string;
  /**
   * End date of the agreement
   * @format date
   */
  toDate?: string;
  /** Signal if the agreement is active or not */
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
  /** Customer identifier at the supplier of the agreement */
  customerId?: string;
  agreements?: Agreement[];
}

/** Agreement response model */
export interface AgreementResponse {
  agreementParties?: AgreementParty[];
}
