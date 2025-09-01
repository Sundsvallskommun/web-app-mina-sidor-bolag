import { Delegation } from '@/data-contracts/installedbase/data-contracts';

export interface ResolvedFacilityDelegation extends Delegation {
  delegatedToName: string;
  delegatedToBirthDate: string;
}
