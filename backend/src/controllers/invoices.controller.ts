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

    try {
      const url = `${this.apiBase}/${MUNICIPALITY_ID}/COMMERCIAL`;
      const params = {
        partyId,
        facilityId,
        invoiceStatus,
        page,
        limit,
      };
      const res = await this.apiService.get<InvoicesResponse>({ url, params }, req);
      const { invoices, _meta } = res.data;
      data.invoices = invoices;
      data._meta = _meta;

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
    const res = await this.apiService.get<PdfInvoice>({ url }, req);

    return { data: res.data, message: 'success' };
  }
}
