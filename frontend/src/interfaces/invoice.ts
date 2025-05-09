import { Invoice } from '@data-contracts/invoices/data-contracts';
import { ApiResponseMeta } from './service';

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
