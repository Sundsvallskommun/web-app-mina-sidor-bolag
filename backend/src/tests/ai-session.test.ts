import 'reflect-metadata';
import { RepresentingMode } from '@interfaces/representing.interface';

const apiPost = jest.fn();
const apiDelete = jest.fn();
const cacheRelations = jest.fn();

jest.mock('@config', () => ({ MUNICIPALITY_ID: '2281' }));
jest.mock('@/config/api-config', () => ({ getApiBase: (key: string) => key }));
jest.mock('@utils/logger', () => ({
  logger: { warn: jest.fn(), info: jest.fn(), error: jest.fn() },
  stream: { write: jest.fn() },
}));
jest.mock('@/services/session-cache.service', () => ({
  sessionCacheService: { cacheRelations: (...args: unknown[]) => cacheRelations(...args) },
}));
jest.mock('@/services/api.service', () => ({
  __esModule: true,
  default: class MockApiService {
    post = apiPost;
    delete = apiDelete;
  },
}));

import {
  deleteAISession,
  ensureAISession,
  ensureEneoSessionId,
  restartAISession,
} from '@/services/selfserviceai.service';

const RELATIONS = { customerNumber: ['1'], customerRelations: [{ organizationNumber: '5565027223' }] };

function request(sessionID: string, overrides: Record<string, unknown> = {}): any {
  return {
    sessionID,
    user: { partyId: 'party-me', username: 'party-me' },
    session: {
      representing: { mode: RepresentingMode.PRIVATE, PRIVATE: { partyId: 'party-me' } },
      cache: { relations: RELATIONS },
      ...overrides,
    },
  };
}

function pendingPost() {
  let release: (data: unknown) => void;
  apiPost.mockReturnValueOnce(new Promise(resolve => (release = data => resolve({ data }))));
  return (data: unknown) => release(data);
}

let sessionCounter = 0;
const sessionId = () => `s${++sessionCounter}`;

beforeEach(() => {
  apiPost.mockReset();
  apiDelete.mockReset();
  cacheRelations.mockReset();
});

describe('ensureAISession', () => {
  it('returns the existing session without calling the API', async () => {
    const req = request(sessionId(), { ai: { sessionId: 'existing', assistantId: 'a' } });

    await expect(ensureAISession(req)).resolves.toEqual({ sessionId: 'existing', assistantId: 'a' });
    expect(apiPost).not.toHaveBeenCalled();
  });

  it('starts one session for concurrent requests of the same user and gives it to all of them', async () => {
    const release = pendingPost();
    const id = sessionId();
    const first = request(id);
    const second = request(id);

    const results = Promise.all([ensureAISession(first), ensureAISession(second)]);
    release({ sessionId: 'new', assistantId: 'a' });

    await expect(results).resolves.toEqual([
      { sessionId: 'new', assistantId: 'a' },
      { sessionId: 'new', assistantId: 'a' },
    ]);
    expect(apiPost).toHaveBeenCalledTimes(1);
    expect(first.session.ai).toEqual({ sessionId: 'new', assistantId: 'a' });
    expect(second.session.ai).toEqual({ sessionId: 'new', assistantId: 'a' });
  });

  it('starts separate sessions for different users', async () => {
    apiPost.mockResolvedValueOnce({ data: { sessionId: 'one' } }).mockResolvedValueOnce({ data: { sessionId: 'two' } });

    await Promise.all([ensureAISession(request(sessionId())), ensureAISession(request(sessionId()))]);

    expect(apiPost).toHaveBeenCalledTimes(2);
  });

  it('restores a started session that another request has dropped from the store', async () => {
    const id = sessionId();
    apiPost.mockResolvedValueOnce({ data: { sessionId: 'started' } });
    await ensureAISession(request(id));

    const later = request(id);
    await expect(ensureAISession(later)).resolves.toEqual({ sessionId: 'started' });
    expect(apiPost).toHaveBeenCalledTimes(1);
    expect(later.session.ai).toEqual({ sessionId: 'started' });
  });

  it('starts a new session after the old one was deleted', async () => {
    const id = sessionId();
    apiPost.mockResolvedValueOnce({ data: { sessionId: 'old' } }).mockResolvedValueOnce({ data: { sessionId: 'new' } });
    apiDelete.mockResolvedValueOnce({});
    const req = request(id);
    await ensureAISession(req);

    await expect(deleteAISession(req)).resolves.toBe(true);
    await expect(ensureAISession(request(id))).resolves.toEqual({ sessionId: 'new' });
    expect(apiPost).toHaveBeenCalledTimes(2);
  });

  it('replaces an expired session on restart, and later requests get the new one', async () => {
    const id = sessionId();
    apiPost
      .mockResolvedValueOnce({ data: { sessionId: 'expired' } })
      .mockResolvedValueOnce({ data: { sessionId: 'fresh' } });
    const req = request(id);
    await ensureAISession(req);

    await expect(restartAISession(req)).resolves.toEqual({ sessionId: 'fresh' });
    expect(req.session.ai).toEqual({ sessionId: 'fresh' });
    await expect(ensureAISession(request(id))).resolves.toEqual({ sessionId: 'fresh' });
    expect(apiPost).toHaveBeenCalledTimes(2);
  });

  it('caches the relations before starting, so it works right after a company switch', async () => {
    const req = request(sessionId(), { cache: { relations: null } });
    cacheRelations.mockImplementation(async r => {
      r.session.cache.relations = RELATIONS;
    });
    apiPost.mockResolvedValueOnce({ data: { sessionId: 'new' } });

    await expect(ensureAISession(req)).resolves.toEqual({ sessionId: 'new' });
    expect(cacheRelations).toHaveBeenCalledTimes(1);
    expect(apiPost.mock.calls[0][0].data.customerEngagementOrgIds).toEqual(['5565027223']);
  });

  it('does not start a session when the user has no customer engagements', async () => {
    const req = request(sessionId(), { cache: { relations: { customerNumber: [], customerRelations: [] } } });

    await expect(ensureAISession(req)).resolves.toBeUndefined();
    expect(apiPost).not.toHaveBeenCalled();
    expect(req.session.ai).toBeUndefined();
  });

  it('lets the next request try again after a failed start', async () => {
    const id = sessionId();
    apiPost.mockRejectedValueOnce(new Error('down')).mockResolvedValueOnce({ data: { sessionId: 'later' } });

    await expect(ensureAISession(request(id))).rejects.toBeDefined();
    await expect(ensureAISession(request(id))).resolves.toEqual({ sessionId: 'later' });
    expect(apiPost).toHaveBeenCalledTimes(2);
  });
});

