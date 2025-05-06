import { CustomerRelation } from "@data-contracts/customer/data-contracts";
import { FacilityAddress } from "./facility-address";

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
  relations: CustomerRelation[];
  addresses: FacilityAddress[];
}
