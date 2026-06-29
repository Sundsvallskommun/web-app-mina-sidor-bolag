import { CustomerRelation } from '@data-contracts/customer/data-contracts';
import { FacilityAddress } from './facility-address';
import { InstalledBaseItem } from '@data-contracts/installedbase/data-contracts';
import { RepresentingMode } from '@interfaces/app';

export enum FeedbackLifespan {
  'untilRemoved' = 'untilRemoved',
  'twoWeeks' = 'twoWeeks',
  'oneMonth' = 'oneMonth',
}

export interface User {
  name: string;
  userSettings: {
    feedbackLifespan: FeedbackLifespan;
    readNotificationsClearedDate: string;
  };
  relations: { customerNumber: string; customerRelations: CustomerRelation[] };
  addresses: FacilityAddress[];
  facilities: (InstalledBaseItem & { isDelegated?: boolean })[];
  extendedView: boolean;
  isExtendingView: boolean;
}

export interface UserEngagement {
  userPersonNumber: string;
  userName: string;
  userPartyId: string;
  canRepresent: CanRepresent[];
}

export interface CanRepresent {
  name: string;
  representingNumber: string;
  representingMode: RepresentingMode;
}
