const axiosCall = jest.fn();
const mockRedisConfig: { enabled: boolean; keyPrefix?: string } = { enabled: false };
const mockGetRedisClient = jest.fn();

jest.mock('axios', () => {
  const actual = jest.requireActual('axios');
  return {
    __esModule: true,
    default: Object.assign((...args: unknown[]) => axiosCall(...args), { isAxiosError: actual.isAxiosError }),
  };
});
jest.mock('@config', () => ({
  CLIENT_KEY: 'key',
  CLIENT_SECRET: 'secret',
  API_BASE_URL: 'https://api',
  REDIS_CONFIG: mockRedisConfig,
}));
jest.mock('@utils/redis', () => ({ getRedisClient: (...args: unknown[]) => mockGetRedisClient(...args) }));
jest.mock('@utils/logger', () => ({
  logger: { warn: jest.fn(), info: jest.fn(), error: jest.fn() },
}));
jest.mock('@utils/request-context', () => ({ getSessionMarker: () => '-' }));

async function freshService() {
  jest.resetModules();
  const { default: ApiTokenService } = await import('@/services/api-token.service');
  return new ApiTokenService();
}

function tokenResponse(access_token: string, expires_in = 3600) {
  return { status: 200, data: { access_token, expires_in } };
}

describe('ApiTokenService.getToken', () => {
  beforeEach(() => {
    axiosCall.mockReset();
    mockGetRedisClient.mockReset().mockResolvedValue(null);
    mockRedisConfig.enabled = false;
  });

  it('fetches the token once for concurrent callers', async () => {
    let resolve: (value: unknown) => void;
    axiosCall.mockReturnValueOnce(new Promise(r => (resolve = r)));
    const service = await freshService();

    const calls = Promise.all([service.getToken(), service.getToken(), service.getToken(), service.getToken()]);
    // getToken awaits the Redis lookup before it starts the request, so let that settle first.
    await new Promise(r => setImmediate(r));
    resolve(tokenResponse('t1'));

    expect(await calls).toEqual(['t1', 't1', 't1', 't1']);
    expect(axiosCall).toHaveBeenCalledTimes(1);
  });

  it('reuses a valid token without fetching', async () => {
    axiosCall.mockResolvedValueOnce(tokenResponse('t1'));
    const service = await freshService();

    await service.getToken();
    expect(await service.getToken()).toBe('t1');
    expect(axiosCall).toHaveBeenCalledTimes(1);
  });

  it('rejects all waiting callers on failure and fetches again on the next call', async () => {
    axiosCall.mockRejectedValueOnce(new Error('down')).mockResolvedValueOnce(tokenResponse('t2'));
    const service = await freshService();

    const results = await Promise.allSettled([service.getToken(), service.getToken()]);
    expect(results.map(r => r.status)).toEqual(['rejected', 'rejected']);
    expect(axiosCall).toHaveBeenCalledTimes(1);

    expect(await service.getToken()).toBe('t2');
    expect(axiosCall).toHaveBeenCalledTimes(2);
  });

  it('fetches a new token once the current one has expired', async () => {
    axiosCall.mockResolvedValueOnce(tokenResponse('t1', 60)).mockResolvedValueOnce(tokenResponse('t2'));
    const service = await freshService();
    const now = jest.spyOn(Date, 'now').mockReturnValue(1_000_000);

    expect(await service.getToken()).toBe('t1');
    // The refresh margin is 10 % of the lifetime (max 10 s), so a 60 s token is reused for 54 s.
    now.mockReturnValue(1_000_000 + 53_999);
    expect(await service.getToken()).toBe('t1');
    now.mockReturnValue(1_000_000 + 54_000);
    expect(await service.getToken()).toBe('t2');
    expect(axiosCall).toHaveBeenCalledTimes(2);
    now.mockRestore();
  });

  it('rejects a response without a usable token', async () => {
    axiosCall.mockResolvedValueOnce({ status: 200, data: { access_token: '' } });
    const service = await freshService();

    await expect(service.getToken()).rejects.toMatchObject({ status: 502 });
  });
});

/**
 * Minimal in-memory stand-in for the Redis commands the token service uses:
 * GET, SET with NX, and the script that releases the lock only for its owner.
 */
function createFakeRedis() {
  const store = new Map<string, string>();
  return {
    store,
    get: jest.fn(async (key: string) => store.get(key) ?? null),
    set: jest.fn(async (key: string, value: string, options?: { NX?: boolean }) => {
      if (options?.NX && store.has(key)) return null;
      store.set(key, value);
      return 'OK';
    }),
    eval: jest.fn(async (_script: string, { keys, arguments: args }: { keys: string[]; arguments: string[] }) => {
      if (store.get(keys[0]) !== args[0]) return 0;
      store.delete(keys[0]);
      return 1;
    }),
  };
}

const TOKEN_KEY = 'mina-sidor:wso2:access_token';
const LOCK_KEY = 'mina-sidor:wso2:token_lock';

function sharedToken(accessToken: string, expiresAt: number) {
  return JSON.stringify({ accessToken, expiresAt });
}

describe('ApiTokenService.getToken with Redis', () => {
  beforeEach(() => {
    axiosCall.mockReset();
    mockRedisConfig.enabled = true;
    mockRedisConfig.keyPrefix = 'mina-sidor';
  });

  it('returns the token shared by another pod without fetching', async () => {
    const redis = createFakeRedis();
    redis.store.set(TOKEN_KEY, sharedToken('shared', Date.now() + 60_000));
    mockGetRedisClient.mockReset().mockResolvedValue(redis);
    const service = await freshService();

    expect(await service.getToken()).toBe('shared');
    expect(axiosCall).not.toHaveBeenCalled();
  });

  it('fetches once under the lock, shares the token in Redis and releases the lock', async () => {
    const redis = createFakeRedis();
    mockGetRedisClient.mockReset().mockResolvedValue(redis);
    axiosCall.mockResolvedValueOnce(tokenResponse('fresh'));
    const service = await freshService();

    const results = await Promise.all([service.getToken(), service.getToken(), service.getToken()]);

    expect(results).toEqual(['fresh', 'fresh', 'fresh']);
    expect(axiosCall).toHaveBeenCalledTimes(1);
    expect(JSON.parse(redis.store.get(TOKEN_KEY) as string)).toMatchObject({ accessToken: 'fresh' });
    expect(redis.store.has(LOCK_KEY)).toBe(false);
  });

  it('ignores an expired shared token', async () => {
    const redis = createFakeRedis();
    redis.store.set(TOKEN_KEY, sharedToken('old', Date.now() - 1));
    mockGetRedisClient.mockReset().mockResolvedValue(redis);
    axiosCall.mockResolvedValueOnce(tokenResponse('new'));
    const service = await freshService();

    expect(await service.getToken()).toBe('new');
  });

  it('waits for the pod holding the lock instead of fetching in parallel', async () => {
    const redis = createFakeRedis();
    redis.store.set(LOCK_KEY, 'other-pod');
    mockGetRedisClient.mockReset().mockResolvedValue(redis);
    const service = await freshService();

    const pending = service.getToken();
    // The other pod finishes its refresh while this one is waiting for the lock.
    redis.store.set(TOKEN_KEY, sharedToken('from-other-pod', Date.now() + 60_000));

    expect(await pending).toBe('from-other-pod');
    expect(axiosCall).not.toHaveBeenCalled();
    expect(redis.store.get(LOCK_KEY)).toBe('other-pod');
  });
});
