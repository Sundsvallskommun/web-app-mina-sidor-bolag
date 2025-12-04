export interface BFUSCustomerResponse {
  Header: BFUSCustomerHeader;
  Content: BFUSCustomerContent;
}

export interface BFUSCustomerHeader {
  ErrorInformation: string | null;
  ObjectVersion: number;
  Success: boolean;
  PerformanceTime: string;
  InParameters: BFUSCustomerInParameter[];
}

export interface BFUSCustomerInParameter {
  ObjectVersion: number;
  Parameter: string;
  Value: string;
}

export interface BFUSCustomerContent {
  Customer: BFUSCustomer;
}

export interface BFUSCustomer {
  CustomerId: number;
  CustomerCode: string;
  FirstName: string;
  LastName: string;
  PinCode: string;
  CompanyCode: string | null;
  IsPrivatePerson: boolean;
  IsPrivateCompany: boolean;
  IsProspect: boolean;
  IsInactive: boolean;
  Deceased: boolean;
  PostCareOfName: string | null;
  PostStreetName: string | null;
  PostStreetQualifier: string | null;
  PostStreetNumberSuffix: string | null;
  PostApartmentNumber: string | null;
  PostFloorNumber: string | null;
  PostZipCode: string | null;
  PostCity: string | null;
  PostCountryName: string | null;
  InvoiceCareOfName: string | null;
  InvoiceStreetName: string | null;
  InvoiceStreetQualifier: string | null;
  InvoiceStreetNumberSuffix: string | null;
  InvoiceApartmentNumber: string | null;
  InvoiceFloorNumber: string | null;
  InvoiceZipCode: string | null;
  InvoiceCity: string | null;
  InvoiceCountryName: string | null;
  HomePhoneNumber: string | null;
  BusinessPhoneNumber: string | null;
  MobilePhoneNumber: string | null;
  Extra1PhoneNumber: string | null;
  Extra2PhoneNumber: string | null;
  AcceptsEmail: boolean;
  AcceptsSMS: boolean;
  MarketingBan: boolean;
  InformationBan: boolean;
  Email1: string | null;
  Email2: string | null;
  Email3: string | null;
  BusinessUnitId: number;
  BusinessUnitExternalReferenceCode: number;
  ContactPersons: string[] | null;
  ObjectVersion: number;
}
