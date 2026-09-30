import { CustomerInvoice, InvoiceDetail } from '@data-contracts/backend/data-contracts';

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

export type GroupedDetails = Record<string, Record<string, InvoiceDetail[]>>;
