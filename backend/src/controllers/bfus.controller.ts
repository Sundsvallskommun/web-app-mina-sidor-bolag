import { BFUS_API_KEY, BFUS_BASE_URL, BFUS_EXTERNAL_ID } from '@/config';
import { HttpException } from '@/exceptions/HttpException';
import { RequestWithUser } from '@/interfaces/auth.interface';
import { BFUSCustomerResponse, BFUSEligablePartyResponse } from '@/interfaces/bfus.interface';
import authMiddleware from '@/middlewares/auth.middleware';
import { BFUSApiResponse, BFUSEligablePartyApiResponse } from '@/responses/bfus.response';
import { logger } from '@/utils/logger';
import axios, { AxiosResponse } from 'axios';
import { Response } from 'express';
import { Body, Controller, Get, HttpCode, HttpError, Post, QueryParam, Req, Res, UseBefore } from 'routing-controllers';
import { OpenAPI } from 'routing-controllers-openapi';
import _ from 'lodash';
import { UpdatePermissionDto } from '@/dtos/update-permission.dto';
import { sendPermissionRequest } from '@/services/bfus.service';
import { FullPermissionDto, PermissionRequestDto } from '@/dtos/permission-request.dto';
import { PermissionHeaderDto } from '@/dtos/permission-header.dto';
import { mapPartStatus } from '@/utils/bfus-permission-status-code-helpers';

@Controller('/bfus')
export class BFUSController {
  async processPermission(operation: PermissionHeaderDto['Operation'], request: PermissionRequestDto) {
    const body: FullPermissionDto = {
      Header: {
        ExternalId: BFUS_EXTERNAL_ID,
        Operation: operation,
      },
      PermissionRequest: {
        EligablePartyId: request.EligablePartyId,
      },
    };

    if (operation === 'grant' || operation === 'revoke') {
      body.PermissionRequest.ContractIdList = request.ContractIdList;
    } else if (operation === 'deny') {
      body.PermissionRequest.CustomerId = request.CustomerId;
    }

    try {
      const result = await sendPermissionRequest(body);
      return {
        Header: result.Header,
        Content: result.Content,
      };
    } catch (error) {
      logger.error(`Error processing permission (${operation})`, error);

      if (axios.isAxiosError(error) && error.response) {
        throw new HttpException(error.response.status, error.response.statusText);
      }

      throw new HttpException(500, 'Internal server error');
    }
  }

  @Get('/eligable-party-customer-id')
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

      const eligablePartyParts = result.data.Content.EligablePartyParts;

      const statusCodeMappedParts = eligablePartyParts.map(p => ({
        ...p,
        statusCategory: mapPartStatus(p),
      }));

      return res.send({
        message: _.isEmpty(result.data.Content) ? 'no eligable party parts available' : 'success',
        eligablePartyParts: statusCodeMappedParts,
      });
    } catch (error: any) {
      logger.error('Unexpected error in BFUS eligable party permissions', error.message);
      throw new HttpError(500, 'Unexpected server error');
    }
  }

  @Post('/eligable-party-grant-permission')
  @HttpCode(201)
  async grantPermission(@Body() dto: UpdatePermissionDto) {
    return this.processPermission('grant', dto.PermissionRequest);
  }

  @Post('/eligable-party-deny-permission')
  @HttpCode(200)
  async denyPermission(@Body() dto: UpdatePermissionDto) {
    return this.processPermission('deny', dto.PermissionRequest);
  }

  @Post('/eligable-party-revoke-permission')
  @HttpCode(200)
  async revokePermission(@Body() dto: UpdatePermissionDto) {
    return this.processPermission('revoke', dto.PermissionRequest);
  }
}
