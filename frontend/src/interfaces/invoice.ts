import { CustomerInvoice } from '@data-contracts/backend/data-contracts';
import React, { ReactNode, RefObject } from 'react';
import { RepresentingMode } from '@interfaces/app';

export interface IInvoice extends Omit<CustomerInvoice, 'invoiceStatus'> {
  invoiceStatus: { code: InvoiceStatus; color: string; label: string };
}

export interface InvoicesData {
  invoices: IInvoice[];
  labels: { label: string; screenReaderOnly: boolean; sortable: boolean }[];
  totalCount: number;
}

export type InvoiceStatus =
  | 'PAID'
  | 'SENT'
  | 'PARTIALLY_PAID'
  | 'DEBT_COLLECTION'
  | 'PAID_TOO_MUCH'
  | 'REMINDER'
  | 'VOID'
  | 'CREDITED'
  | 'WRITTEN_OFF'
  | 'UNKNOWN';

export interface InvoicePdfData {
  data: string;
  error?: boolean;
}

export interface InvoiceBaseProps {
  data: InvoicesData;
  isFetched: boolean;
  activePage: number;
  setActivePage: React.Dispatch<React.SetStateAction<number>>;
  previousActivePage: RefObject<number>;
  previousFacilityIds: RefObject<string[] | undefined>;
  representingModeChanged: boolean;
  facilityIds?: string[];
  emptyComponent?: ReactNode;
  representingMode: RepresentingMode;
  representingName: string | undefined;
}

export interface InvoiceTableProps extends InvoiceBaseProps {
  pageSize: number;
  previousRepresentingMode: RefObject<RepresentingMode | undefined>;
}
