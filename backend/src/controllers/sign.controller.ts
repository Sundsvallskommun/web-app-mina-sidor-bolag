import { BANK_ID_DEV_PERSONAL_NUMBER, NODE_ENV } from '@/config';
import { SignDto } from '@/dtos/bankid.dto';
import { HttpException } from '@/exceptions/HttpException';
import { RequestWithUser } from '@/interfaces/auth.interface';
import { SignBody, SignCancelBody, SignCollectBody, SignCollectResponse, SignResponse, SignStatus } from '@/interfaces/bankid.interface';
import authMiddleware from '@/middlewares/auth.middleware';
import { SignApiResponse, SignCollectApiResponse } from '@/responses/bankid.response';
import { ApiResponse } from '@/services/api.service';
import BankIdApiService from '@/services/bankid-api.service';
import { QRGenerator } from '@/services/qr-code-generator.service';
import { handleSignCache } from '@/utils/handleSignCache';
import { logger } from '@/utils/logger';
import { Response } from 'express';
import { Body, Controller, Get, Param, Post, Req, Res, UseBefore } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

@Controller()
@UseBefore(authMiddleware)
export class SignController {
  private readonly apiService = new BankIdApiService();
  private readonly qrService = new QRGenerator();

  @Post('/sign')
  @OpenAPI({ summary: 'Initiate BankID signing process' })
  @ResponseSchema(SignApiResponse)
  async sign(@Req() req: RequestWithUser, @Body() body: SignDto, @Res() res: Response<SignApiResponse>): Promise<Response<SignApiResponse>> {
    const endUserIp = req.ip;
    const { personNumber } = req.user;
    const userNonVisibleData = body.details ? Buffer.from(JSON.stringify(body.details)).toString('base64') : undefined;
    const data: SignBody = {
      ...body,
      userNonVisibleData,
      endUserIp,
      requirement: {
        personalNumber: NODE_ENV === 'development' ? BANK_ID_DEV_PERSONAL_NUMBER : personNumber,
      },
    };

    try {
      const response = await this.apiService.post<SignResponse, SignBody>({
        url: 'sign',
        data,
      });

      const cacheHandler = handleSignCache(req);
      const startTime = Date.now();
      cacheHandler.set('pending', response.orderRef, { ...response, startTime });

      if (body.details) {
        cacheHandler.set('details', response.orderRef, body.details);
      }

      const qrCode = this.qrService.createQRData({ ...response, startTime });
      return res.send({ message: 'success', data: { orderRef: response.orderRef, autoStartToken: response.autoStartToken, qrCode } });
    } catch (error) {
      logger.error('message', error?.details);
      throw new HttpException(500, 'Failed to initiate BankID signing process');
    }
  }

  @Post('/sign/cancel/:ref')
  @OpenAPI({ summary: 'Cancel an initiated BankID signing process' })
  async cancel(
    @Req() req: RequestWithUser,
    @Param('ref') ref: string,
    @Res() res: Response<ApiResponse<null>>,
  ): Promise<Response<ApiResponse<null>>> {
    try {
      await this.apiService.post<SignResponse, SignCancelBody>({
        url: 'cancel',
        data: { orderRef: ref },
      });
      const cacheHandler = handleSignCache(req);
      cacheHandler.remove('pending', ref);
      cacheHandler.remove('details', ref);

      return res.send({ message: 'success', data: null });
    } catch (error) {
      logger.error('message', error?.details);
      throw new HttpException(500, 'Failed to cancel BankID signing process');
    }
  }

  @Get('/sign/:ref')
  @OpenAPI({ summary: 'Get BankID signing. If not completed, returns status. When completed, returns forderRef:result.orderRef' })
  @ResponseSchema(SignCollectApiResponse)
  async check(
    @Req() req: RequestWithUser,
    @Param('ref') ref: string,
    @Res() res: Response<SignCollectApiResponse>,
  ): Promise<Response<SignCollectApiResponse>> {
    try {
      const result = await this.apiService.post<SignCollectResponse, SignCollectBody>({
        url: 'collect',
        data: { orderRef: ref },
      });
      let qrCode: string | undefined = undefined;
      const cacheHandler = handleSignCache(req);

      if (result.status === SignStatus.Pending) {
        const sign = cacheHandler.get('pending', ref);
        qrCode = this.qrService.createQRData(sign);
      } else if (result.status === SignStatus.Completed) {
        cacheHandler.set('completed', ref, result);
        cacheHandler.remove('pending', ref);
      } else {
        cacheHandler.remove('pending', ref);
        cacheHandler.remove('details', ref);
      }

      return res.send({ message: 'success', data: { orderRef: result.orderRef, status: result.status, hintCode: result.hintCode, qrCode } });
    } catch (error) {
      logger.error('message', error?.details);
      throw new HttpException(500, 'Failed to get BankID signing process');
    }
  }
}
