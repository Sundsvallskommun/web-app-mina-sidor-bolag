import { InvoiceStatus } from '@interfaces/invoice';
import { statusMapInvoices } from '@services/invoice-service';
import { CustomerInvoice } from '@data-contracts/backend/data-contracts';

const baseInvoice: CustomerInvoice = {
  administration: 'Energi AB',
  amountVatExcluded: 100,
  amountVatIncluded: 125,
  careOf: 'Förnamn Efternamn',
  city: 'SUNDSVALL',
  customerNumber: '1',
  customerType: 'PRIVATE',
  details: [
    {
      administration: 'Energi AB',
      amount: 125,
      amountVatExcluded: 100,
      description: 'Fjärrvärme',
      facilityId: '111',
      fromDate: '2026-01-01',
      productCode: '1031769515',
      productName: 'Villa',
      quantity: 1,
      toDate: '2026-01-31',
      unit: 'MWh',
      unitPrice: 100,
      vat: 25,
    },
  ],
  dueDate: '2026-02-27',
  facilityIds: ['111'],
  invoiceDate: '2026-02-03',
  invoiceDescription: 'Fjärrvärme',
  invoiceId: 5,
  invoiceName: '5.pdf',
  invoiceNumber: '5',
  invoiceStatus: 'SENT',
  invoiceType: 'INVOICE',
  ocrNumber: '5',
  organizationGroup: 's',
  organizationNumber: '5564786647',
  pdfAvailable: true,
  periodFrom: '2025-12-31',
  periodTo: '2026-01-31',
  postCode: '00000',
  rounding: -0.14,
  street: 'Storgatan 1',
  totalAmount: 125,
  vatEligibleAmount: 100,
};

export const getGeneratedInvoices = () =>
  Object.keys(statusMapInvoices).map((status, index) => ({
    ...baseInvoice,
    invoiceStatus: status as InvoiceStatus,
    invoiceDescription: 'Typ av förbrukning',
    invoiceName: `faktura-999-${status.toLowerCase()}.pdf`,
    invoiceId: index + 100,
  }));
