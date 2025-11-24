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

/** Event model */
export interface Event {
  /**
   * Unique identifier
   * @example "fbe2fb67-005c-4f26-990f-1c95b5f6933e"
   */
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
  /**
   * Municipality ID
   * @example "2281"
   */
  municipalityId?: string;
  /**
   * Event description
   * @minLength 1
   * @example "Request saved in database"
   */
  message: string;
  /**
   * Date when event can be scheduled for delete. 'null' means never
   * @format date-time
   * @example "2030-10-31T01:30:00+02:00"
   */
  expires?: string | null;
  /**
   * Service that created event
   * @minLength 1
   * @example "SupportManagement"
   */
  owner: string;
  /**
   * Timestamp when the event was created
   * @format date-time
   * @example "2000-10-31T01:30:00+02:00"
   */
  created?: string;
  /**
   * Historical external reference to an immutable snapshot of data
   * @example "fbe2fb67-005c-4f26-990f-1c95b5f6933e"
   */
  historyReference?: string | null;
  /**
   * Source which the event refers to
   * @example "errand"
   */
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

/** Metadata model */
export interface Metadata {
  /**
   * The key
   * @minLength 1
   * @example "userId"
   */
  key: string;
  /**
   * The value
   * @minLength 1
   * @example "john123"
   */
  value: string;
}

export interface PageEvent {
  /** @format int32 */
  totalPages?: number;
  /** @format int64 */
  totalElements?: number;
  /** @format int32 */
  size?: number;
  content?: Event[];
  /** @format int32 */
  number?: number;
  sort?: SortObject;
  first?: boolean;
  last?: boolean;
  /** @format int32 */
  numberOfElements?: number;
  pageable?: PageableObject;
  empty?: boolean;
}

export interface PageableObject {
  unpaged?: boolean;
  /** @format int64 */
  offset?: number;
  sort?: SortObject;
  paged?: boolean;
  /** @format int32 */
  pageNumber?: number;
  /** @format int32 */
  pageSize?: number;
}

export interface SortObject {
  unsorted?: boolean;
  empty?: boolean;
  sorted?: boolean;
}
