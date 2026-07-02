import { InvoiceStatus } from '@interfaces/invoice';
import { statusMapInvoices } from '@services/invoice-service';
import { CustomerInvoice } from '@data-contracts/backend/data-contracts';

const baseInvoice: CustomerInvoice = {
  dueDate: '2024-08-30',
  totalAmount: 814,
  amountVatIncluded: 813.5,
  amountVatExcluded: 651.2,
  vatEligibleAmount: 651.2,
  rounding: 0.5,
  pdfAvailable: false,
  invoiceDate: '2024-08-30',
  periodFrom: '2024-08-30',
  periodTo: '2024-08-30',
  invoiceNumber: '999',
  invoiceStatus: 'PAID',
  ocrNumber: '96758235',
  organizationNumber: '5565027223',
  invoiceName: 'faktura-999.pdf',
  invoiceType: 'INVOICE',
  invoiceDescription: 'Fjärrvärme',
  street: 'Storgatan 1',
  postCode: '11122',
  city: 'Sundsvall',
  careOf: 'Kalle',
  facilityIds: ['111'],
  details: [],
};

export const getGeneratedInvoices = () =>
  Object.keys(statusMapInvoices).map((status) => ({
    ...baseInvoice,
    invoiceStatus: status as InvoiceStatus,
    invoiceDescription: 'Typ av förbrukning',
    invoiceName: `faktura-999-${status.toLowerCase()}.pdf`,
  }));
