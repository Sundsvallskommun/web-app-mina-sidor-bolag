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

/** Event model */
export interface Event {
  /** Unique identifier for this event */
  id?: string;
  /** Unique identifier */
  logKey?: string;
  /**
   * ## CRUD events:
   * * `CREATE`
   * * `READ`
   * * `UPDATE`
   * * `DELETE`
   * ## System events:
   * * `ACCESS` - login, logout, authorization, throttling
   * * `EXECUTE` - send, queue, schedule, transfer, move
   * * `CANCEL` - terminate, abort, decommission, kill
   * * `DROP` - skip, omit, ignore, disregard
   */
  type: EventType;
  /** Event sub type */
  subType?: string;
  /** Request group id, groups events originating from the same operation */
  requestGroupId?: string;
  /** The user that executed the action that caused this event */
  executingUser?: null;
  /** Additional details about the event */
  details?: string;
  /** Municipality ID */
  municipalityId?: string;
  /**
   * Event description
   * @minLength 1
   */
  message: string;
  /**
   * Date when event can be scheduled for delete. 'null' means never
   * @format date-time
   */
  expires?: string | null;
  /**
   * Service that created event
   * @minLength 1
   */
  owner: string;
  /**
   * Timestamp when the event was created
   * @format date-time
   */
  created?: string;
  /** Historical external reference to an immutable snapshot of data */
  historyReference?: string | null;
  /** Source which the event refers to */
  sourceType?: string | null;
  metadata?: Metadata[];
}

/**
 * ## CRUD events:
 * * `CREATE`
 * * `READ`
 * * `UPDATE`
 * * `DELETE`
 * ## System events:
 * * `ACCESS` - login, logout, authorization, throttling
 * * `EXECUTE` - send, queue, schedule, transfer, move
 * * `CANCEL` - terminate, abort, decommission, kill
 * * `DROP` - skip, omit, ignore, disregard
 */
export enum EventType {
  CREATE = 'CREATE',
  READ = 'READ',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  ACCESS = 'ACCESS',
  EXECUTE = 'EXECUTE',
  CANCEL = 'CANCEL',
  DROP = 'DROP',
}

/** Executing user model */
export interface ExecutingUser {
  /**
   * ## Executing user types:
   * * `AD_USER` - Active Directory user
   * * `PARTY_ID` - Party identifier (UUID)
   */
  type: ExecutingUserType;
  /**
   * The identifier of the executing user
   * @minLength 1
   */
  value: string;
}

/**
 * ## Executing user types:
 * * `AD_USER` - Active Directory user
 * * `PARTY_ID` - Party identifier (UUID)
 */
export enum ExecutingUserType {
  AD_USER = 'AD_USER',
  PARTY_ID = 'PARTY_ID',
}

/** Metadata model */
export interface Metadata {
  /**
   * The key
   * @minLength 1
   */
  key: string;
  /**
   * The value
   * @minLength 1
   */
  value: string;
}

export interface PageEvent {
  /** @format int64 */
  totalElements?: number;
  /** @format int32 */
  totalPages?: number;
  /** @format int32 */
  size?: number;
  content?: Event[];
  /** @format int32 */
  number?: number;
  first?: boolean;
  last?: boolean;
  pageable?: PageableObject;
  /** @format int32 */
  numberOfElements?: number;
  sort?: SortObject;
  empty?: boolean;
}

export interface PageableObject {
  /** @format int64 */
  offset?: number;
  paged?: boolean;
  /** @format int32 */
  pageNumber?: number;
  /** @format int32 */
  pageSize?: number;
  sort?: SortObject;
  unpaged?: boolean;
}

export interface SortObject {
  empty?: boolean;
  sorted?: boolean;
  unsorted?: boolean;
}
