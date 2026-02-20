import { MUNICIPALITY_ID, ENEO_API_KEY } from '@/config';
import ApiService from '@/services/api.service';
import { logger } from '@/utils/logger';
import { Request, Response } from 'express';
import { Body, Controller, Delete, Get, HttpError, Param, Post, Req, Res, UseBefore } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';
import { getApiBase } from '@/config/api-config';
import authMiddleware from '@middlewares/auth.middleware';
import { getRepresentingPartyId } from '@utils/getRepresentingPartyId';
import { HttpException } from '@exceptions/HttpException';
import { SessionRequest, SessionResponse } from '@/data-contracts/selfserviceai/data-contracts';
import { SessionResponse as ISessionResponse } from '@/responses/self-service-ai.response';
import { ConversationRequest } from '@/responses/eneo-sundsvall.response';
import Stream from 'node:stream';
import { ResponseData } from '@interfaces/service';

@Controller()
@UseBefore(authMiddleware)
export class SelfServiceAiController {
  private apiService = new ApiService();
  private selfServiceAIApiBase = getApiBase('selfserviceai');
  private eneoApiBase = getApiBase('eneo-sundsvall');

  @Post('/session')
  @OpenAPI({
    summary: 'Create assistant session',
  })
  @ResponseSchema(ISessionResponse)
  @UseBefore(authMiddleware)
  async create(@Req() req: Request): Promise<ResponseData<SessionResponse>> {
    console.log('SESSION START REQUEST');
    const representing = req.session?.representing ?? undefined;
    const partyId = getRepresentingPartyId(representing);
    const customerEngagements = req.session.cache.relations.customerRelations ?? [];

    if (!partyId || !customerEngagements.length) {
      throw new HttpException(400, 'Bad Request');
    }

    const requestBody: SessionRequest = {
      partyId: partyId,
      customerEngagementOrgIds: customerEngagements.map(engagement => engagement.organizationNumber),
    };

    try {
      const url = `${this.selfServiceAIApiBase}/${MUNICIPALITY_ID}/session`;

      const res = await this.apiService.post<SessionResponse, SessionRequest>({ url, data: requestBody }, req.user);
      return { data: res.data, message: 'success' };
    } catch (e) {
      logger.error('Error creating session', e);
      throw new HttpError(e?.httpCode ?? 500, e?.message ?? 'Error creating session');
    }
  }

  @Get('/isReady/:id')
  @OpenAPI({
    summary: 'Check if assistant is ready for interaction',
  })
  @UseBefore(authMiddleware)
  async isReady(@Req() req: Request, @Param('id') id: string): Promise<ResponseData<boolean>> {
    console.log('IS READY REQUEST');
    if (!id) {
      throw new HttpException(400, 'Bad Request');
    }

    try {
      const url = `${this.selfServiceAIApiBase}/${MUNICIPALITY_ID}/session/${id}/ready`;
      const res = await this.apiService.get<boolean>({ url: url }, req.user);
      return { data: res.data, message: 'success' };
    } catch (e) {
      logger.error('Error checking if assistant is ready', e);
      throw new HttpError(e?.httpCode ?? 500, e?.message ?? 'Could not check if assistant is ready');
    }
  }

  @Post('/conversations')
  @OpenAPI({
    summary: 'Chat with an assistant',
  })
  @UseBefore(authMiddleware)
  async conversation(
    @Req() req: Request,
    @Body() body: ConversationRequest,
    @Res() response: Response<string | Stream>,
  ): Promise<Response<string> | Stream> {
    console.log('CONVERSATION REQUEST');
    if (!body.assistant_id && !body.group_chat_id && !body.session_id) {
      throw new HttpError(400, 'No assistant id, group chat id, or session id provided');
    }

    const url = `${this.eneoApiBase}/conversations/`;
    const responseType = body?.stream ? 'stream' : 'json';
    const data: ConversationRequest = body;
    try {
      if (responseType === 'json') {
        const res = await this.apiService.post<string, ConversationRequest>(
          {
            url: url,
            data: data,
            headers: { 'api-key': ENEO_API_KEY },
            responseType,
          },
          req.user,
        );

        return response.send(res.data);
      } else {
        const res = await this.apiService.post<Stream, ConversationRequest>(
          {
            url: url,
            data: data,
            headers: { 'api-key': ENEO_API_KEY },
            responseType,
          },
          req.user,
        );
        const dataStream = res.data;
        dataStream.on('data', (buf: Buffer) => {
          return buf;
        });

        dataStream.on('end', () => {
          return response.end();
        });
        return res.data;
      }
    } catch (e) {
      logger.error('Error sending question to conversation.', e);
      throw new HttpError(e?.httpCode ?? 500, e?.message ?? 'Error sending question to conversation.');
    }
  }

  @Delete('/session/:id')
  @OpenAPI({
    summary: 'Delete session by id',
  })
  @UseBefore(authMiddleware)
  async delete_session(@Req() req: Request, @Param('id') id: string, @Res() response: Response): Promise<Response> {
    const url = `${this.selfServiceAIApiBase}/${MUNICIPALITY_ID}/session/${id}`;

    try {
      await this.apiService.delete({ url: url }, req.user);
      return response.status(204).send();
    } catch (e) {
      logger.error('Error deleting session', e);
      throw new HttpError(e?.httpCode ?? 500, e?.message ?? 'Could not delete session');
    }
  }
}
