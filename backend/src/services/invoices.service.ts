import { InvoicesResponse, InvoiceStatus } from '@/data-contracts/invoices/data-contracts';
import ApiService from '@/services/api.service';
import { RequestWithUser } from '@/interfaces/auth.interface';
import { INVOICE_ORG_EXCLUDED, MUNICIPALITY_ID } from '@/config';
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
  private api = new ApiService();
  private baseUrl = getApiBase('invoices');

  private getExcludedOrgs(): string[] {
    const value = INVOICE_ORG_EXCLUDED;

    if (!value) return [];

    return value
      .split(',')
      .map(v => v.trim())
      .filter(Boolean);
  }

  async fetchInvoices(req: RequestWithUser, params: FetchParams) {
    const { partyIds, organizationNumbers, facilityId, invoiceDateFrom, page, limit, invoiceStatus } = params;

    const excluded = this.getExcludedOrgs();

    const filteredOrgNumbers = excluded.length
      ? organizationNumbers.filter(org => !excluded.includes(org))
      : organizationNumbers;

    const url = `${this.baseUrl}/${MUNICIPALITY_ID}/COMMERCIAL`;

    const res = await this.api.get<InvoicesResponse>(
      {
        url,
        params: {
          partyId: partyIds,
          facilityId,
          organizationNumber: filteredOrgNumbers,
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
