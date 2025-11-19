import { CaseStatusResponse } from '@/data-contracts/casestatus/data-contracts';
import { CustomerRelation } from '@/data-contracts/customer/data-contracts';
import { Delegation, InstalledBaseItem } from '@/data-contracts/installedbase/data-contracts';
import { PersonEngagement } from '@/data-contracts/legalentity/data-contracts';
import { FacilityAddress } from '@/interfaces/facility-address.interface';
import { GrpCollectResponseWithRef, GrpInitiateResponseWithStartTime } from '@/interfaces/grp.interface';
import { SignMandateCache } from '@/interfaces/mandates.interface';
import { User } from '@/interfaces/users.interface';
import { RepresentingEntity } from '../interfaces/representing.interface';

declare module 'express-session' {
  interface Session {
    returnTo?: string;
    user?: User;
    representing?: RepresentingEntity;
    passport?: any;
    representingBusinessChoices?: PersonEngagement[];
    messages: string[];
    cache?: {
      partyId?: string;
      cases?: {
        PRIVATE?: CaseStatusResponse[];
        BUSINESS?: {
          [key: string]: CaseStatusResponse[];
        };
      };
      relations?: { customerNumber: string[]; customerRelations: CustomerRelation[] };
      addresses?: FacilityAddress[];
      facilities?: (InstalledBaseItem & { facilityOwnerPartyId?: string })[];
      delegations?: Delegation[];
    };
    signs: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      details: Record<string, any>;
      pending: Record<string, GrpInitiateResponseWithStartTime>;
      completed: Record<string, GrpCollectResponseWithRef>;
      mandates: Record<string, SignMandateCache>;
    };
  }
}
