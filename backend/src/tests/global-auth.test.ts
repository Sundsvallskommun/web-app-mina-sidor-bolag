import 'reflect-metadata';
import express from 'express';
import http from 'node:http';
import { AddressInfo } from 'node:net';
import { Controller, Get, Post, UseBefore, useExpressServer, getMetadataArgsStorage } from 'routing-controllers';
import { enforceGlobalAuth, Public } from '@middlewares/global-auth';

/**
 * The guard mutates the process-wide routing-controllers metadata storage, so
 * each test builds its own controllers and resets the storage afterwards.
 */

/** Minimal request helper - the repo has no HTTP test client installed. */
async function call(
  app: express.Express,
  method: string,
  path: string,
  headers: Record<string, string> = {},
): Promise<number> {
  const server = http.createServer(app);
  await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address() as AddressInfo;
  try {
    const res = await fetch(`http://127.0.0.1:${port}${path}`, { method, headers });
    return res.status;
  } finally {
    await new Promise<void>(resolve => server.close(() => resolve()));
  }
}

const order: string[] = [];

const authMiddleware = (req: any, res: any, next: any) => {
  order.push('auth');
  if (req.headers['x-logged-in'] === 'yes') return next();
  return res.status(401).json({ message: 'Not Authorized' });
};

/** Stands in for middleware that assumes auth already ran (mandate, impersonation). */
const needsUserMiddleware = (req: any, res: any, next: any) => {
  order.push('needsUser');
  if (!req.headers['x-logged-in']) return res.status(500).json({ message: 'no user' });
  return next();
};

// A class, rather than the bare `Function` the linter rejects. Assignable both to
// routing-controllers' `Function[]` option and to the guard's controller list.
type ControllerClass = new () => unknown;

function buildServer(controllers: ControllerClass[]) {
  const app = express();
  enforceGlobalAuth({ authMiddleware, controllers });
  useExpressServer(app, { controllers, defaultErrorHandler: true });
  return app;
}

afterEach(() => {
  getMetadataArgsStorage().reset();
  order.length = 0;
});

