import { User } from '@interfaces/users.interface';
import { Request } from 'express';
import { RepresentingEntity } from './representing.interface';
import { FacilityAddress } from './facility-address.interface';
import { CustomerRelation } from '@/data-contracts/customer/data-contracts';
import { CaseStatusResponse } from '@/data-contracts/casestatus/data-contracts';
import { InstalledBaseItem } from '@/data-contracts/installedbase/data-contracts';

export interface DataStoredInToken {
  id: number;
}

export interface TokenData {
  token: string;
  expiresIn: number;
}

export interface RequestWithUser extends Request {
  user: User;
  representing?: RepresentingEntity;
  cache?: {
    cases?: {
      PRIVATE?: CaseStatusResponse[];
      BUSINESS?: {
        [key: string]: CaseStatusResponse[];
      };
    };
    relations?: CustomerRelation[];
    addresses?: FacilityAddress[];
    facilities?: InstalledBaseItem[];
  };
}
