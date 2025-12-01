import { Aggregation } from '@/data-contracts/measurementdata/data-contracts';

export interface createLogEventData {
  facilityId: string;
  facilityAddress: string;
  fromDate: string;
  toDate: string;
  category: string;
  aggregation: Aggregation;
  year?: number;
}
