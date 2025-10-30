import { CreateMandate, GranteeDetails } from '@/data-contracts/myrepresentatives/data-contracts';

export enum MandateStatus {
  Active = 'ACTIVE',
  Inactive = 'INACTIVE',
  Expired = 'EXPIRED',
  Deleted = 'DELETED',
}

export interface SignMandate extends Pick<CreateMandate, 'activeFrom' | 'inactiveAfter'> {
  /** Grantee id */
  granteeId: GranteeDetails['partyId'];
}
export interface SignMandateCache extends SignMandate {
  /** Grantor partyid */
  grantorId: string;
}
