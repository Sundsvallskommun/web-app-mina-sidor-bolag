import { CustomerInvoiceInvoiceStatusEnum } from '@/responses/datawarehousereader.response';
import ApiService from '@/services/api.service';
import { RequestWithUser } from '@/interfaces/auth.interface';
import { MUNICIPALITY_ID } from '@/config';
import { getApiBase } from '@/config/api-config';
import { DwrCustomerInvoicesResponse, fromDwrInvoice, toDwrInvoiceStatus } from '@utils/invoice-dwr-mappers';
import dayjs from 'dayjs';

export const INVOICE_YEARS_BACK = 4;

const yearPeriodFrom = (year: number): string =>
  dayjs()
    .year(year - 1)
    .endOf('year')
    .format('YYYY-MM-DD');
const yearPeriodTo = (year: number): string => dayjs().year(year).endOf('year').format('YYYY-MM-DD');

/**
 * How far back invoices are listed. Shared so the ownership check looks in the
 * same window the list endpoint returns - a narrower window there would reject
 * downloads of invoices the user can see.
 */
export const getInvoicePeriodFrom = (): string => yearPeriodFrom(dayjs().year() - INVOICE_YEARS_BACK);

export const getInvoiceYearPeriod = (year: number): { periodFrom: string; periodTo: string } | undefined => {
  const currentYear = dayjs().year();
  if (!Number.isInteger(year) || year < currentYear - INVOICE_YEARS_BACK || year > currentYear) return undefined;
  return { periodFrom: yearPeriodFrom(year), periodTo: yearPeriodTo(year) };
};

/**
 * DataWarehouseReader customer invoice list. Everything about invoices goes
 * through it - listing, the detail view and the download's ownership check.
 * Only the PDF document itself is fetched from the Invoices API.
 */
export const dwrCustomerInvoicesUrl = (): string =>
  `${getApiBase('datawarehousereader')}/${MUNICIPALITY_ID}/invoices/customers`;

type FetchParams = {
  customerNumbers: string[];
  organizationNumbers: string[];
  facilityIds: string[];
  periodFrom: string;
  periodTo?: string;
  page: number;
  limit: number;
  invoiceStatus?: CustomerInvoiceInvoiceStatusEnum;
  invoiceNumbers?: number[];
};

export default class InvoicesService {
  private readonly api = new ApiService();

  async fetchInvoices(req: RequestWithUser, params: FetchParams) {
    const {
      customerNumbers,
      organizationNumbers,
      facilityIds,
      periodFrom,
      periodTo,
      page,
      limit,
      invoiceStatus,
      invoiceNumbers,
    } = params;

    const url = dwrCustomerInvoicesUrl();

    const res = await this.api.get<DwrCustomerInvoicesResponse>(
      {
        url,
        params: {
          customerNumbers: customerNumbers.toString(),
          facilityIds: facilityIds,
          organizationNumber: organizationNumbers.toString(),
          periodFrom,
          periodTo,
          status: toDwrInvoiceStatus(invoiceStatus),
          invoiceNumbers,
          page,
          limit,
          sortBy: ['periodTo'],
          sortDirection: 'DESC',
        },
      },
      req.user,
    );

    return {
      invoices: (res.data?.invoices ?? []).map(fromDwrInvoice),
      meta: res.data?._meta,
    };
  }
}
