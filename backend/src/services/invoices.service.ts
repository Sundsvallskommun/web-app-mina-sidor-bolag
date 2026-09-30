import { CustomerInvoiceInvoiceStatusEnum } from '@/responses/datawarehousereader.response';
import ApiService from '@/services/api.service';
import { RequestWithUser } from '@/interfaces/auth.interface';
import { MUNICIPALITY_ID } from '@/config';
import { getApiBase } from '@/config/api-config';
import { DwrCustomerInvoicesResponse, fromDwrInvoice, toDwrInvoiceStatus } from '@utils/invoice-dwr-mappers';
import dayjs from 'dayjs';

/**
 * How far back invoices are listed. Shared so the ownership check looks in the
 * same window the list endpoint returns - a narrower window there would reject
 * downloads of invoices the user can see.
 */
export const getInvoicePeriodFrom = (): string => dayjs().startOf('year').subtract(4, 'years').format('YYYY-MM-DD');

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
          status: toDwrInvoiceStatus(invoiceStatus),
          invoiceNumbers,
          page,
          limit,
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