describe('enforceGlobalAuth', () => {
  it('protects an action that has no auth decorator', async () => {
    @Controller()
    class UndecoratedController {
      @Post('/grant-permission')
      grant() {
        return 'granted';
      }
    }

    const app = buildServer([UndecoratedController]);

    expect(await call(app, 'POST', '/grant-permission')).toBe(401);
    expect(await call(app, 'POST', '/grant-permission', { 'x-logged-in': 'yes' })).toBe(200);
  });

  it('leaves @Public() actions open', async () => {
    @Controller()
    class MixedController {
      @Get('/health/up')
      @Public('probe')
      up() {
        return 'OK';
      }

      @Get('/secret')
      secret() {
        return 'secret';
      }
    }

    const app = buildServer([MixedController]);

    expect(await call(app, 'GET', '/health/up')).toBe(200);
    expect(await call(app, 'GET', '/secret')).toBe(401);
  });

  it('treats a class-level @Public() as covering every action', async () => {
    @Controller()
    @Public('fully open by design')
    class OpenController {
      @Get('/open-a')
      a() {
        return 'a';
      }

      @Get('/open-b')
      b() {
        return 'b';
      }
    }

    const app = buildServer([OpenController]);

    expect(await call(app, 'GET', '/open-a')).toBe(200);
    expect(await call(app, 'GET', '/open-b')).toBe(200);
  });

  it('does not run the auth middleware twice when @UseBefore already applies it', async () => {
    @Controller()
    class AlreadyProtectedController {
      @Get('/already')
      @UseBefore(authMiddleware)
      already() {
        return 'ok';
      }
    }

    const app = buildServer([AlreadyProtectedController]);

    expect(await call(app, 'GET', '/already', { 'x-logged-in': 'yes' })).toBe(200);
    expect(order.filter(entry => entry === 'auth')).toHaveLength(1);
  });

  it('runs auth before class-level middleware that depends on the user', async () => {
    @Controller()
    @UseBefore(needsUserMiddleware)
    class DependentController {
      @Get('/dependent')
      dependent() {
        return 'ok';
      }
    }

    const app = buildServer([DependentController]);

    // Without the guard hoisting auth to class level, needsUserMiddleware would
    // run first and answer 500 instead of 401.
    expect(await call(app, 'GET', '/dependent')).toBe(401);
    expect(order).toEqual(['auth']);
  });

  it('runs auth before action-level middleware', async () => {
    @Controller()
    class ActionMiddlewareController {
      @Get('/action-mw')
      @UseBefore(needsUserMiddleware)
      handler() {
        return 'ok';
      }
    }

    const app = buildServer([ActionMiddlewareController]);

    expect(await call(app, 'GET', '/action-mw')).toBe(401);
    expect(order).toEqual(['auth']);
  });

  it('reports what it changed and warns about unreasoned public routes', () => {
    @Controller()
    class ReportController {
      @Get('/injected')
      injected() {
        return 'a';
      }

      @Get('/decorated')
      @UseBefore(authMiddleware)
      decorated() {
        return 'b';
      }

      @Get('/open')
      @Public('documented reason')
      open() {
        return 'c';
      }
    }

    const report = enforceGlobalAuth({ authMiddleware, controllers: [ReportController] });

    expect(report.protectedRoutes.map(r => r.route)).toEqual(['/injected']);
    expect(report.alreadyProtected.map(r => r.route)).toEqual(['/decorated']);
    expect(report.publicRoutes).toEqual([
      expect.objectContaining({ route: '/open', reason: 'documented reason', httpMethod: 'GET' }),
    ]);
    expect(report.warnings).toEqual([]);
  });

  it('warns when a controller mixes @Public() with class-level middleware', () => {
    @Controller()
    @UseBefore(needsUserMiddleware)
    class AmbiguousController {
      @Get('/ambiguous-open')
      @Public('open')
      open() {
        return 'a';
      }

      @Get('/ambiguous-closed')
      closed() {
        return 'b';
      }
    }

    const report = enforceGlobalAuth({ authMiddleware, controllers: [AmbiguousController] });

    expect(report.warnings).toHaveLength(1);
    expect(report.warnings[0]).toContain('AmbiguousController');
    expect(report.protectedRoutes.map(r => r.route)).toEqual(['/ambiguous-closed']);
  });

  it('throws on that ambiguity in strict mode', () => {
    @Controller()
    @UseBefore(needsUserMiddleware)
    class StrictController {
      @Get('/strict-open')
      @Public('open')
      open() {
        return 'a';
      }

      @Get('/strict-closed')
      closed() {
        return 'b';
      }
    }

    expect(() => enforceGlobalAuth({ authMiddleware, controllers: [StrictController], strict: true })).toThrow(
      /StrictController/,
    );
  });

  it('is idempotent across repeated calls', async () => {
    @Controller()
    class IdempotentController {
      @Get('/idempotent')
      handler() {
        return 'ok';
      }
    }

    const app = express();
    const first = enforceGlobalAuth({ authMiddleware, controllers: [IdempotentController] });
    const second = enforceGlobalAuth({ authMiddleware, controllers: [IdempotentController] });
    useExpressServer(app, { controllers: [IdempotentController], defaultErrorHandler: true });

    expect(first.protectedRoutes).toHaveLength(1);
    expect(second.protectedRoutes).toHaveLength(0);
    expect(second.alreadyProtected).toHaveLength(1);

    expect(await call(app, 'GET', '/idempotent', { 'x-logged-in': 'yes' })).toBe(200);
    expect(order.filter(entry => entry === 'auth')).toHaveLength(1);
  });

  it('ignores controllers outside the given scope', () => {
    @Controller()
    class InScopeController {
      @Get('/in-scope')
      handler() {
        return 'a';
      }
    }

    @Controller()
    class OutOfScopeController {
      @Get('/out-of-scope')
      handler() {
        return 'b';
      }
    }

    const report = enforceGlobalAuth({ authMiddleware, controllers: [InScopeController] });

    expect(report.protectedRoutes.map(r => r.route)).toEqual(['/in-scope']);
    expect(getMetadataArgsStorage().uses.some(use => use.target === OutOfScopeController)).toBe(false);
  });

  it('rejects a non-function auth middleware', () => {
    expect(() => enforceGlobalAuth({ authMiddleware: undefined as any })).toThrow(TypeError);
  });
});
