import { HttpException } from '@/exceptions/HttpException';
import { RequestWithUser } from '@/interfaces/auth.interface';
import { SessionRequest, SessionResponse } from '@/responses/self-service-ai.response';
import { getRepresentingPartyId } from '@/utils/getRepresentingPartyId';
import ApiService from './api.service';
import { getApiBase } from '@/config/api-config';
import { MUNICIPALITY_ID } from '@/config';
import { logger } from '@/utils/logger';

const selfServiceAIApiBase = getApiBase('selfserviceai');
const apiService = new ApiService();

export const startAISession = async (req: RequestWithUser) => {
  const representing = req.session?.representing ?? undefined;
  const partyId = representing ? getRepresentingPartyId(representing) : undefined;
  const customerEngagements = req?.session?.cache?.relations?.customerRelations ?? [];

  if (!partyId || !customerEngagements.length) {
    console.log('🚀 ~ startSession ~ partyId:', partyId);
    console.log('🚀 ~ startSession ~ customerEngagements:', customerEngagements);

    throw new HttpException(400, 'Bad Request');
  }

  const requestBody: SessionRequest = {
    partyId: partyId,
    customerEngagementOrgIds: customerEngagements?.map(engagement => engagement.organizationNumber),
  };

  try {
    const url = `${selfServiceAIApiBase}/${MUNICIPALITY_ID}/session`;

    const res = await apiService.post<SessionResponse, SessionRequest>({ url, data: requestBody }, req.user);
    req.session.ai = res.data;
    return res.data;
  } catch (e) {
    logger.error('Error creating session', e);
    throw new HttpException(e?.httpCode ?? 500, e?.message ?? 'Error creating session');
  }
};

export const deleteAISession = async (req: RequestWithUser) => {
  const id = req.session.ai.sessionId;
  console.log('🚀 ~ deleteSession ~ id:', id);
  if (!id) return;

  const url = `${selfServiceAIApiBase}/${MUNICIPALITY_ID}/session/${id}`;

  try {
    const deleted = await apiService.delete({ url: url }, req.user);
    console.log('🚀 ~ deleteSession ~ deleted:', deleted);
    req.session.ai = undefined;
    return true;
  } catch (e) {
    logger.error('Error deleting session', e);
    throw new HttpException(e?.httpCode ?? 500, e?.message ?? 'Could not delete session');
  }
};
