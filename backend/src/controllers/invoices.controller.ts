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

  @Get('/invoices')
  @OpenAPI({ summary: 'Return a list of invoices for current party' })
  @UseBefore(authMiddleware)
  async getInvoices(@Req() req: RequestWithUser): Promise<ApiResponse<InvoicesResponse>> {
    const { representing } = req?.session;
    const { facilityId, invoiceStatus, page, limit } = req.query;

    const partyId = getRepresentingPartyId(representing);
    if (!partyId) {
      throw new HttpException(400, 'Bad Request');
    }

    const data = Object.assign({}, emptyInvoice);
    const invoiceStatusArray = invoiceStatus ? invoiceStatus.toString().split(',') : [];
    const filterInQuery = invoiceStatusArray.length === 1;

    try {
      const url = `${this.apiBase}/${MUNICIPALITY_ID}/COMMERCIAL`;
      const params = {
        partyId,
        facilityId,
        invoiceStatus: filterInQuery ? invoiceStatus : undefined,
        page,
        limit,
      };
      const res = await this.apiService.get<InvoicesResponse>({ url, params }, req);
      const { invoices, _meta } = res.data;
      data.invoices = invoices;
      data._meta = _meta;

      // TODO: Remove when multiple status filters are supported in API
      if (!filterInQuery && invoiceStatusArray.length) {
        data.invoices = data.invoices.filter(v => invoiceStatusArray.includes(v.invoiceStatus));
        data._meta.count = data.invoices.length;
        data._meta.totalRecords = data.invoices.length;
      }

      return { data, message: 'success' };
    }
    catch (error) {
      if (error.status === 404) {
        return { data, message: '404 from api, Assumed empty array' };
      } else {
        return { data, message: 'error' };
      }
    }
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
