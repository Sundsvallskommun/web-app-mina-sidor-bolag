import { InvoicesResponse, InvoiceStatus } from '@/data-contracts/invoices/data-contracts';
import ApiService from '@/services/api.service';
import { RequestWithUser } from '@/interfaces/auth.interface';
import { MUNICIPALITY_ID } from '@/config';
import { getApiBase } from '@/config/api-config';

type FetchParams = {
  customerNumbers: string[];
  organizationNumbers: string[];
  facilityIds: string[];
  periodFrom: string;
  page: number;
  limit: number;
  invoiceStatus?: InvoiceStatus;
};

export default class InvoicesService {
  private readonly api = new ApiService();
  private readonly baseUrl = getApiBase('invoices');

  async fetchInvoices(req: RequestWithUser, params: FetchParams) {
    const { customerNumbers, organizationNumbers, facilityIds, periodFrom, page, limit, invoiceStatus } = params;

    const url = `${this.baseUrl}/${MUNICIPALITY_ID}/COMMERCIAL/customers/invoices`;

    const res = await this.api.get<InvoicesResponse>(
      {
        url,
        params: {
          customerNumbers: customerNumbers,
          facilityIds: facilityIds,
          organizationNumber: organizationNumbers,
          periodFrom: periodFrom,
          status: invoiceStatus,
          page,
          limit,
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
