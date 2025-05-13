import { MUNICIPALITY_ID, MUNICIPALITY_ORG_NR } from '@/config';
import { getApiBase } from '@/config/api-config';
import { InvoicesResponse, PdfInvoice } from '@/data-contracts/invoices/data-contracts';
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

@Controller()
export class InvoicesController {
  private apiService = new ApiService();
  private apiBase = getApiBase('invoices');

  // TODO: Remove itterative logic once API supports passing multiple status filters
  @Get('/invoices')
  @OpenAPI({ summary: 'Return a list of invoices for current party' })
  @UseBefore(authMiddleware)
  async getInvoices(@Req() req: RequestWithUser): Promise<ApiResponse<InvoicesResponse>> {
    const { representing } = req?.session;
    const { facilityId, invoiceStatus: invoiceStatuses, page, limit, dueDateFrom, dueDateTo } = req.query;

    const partyId = getRepresentingPartyId(representing);
    if (!partyId) {
      throw new HttpException(400, 'Bad Request');
    }

    const data = Object.assign({}, emptyInvoice);
    const invoiceStatusArray = invoiceStatuses?.toString()?.split(',') ?? undefined;
    const itteratorArray = invoiceStatusArray ?? [undefined];

    let totalInvoices = [];
    let totalRecords = 0;
    let meta;
    for (const invoiceStatus of itteratorArray) {
      try {
        const url = `${this.apiBase}/${MUNICIPALITY_ID}/COMMERCIAL`;
        const params = {
          partyId,
          facilityId,
          invoiceStatus,
          page,
          limit,
          dueDateFrom,
          dueDateTo,
        };
        const res = await this.apiService.get<InvoicesResponse>({ url, params }, req);
        const { invoices, _meta } = res.data;

        totalInvoices.push(...invoices);
        totalRecords += _meta.totalRecords;
        meta = _meta;
      }
      catch (error) {
        // Handle 404 as empty
        if (error.status === 404) {
          //
        }
        else {
          throw new HttpException(500, 'Could not fetch invoices');
        }
      }
    }

    if (invoiceStatusArray?.length) {
      data.invoices = totalInvoices
        .sort((a, b) => Math.sign(new Date(a.invoiceDate).getTime() - new Date(b.invoiceDate).getTime()))
        .splice(0, parseInt(`${limit}`));
      data._meta = meta;
      data._meta.count = data.invoices.length;
      data._meta.totalRecords = totalRecords;
      data._meta.totalPages = Math.ceil(totalRecords / data.invoices.length);
    }
    else {
      data.invoices = totalInvoices;
      data._meta = meta;
    }

    return { data, message: 'success' };
  }

  @Get('/invoicepdf/:id')
  @OpenAPI({ summary: 'Return the base64 encoded pdf by invoice id' })
  @UseBefore(authMiddleware)
  async getInvoicePdf(@Req() req: RequestWithUser, @Param('id') id: string): Promise<ApiResponse<PdfInvoice>> {
    if (!id) {
      throw new HttpException(400, 'Bad Request');
    }

    const url = `${this.apiBase}/${MUNICIPALITY_ID}/PUBLIC_ADMINISTRATION/${MUNICIPALITY_ORG_NR}/${id}/pdf`;
    const res = await this.apiService.get<PdfInvoice>({ url }, req);

    return { data: res.data, message: 'success' };
  }
}
