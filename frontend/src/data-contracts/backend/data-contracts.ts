/* eslint-disable */
/* tslint:disable */
// @ts-nocheck
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

export interface CreateReadNotificationsDto {
  caseId: string;
}

export interface RepresentsDto {
  organizationNumber?: string;
  personNumber?: string;
  mode?: 'PRIVATE' | 'BUSINESS' | 0 | 1;
}

export interface PatchUserSettingsDto {
  feedbackLifespan: 'untilRemoved' | 'oneMonth' | 'twoWeeks';
}

export interface ClientContactSettingNotifications {
  email_enabled: boolean;
  phone_enabled: boolean;
}

export interface ClientContactSettingDecicionsAndDocuments {
  digitalInbox: boolean;
  myPages: boolean;
  snailmail: boolean;
}

export interface ClientContactSettingAddress {
  street?: string;
  postcode?: string;
  city?: string;
}

export interface ClientContactSetting {
  id?: string;
  createdById?: string;
  name?: string;
  email?: string | null;
  phone?: string | null;
  address?: ClientContactSettingAddress[] | null;
  notifications?: ClientContactSettingNotifications[];
  decicionsAndDocuments?: ClientContactSettingDecicionsAndDocuments[];
  virtual: boolean;
  alias: string | null;
  municipalityId?: string | null;
  modified?: string;
}

export interface ClientDelegate {
  id?: string;
  principalId?: string;
  agentId?: string;
  created?: string;
  modified?: string;
  filters?: Filter[];
}

export interface Filter {
  id?: string;
  alias?: string;
  channel?: string;
  created?: string;
  modified?: string;
  rules: Rule[];
}

export interface Rule {
  attributeName: string;
  operator: 'EQUALS' | 'NOT_EQUALS';
  attributeValue: string;
}

export interface Sign {
  orderRef: string;
  autoStartToken: string;
  qrCode?: string;
}

export interface User {
  personalNumber: string;
  name: string;
  givenName: string;
  surname: string;
}

export interface StepUp {
  mrtd: boolean;
}

export interface Device {
  ipAddress: string;
  uhi: string;
}

export interface CompletionData {
  user: User;
  device: Device;
  stepUp: StepUp;
  /** @pattern \d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d.\d+Z? */
  bankIdIssueDate: string;
  signature: string;
  ocspResponse: string;
  risk?: 'low' | 'moderate' | 'high';
}

export interface SignCollect {
  orderRef: string;
  status: 'pending' | 'failed' | 'complete';
  hintCode: string;
  qrCode?: string;
}

export interface SignApiResponse {
  data: Sign;
  message: string;
}

export interface SignCollectApiResponse {
  data: SignCollect;
  message: string;
}

export interface Meta {
  page: number;
  limit: number;
  count: number;
  totalRecords: number;
  totalPages: number;
  sortBy: string[];
  sortDirection: 'ASC' | 'DESC';
}

export interface Grantor {
  name?: string;
  grantorPartyId: string;
  signatoryPartyId: string;
}

export interface Grantee {
  partyId: string;
}

export interface MandatePart {
  name: string;
  personNumber?: string;
}

export interface SigningInfo {
  orderRef: string;
  status: 'pending' | 'failed' | 'complete';
  completionData: CompletionData;
}

export interface MandateDefaults {
  id: string;
  /** @pattern \d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d.\d+Z? */
  created: string;
  /** @pattern \d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d.\d+Z? */
  updated: string;
  /** @pattern \d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d.\d+Z? */
  activeFrom: string;
  /** @pattern \d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d.\d+Z? */
  inactiveAfter?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'EXPIRED' | 'DELETED';
}

export interface Mandate {
  grantorDetails?: Grantor;
  granteeDetails?: Grantee;
  municipalityId?: string;
  namespace?: string;
  signingInfo: SigningInfo;
  id: string;
  /** @pattern \d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d.\d+Z? */
  created: string;
  /** @pattern \d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d.\d+Z? */
  updated: string;
  /** @pattern \d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d.\d+Z? */
  activeFrom: string;
  /** @pattern \d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d.\d+Z? */
  inactiveAfter?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'EXPIRED' | 'DELETED';
}

export interface MandatePopulated {
  grantee: MandatePart;
  grantor: MandatePart;
  id: string;
  /** @pattern \d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d.\d+Z? */
  created: string;
  /** @pattern \d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d.\d+Z? */
  updated: string;
  /** @pattern \d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d.\d+Z? */
  activeFrom: string;
  /** @pattern \d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d.\d+Z? */
  inactiveAfter?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'EXPIRED' | 'DELETED';
}

export interface MandatesApiResponse {
  data: Mandate[];
  message: string;
  page: number;
  limit: number;
  count: number;
  totalRecords: number;
  totalPages: number;
  sortBy: string[];
  sortDirection: 'ASC' | 'DESC';
}

export interface MandateApiResponse {
  data: Mandate;
  message: string;
  page: number;
  limit: number;
  count: number;
  totalRecords: number;
  totalPages: number;
  sortBy: string[];
  sortDirection: 'ASC' | 'DESC';
}

export interface PopulatedMandatesApiResponse {
  data: MandatePopulated[];
  message: string;
  page: number;
  limit: number;
  count: number;
  totalRecords: number;
  totalPages: number;
  sortBy: string[];
  sortDirection: 'ASC' | 'DESC';
}

export interface SignMandateDetails {
  granteeId: string;
  /** @pattern \d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d.\d+Z? */
  activeFrom: string;
  /** @pattern \d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d.\d+Z? */
  inactiveAfter?: string;
}

export interface MandateDto {
  grantorDetails: Grantor;
  granteeDetails: Grantee;
  /** @pattern \d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d.\d+Z? */
  activeFrom: string;
  /** @pattern \d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d.\d+Z? */
  inactiveAfter?: string;
  signingInfo: SigningInfo;
}

export interface MandatePaginationDto {
  page?: number;
  limit?: number;
}

export interface CreateMandateDto {
  bankIdRef: string;
}

export interface SignWeb {
  deviceIdentifier?: string;
  referringDomain?: string;
  userAgent?: string;
}

export interface SignDto {
  userVisibleData: string;
  userVisibleDataFormat: 'plaintext' | 'simpleMarkdownV1';
  web?: SignWeb;
  details?: object;
}

export interface SignMandateDto {
  userVisibleData: string;
  userVisibleDataFormat: 'plaintext' | 'simpleMarkdownV1';
  web?: SignWeb;
  mandate: SignMandateDetails;
}

export interface Citizen {
  personId: string;
  givenname: string;
  lastname: string;
}

export interface CitizenApiResponse {
  data: Citizen;
  message: string;
}
