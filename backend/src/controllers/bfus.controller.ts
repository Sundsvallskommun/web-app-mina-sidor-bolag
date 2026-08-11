import { BFUS_EXTERNAL_ID } from '@/config';
import { HttpException } from '@/exceptions/HttpException';
import { RequestWithUser } from '@/interfaces/auth.interface';
import {
  BFUSCustomerResponse,
  BFUSEligablePartyResponse,
  BFUSHasNewConsentsResponse,
} from '@/interfaces/bfus.interface';
import authMiddleware from '@/middlewares/auth.middleware';
import { BFUSApiResponse, BFUSConsentsApiResponse, BFUSNewConsentApiResponse } from '@/responses/bfus.response';
import { logger } from '@/utils/logger';
import axios from 'axios';
import { Response } from 'express';
import { Body, Controller, Get, HttpCode, HttpError, Post, QueryParam, Req, Res, UseBefore } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';
import { UpdateConsentDto } from '@dtos/update-consent.dto';
import { handleCustomerIds, sendConsentRequest } from '@/services/bfus.service';
import { FullConsentDto, ConsentRequestDto, ConsentHeaderDto } from '@dtos/consent-request.dto';
import { mapPartStatus } from '@utils/bfus-consent-status-code-helpers';
import { getApiBase } from '@/config/api-config';
import ApiService from '@/services/api.service';
import { User } from '@/interfaces/users.interface';
import { sessionCacheService } from '@/services/session-cache.service';

@Controller('/bfus')
export class BFUSController {
  private readonly apiService = new ApiService();
  private apiBase = getApiBase('bfus');

  async processConsent(operation: ConsentHeaderDto['Operation'], request: ConsentRequestDto, user: User) {
    const body: FullConsentDto = {
      Header: {
        ExternalId: BFUS_EXTERNAL_ID,
        Operation: operation,
      },
      PermissionRequest: {
        EligablePartyId: request.EligablePartyId,
        CustomerId: request.CustomerId,
      },
    };

    if (operation === 'grant' || operation === 'revoke') {
      body.PermissionRequest.ContractIdList = request.ContractIdList;
      body.PermissionRequest.CustomerId = null;
    } else if (operation === 'deny') {
      body.PermissionRequest.CustomerId = request.CustomerId;
    }

    try {
      const result = await sendConsentRequest(body, user, this.apiBase);

      if (result.Content.PermissionRequestExecuted === false) {
        throw new HttpException(500, 'Internal server error, request was not processed');
      }

      return result;
    } catch (error) {
      logger.error(`Error processing consent (${operation})`, error);
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
  async getBFUSCustomerId(@Req() req: RequestWithUser, @Res() res: Response<BFUSApiResponse>) {
    await sessionCacheService.cacheRelations(req);

    const relationsCache = req.session.cache.relations!;
    const allCustomerNumbers = [
      ...(relationsCache.customerNumber ?? []),
      ...(relationsCache.customerRelations?.map(r => r.customerNumber).filter(Boolean) ?? []),
    ];
    const uniqueCustomerNumbers = Array.from(new Set(allCustomerNumbers));

    if (!uniqueCustomerNumbers.length) {
      throw new HttpException(400, 'No BFUS customer number available');
    }

    const results = await Promise.allSettled(
      uniqueCustomerNumbers.map(cn => {
        const url = `${this.apiBase}/EP/Customer/GetEPCustomerByCode_v1/${BFUS_EXTERNAL_ID}/${cn}`;
        return this.apiService.get<BFUSCustomerResponse>({ url }, req.user);
      }),
    );

    const customerIds = results
      .filter(r => r.status === 'fulfilled')
      .map(r => r.value.data.Content.Customer.CustomerId);

    return res.send({
      data: { customerIds },
      message: 'success',
    });
  }

  @Get('/consents/new')
  @OpenAPI({ summary: 'Check if user has new consents' })
  @UseBefore(authMiddleware)
  async hasNewConsent(
    @Req() req: RequestWithUser,
    @Res() res: Response<BFUSNewConsentApiResponse>,
    @QueryParam('customerIds') customerIds: string,
  ): Promise<Response<BFUSNewConsentApiResponse>> {
    const ids = await handleCustomerIds(customerIds);

    try {
      const responses = await Promise.allSettled(
        ids.map(cn => {
          const url = `${this.apiBase}/EP/EligableParty/NewPermissions/${BFUS_EXTERNAL_ID}/${cn}`;
          return this.apiService.get<BFUSHasNewConsentsResponse>({ url }, req.user);
        }),
      );

      const newConsents = responses.filter(r => r.status === 'fulfilled').map(r => r.value.data.Content.NewPermissions);

      return res.send({
        data: newConsents.some(r => r.HasPermissions === true),
        message: 'success',
      });
    } catch (error: any) {
      logger.error('Unexpected error when checking if user has new consents', error.message);
      throw new HttpError(500, 'Unexpected server error');
    }
  }

  @Get('/consents')
  @OpenAPI({ summary: 'Returns a list of BFUS consents' })
  @ResponseSchema(BFUSConsentsApiResponse)
  @UseBefore(authMiddleware)
  async GetConsents(
    @Req() req: RequestWithUser,
    @QueryParam('customerIds') customerIds: string,
    @Res() res: Response<BFUSConsentsApiResponse>,
  ): Promise<Response<BFUSConsentsApiResponse>> {
    const ids = await handleCustomerIds(customerIds);

    try {
      const responses = await Promise.allSettled(
        ids.map(customerId => {
          const url = `${this.apiBase}/EP/EligableParty/EligablePartyPermissions/${BFUS_EXTERNAL_ID}/${customerId}`;
          return this.apiService.get<BFUSEligablePartyResponse>({ url }, req.user);
        }),
      );

      const consents = responses
        .filter(r => r.status === 'fulfilled')
        .map(r => r.value.data.Content.EligablePartyParts);

      const consentParts = consents.flatMap(r => r ?? []);

      const mappedParts = consentParts.map(p => ({
        ...p,
        StatusCategory: mapPartStatus(p),
      }));

      return res.send({
        message: mappedParts.length ? 'success' : 'no consents available',
        data: { consents: mappedParts },
      });
    } catch (error: any) {
      logger.error('Unexpected error fetching consents', error.message);
      throw new HttpError(500, 'Unexpected server error');
    }
  }

  @Post('/consent/grant')
  @HttpCode(201)
  async grantPermission(@Req() req: RequestWithUser, @Body() dto: UpdateConsentDto) {
    return this.processConsent('grant', dto.PermissionRequest, req.user);
  }

  @Post('/consent/deny')
  @HttpCode(200)
  async denyPermission(@Req() req: RequestWithUser, @Body() dto: UpdateConsentDto) {
    return this.processConsent('deny', dto.PermissionRequest, req.user);
  }

  @Post('/consent/revoke')
  @HttpCode(200)
  async revokePermission(@Req() req: RequestWithUser, @Body() dto: UpdateConsentDto) {
    return this.processConsent('revoke', dto.PermissionRequest, req.user);
  }
}
