import { InvoicesResponse, InvoiceStatus } from '@/data-contracts/invoices/data-contracts';
import ApiService from '@/services/api.service';
import { RequestWithUser } from '@/interfaces/auth.interface';
import { MUNICIPALITY_ID } from '@/config';
import { getApiBase } from '@/config/api-config';

type FetchParams = {
  partyIds: string[];
  organizationNumbers: string[];
  facilityId: string[];
  invoiceDateFrom: string;
  page: number;
  limit: number;
  invoiceStatus?: InvoiceStatus;
};

export default class InvoicesService {
  private readonly api = new ApiService();
  private readonly baseUrl = getApiBase('invoices');

  async fetchInvoices(req: RequestWithUser, params: FetchParams) {
    const { partyIds, organizationNumbers, facilityId, invoiceDateFrom, page, limit, invoiceStatus } = params;

    const url = `${this.baseUrl}/${MUNICIPALITY_ID}/COMMERCIAL`;

    const res = await this.api.get<InvoicesResponse>(
      {
        url,
        params: {
          partyId: partyIds,
          facilityId,
          organizationNumber: organizationNumbers,
          invoiceDateFrom,
          invoiceStatus,
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
