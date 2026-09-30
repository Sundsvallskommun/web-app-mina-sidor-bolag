import 'reflect-metadata';
import http from 'node:http';
import { AddressInfo } from 'node:net';
import App from '@/app';
import { BFUSController } from '@controllers/bfus.controller';
import { IndexController } from '@controllers/index.controller';
import { localApi } from '@utils/util';

/**
 * Proves the guard through the application's own startup sequence.
 *
 * `global-auth.test.ts` verifies the injection mechanism, but with a stub auth
 * middleware that answers 401 itself. The real one never ends the request - it
 * calls `next(new HttpException(401, ...))` and leaves the response to
 * `errorMiddleware`, which only reaches the client because `useExpressServer` is
 * configured with `defaultErrorHandler: false`. Nothing else covers that chain.
 *
 * This suite boots the real `App`, so a request passes through the real ordering
 * of `enforceGlobalAuth` and `useExpressServer`, the real auth middleware, the
 * real error handler and the configured route prefix.
 *
 * The protected route under test deliberately carries no `@UseBefore(authMiddleware)`
 * of its own - only the guard can be protecting it. Pointing this at a decorated
 * route instead would make the test pass even if the guard did nothing at all.
 */

const GUARD_ONLY_ROUTE = localApi('bfus/eligable-party-customer-id');
const PUBLIC_ROUTE = localApi('/');

let server: http.Server;
let baseUrl: string;

beforeAll(async () => {
  const app = new App([BFUSController, IndexController]);
  server = http.createServer(app.getServer());
  await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address() as AddressInfo;
  baseUrl = `http://127.0.0.1:${port}`;
});

afterAll(async () => {
  await new Promise<void>(resolve => server.close(() => resolve()));
});

async function get(path: string): Promise<{ status: number; body: string }> {
  const res = await fetch(`${baseUrl}${path}`);
  return { status: res.status, body: await res.text() };
}

describe('auth through the real application stack', () => {
  it('answers 401 on a route that only the guard protects', async () => {
    const { status } = await get(GUARD_ONLY_ROUTE);
    expect(status).toBe(401);
  });

  // The real middleware only calls next(error); this asserts the response that
  // errorMiddleware produces from it, which is the part the stub never exercises.
  it('renders the rejection through errorMiddleware', async () => {
    const { body } = await get(GUARD_ONLY_ROUTE);
    expect(JSON.parse(body)).toEqual({ message: 'Not Authorized' });
  });

  it('leaves a @Public() route reachable', async () => {
    const { status } = await get(PUBLIC_ROUTE);
    expect(status).toBe(200);
  });
});
