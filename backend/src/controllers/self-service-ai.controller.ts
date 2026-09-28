import { ENEO_API_KEY, MUNICIPALITY_ID } from '@/config';
import { getApiBase } from '@/config/api-config';
import { QuestionResponse, SessionStatusResponse } from '@/data-contracts/selfserviceai/data-contracts';
import { ConversationRequest } from '@/dtos/conversation.dto';
import { RequestWithUser } from '@/interfaces/auth.interface';
import ApiService from '@/services/api.service';
import { startAISession } from '@/services/selfserviceai.service';
import { logger } from '@/utils/logger';
import { HttpException } from '@exceptions/HttpException';
import { ResponseData } from '@interfaces/service';
import { Request, Response } from 'express';
import Stream from 'node:stream';
import { Body, Controller, Get, HttpError, Post, Req, Res } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';
import { SessionStatusApiResponse } from '@/responses/self-service-ai.response';

const PRIMING_QUESTION = 'Här är min info. Svara ej på detta meddelande.';
// How long a restarted session may take to become READY before the question is given up. Population normally takes a
// few seconds; the upper bound guards against a stalled self-service-ai.
const RESTART_READY_TIMEOUT_MS = 30_000;
const RESTART_POLL_INTERVAL_MS = 1_000;

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

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

    const readyUrl = `${this.sessionUrl(id)}/ready`;
    const res = await this.apiService.get<SessionStatusResponse>({ url: readyUrl }, req.user);

    if (res.data.status === 'READY') {
      await this.resolveEneoSessionId(req, res.data);
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
    let session_id = req.session?.ai?.eneoSessionId;

    if (!assistant_id || !session_id) {
      throw new HttpException(412, 'Not ready');
    }
    const responseType = body?.stream ? 'stream' : 'json';

    try {
      let res: Awaited<ReturnType<typeof this.askEneo>>;
      try {
        res = await this.askEneo(req, body, session_id, responseType);
      } catch (e) {
        // A 404 means Eneo no longer has the chat. self-service-ai removes sessions after an hour of inactivity, chat
        // included, while the browser session lives on, so restart the session and ask again once.
        if (e?.status !== 404) throw e;
        session_id = await this.restartSession(req);
        if (!session_id) {
          throw new HttpException(412, 'Not ready');
        }
        res = await this.askEneo(req, body, session_id, responseType);
      }

      if (responseType === 'json') {
        return response.send(res.data as QuestionResponse);
      }
      const dataStream = res.data as Stream;
      dataStream.on('data', (buf: Buffer) => {
        return buf;
      });

      dataStream.on('end', () => {
        return response.end();
      });
      return dataStream;
    } catch (e) {
      logger.error('Error sending question to conversation.', e);
      throw new HttpError(e?.httpCode ?? e?.status ?? 500, e?.message ?? 'Error sending question to conversation.');
    }
  }

  private sessionUrl(sessionId: string): string {
    return `${this.selfServiceAIApiBase}/${MUNICIPALITY_ID}/session/${sessionId}`;
  }

  private askEneo(req: Request, body: ConversationRequest, session_id: string, responseType: 'json' | 'stream') {
    // Eneo 2.0 requires exactly one of session_id / assistant_id / group_chat_id.
    // When continuing a session, session_id wins and the others must be dropped.
    const data: ConversationRequest = {
      question: body.question,
      stream: body.stream,
      session_id,
    };

    return this.apiService.post<QuestionResponse | Stream, ConversationRequest>(
      {
        url: `${this.eneoApiBase}/conversations/`,
        data,
        headers: { 'api-key': ENEO_API_KEY },
        responseType,
      },
      req.user,
    );
  }

  /**
   * Makes sure the session has an Eneo session id and returns it. The session in Eneo is started by the first question
   * asked via self-service-ai, so when `/ready` does not carry the id yet the priming question is asked once. The id is
   * kept in the browser session for /ai/conversations, which talks to Eneo directly.
   */
  private async resolveEneoSessionId(req: Request, status: SessionStatusResponse): Promise<string | undefined> {
    if (!req.session.ai.eneoSessionId) {
      if (status.eneoSessionId) {
        req.session.ai.eneoSessionId = status.eneoSessionId;
      } else {
        const primed = await this.apiService.get<QuestionResponse>(
          { url: this.sessionUrl(req.session.ai.sessionId), params: { question: PRIMING_QUESTION } },
          req.user,
        );
        // Before self-service-ai 2.1 the session id and the Eneo session id were the same, so fall back to sessionId to
        // stay compatible with the older backend.
        req.session.ai.eneoSessionId = primed.data?.eneoSessionId ?? primed.data?.sessionId;
      }
    }
    if (!req.session.ai.eneoSessionId) {
      logger.error('SSAI is READY but no Eneo session id was returned; conversations will not work');
    }
    return req.session.ai.eneoSessionId;
  }

  /**
   * Replaces a session that Eneo no longer knows with a new one: creates it, waits for it to become READY and starts it
   * in Eneo. Returns the new Eneo session id, or undefined if no usable session could be produced in time.
   */
  private async restartSession(req: Request): Promise<string | undefined> {
    logger.info(`Eneo no longer has session ${req.session.ai?.eneoSessionId}; starting a new session`);
    delete req.session.ai;

    const created = await startAISession(req as RequestWithUser);
    if (!created?.sessionId) {
      return undefined;
    }

    const readyUrl = `${this.sessionUrl(created.sessionId)}/ready`;
    const deadline = Date.now() + RESTART_READY_TIMEOUT_MS;
    while (Date.now() < deadline) {
      const res = await this.apiService.get<SessionStatusResponse>({ url: readyUrl }, req.user);
      if (res.data.status === 'READY') {
        return this.resolveEneoSessionId(req, res.data);
      }
      if (res.data.status === 'FAILED') {
        logger.error(`Restarted SSAI session ${created.sessionId} failed: ${res.data.detail}`);
        return undefined;
      }
      await wait(RESTART_POLL_INTERVAL_MS);
    }
    logger.error(
      `Restarted SSAI session ${created.sessionId} did not become READY within ${RESTART_READY_TIMEOUT_MS} ms`,
    );
    return undefined;
  }
}
