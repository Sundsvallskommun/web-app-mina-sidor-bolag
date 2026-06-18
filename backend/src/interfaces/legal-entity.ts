import { LegalEntity2 } from '@/data-contracts/legalentity/data-contracts';

export type ClientBusinessInformation = Pick<LegalEntity2, 'address'>;
export interface BusinessInformation extends ClientBusinessInformation {
  partyId: string;
}
