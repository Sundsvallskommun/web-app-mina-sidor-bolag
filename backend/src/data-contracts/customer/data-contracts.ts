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

/** Customer details request */
export interface CustomerDetailsRequest {
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
  sortBy?: string[];
  /**
   * The sort order direction
   * @example "ASC"
   */
  sortDirection?: Direction;
  partyId?: string[];
  /**
   * Organization id for customer engagements
   * @minLength 1
   */
  customerEngagementOrgId: string;
  /**
   * Earliest date and time for when to search for change from. Format is yyyy-MM-dd'T'HH:mm:ss.SSSXXX
   * @format date-time
   */
  fromDateTime?: string;
}

export enum Direction {
  ASC = 'ASC',
  DESC = 'DESC',
}

/** Customer details model */
export interface CustomerDetails {
  /** Company with which the customer has an engagement (organization number) */
  customerEngagementOrgId?: string;
  /** Name of the company the customer has an engagement with */
  customerEngagementOrgName?: string;
  /** PartyId (e.g. a personId or an organizationId) */
  partyId?: string;
  /** Customer number */
  customerNumber?: string;
  /** Customer name */
  customerName?: string;
  /** Street */
  street?: string;
  /** Postal code */
  postalCode?: string;
  /** City */
  city?: string;
  /** Care of address */
  careOf?: string;
  phoneNumbers?: string[];
  emails?: string[];
  /**
   * Customer category ID
   * @format int32
   */
  customerCategoryID?: number;
  /** Customer category description */
  customerCategoryDescription?: string;
  /** Indicates if customer details have changed since the search date */
  customerChangedFlg?: boolean;
  /** Indicates if placement and/or equipment details have changed since the search date */
  installedChangedFlg?: boolean;
  /** Indicates customer status, if not active then the moveInDate holds information on when the customer will be activated */
  active?: boolean;
  /**
   * The prospective customer's move-in date
   * @format date
   */
  moveInDate?: string;
}

/** Customer details response model */
export interface CustomerDetailsResponse {
  customerDetails?: CustomerDetails[];
  /** PagingAndSortingMetaData model */
  _meta?: PagingAndSortingMetaData;
}

/** PagingAndSortingMetaData model */
export interface PagingAndSortingMetaData {
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
  sortBy?: string[];
  /**
   * The sort order direction
   * @example "ASC"
   */
  sortDirection?: Direction;
}

/** Customer model */
export interface Customer {
  /** Customer type model */
  customerType?: CustomerType;
  customerRelations?: CustomerRelation[];
}

/** Customer relation model */
export interface CustomerRelation {
  /** Customer number */
  customerNumber?: string;
  /** Organization number */
  organizationNumber?: string;
  /** Organization name */
  organizationName?: string;
  /** Indicates customer status, if not active then the moveInDate holds information on when the customer will be activated */
  active?: boolean;
  /**
   * The prospective customer's move-in date
   * @format date
   */
  moveInDate?: string;
}

/** Customer type model */
export enum CustomerType {
  PRIVATE = 'PRIVATE',
  ENTERPRISE = 'ENTERPRISE',
}
