import { MUNICIPALITY_ID } from '@/config';
import { getApiBase } from '@/config/api-config';
import { InvoicesResponse, InvoiceStatus, PdfInvoice } from '@/data-contracts/invoices/data-contracts';
import { HttpException } from '@/exceptions/HttpException';
import { RequestWithUser } from '@/interfaces/auth.interface';
import ApiService from '@/services/api.service';
import authMiddleware from '@middlewares/auth.middleware';
import { Controller, Get, Param, Req, UseBefore } from 'routing-controllers';
import { OpenAPI } from 'routing-controllers-openapi';
import { ApiResponse } from '../interfaces/service';
import { getRepresentingPartyId } from '../utils/getRepresentingPartyId';

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
  private apiService = new ApiService();
  private apiBase = getApiBase('invoices');

  @Get('/invoices')
  @OpenAPI({ summary: 'Return a list of invoices for current party' })
  @UseBefore(authMiddleware)
  async getInvoices(@Req() req: RequestWithUser): Promise<ApiResponse<InvoicesResponse>> {
    const representing = req.session?.representing ?? undefined;
    const { facilityId, page, limit } = req.query;
    if (!facilityId) {
      // Facility ids must be provided. Together with the filter on facilities in User Controller,
      // this ensures that only invoices for active (plus three years back) facilities are fetched.
      return { data: { ...emptyInvoice }, message: 'Empty response' };
    }

    const partyId = getRepresentingPartyId(representing);
    if (!partyId) {
      throw new HttpException(400, 'Bad Request');
    }

    const data = Object.assign({}, emptyInvoice);

    try {
      const url = `${this.apiBase}/${MUNICIPALITY_ID}/COMMERCIAL`;
      const params = {
        partyId,
        facilityId,
        page,
        limit,
      };
      const res = await this.apiService.get<InvoicesResponse>({ url, params }, req.user);
      const { invoices, _meta } = res.data;
      data.invoices = invoices;
      data._meta = _meta;
    } catch (error) {
      // Handle 404 as empty
      if (error.status === 404) {
        return { data, message: '404 from api, Assumed empty array' };
      } else {
        throw new HttpException(500, 'Could not fetch invoices');
      }
    }

    return { data, message: 'success' };
  }

  // TODO: Remove iterative logic once API supports passing multiple status filters
  @Get('/invoices/pending')
  @OpenAPI({ summary: 'Return a list of pending invoices for current party' })
  @UseBefore(authMiddleware)
  async getPendingInvoices(@Req() req: RequestWithUser): Promise<ApiResponse<InvoicesResponse>> {
    const representing = req.session?.representing ?? undefined;
    const { facilityId, page, limit } = req.query;

    console.log('Using representing:', representing);
    if (!facilityId) {
      // See comment in getInvoices method.
      return { data: { ...emptyInvoice }, message: 'Empty response' };
    }

    const partyId = getRepresentingPartyId(representing);
    if (!partyId) {
      throw new HttpException(400, 'Bad Request. Party id is required');
    }

    const data = Object.assign({}, emptyInvoice);

    // TODO: Can't be used during testing since the test data resides in 2024
    /*
    const date1 = new Date();
    const dueDays = 7;
    const aDay = 60 * 60 * 24 * 1000;
    const date2 = new Date(date1.getTime() + aDay * dueDays);
    const dueDateFrom = `${date1.getUTCFullYear()}-${date1.getUTCDate()}-${date1.getUTCDay()}`;
    const dueDateTo = `${date2.getUTCFullYear()}-${date2.getUTCDate()}-${date2.getUTCDay()}`;
    */

    let meta;
    const totalInvoices = [];
    let totalRecords = 0;
    for (const invoiceStatus of pendingStatuses) {
      try {
        const url = `${this.apiBase}/${MUNICIPALITY_ID}/COMMERCIAL`;
        const params = {
          partyId,
          facilityId,
          invoiceStatus,
          page,
          limit,
          // dueDateFrom,
          // dueDateTo,
        };
        const res = await this.apiService.get<InvoicesResponse>({ url, params }, req.user);
        const { invoices, _meta } = res.data;

        totalInvoices.push(...invoices);
        totalRecords += _meta.totalRecords;
        meta = _meta;
      } catch (error) {
        // Handle 404 as empty
        if (error.status === 404) {
          return { data, message: '404 from api, Assumed empty array' };
        } else {
          throw new HttpException(500, 'Could not fetch invoices');
        }
      }
    }

    data.invoices = totalInvoices
      .sort((a, b) => Math.sign(new Date(a.invoiceDate).getTime() - new Date(b.invoiceDate).getTime()))
      .splice(0, parseInt(`${limit}`));
    data._meta = meta;
    data._meta.count = data.invoices.length;
    data._meta.totalRecords = totalRecords;
    data._meta.totalPages = Math.ceil(totalRecords / data.invoices.length);

    return { data, message: 'success' };
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

    const url = `${this.apiBase}/${MUNICIPALITY_ID}/COMMERCIAL/${organizationNumber}/${id}/pdf`;
    const res = await this.apiService.get<PdfInvoice>({ url }, req.user);

    return { data: res.data, message: 'success' };
  }
}
