import { MUNICIPALITY_ID } from '@/config';
import { getApiBase } from '@/config/api-config';
import {
  CustomerInvoice,
  CustomerInvoiceInvoiceStatusEnum,
  CustomerInvoicesResponse,
} from '@/responses/invoices.response';
import { HttpException } from '@/exceptions/HttpException';
import { RequestWithUser } from '@/interfaces/auth.interface';
import ApiService from '@/services/api.service';
import { Controller, Get, Param, Req, UseBefore } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';
import { ApiResponse } from '@interfaces/service';
import InvoicesService, { getInvoicePeriodFrom } from '@/services/invoices.service';
import { assertInvoiceWasListed, rememberListedInvoices } from '@/services/ownership.service';
import authMiddleware from '@/middlewares/auth.middleware';

const emptyInvoice = {
  invoices: [],
  _meta: undefined,
};

const pendingStatuses = [
  'SENT' as CustomerInvoiceInvoiceStatusEnum,
  'DEBT_COLLECTION' as CustomerInvoiceInvoiceStatusEnum,
  'REMINDER' as CustomerInvoiceInvoiceStatusEnum,
  // NOTE: Doesn't return the correct entries yet
  // 'PARTIALLY_PAID' as InvoiceStatus,
];

@Controller()
export class InvoicesController {
  private readonly apiService = new ApiService();
  private readonly apiBase = getApiBase('invoices');
  private readonly invoiceDateFrom = getInvoicePeriodFrom();
  private readonly invoicesService = new InvoicesService();

  private getCustomerIdentifiers(req: RequestWithUser) {
    const { relations } = req.session.cache;
    return {
      organizationNumbers: relations.customerRelations.map(c => c.organizationNumber),
      customerNumbers: relations.customerNumber,
    };
  }

  @Get('/invoices')
  @OpenAPI({ summary: 'Return a list of invoices for current party' })
  @ResponseSchema(CustomerInvoicesResponse)
  async getInvoices(@Req() req: RequestWithUser) {
    const { facilityId, page, limit } = req.query;

    if (!facilityId) {
      return { data: { ...emptyInvoice }, message: 'Empty response' };
    }

    const { organizationNumbers, customerNumbers } = this.getCustomerIdentifiers(req);

    const result = await this.invoicesService.fetchInvoices(req, {
      customerNumbers: customerNumbers,
      organizationNumbers: organizationNumbers,
      facilityIds: facilityId as string[],
      periodFrom: this.invoiceDateFrom,
      page: Number(page),
      limit: Number(limit),
    });

    rememberListedInvoices(req, result.invoices);

    return {
      data: {
        invoices: result.invoices,
        _meta: result.meta,
      },
      message: 'success',
    };
  }

  @Get('/invoices/pending')
  @OpenAPI({ summary: 'Return a list of pending invoices for current party' })
  @ResponseSchema(CustomerInvoicesResponse)
  async getPendingInvoices(@Req() req: RequestWithUser) {
    const { facilityId, page, limit } = req.query;

    if (!facilityId) {
      return { data: { ...emptyInvoice }, message: 'Empty response' };
    }

    const { organizationNumbers, customerNumbers } = this.getCustomerIdentifiers(req);

    const allInvoices: CustomerInvoice[] = [];
    let totalRecords = 0;

    for (const status of pendingStatuses) {
      const result = await this.invoicesService.fetchInvoices(req, {
        customerNumbers,
        organizationNumbers,
        facilityIds: facilityId as string[],
        periodFrom: this.invoiceDateFrom,
        page: Number(page),
        limit: Number(limit),
        invoiceStatus: status,
      });

      allInvoices.push(...result.invoices);
      totalRecords += result.meta?.totalRecords ?? 0;
    }

    rememberListedInvoices(req, allInvoices);

    return {
      data: {
        invoices: allInvoices,
        _meta: {
          page: Number(page),
          limit: Number(limit),
          totalRecords,
          totalPages: Math.ceil(totalRecords / Number(limit)),
          count: allInvoices.length,
        },
      },
      message: 'success',
    };
  }

  @Get('/invoice/:invoiceNumber')
  @OpenAPI({ summary: 'Returns invoice' })
  @ResponseSchema(CustomerInvoice)
  @UseBefore(authMiddleware)
  async getInvoice(@Req() req: RequestWithUser, @Param('invoiceNumber') invoiceNumber: string) {
    const { facilityId, periodFrom, periodTo } = req.query;

    if (!facilityId) {
      return { data: { ...emptyInvoice }, message: 'Empty response' };
    }

    const { organizationNumbers, customerNumbers } = this.getCustomerIdentifiers(req);

    const result = await this.invoicesService.fetchInvoices(req, {
      customerNumbers: customerNumbers,
      organizationNumbers: organizationNumbers,
      facilityIds: facilityId as string[],
      periodFrom: periodFrom ? periodFrom.toString() : this.invoiceDateFrom,
      periodTo: periodTo ? periodTo.toString() : undefined,
      page: 1,
      limit: 25,
    });

    rememberListedInvoices(req, result.invoices);

    const invoice = result.invoices.find(i => i.invoiceNumber === invoiceNumber);
    if (!invoice) throw new HttpException(404, 'Invoice not found');
    return { data: invoice, message: 'success' };
  }

  @Get('/invoicepdf/:organizationNumber/:id')
  @OpenAPI({ summary: 'Return the base64-encoded invoice document (PDF or ZIP)' })
  async getInvoicePdf(
    @Req() req: RequestWithUser,
    @Param('organizationNumber') organizationNumber: string,
    @Param('id') id: string,
  ): Promise<ApiResponse<string>> {
    if (!id) {
      throw new HttpException(400, 'Bad Request');
    }

    // The listing endpoints already decided ownership; this reuses that decision.
    // The search the previous check relied on returns 504 in production for a query
    // filtered on customer number alone, which is all the download can supply.
    assertInvoiceWasListed(req, organizationNumber, id);

    const url = `${this.apiBase}/${MUNICIPALITY_ID}/COMMERCIAL/${organizationNumber}/${id}/pdf/download`;
    const res = await this.apiService.get<ArrayBuffer>({ url, responseType: 'arraybuffer' }, req.user);
    const base64String = Buffer.from(res.data).toString('base64');
    return { data: base64String, message: 'success' };
  }
}
