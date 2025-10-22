import { Engagement } from '@/data-contracts/businessengagements/data-contracts';
import { CaseStatusResponse } from '@/data-contracts/casestatus/data-contracts';
import { CustomerRelation } from '@/data-contracts/customer/data-contracts';
import { Delegation, InstalledBaseItem } from '@/data-contracts/installedbase/data-contracts';
import { CreateMandate } from '@/data-contracts/myrepresentatives/data-contracts';
import { SignCollectResponse, SignResponseWithStartTime } from '@/interfaces/bankid.interface';
import { FacilityAddress } from '@/interfaces/facility-address.interface';
import { User } from '@/interfaces/users.interface';
import { RepresentingEntity } from '../interfaces/representing.interface';
import { SignMandate } from '@/interfaces/mandates.interface';

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
    signs: {
      // eslint-disable-next-line no-explicit-any
      details: Record<string, any>;
      pending: Record<string, SignResponseWithStartTime>;
      completed: Record<string, SignCollectResponse>;
      mandates: Record<string, SignMandate>;
    };
  }
}
