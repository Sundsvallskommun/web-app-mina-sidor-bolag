import {
  Invoice,
  InvoiceOrigin,
  InvoicesResponse,
  InvoiceStatus,
  InvoiceType,
} from '@/data-contracts/invoices/data-contracts';

// Base invoice template to reduce duplication
const baseInvoice: Omit<Invoice, 'invoiceStatus' | 'dueDate' | 'toDate'> = {
  totalAmount: 814,
  amountVatIncluded: 813.5,
  amountVatExcluded: 651.2,
  vatEligibleAmount: 651.2,
  rounding: 0.5,
  vat: 162.8,
  reversedVat: false,
  pdfAvailable: false,
  currency: 'SEK',
  invoiceDate: '2024-06-17',
  fromDate: '2024-06-17',
  invoiceNumber: '999',
  ocrNumber: '96758235',
  organizationNumber: 'XXXXXXXXXX',
  invoiceName: 'faktura-999.pdf',
  invoiceType: InvoiceType.INVOICE,
  invoiceDescriptions: [],
  invoiceAddress: {
    street: 'Storgatangrändvägen 1',
    postcode: '31532',
    city: 'Sundsvall',
    careOf: 'Person',
  },
  facilityIds: [],
  invoiceOrigin: InvoiceOrigin.PUBLIC_ADMINISTRATION,
};

// Helper function to create invoice with specific status and dates
const createInvoice = (status: InvoiceStatus, dueDate: string, toDate: string): Invoice => ({
  ...baseInvoice,
  invoiceStatus: status,
  dueDate,
  toDate,
});

// Used as test-data. Remove when test-invoices can be fetched from api reliably
export const mockedInvoices: InvoicesResponse['invoices'] = [
  createInvoice(InvoiceStatus.PAID, '2024-06-17', '2024-06-17'),
  createInvoice(InvoiceStatus.SENT, '2024-09-17', '2024-09-17'),
  createInvoice(InvoiceStatus.PARTIALLY_PAID, '2024-06-17', '2024-06-17'),
  createInvoice(InvoiceStatus.DEBT_COLLECTION, '2024-03-17', '2024-03-17'),
  createInvoice(InvoiceStatus.PAID_TOO_MUCH, '2024-06-17', '2024-06-17'),
  createInvoice(InvoiceStatus.REMINDER, '2024-06-17', '2024-06-17'),
  createInvoice(InvoiceStatus.VOID, '2024-06-17', '2024-06-17'),
  createInvoice(InvoiceStatus.CREDITED, '2024-06-17', '2024-06-17'),
  createInvoice(InvoiceStatus.WRITTEN_OFF, '2024-06-17', '2024-06-17'),
  createInvoice(InvoiceStatus.UNKNOWN, '2024-06-17', '2024-06-17'),
];

export const mockedInvoiceResponse: InvoicesResponse = {
  invoices: mockedInvoices,
  _meta: undefined,
};
