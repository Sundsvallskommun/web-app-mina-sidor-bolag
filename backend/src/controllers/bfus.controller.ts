import { API_BASE_URL, BFUS_API_KEY, BFUS_EXTERNAL_ID } from '@/config';
import { HttpException } from '@/exceptions/HttpException';
import { RequestWithUser } from '@/interfaces/auth.interface';
import {
  BFUSCustomerResponse,
  BFUSEligablePartyResponse,
  BFUSHasNewPermissionResponse,
} from '@/interfaces/bfus.interface';
import authMiddleware from '@/middlewares/auth.middleware';
import { BFUSApiResponse, BFUSEligablePartyApiResponse, BFUSNewPermissionApiResponse } from '@/responses/bfus.response';
import { logger } from '@/utils/logger';
import axios, { AxiosResponse } from 'axios';
import { Response } from 'express';
import { Body, Controller, Get, HttpCode, HttpError, Post, QueryParam, Req, Res, UseBefore } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';
import { UpdatePermissionDto } from '@/dtos/update-permission.dto';
import { sendPermissionRequest } from '@/services/bfus.service';
import { FullPermissionDto, PermissionRequestDto } from '@/dtos/permission-request.dto';
import { PermissionHeaderDto } from '@/dtos/permission-header.dto';
import { mapPartStatus } from '@/utils/bfus-permission-status-code-helpers';
import ApiTokenService from '@/services/api-token.service';
import { getApiBase } from '@/config/api-config';

@Controller('/bfus')
export class BFUSController {
  private apiBase = getApiBase('bfus');

  async requireToken(): Promise<string> {
    const apiTokenService = new ApiTokenService();
    const token = await apiTokenService.getToken();

    if (!token) {
      throw new HttpException(500, 'No token');
    }

    return token;
  }

  async processPermission(operation: PermissionHeaderDto['Operation'], request: PermissionRequestDto) {
    const now = new Date().toLocaleDateString();
    const body: FullPermissionDto = {
      Header: {
        ExternalId: BFUS_EXTERNAL_ID,
        Operation: operation,
      },
      PermissionRequest: {
        EligablePartyId: request.EligablePartyId,
        CustomerId: request.CustomerId,
        EndDate: now,
      },
    };

    if (operation === 'grant' || operation === 'revoke') {
      body.PermissionRequest.ContractIdList = request.ContractIdList;
      body.PermissionRequest.CustomerId = null;
    } else if (operation === 'deny') {
      body.PermissionRequest.CustomerId = request.CustomerId;
    }

    try {
      const result = await sendPermissionRequest(body, () => this.requireToken());
      return result;
    } catch (error) {
      logger.error(`Error processing permission (${operation})`, error);
      if (axios.isAxiosError(error) && error.response) {
        console.error('Status:', error.response?.status);
        console.error('Data:', JSON.stringify(error.response?.data, null, 2));
        console.error('Request:', error.config);
        throw new HttpException(error.response.status, error.response.statusText);
      }
      throw new HttpException(500, 'Internal server error');
    }
  }

  @Get('/eligable-party-customer-id')
  @OpenAPI({ summary: 'Returns a list with customer id:s from BFUS' })
  @ResponseSchema(BFUSApiResponse)
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
      const token = await this.requireToken();
      const results = await Promise.allSettled(
        relations.customerNumber.map(cn => {
          const url = `${API_BASE_URL}/${this.apiBase}/EP/Customer/GetEPCustomerByCode_v1/${BFUS_EXTERNAL_ID}/${cn}`;
          return axios.get<BFUSCustomerResponse>(url, {
            headers: { Authorization: `Bearer ${token}, ${BFUS_API_KEY}` },
          });
        }),
      );

      const customerIds = results
        .filter(r => r.status === 'fulfilled')
        .map(
          (r: PromiseFulfilledResult<AxiosResponse<BFUSCustomerResponse>>) => r.value.data.Content.Customer.CustomerId,
        );

      return res.send({
        data: {
          customerIds: customerIds,
        },
        message: 'success',
      });
    } catch (error: any) {
      logger.error('Unexpected error in BFUS Customer', error.message);
      throw new HttpError(500, 'Unexpected server error');
    }
  }

  @Get('/new-permissions')
  @OpenAPI({ summary: 'Check if user has new permissions' })
  @UseBefore(authMiddleware)
  async hasNewPermissions(
    @Res() res: Response<BFUSNewPermissionApiResponse>,
    @QueryParam('customerIds') customerIds: string,
  ): Promise<Response<BFUSNewPermissionApiResponse>> {
    if (!customerIds) {
      throw new HttpException(400, 'No customer ids found');
    }

    const ids = customerIds
      .split(',')
      .map(id => Number(id.trim()))
      .filter(id => !Number.isNaN(id));

    if (!ids.length) {
      throw new HttpException(400, 'Customer ids must be numbers');
    }

    try {
      const token = await this.requireToken();
      const responses = await Promise.allSettled(
        ids.map(cn => {
          const url = `${API_BASE_URL}/${this.apiBase}/EP/EligableParty/NewPermissions/${BFUS_EXTERNAL_ID}/${cn}`;
          return axios.get<BFUSHasNewPermissionResponse>(url, {
            headers: { Authorization: `Bearer ${token}, ${BFUS_API_KEY}` },
          });
        }),
      );

      return res.send({
        data: responses.some(
          (r: PromiseFulfilledResult<AxiosResponse<BFUSHasNewPermissionResponse>>) =>
            r.value.data.Content.NewPermissions.HasPermissions === true,
        ),
        message: 'success',
      });
    } catch (error: any) {
      logger.error('Unexpected error in BFUS Customer', error.message);
      throw new HttpError(500, 'Unexpected server error');
    }
  }

  @Get('/eligable-party-permissions')
  @OpenAPI({ summary: 'Returns a list of eligable party permissions' })
  @ResponseSchema(BFUSEligablePartyApiResponse)
  @UseBefore(authMiddleware)
  async GetEligablePartyPermissions(
    @QueryParam('customerIds') customerIds: string,
    @Res() res: Response<BFUSEligablePartyApiResponse>,
  ): Promise<Response<BFUSEligablePartyApiResponse>> {
    if (!customerIds) {
      throw new HttpException(400, 'No customer ids found');
    }

    const ids = customerIds
      .split(',')
      .map(id => Number(id.trim()))
      .filter(id => !Number.isNaN(id));

    if (!ids.length) {
      throw new HttpException(400, 'Customer ids must be numbers');
    }

    try {
      const token = await this.requireToken();
      const responses = await Promise.all(
        ids.map(customerId => {
          const url = `${API_BASE_URL}/${this.apiBase}/EP/EligableParty/EligablePartyPermissions/${BFUS_EXTERNAL_ID}/${customerId}`;
          return axios.get<BFUSEligablePartyResponse>(url, {
            headers: { Authorization: `Bearer ${token}, ${BFUS_API_KEY}` },
          });
        }),
      );

      const eligablePartyParts = responses.flatMap(r => r.data.Content?.EligablePartyParts ?? []);

      const mappedParts = eligablePartyParts.map(p => ({
        ...p,
        StatusCategory: mapPartStatus(p),
      }));

      return res.send({
        message: mappedParts.length ? 'success' : 'no eligable party parts available',
        data: { eligablePartyParts: mappedParts },
      });
    } catch (error: any) {
      logger.error('Unexpected error in BFUS aggregated eligable party permissions', error.message);
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
