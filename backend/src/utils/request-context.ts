import { AsyncLocalStorage } from 'async_hooks';
import { createHash } from 'crypto';

interface RequestContext {
  sessionMarker: string;
}

const storage = new AsyncLocalStorage<RequestContext>();

export const toSessionMarker = (sessionId?: string): string =>
  sessionId ? createHash('sha256').update(sessionId).digest('hex').slice(0, 8) : 'none';

export const runWithRequestContext = <T>(context: RequestContext, callback: () => T): T =>
  storage.run(context, callback);

export const getSessionMarker = (): string => storage.getStore()?.sessionMarker ?? 'none';
