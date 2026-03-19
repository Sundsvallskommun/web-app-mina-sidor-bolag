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

/** CreateDelegation model */
export interface CreateDelegation {
  /**
   * @minItems 1
   * @uniqueItems true
   */
  facilities: Facility[];
  /** Party ID of the delegate */
  delegatedTo: string;
  /** Party ID of the delegation owner */
  owner: string;
}

/** Facility model */
export interface Facility {
  /**
   * Facility id
   * @minLength 1
   */
  id: string;
  /** Organization number of the company owning the facility */
  businessEngagementOrgId: string;
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

/** UpdateDelegation model */
export interface UpdateDelegation {
  /** @uniqueItems true */
  facilities?: Facility[];
  /** Party ID of the delegate */
  delegatedTo?: string;
}

/** Installed base owner model */
export interface InstalledBaseCustomer {
  /** Customer number */
  customerNumber?: string;
  /** Party-ID */
  partyId?: string;
  items?: InstalledBaseItem[];
}

/** Installed base item model */
export interface InstalledBaseItem {
  /** Type */
  type?: string;
  /** Facility id */
  facilityId?: string;
  /**
   * Placement id
   * @format int32
   */
  placementId?: number;
  /**
   * Facility commitment start date
   * @format date
   */
  facilityCommitmentStartDate?: string;
  /**
   * Facility commitment end date
   * @format date
   */
  facilityCommitmentEndDate?: string;
  /**
   * Last date for modification of item (or null if no modification has been done)
   * @format date
   */
  lastModifiedDate?: string;
  /** Installed base item address model */
  address?: InstalledBaseItemAddress;
  /** @maxItems 1000 */
  metaData?: InstalledBaseItemMetaData[];
}

/** Installed base item address model */
export interface InstalledBaseItemAddress {
  /** Property designation */
  propertyDesignation?: string;
  /** Care of address */
  careOf?: string;
  /** Street */
  street?: string;
  /** Postal code */
  postalCode?: string;
  /** City */
  city?: string;
}

/** Installed base item metadata model */
export interface InstalledBaseItemMetaData {
  /** Key */
  key?: string;
  /** Value */
  value?: string;
  /** Type */
  type?: string;
  /** Displayname */
  displayName?: string;
}

/** Installed base response model */
export interface InstalledBaseResponse {
  installedBaseCustomers?: InstalledBaseCustomer[];
}

/** Delegation response model */
export interface Delegation {
  /** Unique identifier for the delegation */
  id?: string;
  facilities?: Facility[];
  /** Party ID of the delegate */
  delegatedTo?: string;
  /** Party ID of the delegation owner */
  owner?: string;
  /** Municipality ID of the delegation */
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
