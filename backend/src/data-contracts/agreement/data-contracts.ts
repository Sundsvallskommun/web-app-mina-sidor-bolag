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
  causeAsProblem?: ThrowableProblem;
  detail?: string;
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
   */
  page?: number;
  /**
   * Result size per page. Maximum allowed value is dynamically configured
   * @format int32
   * @min 1
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
   */
  page?: number;
  /**
   * Displayed objects per page
   * @format int32
   */
  limit?: number;
  /**
   * Displayed objects on current page
   * @format int32
   */
  count?: number;
  /**
   * Total amount of hits based on provided search parameters
   * @format int64
   */
  totalRecords?: number;
  /**
   * Total amount of pages based on provided search parameters
   * @format int32
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
