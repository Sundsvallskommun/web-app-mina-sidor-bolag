import { Engagement } from '@/data-contracts/businessengagements/data-contracts';
import { User } from '@/interfaces/users.interface';
import { RepresentingEntity } from '../interfaces/representing.interface';
import { CaseStatusResponse } from '@/data-contracts/casestatus/data-contracts';
import { CustomerRelation } from '@/data-contracts/customer/data-contracts';
import { Delegation, InstalledBaseItem } from '@/data-contracts/installedbase/data-contracts';
import { FacilityAddress } from '@/interfaces/facility-address.interface';

declare module 'express-session' {
  interface Session {
    returnTo?: string;
    user?: User;
    representing?: RepresentingEntity;
    passport?: any;
    representingBusinessChoices?: Engagement[];
    messages: string[];
    cache?: {
      partyId?: string;
      cases?: {
        PRIVATE?: CaseStatusResponse[];
        BUSINESS?: {
          [key: string]: CaseStatusResponse[];
        };
      };
      relations?: CustomerRelation[];
      addresses?: FacilityAddress[];
      facilities?: InstalledBaseItem[];
      delegations?: Delegation[];
    };
  }
}
