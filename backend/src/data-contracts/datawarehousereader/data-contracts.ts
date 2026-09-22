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

/** The sort order direction */
export enum Direction {
  ASC = "ASC",
  DESC = "DESC",
}

/** Customer type */
export enum CustomerType {
  Enterprise = "Enterprise",
  Private = "Private",
}

/** Display mode for aggregated series */
export enum Display {
  AGGREGATE = "AGGREGATE",
  ONLYAGGREGATED = "ONLYAGGREGATED",
}

/** Data point aggregation granularity */
export enum Aggregation {
  QUARTER = "QUARTER",
  HOUR = "HOUR",
  DAY = "DAY",
  MONTH = "MONTH",
}

/** Category */
export enum Category {
  COMMUNICATION = "COMMUNICATION",
  DISTRICT_COOLING = "DISTRICT_COOLING",
  DISTRICT_HEATING = "DISTRICT_HEATING",
  ELECTRICITY = "ELECTRICITY",
  ELECTRICITY_TRADE = "ELECTRICITY_TRADE",
  WASTE_MANAGEMENT = "WASTE_MANAGEMENT",
  WATER = "WATER",
}

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
  causeAsProblem?: ThrowableProblem;
  detail?: string;
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

/** Measurement model */
export interface Measurement {
  /** Unique identifier for the measurement */
  uuid?: string;
  /** Customer organization identifier */
  customerOrgId?: string;
  /** Facility identifier */
  facilityId?: string;
  /** Type of feed */
  feedType?: string;
  /** Measurement unit */
  unit?: string;
  /** Usage value */
  usage?: number;
  /**
   * Interpolation value indicating data quality
   * @format int32
   */
  interpolation?: number;
  /**
   * Date and time of the measurement
   * @format date-time
   */
  dateAndTime?: string;
}

/** Invoice model */
export interface Invoice {
  /** Customer number */
  customerNumber?: string;
  /** Customer type */
  customerType?: CustomerType;
  /**
   * List of facility ids
   * @uniqueItems true
   */
  facilityIds?: string[];
  /**
   * List of descriptions
   * @uniqueItems true
   */
  invoiceDescriptions?: string[];
  /**
   * Invoice number
   * @format int64
   */
  invoiceNumber?: number;
  /**
   * Invoice date
   * @format date
   */
  invoiceDate?: string;
  /** invoice name */
  invoiceName?: string;
  /** Invoice type */
  invoiceType?: string;
  /** Invoice status */
  invoiceStatus?: string;
  /**
   * Ocr number
   * @format int64
   */
  ocrNumber?: number;
  /**
   * Due date
   * @format date
   */
  dueDate?: string;
  /** Total amount */
  totalAmount?: number;
  /** Amount included VAT */
  amountVatIncluded?: number;
  /** Amount excluded VAT */
  amountVatExcluded?: number;
  /** Amount eligible for VAT */
  vatEligibleAmount?: number;
  /** Rounding */
  rounding?: number;
  /** VAT */
  vat?: number;
  /** Reversed VAT */
  reversedVat?: boolean;
  /** Currency */
  currency?: string;
  /** Organization group */
  organizationGroup?: string;
  /** Organization number of invoice issuer */
  organizationNumber?: string;
  /** Adminstration */
  administration?: string;
  /** Street */
  street?: string;
  /** Postal code */
  postCode?: string;
  /** City */
  city?: string;
  /** Care of address */
  careOf?: string;
  /** Is pdf-version of invoice available */
  pdfAvailable?: boolean;
}

/** Invoice response model */
export interface InvoiceResponse {
  invoices?: Invoice[];
  /** PagingAndSortingMetaData model */
  _meta?: PagingAndSortingMetaData;
}

/** PagingAndSortingMetaData model */
export interface PagingAndSortingMetaData {
  /**
   * Current page
   * @format int32
   */
  page?: number;
  /**
   * Displayed objects per page
   * @format int32
   */
  limit?: number;
  /**
   * Displayed objects on current page
   * @format int32
   */
  count?: number;
  /**
   * Total amount of hits based on provided search parameters
   * @format int64
   */
  totalRecords?: number;
  /**
   * Total amount of pages based on provided search parameters
   * @format int32
   */
  totalPages?: number;
  sortBy?: string[];
  /** The sort order direction */
  sortDirection?: Direction;
}

