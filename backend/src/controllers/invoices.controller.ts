import { MUNICIPALITY_ID } from '@/config';
import { getApiBase } from '@/config/api-config';
import { Invoice, InvoiceStatus, PdfInvoice } from '@/data-contracts/invoices/data-contracts';
import { HttpException } from '@/exceptions/HttpException';
import { RequestWithUser } from '@/interfaces/auth.interface';
import ApiService from '@/services/api.service';
import authMiddleware from '@middlewares/auth.middleware';
import { Controller, Get, Param, Req, UseBefore } from 'routing-controllers';
import { OpenAPI } from 'routing-controllers-openapi';
import { ApiResponse } from '@interfaces/service';
import dayjs from 'dayjs';
import InvoicesService from '@/services/invoices.service';

const emptyInvoice = {
  invoices: [],
  _meta: undefined,
};

const pendingStatuses = [
  'SENT' as InvoiceStatus,
  'DEBT_COLLECTION' as InvoiceStatus,
  'REMINDER' as InvoiceStatus,
  // NOTE: Doesn't return the correct entries yet
  // 'PARTIALLY_PAID' as InvoiceStatus,
];

@Controller()
export class InvoicesController {
  private readonly apiService = new ApiService();
  private readonly apiBase = getApiBase('invoices');
  private readonly invoiceDateFrom = dayjs().startOf('year').subtract(4, 'years').format('YYYY-MM-DD');
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
  @UseBefore(authMiddleware)
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
  @UseBefore(authMiddleware)
  async getPendingInvoices(@Req() req: RequestWithUser) {
    const { facilityId, page, limit } = req.query;

    if (!facilityId) {
      return { data: { ...emptyInvoice }, message: 'Empty response' };
    }

    const { organizationNumbers, customerNumbers } = this.getCustomerIdentifiers(req);

    const allInvoices: Invoice[] = [];
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

  @Get('/invoicepdf/:organizationNumber/:id')
  @OpenAPI({ summary: 'Return the base64 encoded pdf by invoice id' })
  @UseBefore(authMiddleware)
  async getInvoicePdf(
    @Req() req: RequestWithUser,
    @Param('organizationNumber') organizationNumber: string,
    @Param('id') id: string,
  ): Promise<ApiResponse<PdfInvoice>> {
    if (!id) {
      throw new HttpException(400, 'Bad Request');
    }

    const url = `${this.apiBase}/${MUNICIPALITY_ID}/COMMERCIAL/${organizationNumber}/${id}/pdf/download`;
    const res = await this.apiService.get<PdfInvoice>({ url }, req.user);

    return { data: res.data, message: 'success' };
  }
}
