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
  /** The sort order direction */
  sortDirection?: Direction;
  partyId?: string[];
  /** Organization id for customer engagements */
  customerEngagementOrgId: string;
  /**
   * Earliest date and time for when to search for change from. Format is yyyy-MM-dd'T'HH:mm:ss.SSSXXX
   * @format date-time
   * @example "2000-10-31T01:30:00-05:00"
   */
  fromDateTime?: string;
}

/**
 * The sort order direction
 * @example "ASC"
 */
export enum Direction {
  ASC = 'ASC',
  DESC = 'DESC',
}

/** Customer details model */
export interface CustomerDetails {
  /**
   * Company with which the customer has an engagement (organization number)
   * @example "5591962591"
   */
  customerEngagementOrgId?: string;
  /**
   * Name of the company the customer has an engagement with
   * @example "Sundsvall Elnät"
   */
  customerEngagementOrgName?: string;
  /**
   * PartyId (e.g. a personId or an organizationId)
   * @example "81471222-5798-11e9-ae24-57fa13b361e1"
   */
  partyId?: string;
  /**
   * Customer number
   * @example "39195"
   */
  customerNumber?: string;
  /**
   * Customer name
   * @example "Sven Svensson"
   */
  customerName?: string;
  /**
   * Street
   * @example "Storgatan 44"
   */
  street?: string;
  /**
   * Postal code
   * @example "85230"
   */
  postalCode?: string;
  /**
   * City
   * @example "Sundsvall"
   */
  city?: string;
  /**
   * Care of address
   * @example "Agatha Malm"
   */
  careOf?: string;
  phoneNumbers?: string[];
  emails?: string[];
  /**
   * Customer category ID
   * @format int32
   * @example 1
   */
  customerCategoryID?: number;
  /**
   * Customer category description
   * @example "Privat"
   */
  customerCategoryDescription?: string;
  /**
   * Indicates if customer details have changed since the search date
   * @example false
   */
  customerChangedFlg?: boolean;
  /**
   * Indicates if placement and/or equipment details have changed since the search date
   * @example true
   */
  installedChangedFlg?: boolean;
  /**
   * Indicates customer status, if not active then the moveInDate holds information on when the customer will be activated
   * @example true
   */
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
  /** The sort order direction */
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
  /**
   * Customer number
   * @example "10007"
   */
  customerNumber?: string;
  /**
   * Organization number
   * @example "5565027223"
   */
  organizationNumber?: string;
  /**
   * Organization name
   * @example "Sundsvall Elnät"
   */
  organizationName?: string;
  /**
   * Indicates customer status, if not active then the moveInDate holds information on when the customer will be activated
   * @example true
   */
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
