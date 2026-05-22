export type Category =
  | 'COMMUNICATION'
  | 'DISTRICT_COOLING'
  | 'DISTRICT_HEATING'
  | 'ELECTRICITY'
  | 'ELECTRICITY_TRADE'
  | 'WASTE_MANAGEMENT'
  | 'WATER';

export interface AgreementResponse {
  agreementParties?: AgreementParty[];
}

export interface AgreementParty {
  customerId?: string;
  agreements?: Agreement[];
}

export interface Agreement {
  customerId: string;
  agreementId: string;
  billingId: string;
  category: Category;
  description: string;
  facilityId: string;
  mainAgreement: boolean;
  binding: boolean;
  bindingRule: string | null;
  placementStatus: string;
  netAreaId: string;
  siteAddress: string;
  production: boolean | null;
  fromDate: string;
  toDate: string;
  active: boolean;
  additionalAgreements?: Agreement[];
}

export interface MappedCategory {
  label: string;
  color: string;
  icon: string;
  code: string;
  contractor: string;
}

export interface RefinedAgreement extends Omit<Agreement, 'category'> {
  category: MappedCategory;
}

export interface AgreementData {
  [siteAddress: string]: RefinedAgreement[];
}

export interface PagingMetaData {
  page?: number;
  limit?: number;
  count?: number;
  totalRecords?: number;
  totalPages?: number;
}

export interface PagedAgreementsResponse {
  agreements: Agreement[];
  _meta: PagingMetaData;
}

export interface PagedAgreementsHandlerResult {
  agreements: AgreementData;
  _meta: PagingMetaData;
}
