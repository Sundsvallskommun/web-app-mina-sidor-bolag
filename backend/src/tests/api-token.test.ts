const axiosCall = jest.fn();

jest.mock('axios', () => {
  const actual = jest.requireActual('axios');
  return {
    __esModule: true,
    default: Object.assign((...args: unknown[]) => axiosCall(...args), { isAxiosError: actual.isAxiosError }),
  };
});
jest.mock('@config', () => ({ CLIENT_KEY: 'key', CLIENT_SECRET: 'secret', API_BASE_URL: 'https://api' }));
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
  });

  it('fetches the token once for concurrent callers', async () => {
    let resolve: (value: unknown) => void;
    axiosCall.mockReturnValueOnce(new Promise(r => (resolve = r)));
    const service = await freshService();

    const calls = Promise.all([service.getToken(), service.getToken(), service.getToken(), service.getToken()]);
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
    axiosCall.mockResolvedValueOnce(tokenResponse('t1', 10)).mockResolvedValueOnce(tokenResponse('t2'));
    const service = await freshService();

    expect(await service.getToken()).toBe('t1');
    expect(await service.getToken()).toBe('t2');
    expect(axiosCall).toHaveBeenCalledTimes(2);
  });
});
