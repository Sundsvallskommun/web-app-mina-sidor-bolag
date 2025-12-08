import { Invoice } from '@data-contracts/invoices/data-contracts';
import { ApiResponseMeta } from './service';
import React, { ReactNode, RefObject } from 'react';
import { RepresentingMode } from '@interfaces/app';

export interface IInvoice extends Omit<Invoice, 'invoiceStatus'> {
  invoiceStatus: { code: InvoiceStatus; color: string; label: string };
}

export interface InvoicesData {
  invoices: IInvoice[];
  labels: { label: string; screenReaderOnly: boolean; sortable: boolean }[];
  totalCount: number;
}

export interface InvoicesResponse {
  invoices: InvoicesResponseData[];
  _meta: ApiResponseMeta;
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

export interface InvoicesResponseData {
  dueDate: string;
  totalAmount: number;
  amountVatIncluded: number;
  amountVatExcluded: number;
  vatEligibleAmount: number;
  rounding: number;
  vat: number;
  reversedVat: boolean;
  pdfAvailable: boolean;
  currency: string;
  invoiceDate: string;
  fromDate: string;
  toDate: string;
  invoiceNumber: string;
  invoiceStatus: InvoiceStatus;
  ocrNumber: string;
  organizationNumber: string;
  invoiceName: string;
  invoiceType: string;
  invoiceDescription: string;
  invoiceAddress: InvoiceAddress;
  facilityId: string;
  invoiceOrigin: string;
}

export interface InvoiceAddress {
  street: string;
  postcode: string;
  city: string;
  careOf: string;
}

export interface InvoicePdf {
  fileName: string;
  file: string;
}

export interface InvoicePdfData {
  pdf: InvoicePdf;
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
