import { PermissionStatusCategory } from '@/utils/bfus-permission-status-code-helpers';

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

export interface BFUSEligablePartyResponse {
  Header: BFUSEligablePartyHeader;
  Content: BFUSEligablePartyContent;
}

export interface BFUSEligablePartyHeader {
  ErrorInformation: string | null;
  ObjectVersion: number;
  Success: boolean;
  PerformanceTime: string;
  InParameters: string[];
}

export interface BFUSEligablePartyContent {
  EligablePartyParts: BFUSEligablePartyPart[];
}

export interface BFUSEligablePartyPart {
  EnergyServiceParty: string;
  LastDayToApprove: string;
  ContractReference: string;
  UserHandledTime: string | null;
  PermissionId: string;
  StartDay: string;
  EndDay: string | null;
  UserRevokedContractTime: string | null;
  EndReason: BFUSEndReason;
  RequestPurpose: string;
  ContractInUse: boolean;
  ContractId: number;
  Status: string;
  EligablePartyPermissionId: number;
  CustomerId: number;
  ServiceIdentifier: string;
  UsePlaceAddress: string;
  EligablePartyId: string;
  StatusCode: BFUSStatusCode;
  IsProduction: boolean;
  ObjectVersion: number;
  StatusCategory: PermissionStatusCategory;
}

export interface BFUSEligablePartyPermissionResponse {
  Header: {
    ErrorInformation: string | null;
    ObjectVersion: number;
    Success: boolean;
    PerformanceTime: string;
    InParameters: string | null;
  };
  Content: {
    EligablePartyId: string;
    Action: string;
    PermissionRequestExecuted: boolean;
  };
}

export interface BFUSHasNewPermissionResponse {
  Header: {
    ErrorInformation: string | null;
    ObjectVersion: number;
    Success: boolean;
    PerformanceTime: string;
    InParameters: string | null;
  };
  Content: {
    NewPermissions: NewPermissionsResponseObject;
  };
}

export interface NewPermissionsResponseObject {
  HasPermissions: boolean;
  ObjectVersion: number;
}

export enum BFUSStatusCode {
  New = 0,
  Active = 1,
  Denied = 2,
  Ended = 3,
}

export enum BFUSEndReason {
  Revoked = 'Återkallat',
  Expired = 'Upphört',
  Dismissed = 'Uppsagt',
}
