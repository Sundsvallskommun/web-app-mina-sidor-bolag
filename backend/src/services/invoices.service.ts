import { Invoice, InvoicesResponse, MetaData, InvoiceStatus } from '@/data-contracts/invoices/data-contracts';
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

  private async handleResponses<T>(jobs: (() => Promise<T>)[], maxConcurrent = 5): Promise<T[]> {
    const results: T[] = [];
    const active: Promise<void>[] = [];

    for (const job of jobs) {
      const promise = job().then(result => {
        results.push(result);
      });

      active.push(promise);

      if (active.length >= maxConcurrent) {
        await Promise.race(active);
        active.splice(0, active.length - maxConcurrent + 1);
      }
    }

    await Promise.all(active);
    return results;
  }

  private handleRequests(req: RequestWithUser, params: FetchParams) {
    const { partyIds, organizationNumbers, facilityId, invoiceDateFrom, invoiceStatus } = params;

    const excludedOrgList = this.getExcludedOrgs();

    const filteredOrgNumbers = excludedOrgList.length
      ? organizationNumbers.filter(org => !excludedOrgList.includes(org))
      : organizationNumbers;

    const url = `${this.baseUrl}/${MUNICIPALITY_ID}/COMMERCIAL`;

    return filteredOrgNumbers.map(orgNumber => {
      return async () => {
        const response = await this.api.get<InvoicesResponse>(
          {
            url,
            params: {
              partyId: partyIds,
              facilityId,
              invoiceDateFrom,
              invoiceStatus,
              page: 1,
              limit: 100,
              organizationNumber: orgNumber,
            },
          },
          req.user,
        );

        return response.data;
      };
    });
  }

  private mergeInvoices(responses: (InvoicesResponse | undefined)[]) {
    const invoices: Invoice[] = [];

    for (const res of responses) {
      if (!res) continue;
      invoices.push(...res.invoices);
    }

    return invoices;
  }

  private sortInvoices(invoices: Invoice[]) {
    return invoices.sort((a, b) => new Date(b.invoiceDate).getTime() - new Date(a.invoiceDate).getTime());
  }

  private paginate(invoices: Invoice[], page: number, limit: number) {
    const start = (page - 1) * limit;
    return invoices.slice(start, start + limit);
  }

  async fetchInvoices(req: RequestWithUser, params: FetchParams) {
    const { page, limit } = params;
    const requests = this.handleRequests(req, params);
    const responses = await this.handleResponses(requests);
    const merged = this.mergeInvoices(responses);
    const sorted = this.sortInvoices(merged);
    const paged = this.paginate(sorted, page, limit);

    const meta: MetaData = {
      page,
      limit,
      totalRecords: sorted.length,
      totalPages: Math.ceil(sorted.length / limit),
      count: paged.length,
    };

    return {
      invoices: paged,
      meta,
    };
  }
}
