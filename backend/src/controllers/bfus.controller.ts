import { BFUS_API_KEY, BFUS_BASE_URL, BFUS_EXTERNAL_ID } from '@/config';
import { HttpException } from '@/exceptions/HttpException';
import { RequestWithUser } from '@/interfaces/auth.interface';
import { BFUSCustomerResponse } from '@/interfaces/bfus.interface';
import authMiddleware from '@/middlewares/auth.middleware';
import { BFUSApiResponse } from '@/responses/bfus.response';
import { logger } from '@/utils/logger';
import axios from 'axios';
import { Response } from 'express';
import { Controller, Get, HttpError, Req, Res, UseBefore } from 'routing-controllers';
import { OpenAPI } from 'routing-controllers-openapi';

@Controller()
export class BFUSController {
  @Get('/customer-code')
  @OpenAPI({ summary: 'Returns a customer code from BFUS' })
  @UseBefore(authMiddleware)
  async getBFUSCustomerId(
    @Req() req: RequestWithUser,
    @Res() res: Response<BFUSApiResponse>,
  ): Promise<Response<BFUSApiResponse>> {
    const relations = req?.session?.cache?.relations ?? { customerRelations: [], customerNumber: [] };

    if (!relations || !relations.customerNumber.length) {
      throw new HttpException(400, 'No relations or customer number available');
    }

    try {
      const url = `${BFUS_BASE_URL}/EP/Customer/GetEPCustomerByCode_v1/${BFUS_EXTERNAL_ID}/${relations.customerNumber[0]}`;

      const response = await axios.get<BFUSCustomerResponse>(url, {
        headers: { Authorization: BFUS_API_KEY },
      });

      return res.send({
        message: 'success',
        customerId: response.data.Content.Customer.CustomerId,
      });
    } catch (error: any) {
      const err = error as HttpError;
      logger.error('Error getting BFUS Customer', err.message);
      throw new HttpError(err.httpCode, err.message || 'Connection error');
    }
  }
}
