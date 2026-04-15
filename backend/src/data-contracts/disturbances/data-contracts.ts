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

/** Opt-out setting model */
export interface OptOutSetting {
  /** Category of the disturbance */
  category: Category;
  /**
   * Key/value pairs of opt-out values. E.g. ["facilityId" : "12345"].
   * If multiple entries are added, they will have an "and"-relation. I.e. all properties must match in order for the opt-out to be evaluated as true.
   */
  values?: Record<string, any>;
}

/** Subscription update request model */
export interface SubscriptionUpdateRequest {
  /** Opt-out settings */
  optOutSettings?: OptOutSetting[];
}

/** Subscription model */
export interface Subscription {
  /**
   * Subscription ID
   * @format int64
   */
  id?: number;
  /** Municipality ID */
  municipalityId?: string;
  /** PartyId (e.g. a personId or an organizationId) */
  partyId?: string;
  /** Opt out settings */
  optOutSettings?: OptOutSetting[];
  /**
   * Created timestamp
   * @format date-time
   */
  created?: string;
  /**
   * Updated timestamp
   * @format date-time
   */
  updated?: string;
}

/** Subscription create request model */
export interface SubscriptionCreateRequest {
  /** PartyId (e.g. a personId or an organizationId) */
  partyId: string;
  /** Opt-out settings */
  optOutSettings?: OptOutSetting[];
}

/** Affected persons and/or organizations model */
export interface Affected {
  /** PartyId (e.g. a personId or an organizationId) */
  partyId: string;
  /**
   * Reference information
   * @minLength 0
   * @maxLength 512
   */
  reference: string;
  /** Facitlity-ID. The unique facility identifier */
  facilityId?: string;
  /** The coordinates to the facility on the format:{coordinate-system}:N{north-coordinate}:E{east-coordinate} */
  coordinates?: string;
}

/** Disturbance create request model */
export interface DisturbanceCreateRequest {
  /**
   * Disturbance ID
   * @minLength 0
   * @maxLength 255
   */
  id: string;
  /** Category model */
  category: Category;
  /**
   * Title
   * @minLength 0
   * @maxLength 255
   */
  title: string;
  /**
   * Description
   * @minLength 0
   * @maxLength 8192
   */
  description: string;
  /** Status model */
  status: Status;
  /**
   * Planned start date for the disturbance
   * @format date-time
   */
  plannedStartDate?: string;
  /**
   * Planned stop date for the disturbance
   * @format date-time
   */
  plannedStopDate?: string;
  affecteds?: Affected[];
}

/** Status model */
export enum Status {
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
  PLANNED = 'PLANNED',
}

/** Disturbance update request model */
export interface DisturbanceUpdateRequest {
  /**
   * Title
   * @minLength 0
   * @maxLength 255
   */
  title: string;
  /**
   * Description
   * @minLength 0
   * @maxLength 8192
   */
  description?: string;
  /** Status model */
  status?: Status;
  /**
   * Planned start date for the disturbance
   * @format date-time
   */
  plannedStartDate?: string;
  /**
   * Planned stop date for the disturbance
   * @format date-time
   */
  plannedStopDate?: string;
  affecteds?: Affected[];
}

/** Disturbance model */
export interface Disturbance {
  /** Disturbance ID */
  id?: string;
  /** Municipality ID */
  municipalityId?: string;
  /** Category model */
  category: Category;
  /** Status model */
  status: Status;
  /** Title */
  title?: string;
  /** Description */
  description?: string;
  /**
   * Planned start date for the disturbance
   * @format date-time
   */
  plannedStartDate?: string;
  /**
   * Planned stop date for the disturbance
   * @format date-time
   */
  plannedStopDate?: string;
  /**
   * Created timestamp
   * @format date-time
   */
  created?: string;
  /**
   * Updated timestamp
   * @format date-time
   */
  updated?: string;
  affecteds?: Affected[];
}
