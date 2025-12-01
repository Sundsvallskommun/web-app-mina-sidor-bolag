import { PagedEvents, Event } from '@data-contracts/backend/data-contracts';
import { Aggregation } from '@interfaces/measurement-data';

export interface EventData extends Omit<PagedEvents, 'content'> {
  content?: StructuredEvent[];
}

export interface StructuredEvent extends Omit<Event, 'metadata'> {
  exportName: string;
  metadata: StructuredMetaData;
}

export interface StructuredMetaData {
  expired: string;
  exportedByPartyId: string;
  ownerPartyId: string;
  facilities: MetaDataFacility[];
}

export interface MetaDataFacility {
  facilityId: string;
  address: string;
  aggregateOn: string;
  category: string;
  fromDate: string;
  toDate: string;
}

export interface createLogEventData {
  facilityId: string;
  facilityAddress: string;
  fromDate: string;
  toDate: string;
  category: string;
  aggregation: Aggregation;
  year?: string;
}
