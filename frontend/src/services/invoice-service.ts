import { IInvoice, InvoicePdfData, InvoiceStatus, InvoicesData } from '@interfaces/invoice';
import { apiService, ApiResponse, useApi } from './api-service';
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

export const invoicesHandler = (data: CustomerInvoicesResponse): InvoicesData => ({
  invoices: handleInvoiceResponse(data),
  labels: invoicesLabels,
  totalCount: data._meta?.totalRecords ?? 0,
});

export const notPaidInvoices = ['UNPAID', 'SENT', 'PARTIALLY_PAID', 'REMINDER', 'DEBT_COLLECTION'];
export const paidInvoices = ['PAID', 'PAID_TOO_MUCH'];

export const getInvoicePdf: (organizationNumber: string, invoiceNumber: string) => Promise<InvoicePdfData> = (
  organizationNumber,
  invoiceNumber
) =>
  apiService
    .get<ApiResponse<string>>(`invoicepdf/${organizationNumber}/${invoiceNumber}`)
    .then((res) => ({ data: res.data.data }))
    .catch((e) => ({ data: '', error: e.response?.status ?? 'UNKNOWN ERROR' }) as InvoicePdfData);

export const useInvoicesQuery = ({
  pending,
  limit,
  facilityIds,
}: {
  pending: boolean;
  limit: number;
  facilityIds: string[];
}) =>
  useApi<CustomerInvoicesResponse, Error, InvoicesData>({
    queryKey: [pending ? 'pendingInvoices' : 'allInvoices', limit.toString(), facilityIds.toString()],
    url: `/invoices${pending ? '/pending' : ''}?page=1&limit=${limit}&facilityId=${facilityIds.toString()}`,
    method: 'get',
    dataHandler: invoicesHandler,
    queryOptions: {
      placeholderData: (prev) => prev,
      enabled: facilityIds.length > 0,
    },
  });
