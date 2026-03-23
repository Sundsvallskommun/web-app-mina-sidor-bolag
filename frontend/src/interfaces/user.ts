import { CustomerRelation } from '@data-contracts/customer/data-contracts';
import { FacilityAddress } from './facility-address';
import { InstalledBaseItem } from '@data-contracts/installedbase/data-contracts';

export enum FeedbackLifespan {
  'untilRemoved' = 'untilRemoved',
  'twoWeeks' = 'twoWeeks',
  'oneMonth' = 'oneMonth',
}
export interface OverviewFormModel {
  feedbackLifespan: FeedbackLifespan;
}

export const defaultOverviewsSettings: OverviewFormModel = {
  feedbackLifespan: FeedbackLifespan.oneMonth,
};
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
}
