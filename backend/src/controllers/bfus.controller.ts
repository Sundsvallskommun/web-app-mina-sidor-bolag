import { BFUS_API_KEY, BFUS_BASE_URL, BFUS_EXTERNAL_ID } from '@/config';
import { HttpException } from '@/exceptions/HttpException';
import { RequestWithUser } from '@/interfaces/auth.interface';
import { BFUSCustomerResponse, BFUSEligablePartyResponse } from '@/interfaces/bfus.interface';
import authMiddleware from '@/middlewares/auth.middleware';
import { BFUSApiResponse, BFUSEligablePartyApiResponse } from '@/responses/bfus.response';
import { logger } from '@/utils/logger';
import axios, { AxiosResponse } from 'axios';
import { Response } from 'express';
import { Controller, Get, HttpError, QueryParam, Req, Res, UseBefore } from 'routing-controllers';
import { OpenAPI } from 'routing-controllers-openapi';
import _ from 'lodash';

@Controller()
export class BFUSController {
  @Get('/customer-id')
  @OpenAPI({ summary: 'Returns a list with customer id:s from BFUS' })
  @UseBefore(authMiddleware)
  async getBFUSCustomerId(
    @Req() req: RequestWithUser,
    @Res() res: Response<BFUSApiResponse>,
  ): Promise<Response<BFUSApiResponse>> {
    const relations = req?.session?.cache?.relations ?? { customerRelations: [], customerNumber: [] };

    if (!relations?.customerNumber?.length) {
      throw new HttpException(400, 'No relations or customer number available');
    }

    try {
      const results = await Promise.allSettled(
        relations.customerNumber.map(cn => {
          const url = `${BFUS_BASE_URL}/EP/Customer/GetEPCustomerByCode_v1/${BFUS_EXTERNAL_ID}/${cn}`;
          return axios.get<BFUSCustomerResponse>(url, {
            headers: { Authorization: BFUS_API_KEY },
          });
        }),
      );

      const customerIds = results
        .filter(r => r.status === 'fulfilled')
        .map(
          (r: PromiseFulfilledResult<AxiosResponse<BFUSCustomerResponse>>) => r.value.data.Content.Customer.CustomerId,
        );

      return res.send({
        message: 'success',
        customerIds: customerIds,
      });
    } catch (error: any) {
      logger.error('Unexpected error in BFUS Customer', error.message);
      throw new HttpError(500, 'Unexpected server error');
    }
  }

  @Get('/eligable-party-permissions')
  @OpenAPI({ summary: 'Returns a list with eligable party permissions' })
  @UseBefore(authMiddleware)
  async GetEligablePartyPermissions(
    @QueryParam('customerId') customerId: string,
    @Res() res: Response<BFUSEligablePartyApiResponse>,
  ): Promise<Response<BFUSEligablePartyApiResponse>> {
    if (!customerId) {
      throw new HttpException(400, 'No customer id found');
    }

    const customerIdNumber = Number(customerId);

    if (Number.isNaN(customerIdNumber)) {
      throw new HttpException(400, 'Customer id must be a number');
    }

    try {
      const url = `${BFUS_BASE_URL}/EP/EligableParty/EligablePartyPermissions/${BFUS_EXTERNAL_ID}/${customerId}`;
      const result = await axios.get<BFUSEligablePartyResponse>(url, {
        headers: { Authorization: BFUS_API_KEY },
      });

      return res.send({
        message: _.isEmpty(result.data.Content) ? 'no eligable party parts available' : 'success',
        eligablePartyParts: result.data.Content.EligablePartyParts,
      });
    } catch (error: any) {
      logger.error('Unexpected error in BFUS eligable party permissions', error.message);
      throw new HttpError(500, 'Unexpected server error');
    }
  }
}
