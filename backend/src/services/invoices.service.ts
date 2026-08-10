import { CustomerInvoicesResponse, CustomerInvoiceInvoiceStatusEnum } from '@/responses/invoices.response';
import ApiService from '@/services/api.service';
import { RequestWithUser } from '@/interfaces/auth.interface';
import { MUNICIPALITY_ID } from '@/config';
import { getApiBase } from '@/config/api-config';
import dayjs from 'dayjs';

/**
 * How far back invoices are listed. Shared so the ownership check searches the
 * same window the list endpoint returns - a narrower window there would reject
 * downloads of invoices the user can see.
 */
export const getInvoicePeriodFrom = (): string => dayjs().startOf('year').subtract(4, 'years').format('YYYY-MM-DD');

/** Path of the customer invoice list, used for both listing and ownership checks. */
export const customerInvoicesUrl = (): string =>
  `${getApiBase('invoices')}/${MUNICIPALITY_ID}/COMMERCIAL/customers/invoices`;

type FetchParams = {
  customerNumbers: string[];
  organizationNumbers: string[];
  facilityIds: string[];
  periodFrom: string;
  page: number;
  limit: number;
  invoiceStatus?: CustomerInvoiceInvoiceStatusEnum;
};

export default class InvoicesService {
  private readonly api = new ApiService();
  private readonly baseUrl = getApiBase('invoices');

  async fetchInvoices(req: RequestWithUser, params: FetchParams) {
    const { customerNumbers, organizationNumbers, facilityIds, periodFrom, page, limit, invoiceStatus } = params;

    const url = customerInvoicesUrl();

    const res = await this.api.get<CustomerInvoicesResponse>(
      {
        url,
        params: {
          customerNumbers: customerNumbers.toString(),
          facilityIds: facilityIds,
          organizationNumber: organizationNumbers.toString(),
          periodFrom: periodFrom,
          status: invoiceStatus,
          page,
          limit,
          sortDirection: 'DESC',
        },
      },
      req.user,
    );

    return {
      invoices: res.data?.invoices ?? [],
      meta: res.data?._meta,
    };
  }
}
