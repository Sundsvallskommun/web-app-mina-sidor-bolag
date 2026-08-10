import 'reflect-metadata';
import authMiddleware from '@middlewares/auth.middleware';
import { enforceGlobalAuth } from '@middlewares/global-auth';
import { registeredControllers } from '@/registered-controllers';

/**
 * Regression guard for the whole route table.
 *
 * Authentication is no longer declared per action - `enforceGlobalAuth` injects it
 * into everything that is not explicitly `@Public()`. That makes this the place
 * where an accidentally reachable endpoint gets caught: add a controller, drop the
 * guard call, or mark something public by mistake, and this fails.
 *
 * When a route legitimately becomes public, add it here in the same commit.
 */
const EXPECTED_PUBLIC_ROUTES = ['GET /', 'GET /health/up'];

describe('registered routes', () => {
  const report = enforceGlobalAuth({ authMiddleware, controllers: registeredControllers });
  const asKey = (route: { httpMethod: string; route: string }) => `${route.httpMethod} ${route.route}`;

  it('exposes exactly the routes on the public allowlist', () => {
    expect(report.publicRoutes.map(asKey).sort()).toEqual([...EXPECTED_PUBLIC_ROUTES].sort());
  });

  it('requires every public route to document why', () => {
    for (const route of report.publicRoutes) {
      expect(route.reason).toBeTruthy();
    }
  });

  it('protects every other registered route', () => {
    const covered = [...report.protectedRoutes, ...report.alreadyProtected].map(asKey);
    const publicKeys = report.publicRoutes.map(asKey);

    expect(covered.length).toBeGreaterThan(40);
    expect(covered.filter(key => publicKeys.includes(key))).toEqual([]);
  });

  it('resolves middleware ordering without warnings', () => {
    expect(report.warnings).toEqual([]);
  });

  // The endpoints the security review found reachable without a session.
  it.each([
    'POST /netowner',
    'GET /bfus/eligable-party-customer-id',
    'POST /bfus/eligable-party-grant-permission',
    'POST /bfus/eligable-party-deny-permission',
    'POST /bfus/eligable-party-revoke-permission',
  ])('keeps %s behind authentication', route => {
    expect(report.publicRoutes.map(asKey)).not.toContain(route);
    expect([...report.protectedRoutes, ...report.alreadyProtected].map(asKey)).toContain(route);
  });
});
