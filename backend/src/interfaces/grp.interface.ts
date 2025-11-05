export enum GrpSubjectIdentifierType {
  Tin = 'TIN',
  Email = 'EMAIL',
}
export interface GrpSubjectIdentifier {
  /**
   * User unique identifier, like SSN.
   * For some eID provider it is always required, for others it is only required when eID is on another device
   */
  value: string;
  /**
   * Specifies subject identifier type.
   * Currently used are:
   * + "TIN" (personnummer)
   * + "EMAIL" - user e-mail address.
   */
  type: GrpSubjectIdentifierType;
}

export enum GrpUserMessageFormat {
  Plaintext = 'PLAIN_TEXT',
  Markdown = 'MARKDOWN',
  Html = 'HTML',
}

export interface GrpUserMessage {
  /**
   * Data to be signed, not displayed to user in the eID app.
   * Should be Base64 encoded.
   * Max length depends on the eID provider.
   * Example for BankID is 200 000 characters after Base64 encoding.
   */
  nonVisible?: string;
  /**
   * Text to be signed and displayed to user in the eID app.
   * Should be a Base64 encoded UTF-8 string.
   * Max length depends on the eID provider.
   * Example for BankID is 40 000 characters after Base64 encoding.
   */
  visible: string;
  /**
   * Format of the visible text, types available are: PLAIN_TEXT, MARKDOWN, HTML
   */
  format: GrpUserMessageFormat;
}

export interface GrpInitiateBody {
  subjectIdentifier?: GrpSubjectIdentifier;
  userMessage: GrpUserMessage;
}

export interface GrpInitiateParameters {
  /**
   * Relying parties identify themselves for the GRP API using the parameter "serviceId".
   * This is a value assigned by the GRP service operator when signing up.
   */
  serviceId: string;
  /**
   * The relying party selects eID provider using the argument "provider".
   * Examples are "bankid", "freja" and "nias"
   */
  provider: string;
  /**
   * Name of the certificate to be used by the IdP
   */
  displayName: string;
  /**
   * Which type of request, "AUTH" for authentication and "SIGN" for signing.
   * Defaults to AUTH if not specified.
   * @default AUTH
   */
  requestType?: 'AUTH' | 'SIGN';
  /**
   * A client provided random string unique for the specific authentication or sign request.
   * UUID format is recommended.
   * The same value is returned in the response and this is used for tracing and logging purposes.
   */
  transactionId: string;
  /**
   * IP-address of the end-user connected to the RP.
   */
  endUserInfo: string;
  /**
   * Only used for Freja Organisation ID.
   * Can be set to "ANY" to allow organisation IDs set by other Relying Parties.
   */
  orgIdIssuer?: string;
  /**
   * Indicate if the user or RP initiated the phone call.
   * Possible values are "USER" and "RP".
   *
   * NB: This must be present if flowType is set to "PHONE", as this is a required parameter for a BankID phone auth/sign request.
   * Otherwise it can be left out or with an empty value.
   */
  callInitiator?: 'USER' | 'RP';
  /**
   * Specify what type of flow the request is for.
   * Currently only supports one value "PHONE", used for BankID phone auth/sign.
   * Defaults to regular BankID auth/sign if not specified.
   *
   * NB: If this parameter is active and set to "PHONE", then it's required to also use the parameter "callInitiator".
   */
  flowType?: 'PHONE';
}

export interface GrpInitiateResponse {
  /**
   * An order reference that should be used in subsequent calls to the collect endpoint.
   */
  refId: string;
  /**
   * A unique token used by some providers to start the app on the same device.
   */
  autoStartToken: string;
  /**
   * A token used to compute the animated QR code, not used by all providers
   */
  qrStartToken: string;
  /**
   * A token used to compute the animated QR code, not used by all providers
   */
  qrStartSecret: string;
  /**
   * The same transactionId that was provided in the request, used for tracing and logging purposes.
   */
  transactionId: string;
}

export interface GrpCollectRequest {
  /**
   * The value received in Authenticate / Sign response.
   */
  refId: string;
  /**
   * A client provided random string unique for the specific authentication or sign request.
   * UUID format is recommended.
   * The same value is returned in the response and this is used for tracing and logging purposes.
   */
  transactionId: string;
}

export enum GrpStatus {
  Complete = 'COMPLETE',
  Failed = 'FAILED',
  Cancelled = 'CANCELLED',
  Pending = 'PENDING',
}

export interface GrpProgressStatus {
  /**
   * General status of the attempt.
   * Possible values: COMPLETE, FAILED, CANCELLED, PENDING
   */
  status: GrpStatus;
  /**
   * Status from the provider
   */
  substatus: string | null;
  /**
   * Status message from the provider
   */
  message: string;
}

export enum GrpValidationSignatureFormat {
  xmldsig = 'xmldsig',
  pkcs7 = 'pkcs7',
  jws = 'jws',
}

export interface GrpValidationInfo {
  /**
   * Base64 encoded signature in the format specified by "signatureFormat".
   */
  signature: string;
  /**
   * Current supported formats are:
   * + "xmldsig" - Standard XML based format used by BankID.
   * + "pkcs7" - PKCS#7, binary format used by NetID etc.
   * + "jws" - JSON Web Signature format used by Freja.
   */
  signatureFormat: GrpValidationSignatureFormat;
  /**
   * Base64 encoded OCSP response (not available for all providers).
   */
  ocspResponse?: string;
}

export interface GrpUserInfo {
  /**
   * Identifier of the subject
   */
  subjectIdentifier: GrpSubjectIdentifier;
  /**
   * User display name.
   * Used by some providers for given name + surname
   */
  displayName?: string;
  /**
   * User given name
   */
  givenName: string;
  /**
   * User surname
   */
  sn: string;
  /**
   * User TIN (personnummer)
   */
  tin: string;
  /**
   * IP address of the eID client
   */
  ipAddress: string;
}

export interface GrpCollectResponse {
  /**
   * Object with status of the order
   */
  progressStatus: GrpProgressStatus;
  /**
   * Key-value pairs with information from the certificate or sign/auth operation.
   */
  attributes?: Record<string, string> | null;
  /**
   * Basic information about the user
   */
  userInfo?: GrpUserInfo | null;
  /**
   * Information about the validation.
   *  May contain the actual signature and OCSP response from certificate validation.
   */
  validationInfo?: GrpValidationInfo | null;
  /**
   * The same transactionId that was provided in the request, used for tracing and logging purposes.
   */
  transactionId: string;
}

export interface GrpCancelRequest {
  /**
   * 	The value received in Authenticate / Sign response.
   */
  refId: string;
  /**
   * A client provided random string unique for the specific authentication or sign request.
   * UUID format is recommended.
   * The same value is returned in the response and this is used for tracing and logging purposes
   */
  transactionId: string;
}

export interface GrpCancelResponse {
  /**
   * Object with status of the order
   */
  status: Pick<GrpProgressStatus, 'status'>;
  /**
   * 	The same transactionId that was provided in the request, used for tracing and logging purposes.
   */
  transactionId: string;
}

export type GrpInitiateResponseWithStartTime = GrpInitiateResponse & { startTime: number };

export interface QrCode {
  qrCode?: string;
}

export interface GrpCollectResponseWithRef extends GrpCollectResponse {
  refId: string;
}
