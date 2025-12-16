export interface BFUSCustomerIdsApiResponse {
  customerIds: number[];
  message: string;
}

export type PermissionStatusCategory = 'new' | 'ongoing' | 'denied' | 'ended' | 'revoked' | 'expired';

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

export interface EligablePartyPart {
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

export interface BFUSEligiblePartyPermissionsApiResponse {
  eligablePartyParts: EligablePartyPart[];
  message: string;
}
