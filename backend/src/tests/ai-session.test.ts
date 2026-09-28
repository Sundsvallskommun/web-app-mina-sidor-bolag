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

import { deleteAISession, ensureAISession } from '@/services/selfserviceai.service';

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