/** Invoice detail model */
export interface InvoiceDetail {
  /**
   * Invoice number
   * @format int64
   */
  invoiceNumber?: number;
  /** Amount */
  amount?: number;
  /** Amount excluded VAT */
  amountVatExcluded?: number;
  /** VAT */
  vat?: number;
  /**
   * VAT rate
   * @format double
   */
  vatRate?: number;
  /**
   * Quantity
   * @format double
   */
  quantity?: number;
  /** Unit */
  unit?: string;
  /** Price per unit */
  unitPrice?: number;
  /** Price per unit excluded VAT */
  unitPriceVatExcluded?: number;
  /** Price per unit as presented on the invoice, expressed in the currency and unit given by invoiceUnitPriceCurrency and invoiceUnitPriceUnit */
  invoiceUnitPrice?: number;
  /** Price per unit excluded VAT as presented on the invoice, expressed in the currency and unit given by invoiceUnitPriceCurrency and invoiceUnitPriceUnit */
  invoiceUnitPriceVatExcluded?: number;
  /** Currency that the invoice unit prices are expressed in */
  invoiceUnitPriceCurrency?: string;
  /** Unit that the invoice unit prices are expressed per */
  invoiceUnitPriceUnit?: string;
  /** Period from */
  periodFrom?: string;
  /** Period to */
  periodTo?: string;
  /** Description */
  description?: string;
  /**
   * Product code
   * @format int32
   */
  productCode?: number;
  /** Product name */
  productName?: string;
  /** Organization number of invoice issuer */
  organizationNumber?: string;
  /** Administration */
  administration?: string;
  /** Facility id */
  facilityId?: string;
}

/** Customer invoice model */
export interface CustomerInvoice {
  /** Customer number */
  customerNumber?: string;
  /** Customer type */
  customerType?: CustomerType;
  /** List of facility ids */
  facilityIds?: string[];
  /**
   * Invoice number
   * @format int64
   */
  invoiceNumber?: number;
  /**
   * Invoice id
   * @format int64
   */
  invoiceId?: number;
  /**
   * Joint invoice id
   * @format int64
   */
  jointInvoiceId?: number;
  /**
   * Invoice date
   * @format date
   */
  invoiceDate?: string;
  /** Invoice name */
  invoiceName?: string;
  /** Invoice type */
  invoiceType?: string;
  /** Invoice description */
  invoiceDescription?: string;
  /** Invoice status */
  invoiceStatus?: string;
  /**
   * OCR number
   * @format int64
   */
  ocrNumber?: number;
  /**
   * Due date
   * @format date
   */
  dueDate?: string;
  /**
   * Invoice period start
   * @format date
   */
  periodFrom?: string;
  /**
   * Invoice period end
   * @format date
   */
  periodTo?: string;
  /** Total amount */
  totalAmount?: number;
  /** Amount included VAT */
  amountVatIncluded?: number;
  /** Amount excluded VAT */
  amountVatExcluded?: number;
  /** Amount eligible for VAT */
  vatEligibleAmount?: number;
  /** Rounding */
  rounding?: number;
  /** Organization group */
  organizationGroup?: string;
  /** Organization number of invoice issuer */
  organizationNumber?: string;
  /** Administration */
  administration?: string;
  /** Street */
  street?: string;
  /** Postal code */
  postCode?: string;
  /** City */
  city?: string;
  /** Care of address */
  careOf?: string;
  /** Invoice reference */
  invoiceReference?: string;
  /** Is pdf-version of invoice available */
  pdfAvailable?: boolean;
  details?: InvoiceDetail[];
}

/** Customer invoice response model */
export interface CustomerInvoiceResponse {
  invoices?: CustomerInvoice[];
  /** PagingAndSortingMetaData model */
  _meta?: PagingAndSortingMetaData;
}

/** Installed base item model */
export interface InstalledBaseItem {
  /** Company */
  company?: string;
  /** Customer number */
  customerNumber?: string;
  /** Type */
  type?: string;
  /** Facility id */
  facilityId?: string;
  /**
   * Placement id
   * @format int32
   */
  placementId?: number;
  /** Care of address */
  careOf?: string;
  /** Street */
  street?: string;
  /** Postal code */
  postCode?: string;
  /** City */
  city?: string;
  /** Property designation */
  propertyDesignation?: string;
  /**
   * From date
   * @format date
   */
  dateFrom?: string;
  /**
   * To date
   * @format date
   */
  dateTo?: string;
  /**
   * Date when object was last modified (or null if never modified)
   * @format date
   */
  dateLastModified?: string;
  /** @maxItems 1000 */
  metaData?: InstalledBaseItemMetaData[];
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
  installedBase?: InstalledBaseItem[];
  /** PagingAndSortingMetaData model */
  _meta?: PagingAndSortingMetaData;
}

