import { PagedEvents, Event } from '@data-contracts/backend/data-contracts';

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
