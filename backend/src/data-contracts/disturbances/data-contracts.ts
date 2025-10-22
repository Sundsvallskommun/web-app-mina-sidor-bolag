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

/**
 * Category model
 * @example "ELECTRICITY"
 */
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
  /** Category model */
  category: Category;
  /**
   * Key/value pairs of opt-out values. E.g. ["facilityId" : "12345"].
   * If multiple entries are added, they will have an "and"-relation. I.e. all properties must match in order for the opt-out to be evaluated as true.
   * @example {"facilityId":"123456"}
   */
  values?: object;
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
   * @example 1234
   */
  id?: number;
  /**
   * Municipality ID
   * @example "2281"
   */
  municipalityId?: string;
  /**
   * PartyId (e.g. a personId or an organizationId)
   * @example "81471222-5798-11e9-ae24-57fa13b361e1"
   */
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
  /**
   * PartyId (e.g. a personId or an organizationId)
   * @example "81471222-5798-11e9-ae24-57fa13b361e1"
   */
  partyId: string;
  /** Opt-out settings */
  optOutSettings?: OptOutSetting[];
}

/** Affected persons and/or organizations model */
export interface Affected {
  /**
   * PartyId (e.g. a personId or an organizationId)
   * @example "81471222-5798-11e9-ae24-57fa13b361e1"
   */
  partyId: string;
  /**
   * Reference information
   * @minLength 0
   * @maxLength 512
   * @example "Streetname 123"
   */
  reference: string;
  /**
   * Facitlity-ID. The unique facility identifier
   * @example "735999109175011012"
   */
  facilityId?: string;
  /**
   * The coordinates to the facility on the format:{coordinate-system}:N{north-coordinate}:E{east-coordinate}
   * @example "SWEREF 991715:N6919620.98828125:E152414.77734375"
   */
  coordinates?: string;
}

/** Disturbance create request model */
export interface DisturbanceCreateRequest {
  /**
   * Disturbance ID
   * @minLength 0
   * @maxLength 255
   * @example "435553"
   */
  id: string;
  /** Category model */
  category: Category;
  /**
   * Title
   * @minLength 0
   * @maxLength 255
   * @example "Disturbance"
   */
  title: string;
  /**
   * Description
   * @minLength 0
   * @maxLength 8192
   * @example "Major disturbance"
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
   * @example "Disturbance"
   */
  title: string;
  /**
   * Description
   * @minLength 0
   * @maxLength 8192
   * @example "Major disturbance"
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
  /**
   * Disturbance ID
   * @example "435553"
   */
  id?: string;
  /**
   * Municipality ID
   * @example "2281"
   */
  municipalityId?: string;
  /** Category model */
  category: Category;
  /** Status model */
  status: Status;
  /**
   * Title
   * @example "Disturbance"
   */
  title?: string;
  /**
   * Description
   * @example "Major disturbance in city"
   */
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
