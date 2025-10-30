export interface SignBody {
  /**
   * The user IP address as it is seen by your service.
   * IPv4 and IPv6 are allowed.
   * Make sure that the IP address you include as endUserIp is the address of your end user's device, not the internal address of any reverse proxy between you and the end user.
   * In use cases where the IP address is not available, e. g. for voice-based services, the internal representation of those systems' IP address is ok to use.
   */
  endUserIp: string;
  /**
   * If this is set to true a risk indicator will be included in the collect response when the order completes. The risk indication requires that the endUserIp is correct.
   */
  returnRisk?: boolean;
  /**
   * Orders started on the same device as where the user's BankID is stored (started with autostart token) will call this URL when the order is completed.
   */
  returnUrl?: string;
  /**
   * Data that you wish to include but not display to the user.
   * The value must be base 64-encoded.
   */
  userNonVisibleData?: string;
  /**
   * Text displayed to the user during the order.
   * The purpose is to provide context, thereby enabling the user to detect identification errors and avert fraud attempts.
   */
  userVisibleData: string;
  /**
   * plaintext: userVisibleData contains base 64 encoded text using a sub-set of UTF-8 and CR, LF or CRLF for line breaks.
   * simpleMarkdownV1: userVisibleData contains Simple Markdown version 1.
   */
  userVisibleDataFormat?: UserVisibleDataFormat;
  /**
   * Additional data included when creating an order from your web page.
   * When starting an order from your web page this data may be included in the request.
   */
  web?: SignWeb;
  /**
   * Requirements on how the signature order must be performed.
   */
  requirement?: SignRequirement;
}

export enum UserVisibleDataFormat {
  Plaintext = 'plaintext',
  SimpleMarkdownV1 = 'simpleMarkdownV1',
}

export interface SignWeb {
  deviceIdentifier?: string;
  referringDomain?: string;
  userAgent?: string;
}

export interface SignRequirement {
  /**
   * Whether the user needs to complete the order using a card reader for the signature.
   * class1: The order must be confirmed with a card reader where the PIN code is entered on a computer keyboard, or a card reader of higher class.
   * class2: The order must be confirmed with a card reader where the PIN code is entered on the reader.
   */
  cardReader?: 'class1' | 'class2';
  /**
   * The OID in certificate policies in the user certificate.
   * One wildcard is allowed from position 5 and forward ("1.2.752.78.*").
   *
   * Available values for production BankIDs are:
   * "1.2.752.78.1.1" - BankID on file
   * "1.2.752.78.1.2" - BankID on card
   * "1.2.752.78.1.5" - Mobile BankID
   *
   * Available values for test BankIDs are:
   * "1.2.3.4.5" - BankID on file
   * "1.2.3.4.10" - BankID on card
   * "1.2.3.4.25" - Mobile BankID
   * "1.2.752.60.1.6" - Test BankID for some BankID banks
   *
   * When using one of the BankID on card policies, the cardReader requirement can be used to further restrict the type of card reader allowed. If no cardReader requirement is passed, all supported kinds of card readers are permitted.
   */
  certificatePolicies?: string[];
  /**
   * Whether the user needs to confirm their identity with a valid Swedish passport or national ID card to complete the order.
   */
  mrtd?: boolean;
  /**
   * The personal identity number allowed to confirm the identification.
   * If a BankID with another personal identity number attempts to confirm the identification, it will fail.
   */
  personalNumber?: string;
  /**
   * Users are required to confirm the order with their security code even if they have biometrics activated.
   */
  pinCode?: boolean;
}

export interface SignResponse {
  /**
   * A reference ID for an order.
   * This is used to query the status of the order or to cancel it.
   */
  orderRef: string;
  /**
   * Used to compile the start URL.
   */
  autoStartToken: string;
  /**
   * Used to compute the animated QR code.
   */
  qrStartToken: string;
  /**
   * Used to compute the animated QR code.
   */
  qrStartSecret: string;
}