/** Installation details model */
export interface InstallationDetails {
  /** Company */
  company?: string;
  /** Type */
  type?: string;
  /** Facility id */
  facilityId?: string;
  /**
   * Placement id
   * @format int32
   */
  placementId?: number;
  /** Care of address */
  careOf?: string;
  /** Street */
  street?: string;
  /** Post code */
  postCode?: string;
  /** City */
  city?: string;
  /** Property designation */
  propertyDesignation?: string;
  /**
   * From date
   * @format date
   */
  dateFrom?: string;
  /**
   * To date
   * @format date
   */
  dateTo?: string;
  /**
   * Date when object was last modified (or null if never modified)
   * @format date
   */
  dateLastModified?: string;
  /** @maxItems 1000 */
  metaData?: InstallationMetaData[];
}

export interface InstallationDetailsResponse {
  installationDetails?: InstallationDetails[];
  /** PagingAndSortingMetaData model */
  _meta?: PagingAndSortingMetaData;
}

/** Installation metadata model */
export interface InstallationMetaData {
  /** Key */
  key?: string;
  /** Value */
  value?: string;
  /** Type */
  type?: string;
  /** Displayname */
  displayName?: string;
}

/** Customer engagement model */
export interface CustomerEngagement {
  /** PartyId (e.g. a personId or an organizationId) */
  partyId?: string;
  /** Customer type */
  customerType?: CustomerType;
  /** Customer number */
  customerNumber?: string;
  /** Organization number for counterpart of engagement */
  organizationNumber?: string;
  /** Organization name for counterpart of engagement */
  organizationName?: string;
  /** Indicates customer status, if not active then the moveInDate holds information on when the customer will be activated */
  active?: boolean;
  /**
   * The prospective customer's move-in date
   * @format date
   */
  moveInDate?: string;
}

/** Customer engagement response model */
export interface CustomerEngagementResponse {
  customerEngagements?: CustomerEngagement[];
  /** PagingAndSortingMetaData model */
  _meta?: PagingAndSortingMetaData;
}

/** Customer details model */
export interface CustomerDetails {
  /** Company with which the customer has an engagement (organization number) */
  customerEngagementOrgId?: string;
  /** Name of the company the customer has an engagement with */
  customerEngagementOrgName?: string;
  /** PartyId (e.g. a personId or an organizationId) */
  partyId?: string;
  /** Customer number */
  customerNumber?: string;
  /** Customer name */
  customerName?: string;
  /** Street */
  street?: string;
  /** Postal code */
  postalCode?: string;
  /** City */
  city?: string;
  /** Care of address */
  careOf?: string;
  phoneNumbers?: string[];
  emails?: string[];
  /**
   * Customer category ID
   * @format int32
   */
  customerCategoryID?: number;
  /** Customer category description */
  customerCategoryDescription?: string;
  /** Indicates if customer details have changed since the search date */
  customerChangedFlg?: boolean;
  /** Indicates if placement and/or equipment details have changed since the search date */
  installedChangedFlg?: boolean;
  /** Indicates customer status, if not active then the moveInDate holds information on when the customer will be activated */
  active?: boolean;
  /**
   * The prospective customer's move-in date
   * @format date
   */
  moveInDate?: string;
}

/** Customer details response model */
export interface CustomerDetailsResponse {
  customerDetails?: CustomerDetails[];
  /** PagingAndSortingMetaData model */
  _meta?: PagingAndSortingMetaData;
}

/** Agreement model */
export interface Agreement {
  /** PartyId (e.g. a personId or an organizationId) */
  partyId?: string;
  /** Customer number */
  customerNumber?: string;
  /** Facility Id */
  facilityId?: string;
  /** Category */
  category?: Category;
  /** Billing Id */
  billingId?: string;
  /** Agreement Id */
  agreementId?: string;
  /** Description */
  description?: string;
  /** Shows if agreement is a main-agreement or not */
  mainAgreement?: boolean;
  /** Shows if agreement include binding or not */
  binding?: boolean;
  /** Rule of binding if exists */
  bindingRule?: string;
  /** Placement status for agreement */
  placementStatus?: string;
  /** Net area id for agreement */
  netAreaId?: string;
  /** Site address connected to the agreement */
  siteAddress?: string;
  /** Signal if the agreement is a production agreement or not (can be null if not applicable) */
  production?: boolean;
  /**
   * From-date in validity of agreement
   * @format date
   */
  fromDate?: string;
  /**
   * To-date in validity of agreement
   * @format date
   */
  toDate?: string;
  /** Shows if agreement is active ('fromDate' <= today and 'toDate' => today) */
  active?: boolean;
}

/** Agreement response model */
export interface AgreementResponse {
  agreements?: Agreement[];
  /** PagingAndSortingMetaData model */
  _meta?: PagingAndSortingMetaData;
}
