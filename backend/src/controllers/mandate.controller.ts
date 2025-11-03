import { MUNICIPALITY_ID, NAMESPACE } from '@/config';
import { getApiBase } from '@/config/api-config';
import { CreateMandate, MandateDetails, Mandates, SearchMandateParameters } from '@/data-contracts/myrepresentatives/data-contracts';
import { CreateMandateDto, MandatePaginationDto } from '@/dtos/mandate.dto';
import { HttpException } from '@/exceptions/HttpException';
import { RequestWithUser } from '@/interfaces/auth.interface';
import { SignCollectResponse, SignStatus } from '@/interfaces/bankid.interface';
import { SignMandateCache } from '@/interfaces/mandates.interface';
import authMiddleware from '@/middlewares/auth.middleware';
import mandateMiddleware from '@/middlewares/mandate.middleware';
import { MandateApiResponse, MandatesApiResponse } from '@/responses/mandates.response';
import ApiService, { ApiResponse } from '@/services/api.service';
import { handleSignCache } from '@/utils/handleSignCache';
import { logger } from '@/utils/logger';
import dayjs from 'dayjs';
import { Response } from 'express';
import { Body, Controller, Delete, Get, Param, Post, QueryParams, Req, Res, UseBefore } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

@Controller()
@UseBefore(authMiddleware)
export class MandateController {
  private readonly apiService = new ApiService();
  private readonly apiBase = `${getApiBase('myrepresentatives')}/${MUNICIPALITY_ID}/${NAMESPACE}`;

  @Get('/mandates/personal')
  @OpenAPI({ summary: 'Get all mandates given to me' })
  @ResponseSchema(MandatesApiResponse)
  async getMyMandates(
    @Req() req: RequestWithUser,
    @QueryParams() queryParams: MandatePaginationDto,
    @Res() res: Response<MandatesApiResponse>,
  ): Promise<Response<MandatesApiResponse>> {
    const { partyId } = req.user;
    const url = `${this.apiBase}/mandates`;
    const params: SearchMandateParameters = {
      ...queryParams,
      granteePartyId: partyId,
    };
    try {
      const result = await this.apiService.get<Mandates>({ url, params }, req.user);
      return res.send({ message: 'success', ...result.data._meta, data: result.data.mandateDetailsList });
    } catch (error) {
      logger.error('Error getting my mandates: ', error);
      throw new HttpException(500, 'Error getting mandates');
    }
  }

  @Get('/mandates/org/:partyid')
  @OpenAPI({ summary: 'Get all mandates for an organization' })
  @ResponseSchema(MandatesApiResponse)
  async getOrgMandates(
    @Req() req: RequestWithUser,
    @Param('partyid') id: string,
    @QueryParams() queryParams: MandatePaginationDto,
    @Res() res: Response<MandatesApiResponse>,
  ): Promise<Response<MandatesApiResponse>> {
    const url = `${this.apiBase}/mandates`;
    const params: SearchMandateParameters = {
      ...queryParams,
      grantorPartyId: id,
    };
    try {
      const result = await this.apiService.get<Mandates>({ url, params }, req.user);
      return res.send({ message: 'success', ...result.data._meta, data: result.data.mandateDetailsList });
    } catch (error) {
      logger.error('Error getting org mandates: ', error);
      throw new HttpException(500, 'Error getting mandates');
    }
  }

  @Post('/mandates')
  @OpenAPI({ summary: 'Create new mandate from completed BankId sign' })
  @UseBefore(mandateMiddleware)
  @ResponseSchema(MandateApiResponse)
  async createMandate(
    @Req() req: RequestWithUser,
    @Body() body: CreateMandateDto,
    @Res() res: Response<MandateApiResponse>,
  ): Promise<Response<MandateApiResponse>> {
    const { partyId } = req.user;
    const url = `${this.apiBase}/mandates`;
    try {
      const cacheHandler = handleSignCache(req);
      const { granteeId, grantorId, ...mandate } = cacheHandler.get<SignMandateCache>('mandates', body.bankIdRef);

      const sign: SignCollectResponse = cacheHandler.get('completed', body.bankIdRef);
      const grantorDetails = req.session.representing?.BUSINESS;

      if (!mandate || !sign) {
        throw new HttpException(422, 'Can not find BankId sign details');
      }
      if (sign.status !== SignStatus.Completed) {
        throw new HttpException(403, 'Mandate is not signed');
      }

      const data: CreateMandate = {
        ...mandate,
        grantorDetails: {
          grantorPartyId: grantorDetails.partyId,
          name: grantorDetails.organizationName,
          signatoryPartyId: partyId,
        },
        signingInfo: {
          ...sign,
          completionData: {
            ...sign.completionData,
            bankIdIssueDate: dayjs(sign.completionData.bankIdIssueDate).format('YYYY-MM-DD'),
            risk: sign.completionData?.risk ?? 'low',
            stepUp: sign.completionData.stepUp ?? { mrtd: false },
          },
        },
        granteeDetails: {
          partyId: granteeId,
        },
      };

      const result = await this.apiService.post<MandateDetails, CreateMandate>({ url, data }, req.user);
      cacheHandler.remove('details', body.bankIdRef);
      cacheHandler.remove('completed', body.bankIdRef);
      return res.send({ message: 'success', data: result.data });
    } catch (error) {
      logger.error('Error creating mandates: ', error);
      throw new HttpException(error?.httpCode ?? 500, error?.message ?? 'Error creating mandates');
    }
  }

  @Delete('/mandates/:id')
  @OpenAPI({ summary: 'Soft delete a mandate' })
  async deleteMandates(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
    @Res() res: Response<ApiResponse<null>>,
  ): Promise<Response<ApiResponse<null>>> {
    const url = `${this.apiBase}/mandates/${id}`;

    try {
      await this.apiService.delete({ url }, req.user);
      return res.send({ message: 'success', data: null });
    } catch (error) {
      logger.error('Error deleting mandate: ', error);
      throw new HttpException(500, 'Error deleting mandate');
    }
  }
}