export type SignResponseWithStartTime = SignResponse & { startTime: number };
export interface SignCompletionData {
  /**
   * Information related to the user.
   */
  user: SignCompletionDataUser;
  /**
   * Information related to the device.
   */
  device: SignCompletionDataDevice;
  /**
   * Information about additional verifications that were part of the order.
   */
  stepUp: SignCompletionDataStepUp;
  /**
   * The date the BankID was issued to the user.
   * The issue date is expressed using ISO 8601 date format with a UTC time zone offset.
   */
  bankIdIssueDate?: string;
  /**
   * The signature that is the result of the order.
   * This is a base 64 encoded XML signature string.
   */
  signature: string;
  /**
   * The OCSP response.
   * This is a base 64 encoded OCSP response.
   *
   * The OCSP response is signed by a certificate that has the same issuer as the certificate being verified, and it has a nonce extension. The nonce is calculated as:
   * - SHA-1 hash over the base 64 XML signature encoded as UTF-8.
   * - 12 random bytes added after the hash.
   * The nonce is 32 bytes (20 + 12).
   */
  ocspResponse: string;
  /**
   * Indicates the risk level of the order based on data available in the order.
   * The possible values have the following meaning:
   * - low: No or low risk identified in the available order data.
   * - moderate: Might require further action, investigation or follow-up by you based on the order data.
   * - high: The order should be blocked or cancelled by you and needs further action, investigation or follow-up. This value will only be returned if you have requested to have the risk assement to be provided, but not supplied a risk condition.
   * This is only returned if requested in the order, and it may be absent if the risk could not be calculated.
   *
   * If you have sent the correct endUserIp and additional data, a risk indication with the value "high" means there are signs of the channel binding being compromised, or other highly concerning circumstances.
   */
  risk?: SignRisk;
}

export interface SignCompletionDataUser {
  /**
   * The ID number of the user.
   * The ID number is a Swedish national identification number (12 digits).
   */
  personalNumber: string;
  /**
   * The first and last name of the user.
   */
  name: string;
  /**
   * The first name of the user.
   */
  givenName: string;
  /**
   * The surname of the user.
   */
  surname: string;
}
export interface SignCompletionDataDevice {
  /**
   * The IP address of the user agent as the BankID server sees it.
   * When an order is started with autoStartToken you can check that it matches the IP you service observes to ensure session fixation.
   */
  ipAddress: string;
  /**
   * Unique hardware identifier for the user's device.
   */
  uhi: string;
}

export interface SignCompletionDataStepUp {
  /**
   * Whether an MRTD check was performed before the order was completed.
   */
  mrtd: boolean;
}

export enum SignRisk {
  Low = 'low',
  Moderate = 'moderate',
  High = 'high',
}
export interface SignCancelBody {
  /**
   * A reference ID for an order.
   * This is used to query the status of the order or to cancel it.
   */
  orderRef: string;
}

export interface SignCollectBody {
  /**
   * A reference ID for an order.
   * This is used to query the status of the order or to cancel it.
   */
  orderRef: string;
}

export interface SignCollectResponse {
  /**
   * A reference ID for an order.
   * This is used to query the status of the order or to cancel it.
   */
  orderRef: string;
  /**
   * The current status of the order.
   */
  status: SignStatus;
  /**
   * When an order is pending, you should use the hintCode to provide the user with details and instructions and keep calling collect until order fails or is complete.
   */
  hintCode?: string;
  /**
   * Information about the user and the completed order.
   * The user has completed the order. completionData includes the signature, user information and the OCSP response. You should verify user information to proceed. You should retain completion data for future reference, compliance and audit purposes.
   */
  completionData?: SignCompletionData;
}

export enum SignStatus {
  Pending = 'pending',
  Failed = 'failed',
  Completed = 'complete',
}

export interface QrCode {
  qrCode?: string;
}
