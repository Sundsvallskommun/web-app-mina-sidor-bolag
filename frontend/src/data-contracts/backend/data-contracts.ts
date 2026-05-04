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

export interface PersonEngagement {
  organizationNumber: string | null;
  name: string | null;
  isAuthorizedSignatory?: boolean | null;
  isSoleTrader?: boolean | null;
}

export interface BusinessEngagementsApiResponse {
  data: PersonEngagement[];
  message: string;
}

export interface LegalEntityAdress {
  addressArea: string | null;
  adressNumber: string | null;
  city: string | null;
  postalCode: string | null;
  municipality: string | null;
  county: string | null;
}

export interface BusinessInformation {
  address: LegalEntityAdress;
}

export interface BusinessInformationApiResponse {
  data: BusinessInformation;
  message: string;
}

export interface CreateReadNotificationsDto {
  caseId: string;
}

export interface ContactSettingChannel {
  contactMethod: string;
  destination: string;
  disabled?: boolean;
  alias: string;
}

export interface Meta {
  page: number;
  limit: number;
  count: number;
  totalRecords: number;
  totalPages: number;
  sortBy: string[];
  sortDirection: "ASC" | "DESC";
}

export interface ContactSetting {
  id: string;
  partyId: string;
  contactChannels: ContactSettingChannel[];
  created: string;
  modified: string;
  virtual: boolean;
  alias: string;
  municipalityId: string;
}

export interface UpdateContactSettingsDto {
  id: string;
  contactChannels: ContactSettingChannel[];
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
  address?: ClientContactSettingAddress | null;
  notifications?: ClientContactSettingNotifications;
  decicionsAndDocuments?: ClientContactSettingDecicionsAndDocuments;
  virtual?: boolean;
  alias?: string | null;
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
  operator: "EQUALS" | "NOT_EQUALS";
  attributeValue: string;
}

export interface RepresentingPrivateEntity {
  name: string;
  personNumber?: string;
  information?: Information;
}

export interface RepresentingBusinessEntity {
  organizationName: string;
  organizationNumber: string;
  isAuthorizedSignatory?: boolean;
  information: Information;
  whitelisted?: boolean;
}

export interface Information {
  address: ClientContactSettingAddress;
}

export interface RepresentingEntity {
  BUSINESS?: RepresentingBusinessEntity;
  PRIVATE?: RepresentingPrivateEntity;
  mode: "PRIVATE" | "BUSINESS" | 0 | 1;
}

export interface ClientRepresentingApiResponse {
  data: RepresentingEntity;
  message: string;
}

export interface RepresentsDto {
  organizationNumber?: string;
  personNumber?: string;
  mode?: "PRIVATE" | "BUSINESS" | 0 | 1;
}

