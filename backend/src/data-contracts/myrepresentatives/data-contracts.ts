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

/** Information about the user and the completed order */
export interface CompletionData {
  /**
   * When the BankID was issued
   * @format date
   * @example "2020-01-02"
   */
  bankIdIssueDate: string;
  /**
   * The signature made by the receiving party
   * @minLength 1
   * @example "YmFzZTY0LWVuY29kZWQgZGF0YQ=="
   */
  signature: string;
  /**
   * Online certificate status protocol for the signing order
   * @minLength 1
   * @example "YmFzZTY0LWVuY29kZWQgZGF0YQ=="
   */
  ocspResponse: string;
  /**
   * Indicates the risk level of the order based on data available in the order
   * @example "low"
   */
  risk?: string;
  /** Information regarding the signing party */
  user: User;
  /** Information regarding the device used for the signing order */
  device: Device;
  /** Information about possible additional verifications that were part of the signing order */
  stepUp?: StepUp;
}

/** CreateMandate model */
export interface CreateMandate {
  /** GrantorDetails model */
  grantorDetails: GrantorDetails;
  /** GranteeDetails model */
  granteeDetails: GranteeDetails;
  /**
   * The date when the mandate becomes effective
   * @format date
   * @example "2025-08-01"
   */
  activeFrom: string;
  /**
   * The date after which the mandate is no longer valid, if not provided it will be set to activeFrom + 36 months
   * @format date
   * @example "2025-12-31"
   */
  inactiveAfter?: string;
  /** SigningInfo model */
  signingInfo: SigningInfo;
}

/** Information regarding the device used for the signing order */
export interface Device {
  /**
   * Ip address used when the letter was signed
   * @minLength 1
   * @example "192.168.1.1"
   */
  ipAddress: string;
  /**
   * The Unique Hardware Identifier for the user’s device holding the BankID
   * @minLength 1
   * @example "OZvYM9VvyiAmG7NA5jU5zqGcVpo="
   */
  uhi: string;
}

/** GranteeDetails model */
export interface GranteeDetails {
  /**
   * PartyId of the grantee
   * @example "fb2f0290-3820-11ed-a261-0242ac120004"
   */
  partyId: string;
}

/** GrantorDetails model */
export interface GrantorDetails {
  /**
   * The name of the granting organization or person
   * @example "Ankeborgs Margarinfabrik"
   */
  name?: string;
  /**
   * The partyId of the issuing organization or person
   * @example "fb2f0290-3820-11ed-a261-0242ac120002"
   */
  grantorPartyId: string;
  /**
   * PartyId of the issuing person / signatory
   * @example "fb2f0290-3820-11ed-a261-0242ac120003"
   */
  signatoryPartyId: string;
}

/** SigningInfo model */
export interface SigningInfo {
  /**
   * Reference for the signing order
   * @minLength 1
   * @example "131daac9-16c6-4618-beb0-365768f37288"
   */
  orderRef: string;
  /**
   * Status of the signing order
   * @minLength 1
   * @example "complete"
   */
  status: string;
  /** Information about the user and the completed order */
  completionData: CompletionData;
}

/** Information about possible additional verifications that were part of the signing order */
export interface StepUp {
  /**
   * Whether an MRTD check was performed before the order was completed
   * @example true
   */
  mrtd?: boolean;
}

/** Information regarding the signing party */
export interface User {
  /**
   * Personal identity number for the signing party
   * @minLength 1
   * @example "200001012384"
   */
  personalNumber: string;
  /**
   * Full name of the signing party
   * @example "John Wick"
   */
  name?: string;
  /**
   * First name of the signing party
   * @example "John"
   */
  givenName?: string;
  /**
   * Last name of the signing party
   * @example "Wick"
   */
  surname?: string;
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

/** SearchMandateParameters model */
export interface SearchMandateParameters {
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
  /**
   * The partyId of the issuing organization or person
   * @example "fb2f0290-3820-11ed-a261-0242ac120002"
   */
  grantorPartyId?: string;
  /**
   * PartyId of the grantee
   * @example "fb2f0290-3820-11ed-a261-0242ac120004"
   */
  granteePartyId?: string;
  /**
   * PartyId of the issuing person / signatory
   * @example "fb2f0290-3820-11ed-a261-0242ac120003"
   */
  signatoryPartyId?: string;
  /** List of mandate statuses */
  statuses?: string[];
}

/**
 * The sort order direction
 * @example "ASC"
 */
export enum Direction {
  ASC = 'ASC',
  DESC = 'DESC',
}

/** MandateDetails model */
export interface MandateDetails {
  /**
   * Id of the mandate
   * @example "123e4567-e89b-12d3-a456-426614174000"
   */
  id?: string;
  /** GrantorDetails model */
  grantorDetails?: GrantorDetails;
  /** GranteeDetails model */
  granteeDetails?: GranteeDetails;
  /**
   * MunicipalityId where the mandate was created
   * @example "2281"
   */
  municipalityId?: string;
  /** The namespace in which the mandate is valid */
  namespace?: string;
  /**
   * The date and time when the mandate was created
   * @format date-time
   */
  created?: string;
  /**
   * The date and time when the mandate was changed
   * @format date-time
   * @example "2025-11-22T15:30:00+02:00"
   */
  updated?: string;
  /**
   * The date when the mandate becomes effective
   * @format date
   * @example "2025-01-01"
   */
  activeFrom?: string;
  /**
   * The date after which the mandate is no longer valid
   * @format date
   * @example "2025-12-31"
   */
  inactiveAfter?: string;
  /**
   * Indicates whether the mandate is active or not
   * @example "ACTIVE | INACTIVE | EXPIRED | DELETED"
   */
  status?: string;
  /** SigningInfo model */
  signingInfo?: SigningInfo;
}

/** Paginated response containing a list of mandate details */
export interface Mandates {
  /** List of mandates */
  mandateDetailsList?: MandateDetails[];
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
