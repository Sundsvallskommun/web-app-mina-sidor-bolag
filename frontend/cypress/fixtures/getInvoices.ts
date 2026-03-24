import { RepresentingMode } from '@interfaces/app';
import { InvoicesResponse } from '@interfaces/invoice';
import { ApiResponse } from '@services/api-service';
import { getGeneratedInvoices } from 'cypress/fixtures/utils';

export const getInvoices: (representingMode: RepresentingMode) => ApiResponse<InvoicesResponse> = () => ({
  data: {
    invoices: getGeneratedInvoices(),
    _meta: {
      page: 1,
      limit: 100,
      count: getGeneratedInvoices().length,
      totalRecords: getGeneratedInvoices().length,
      totalPages: 1,
    },
  },
  message: 'success',
});

export const getPendingInvoices: () => ApiResponse<InvoicesResponse> = () => ({
  data: {
    invoices: [
      {
        dueDate: '2025-01-30',
        totalAmount: 1623,
        amountVatIncluded: 1623.15,
        amountVatExcluded: 1298.52,
        vatEligibleAmount: 1298.52,
        rounding: -0.15,
        vat: 1298.52,
        reversedVat: false,
        pdfAvailable: false,
        currency: 'sek',
        invoiceDate: '2025-01-01',
        invoiceNumber: '240736694',
        invoiceStatus: 'SENT',
        ocrNumber: '240736694',
        organizationNumber: '5565027223',
        invoiceName: '240736694.pdf',
        invoiceType: 'INVOICE',
        invoiceDescription: 'El',
        invoiceAddress: {
          street: 'Storgatan 1',
          postcode: '11122',
          city: 'Sundsvall',
          careOf: 'Förnamn Efternamn',
        },
        fromDate: '',
        toDate: '',
        facilityId: '111',
        invoiceOrigin: 'COMMERCIAL',
      },
    ],
    _meta: {
      page: 1,
      limit: 1,
      count: 1,
      totalRecords: 3,
      totalPages: 3,
    },
  },
  message: 'success',
});
