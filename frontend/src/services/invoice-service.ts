import { IInvoice, InvoicePdf, InvoicePdfData, InvoiceStatus, InvoicesData } from '@interfaces/invoice';
import { apiService, ApiResponse } from './api-service';
import { CustomerInvoice, CustomerInvoicesResponse } from '@data-contracts/backend/data-contracts';

export const emptyInvoicesList: InvoicesData = {
  invoices: [],
  labels: [],
  totalCount: 0,
};

export const invoicesLabels = [
  { label: 'Förfallodatum', screenReaderOnly: false, sortable: true },
  { label: 'Faktura', screenReaderOnly: false, sortable: true },
  { label: 'Status', screenReaderOnly: false, sortable: true },
  { label: 'Summa', screenReaderOnly: false, sortable: true },
  { label: 'OCR-nummer', screenReaderOnly: false, sortable: false },
  { label: 'Visa faktura', screenReaderOnly: true, sortable: false },
];

export const statusMapInvoices = {
  PAID: { label: 'Betald', color: 'success' },
  PAID_TOO_MUCH: { label: 'För mycket betalt', color: 'success' },

  CREDITED: { label: 'Krediterad', color: 'neutral' },
  WRITTEN_OFF: { label: 'Avskriven', color: 'neutral' },
  UNKNOWN: { label: 'Okänd', color: 'neutral' },
  VOID: { label: 'Makulerad', color: 'neutral' },

  UNPAID: { label: 'Obetald', color: 'warning' },
  SENT: { label: 'Obetald', color: 'warning' },
  PARTIALLY_PAID: { label: 'Delvis betald', color: 'warning' },

  REMINDER: { label: 'Påminnelse', color: 'error' },
  DEBT_COLLECTION: { label: 'Förfallen', color: 'error' },
};

export const mapStatus = (s?: InvoiceStatus) => {
  if (s === undefined)
    return {
      code: 'UNKNOWN' as InvoiceStatus,
      color: statusMapInvoices['UNKNOWN'].color,
      label: statusMapInvoices['UNKNOWN'].label,
    };
  return Object.keys(statusMapInvoices).includes(s as unknown as string)
    ? { code: s, color: statusMapInvoices[s].color, label: statusMapInvoices[s].label }
    : {
        code: 'UNKNOWN' as InvoiceStatus,
        color: statusMapInvoices['UNKNOWN'].color,
        label: statusMapInvoices['UNKNOWN'].label,
      };
};

export const handleInvoiceResponse: (data: CustomerInvoicesResponse) => IInvoice[] = (data) =>
  data.invoices ? data.invoices.map((n: CustomerInvoice) => ({ ...n, invoiceStatus: mapStatus(n.invoiceStatus) })) : [];

// export const getInvoices: () => Promise<InvoicesData> = () =>
//   apiService
//     .get<ApiResponse<InvoicesResponse>>('invoices')
//     .then((res) => ({ invoices: handleInvoiceResponse(res.data), labels: invoicesLabels } as InvoicesData))
//     .catch((e) => ({ ...emptyInvoicesList, error: e.response?.status ?? 'UNKNOWN ERROR' } as InvoicesData));

export const invoicesHandler = (data: CustomerInvoicesResponse): InvoicesData => ({
  invoices: handleInvoiceResponse(data),
  labels: invoicesLabels,
  totalCount: data._meta?.totalRecords ?? 0,
});

export const notPaidInvoices = ['UNPAID', 'SENT', 'PARTIALLY_PAID', 'REMINDER', 'DEBT_COLLECTION'];
export const getNotPaidInvoices: (invoicesData: InvoicesData) => InvoicesData = (invoicesData) => ({
  ...invoicesData,
  labels: invoicesLabels,
  invoices: invoicesData?.invoices.filter((x) => notPaidInvoices.includes(x.invoiceStatus.code)),
});

export const paidInvoices = ['PAID', 'PAID_TOO_MUCH'];
export const getPaidInvoices: (invoicesData: InvoicesData) => InvoicesData = (invoicesData) => ({
  ...invoicesData,
  labels: invoicesLabels,
  invoices: invoicesData?.invoices.filter((x) => paidInvoices.includes(x.invoiceStatus.code)),
});

export const otherInvoices = ['CREDITED', 'WRITTEN_OFF', 'UNKNOWN', 'VOID'];
export const getOtherInvoices: (invoicesData: InvoicesData) => InvoicesData = (invoicesData) => ({
  ...invoicesData,
  labels: invoicesLabels,
  invoices: invoicesData?.invoices.filter((x) => otherInvoices.includes(x.invoiceStatus.code)),
});

export const getInvoicePdf: (organizationNumber: string, invoiceNumber: string) => Promise<InvoicePdfData> = (
  organizationNumber,
  invoiceNumber
) =>
  apiService
    .get<ApiResponse<InvoicePdf>>(`invoicepdf/${organizationNumber}/${invoiceNumber}`)
    .then((res) => ({ pdf: res.data.data }))
    .catch(
      (e) => ({ pdf: { fileName: '', file: '' }, error: e.response?.status ?? 'UNKNOWN ERROR' }) as InvoicePdfData
    );