export interface PatchUserSettingsDto {
  feedbackLifespan: "untilRemoved" | "oneMonth" | "twoWeeks";
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

export interface CompletionDataUser {
  personalNumber: string;
  name?: string;
  givenName: string;
  surname: string;
}

export interface CompletionDataDevice {
  ipAddress: string;
  uhi: string;
}

export interface CompletionData {
  /** @pattern \d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d.\d+Z? */
  bankIdIssueDate: string;
  signature: string;
  ocspResponse: string;
  risk?: string;
  user: CompletionDataUser;
  device: CompletionDataDevice;
}

export interface SigningInfo {
  orderRef: string;
  status: "COMPLETE" | "FAILED" | "CANCELLED" | "PENDING";
  completionData: CompletionData;
}

export interface MandateDefaults {
  id: string;
  /** @pattern \d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d.\d+Z? */
  created?: string;
  /** @pattern \d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d.\d+Z? */
  updated?: string;
  /** @pattern \d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d.\d+Z? */
  activeFrom: string;
  /** @pattern \d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d.\d+Z? */
  inactiveAfter?: string;
  status: "ACTIVE" | "INACTIVE" | "EXPIRED" | "DELETED";
  whitelisted?: boolean;
}

export interface Mandate {
  grantorDetails?: Grantor;
  granteeDetails?: Grantee;
  id: string;
  /** @pattern \d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d.\d+Z? */
  created?: string;
  /** @pattern \d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d.\d+Z? */
  updated?: string;
  /** @pattern \d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d.\d+Z? */
  activeFrom: string;
  /** @pattern \d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d.\d+Z? */
  inactiveAfter?: string;
  status: "ACTIVE" | "INACTIVE" | "EXPIRED" | "DELETED";
  whitelisted?: boolean;
}

export interface MandatePopulated {
  grantee: MandatePart;
  grantor: MandatePart;
  id: string;
  /** @pattern \d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d.\d+Z? */
  created?: string;
  /** @pattern \d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d.\d+Z? */
  updated?: string;
  /** @pattern \d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d.\d+Z? */
  activeFrom: string;
  /** @pattern \d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d.\d+Z? */
  inactiveAfter?: string;
  status: "ACTIVE" | "INACTIVE" | "EXPIRED" | "DELETED";
  whitelisted?: boolean;
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
  sortDirection: "ASC" | "DESC";
}

export interface MandateApiResponse {
  data: Mandate;
  message: string;
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
  sortDirection: "ASC" | "DESC";
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
  transactionId: string;
}

export interface SignDto {
  visible: string;
  format: "PLAIN_TEXT" | "MARKDOWN" | "HTML";
  details?: object;
}

export interface SignMandateDto {
  visible: string;
  format: "PLAIN_TEXT" | "MARKDOWN" | "HTML";
  mandate: SignMandateDetails;
}

export interface Sign {
  transactionId: string;
  autoStartToken: string;
  qrCode?: string;
}

export interface SubjectIdentifier {
  value: string;
  type: "TIN" | "EMAIL";
}

export interface User {
  subjectIdentifier: SubjectIdentifier;
  displayName?: string;
  givenName: string;
  sn: string;
  tin: string;
  ipAddress: string;
}

export interface Status {
  status: "COMPLETE" | "FAILED" | "CANCELLED" | "PENDING";
  substatus: string | null;
  message: string;
}

export interface ValidationInfo {
  signature: string;
  signatureFormat: "xmldsig" | "pkcs7" | "jws";
  ocspResponse?: string;
}

export interface SignCollect {
  progressStatus: Status;
  attributes?: object;
  userInfo?: User;
  validationInfo?: ValidationInfo;
  transactionId: string;
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

export interface Citizen {
  personId: string;
  givenname: string;
  lastname: string;
}

export interface CitizenApiResponse {
  data: Citizen;
  message: string;
}

export interface MetaData {
  key: string;
  value: string;
}

export interface EventResponse {
  logKey?: string;
  type:
    | "CREATE"
    | "READ"
    | "UPDATE"
    | "DELETE"
    | "ACCESS"
    | "EXECUTE"
    | "CANCEL"
    | "DROP";
  municipalityId?: string;
  message?: string;
  /** @pattern \d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d.\d+Z? */
  expires?: string | null;
  owner: string;
  /** @pattern \d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d.\d+Z? */
  created?: string;
  historyReference?: string | null;
  sourceType?: string | null;
  metadata: MetaData;
}

export interface SortObject {
  unsorted?: boolean;
  empty?: boolean;
  sorted?: boolean;
}

export interface PageableObject {
  unpaged?: boolean;
  offset?: number;
  sort: SortObject;
  paged?: boolean;
  pageNumber?: number;
  pageSize?: number;
}

export interface PagedEventsResponse {
  totalPages?: number;
  totalElements?: number;
  size?: number;
  content: any;
  number?: number;
  sort: SortObject;
  first?: boolean;
  last?: boolean;
  numberOfElements?: number;
  pageable: PageableObject;
  empty?: boolean;
}

export interface BFUSApiResponse {
  message: string;
  data: any;
}

export interface BFUSEligablePartyApiResponse {
  message: string;
  data: any;
}

export interface BFUSNewPermissionApiResponse {
  message: string;
  data: boolean;
}

export interface PermissionHeaderDto {
  ExternalId: string;
  Operation: string;
}

export interface PermissionRequestDto {
  EligablePartyId: string;
  ContractIdList?: number[];
  CustomerId?: number;
}

export interface UpdatePermissionDto {
  PermissionRequest: any;
}

export interface ModelId {
  id: string;
}

export interface ConversationRequest {
  question: string;
  session_id?: string;
  assistant_id?: string;
  group_chat_id?: string;
  files?: ModelId;
  stream?: boolean;
}

export interface SessionRequest {
  partyId: string;
  /** @minItems 1 */
  customerEngagementOrgIds: string[];
}

export interface SessionResponse {
  assistantId?: string;
  sessionId?: string;
}

export interface Assistant {
  id?: string;
  handle?: string;
}

export interface File {
  id?: string;
  name?: string;
  mimeType?: string;
  size?: number;
  createdAt?: string;
  updatedAt?: string;
  transcription?: string;
}

export interface Metadata {
  embeddingModelId?: string;
  url?: string;
  title?: string;
  size?: number;
}

export interface Model {
  id?: string;
  name?: string;
  nickname?: string;
  family?: string;
  tokenLimit?: number;
  deprecated?: boolean;
  nrBillionParameters?: number;
  hfLink?: string;
  stability?: string;
  hosting?: string;
  openSource?: boolean;
  description?: string;
  deploymentName?: string;
  org?: string;
  vision?: boolean;
  reasoning?: boolean;
  baseUrl?: string;
  orgEnabled?: boolean;
  orgDefault?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Tools {
  assistants: Assistant;
}

export interface QuestionResponse {
  sessionId?: string;
  question?: string;
  answer?: string;
  files: File;
  references: Reference;
  model: Model;
  tools: Tools;
}

export interface Reference {
  id?: string;
  metadata: Metadata;
  groupId?: string;
  websiteId?: string;
  createdAt?: string;
  updatedAt?: string;
  score?: string;
}

export interface SessionStatusResponse {
  status: "PENDING" | "READY" | "FAILED";
  detail?: string;
}

export interface SessionStatusApiResponse {
  data: SessionStatusResponse;
  message: string;
}

export interface Affected {
  partyId: string;
  reference: string;
  facilityId?: string;
  coordinates?: string;
}

export interface Disturbance {
  id: string;
  municipalityId?: string;
  category:
    | "COMMUNICATION"
    | "DISTRICT_COOLING"
    | "DISTRICT_HEATING"
    | "ELECTRICITY"
    | "ELECTRICITY_TRADE"
    | "WASTE_MANAGEMENT"
    | "WATER";
  status: "OPEN" | "CLOSED" | "PLANNED";
  title: string;
  description?: string;
  plannedStartDate?: string;
  plannedStopDate?: string;
  created: string;
  updated?: string;
  affecteds?: Affected[];
}

export interface DisturbanceApiResponse {
  data: Disturbance[];
  message: string;
}
