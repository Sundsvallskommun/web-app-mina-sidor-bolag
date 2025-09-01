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

/** CreateDelegation model */
export interface CreateDelegation {
  /**
   * @minItems 1
   * @uniqueItems true
   */
  facilities: Facility[];
  /**
   * Party ID of the delegate
   * @example "81471222-5798-11e9-ae24-57fa13b361e2"
   */
  delegatedTo: string;
  /**
   * Party ID of the delegation owner
   * @example "81471222-5798-11e9-ae24-57fa13b361e1"
   */
  owner: string;
}

/** Facility model */
export interface Facility {
  /**
   * Facility id
   * @minLength 1
   * @example "facility1"
   */
  id: string;
  /**
   * Organization number of the company owning the facility
   * @example "5591628136"
   */
  businessEngagementOrgId?: string;
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

/** UpdateDelegation model */
export interface UpdateDelegation {
  /** @uniqueItems true */
  facilities?: Facility[];
  /**
   * Party ID of the delegate
   * @example "81471222-5798-11e9-ae24-57fa13b361e2"
   */
  delegatedTo?: string;
}

/** Installed base owner model */
export interface InstalledBaseCustomer {
  /**
   * Customer number
   * @example "10007"
   */
  customerNumber?: string;
  /**
   * Party-ID
   * @example "cf9892ad-69d5-420f-ae98-9631dd1664fe"
   */
  partyId?: string;
  items?: InstalledBaseItem[];
}

/** Installed base item model */
export interface InstalledBaseItem {
  /**
   * Type
   * @example "Fjärrvärme"
   */
  type?: string;
  /**
   * Facility id
   * @example "735999109270751042"
   */
  facilityId?: string;
  /**
   * Placement id
   * @format int32
   * @example 5263
   */
  placementId?: number;
  /**
   * Facility commitment start date
   * @format date
   * @example "2020-04-01"
   */
  facilityCommitmentStartDate?: string;
  /**
   * Facility commitment end date
   * @format date
   * @example "2020-09-30"
   */
  facilityCommitmentEndDate?: string;
  /**
   * Last date for modification of item (or null if no modification has been done)
   * @format date
   * @example "2020-06-01"
   */
  lastModifiedDate?: string;
  /** Installed base item address model */
  address?: InstalledBaseItemAddress;
  /** @maxItems 1000 */
  metaData?: InstalledBaseItemMetaData[];
}

/** Installed base item address model */
export interface InstalledBaseItemAddress {
  /**
   * Property designation
   * @example "Södermalm 1:27"
   */
  propertyDesignation?: string;
  /**
   * Care of address
   * @example "Agatha Malm"
   */
  careOf?: string;
  /**
   * Street
   * @example "Storgatan 9"
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
}

/** Installed base item metadata model */
export interface InstalledBaseItemMetaData {
  /**
   * Key
   * @example "netarea"
   */
  key?: string;
  /**
   * Value
   * @example "Sundsvall tätort"
   */
  value?: string;
  /**
   * Type
   * @example "location"
   */
  type?: string;
  /**
   * Displayname
   * @example "Nätområde"
   */
  displayName?: string;
}

/** Installed base response model */
export interface InstalledBaseResponse {
  installedBaseCustomers?: InstalledBaseCustomer[];
}

/** Delegation response model */
export interface Delegation {
  /**
   * Unique identifier for the delegation
   * @example "12345678-1234-1234-1234-123456789012"
   */
  id?: string;
  facilities?: Facility[];
  /**
   * Party ID of the delegate
   * @example "81471222-5798-11e9-ae24-57fa13b361e2"
   */
  delegatedTo?: string;
  /**
   * Party ID of the delegation owner
   * @example "81471222-5798-11e9-ae24-57fa13b361e1"
   */
  owner?: string;
  /**
   * Municipality ID of the delegation
   * @example "1234"
   */
  municipalityId?: string;
  /**
   * When the delegation was created
   * @format date-time
   */
  created?: string;
  /**
   * When the delegation was last updated
   * @format date-time
   */
  updated?: string;
}
