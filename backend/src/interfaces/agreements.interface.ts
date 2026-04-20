import { Agreement, PagingMetaData } from '@/data-contracts/agreement/data-contracts';

export interface PagedAgreementsResult {
  agreements: Agreement[];
  _meta: PagingMetaData;
}
