export interface BFUSCustomerIdsApiResponse {
  data: { customerIds: number[] };
  message: string;
}

export type ConsentStatusCategory = 'new' | 'ongoing' | 'denied' | 'ended' | 'revoked' | 'expired';

export enum ConsentStatusCode {
  New = 0,
  Active = 1,
  Denied = 2,
  Ended = 3,
}

export enum BFUSConsentEndReason {
  Revoked = 'Återkallat av kund',
  Expired = 'Upphört',
  Dismissed = 'Uppsagt',
}

export interface Consent {
  EnergyServiceParty: string;
  LastDayToApprove: string;
  ContractReference: string;
  UserHandledTime: string | null;
  PermissionId: string | null;
  StartDay: string;
  EndDay: string | null;
  UserRevokedContractTime: string | null;
  EndReason: BFUSConsentEndReason | null;
  RequestPurpose: string;
  ContractInUse: boolean;
  ContractId: number;
  Status: string | null;
  EligablePartyPermissionId: number;
  CustomerId: number;
  ServiceIdentifier: string;
  UsePlaceAddress: string;
  EligablePartyId: string;
  StatusCode: ConsentStatusCode;
  IsProduction: boolean;
  ObjectVersion: number;
  StatusCategory: ConsentStatusCategory;
}

export interface BFUSConsentsApiResponse {
  data: { consents: Consent[] };
  message: string;
}

export interface ConsentRequestDto {
  PermissionRequest: { ContractIdList?: number[]; EligablePartyId: string; CustomerId?: number };
}

export interface FullConsentDto {
  Header: { ExternalId: string; Operation: 'grant' | 'deny' | 'revoke' };
  PermissionRequest: { EligablePartyId: string; ContractIdList?: number[]; CustomerId?: number };
}
