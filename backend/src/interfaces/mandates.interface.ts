import { CreateMandate, GranteeDetails, GrantorDetails } from '@/data-contracts/myrepresentatives/data-contracts';

export enum MandateStatus {
  Active = 'ACTIVE',
  Inactive = 'INACTIVE',
  Expired = 'EXPIRED',
  Deleted = 'DELETED',
}

export interface SignMandate extends Pick<CreateMandate, 'activeFrom' | 'inactiveAfter'> {
  /** GrantorDetails model */
  grantorId: GrantorDetails['grantorPartyId'];
  /** GranteeDetails model */
  granteeId: GranteeDetails['partyId'];
}
