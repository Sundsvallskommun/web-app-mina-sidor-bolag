import { ENEO_API_KEY, MUNICIPALITY_ID } from '@/config';
import { getApiBase } from '@/config/api-config';
import { QuestionResponse, SessionStatusResponse } from '@/data-contracts/selfserviceai/data-contracts';
import { ConversationRequest } from '@/dtos/conversation.dto';
import ApiService from '@/services/api.service';
import { logger } from '@/utils/logger';
import { HttpException } from '@exceptions/HttpException';
import { ResponseData } from '@interfaces/service';
import { Request, Response } from 'express';
import Stream from 'node:stream';
import { Body, Controller, Get, HttpError, Post, Req, Res } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';
import { SessionStatusApiResponse } from '@/responses/self-service-ai.response';

@Controller()
export class SelfServiceAiController {
  private readonly apiService = new ApiService();
  private readonly selfServiceAIApiBase = getApiBase('selfserviceai');
  private readonly eneoApiBase = getApiBase('eneo-sundsvall');

  @Get('/ai/isReady')
  @OpenAPI({
    summary: 'Check if assistant is ready for interaction',
  })
  @ResponseSchema(SessionStatusApiResponse)
  async isReady(@Req() req: Request): Promise<ResponseData<SessionStatusResponse>> {
    const id = req.session?.ai?.sessionId;
    if (!id) {
      throw new HttpException(400, 'Bad Request');
    }

    const sessionUrl = `${this.selfServiceAIApiBase}/${MUNICIPALITY_ID}/session/${id}`;
    const readyUrl = `${sessionUrl}/ready`;
    const res = await this.apiService.get<SessionStatusResponse>({ url: readyUrl }, req.user);

    if (res.data.status === 'READY') {
      await this.apiService.get<QuestionResponse>(
        { url: sessionUrl, params: { question: 'Här är min info. Svara ej på detta meddelande.' } },
        req.user,
      );
    } else if (res.data.status === 'PENDING') {
      logger.info(`SSAI is ${res.data.status}, details: ${res.data.detail}`);
    } else {
      logger.error(`SSAI ${res.data.status}, details: ${res.data.detail}`);
    }

    return { data: res.data, message: 'success' };
  }

  @Post('/ai/conversations')
  @OpenAPI({
    summary: 'Chat with an assistant',
  })
  async conversation(
    @Req() req: Request,
    @Body() body: ConversationRequest,
    @Res() response: Response<QuestionResponse | Stream>,
  ): Promise<Response<QuestionResponse> | Stream> {
    const assistant_id = req.session?.ai?.assistantId;
    const session_id = req.session?.ai?.sessionId;

    if (!assistant_id || !session_id) {
      throw new HttpException(412, 'Not ready');
    }
    const url = `${this.eneoApiBase}/conversations/`;
    const responseType = body?.stream ? 'stream' : 'json';

    // Eneo 2.0 requires exactly one of session_id / assistant_id / group_chat_id.
    // When continuing a session, session_id wins and the others must be dropped.
    const data: ConversationRequest = {
      question: body.question,
      stream: body.stream,
      session_id,
    };

    try {
      if (responseType === 'json') {
        const res = await this.apiService.post<QuestionResponse, ConversationRequest>(
          {
            url,
            data,
            headers: { 'api-key': ENEO_API_KEY },
            responseType,
          },
          req.user,
        );

        return response.send(res.data);
      } else {
        const res = await this.apiService.post<Stream, ConversationRequest>(
          {
            url,
            data,
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
}
