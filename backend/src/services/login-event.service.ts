import { MUNICIPALITY_ID, NAMESPACE } from '@config';
import { getApiBase } from '@/config/api-config';
import { LOGIN_SOURCE_TYPE } from '@/constants/event-log';
import { Event, EventType, PageEvent } from '@/data-contracts/eventlog/data-contracts';
import { RepresentingEntity } from '@interfaces/representing.interface';
import { User } from '@interfaces/users.interface';
import ApiService from '@services/api.service';
import { getRepresentingPartyId } from '@utils/getRepresentingPartyId';
import { buildLoginMetadata } from '@utils/login-event-metadata';
import { logger } from '@utils/logger';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

const apiService = new ApiService();
const eventLogApiBase = getApiBase('eventlog');

export const writeLoginEvent = async (representing: RepresentingEntity | undefined, user: User): Promise<void> => {
  const logKey = representing && getRepresentingPartyId(representing);
  if (!representing || !logKey) {
    return;
  }

  const loginEvent: Event = {
    type: EventType.ACCESS,
    message: 'Inloggning',
    owner: NAMESPACE,
    sourceType: LOGIN_SOURCE_TYPE,
    expires: dayjs().add(1, 'year').utc(true).toISOString(),
    metadata: buildLoginMetadata(representing),
  };

  const url = `${eventLogApiBase}/${MUNICIPALITY_ID}/${logKey}`;

  try {
    await apiService.post<PageEvent, Event>({ url, data: loginEvent }, user);
  } catch (error) {
    logger.error(`Could not create login event log, url was: ${url}`, error);
  }
};