describe('ensureEneoSessionId', () => {
  let aiCounter = 0;
  const aiSession = (eneoSessionId?: string) => ({
    ai: { sessionId: `ai${++aiCounter}`, assistantId: 'a', eneoSessionId },
  });

  it('returns the stored Eneo session id without priming', async () => {
    const prime = jest.fn();

    await expect(ensureEneoSessionId(request(sessionId(), aiSession('eneo')), prime)).resolves.toBe('eneo');
    expect(prime).not.toHaveBeenCalled();
  });

  it('primes once for concurrent requests and gives the id to all of them', async () => {
    let release: (id: string) => void;
    const prime = jest.fn(() => new Promise<string>(resolve => (release = resolve)));
    const ai = aiSession();
    const first = request(sessionId(), { ai: { ...ai.ai } });
    const second = request(first.sessionID, { ai: { ...ai.ai } });

    const results = Promise.all([ensureEneoSessionId(first, prime), ensureEneoSessionId(second, prime)]);
    release('eneo');

    await expect(results).resolves.toEqual(['eneo', 'eneo']);
    expect(prime).toHaveBeenCalledTimes(1);
    expect(prime).toHaveBeenCalledWith(ai.ai.sessionId);
    expect(first.session.ai.eneoSessionId).toBe('eneo');
    expect(second.session.ai.eneoSessionId).toBe('eneo');
  });

  it('restores an Eneo session id that another request has dropped from the store', async () => {
    const prime = jest.fn().mockResolvedValueOnce('eneo');
    const ai = aiSession();
    await ensureEneoSessionId(request(sessionId(), { ai: { ...ai.ai } }), prime);

    const later = request(sessionId(), { ai: { ...ai.ai } });
    await expect(ensureEneoSessionId(later, prime)).resolves.toBe('eneo');
    expect(prime).toHaveBeenCalledTimes(1);
    expect(later.session.ai.eneoSessionId).toBe('eneo');
  });

  it('primes again after a failed attempt', async () => {
    const prime = jest.fn().mockRejectedValueOnce(new Error('timeout')).mockResolvedValueOnce('eneo');
    const ai = aiSession();

    await expect(ensureEneoSessionId(request(sessionId(), { ai: { ...ai.ai } }), prime)).rejects.toBeDefined();
    await expect(ensureEneoSessionId(request(sessionId(), { ai: { ...ai.ai } }), prime)).resolves.toBe('eneo');
    expect(prime).toHaveBeenCalledTimes(2);
  });

  it('returns undefined when there is no AI session', async () => {
    const prime = jest.fn();

    await expect(ensureEneoSessionId(request(sessionId()), prime)).resolves.toBeUndefined();
    expect(prime).not.toHaveBeenCalled();
  });

  it('forgets the Eneo session id when the AI session is deleted', async () => {
    const prime = jest.fn().mockResolvedValueOnce('first').mockResolvedValueOnce('second');
    apiDelete.mockResolvedValueOnce({});
    const ai = aiSession();
    const req = request(sessionId(), { ai: { ...ai.ai } });
    await ensureEneoSessionId(req, prime);

    await deleteAISession(req);

    await expect(ensureEneoSessionId(request(sessionId(), { ai: { ...ai.ai } }), prime)).resolves.toBe('second');
    expect(prime).toHaveBeenCalledTimes(2);
  });

  it('primes the new AI session after a restart', async () => {
    const prime = jest.fn().mockResolvedValueOnce('old-eneo').mockResolvedValueOnce('new-eneo');
    apiPost.mockResolvedValueOnce({ data: { sessionId: 'restarted', assistantId: 'a' } });
    const req = request(sessionId(), aiSession());
    await ensureEneoSessionId(req, prime);

    await restartAISession(req);

    await expect(ensureEneoSessionId(req, prime)).resolves.toBe('new-eneo');
    expect(prime).toHaveBeenLastCalledWith('restarted');
    expect(req.session.ai.eneoSessionId).toBe('new-eneo');
  });
});
