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
      // The session in Eneo is started by the first question asked via self-service-ai, so ask it once and keep the
      // id of the Eneo session for /ai/conversations, which talks to Eneo directly.
      if (!req.session.ai.eneoSessionId) {
        if (res.data.eneoSessionId) {
          req.session.ai.eneoSessionId = res.data.eneoSessionId;
        } else {
          const primed = await this.apiService.get<QuestionResponse>(
            { url: sessionUrl, params: { question: 'Här är min info. Svara ej på detta meddelande.' } },
            req.user,
          );
          // Before self-service-ai 2.0 with HYDRAN-2993 the session id and the Eneo session id were the same, so fall
          // back to sessionId to stay compatible with the older backend. Lets this be deployed before the backend.
          req.session.ai.eneoSessionId = primed.data?.eneoSessionId ?? primed.data?.sessionId;
        }
      }
      if (!req.session.ai.eneoSessionId) {
        logger.error('SSAI is READY but no Eneo session id was returned; conversations will not work');
      }
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
    // Eneo knows the session by the id self-service-ai got back from the first question, not by self-service-ai's own id
    const session_id = req.session?.ai?.eneoSessionId;

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
