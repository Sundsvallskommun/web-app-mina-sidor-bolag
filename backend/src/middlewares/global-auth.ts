import { getMetadataArgsStorage } from 'routing-controllers';

/**
 * Deny-by-default authentication for routing-controllers.
 *
 * Auth is normally opt-in: every action needs its own `@UseBefore(authMiddleware)`,
 * so a forgotten decorator silently publishes an endpoint. This module inverts that.
 * `enforceGlobalAuth` walks the routing-controllers metadata before the router is
 * built and injects the auth middleware into every registered action that is not
 * explicitly marked `@Public()`.
 *
 * Usage — call after the controllers have been imported (their decorators must have
 * run) and before `useExpressServer`:
 *
 *   const report = enforceGlobalAuth({ authMiddleware, controllers, logger });
 *
 * Opt a route out deliberately:
 *
 *   @Get('/health/up')
 *   @Public('Liveness probe - no user context')
 *   async up() { ... }
 *
 * Portability: this file has no application-specific imports. The auth middleware
 * is supplied by the caller, so it can be copied verbatim into any backend built on
 * the same routing-controllers structure.
 *
 * Scope and limits:
 *  - Only covers routes registered through routing-controllers. Routes mounted
 *    straight onto Express (SAML callbacks, Swagger UI) are untouched and must be
 *    secured where they are mounted.
 *  - Controller inheritance is not supported. Actions inherited from a base class
 *    are matched on their declaring class, which is not how routing-controllers
 *    resolves them; declare actions on the controller that is registered.
 *  - Authentication only. It answers "is someone logged in", never "does this
 *    session own the object being addressed". Per-object authorization is separate.
 */

/**
 * A controller class. routing-controllers stores these as plain functions and uses
 * them purely as identity keys, so this only models what is actually read off them.
 */
type Ctor = { readonly name: string; readonly prototype: unknown };

/** An Express-style middleware. Compared by reference and named in reports. */
type Middleware = { readonly name: string } & ((...args: never[]) => unknown);

/**
 * Shape of a routing-controllers "use" metadata entry. Declared locally rather
 * than deep-imported so this module does not depend on the library's internal
 * file layout.
 */
interface UseEntry {
  target: Ctor;
  method?: string;
  middleware: Middleware;
  afterAction: boolean;
}

export interface RouteRef {
  controller: string;
  action: string;
  httpMethod: string;
  route: string;
  /** Only set for entries in `publicRoutes`, when @Public() was given one. */
  reason?: string;
}

export interface AuthGuardReport {
  /** Routes the guard injected auth into. */
  protectedRoutes: RouteRef[];
  /** Routes that already carried the auth middleware via @UseBefore. */
  alreadyProtected: RouteRef[];
  /** Routes deliberately opted out with @Public(). */
  publicRoutes: RouteRef[];
  /** Ordering problems the guard could not resolve on its own. */
  warnings: string[];
}

export interface EnforceGlobalAuthOptions {
  /**
   * The middleware that establishes authentication. Matched by reference, so an
   * existing `@UseBefore(authMiddleware)` is detected and not duplicated.
   */
  authMiddleware: Middleware;
  /**
   * Controllers being registered. When given, the guard only touches these, which
   * keeps the report free of controllers that were imported but never mounted.
   */
  controllers?: Ctor[];
  logger?: { info?: (message: string) => void; warn?: (message: string) => void };
  /**
   * Throw instead of warning when class-level middleware would run before the
   * injected guard. Useful in CI. Defaults to false so a boot never fails on what
   * is an ordering smell rather than a hole.
   */
  strict?: boolean;
}

const publicClasses = new Map<Ctor, string | undefined>();
const publicMethods = new Map<Ctor, Map<string, string | undefined>>();

/**
 * Marks a controller or a single action as reachable without authentication.
 * The optional reason is recorded in the startup report, so the set of open
 * endpoints stays reviewable.
 */
export function Public(reason?: string): ClassDecorator & MethodDecorator {
  return ((target: any, propertyKey?: string | symbol): void => {
    if (propertyKey === undefined) {
      publicClasses.set(target as Ctor, reason);
      return;
    }
    const ctor: Ctor = typeof target === 'function' ? target : target.constructor;
    let methods = publicMethods.get(ctor);
    if (!methods) {
      methods = new Map();
      publicMethods.set(ctor, methods);
    }
    methods.set(String(propertyKey), reason);
  }) as ClassDecorator & MethodDecorator;
}

function prototypeChain(target: Ctor): Ctor[] {
  const chain: Ctor[] = [];
  for (
    let current: any = target;
    typeof current === 'function' && current !== Function.prototype;
    current = Object.getPrototypeOf(current)
  ) {
    chain.push(current);
  }
  return chain;
}

function resolvePublic(target: Ctor, method: string): { isPublic: boolean; reason?: string } {
  for (const ctor of prototypeChain(target)) {
    if (publicClasses.has(ctor)) {
      return { isPublic: true, reason: publicClasses.get(ctor) };
    }
    const methods = publicMethods.get(ctor);
    if (methods?.has(method)) {
      return { isPublic: true, reason: methods.get(method) };
    }
  }
  return { isPublic: false };
}

function describeRoute(
  controller: Ctor,
  action: { method?: string; type?: string; route?: unknown },
  basePath: string,
  reason?: string,
): RouteRef {
  const route = typeof action.route === 'string' ? action.route : String(action.route ?? '');
  return {
    controller: controller.name,
    action: String(action.method ?? ''),
    httpMethod: String(action.type ?? '').toUpperCase(),
    route: `${basePath}${route}` || '/',
    ...(reason ? { reason } : {}),
  };
}

/**
 * Injects `authMiddleware` into every registered action that is not `@Public()`.
 *
 * Must run after controller decorators have been evaluated (i.e. after the
 * controllers are imported) and before `useExpressServer` builds the router.
 * Calling it more than once is safe: already-injected routes are detected by
 * middleware identity and skipped.
 */
export function enforceGlobalAuth(options: EnforceGlobalAuthOptions): AuthGuardReport {
  const { authMiddleware, controllers, logger, strict = false } = options;

  if (typeof authMiddleware !== 'function') {
    throw new TypeError('enforceGlobalAuth: authMiddleware must be a function');
  }

  const storage = getMetadataArgsStorage();
  const report: AuthGuardReport = { protectedRoutes: [], alreadyProtected: [], publicRoutes: [], warnings: [] };
  const scope = controllers ? new Set<Ctor>(controllers) : null;

  const actionsByController = new Map<Ctor, typeof storage.actions>();
  for (const action of storage.actions) {
    const ctor = action.target as Ctor;
    if (scope && !scope.has(ctor)) continue;
    const existing = actionsByController.get(ctor);
    if (existing) {
      existing.push(action);
    } else {
      actionsByController.set(ctor, [action]);
    }
  }

  for (const [controller, actions] of actionsByController) {
    // The @Controller('/prefix') base path, so the report shows the full route.
    const controllerArgs = storage.controllers.find(entry => entry.target === controller);
    const basePath = typeof controllerArgs?.route === 'string' ? controllerArgs.route : '';

    // routing-controllers resolves controller-level middleware with an exact
    // target match and no method, then runs it ahead of all action-level ones.
    const classLevelUses = storage.uses.filter(use => use.target === controller && !use.method);
    const classIsAuthed = classLevelUses.some(use => use.middleware === authMiddleware);

    const needsAuth: { action: (typeof actions)[number]; ref: RouteRef }[] = [];
    let publicCount = 0;

    for (const action of actions) {
      const actionName = String(action.method ?? '');
      const { isPublic, reason } = resolvePublic(controller, actionName);
      const ref = describeRoute(controller, action, basePath, reason);

      if (isPublic) {
        publicCount += 1;
        report.publicRoutes.push(ref);
        continue;
      }

      const actionIsAuthed =
        classIsAuthed ||
        storage.uses.some(
          use => use.target === controller && use.method === actionName && use.middleware === authMiddleware,
        );

      if (actionIsAuthed) {
        report.alreadyProtected.push(ref);
        continue;
      }

      needsAuth.push({ action, ref });
    }

    if (!needsAuth.length) continue;

    const foreignClassMiddleware = classLevelUses.filter(use => use.middleware !== authMiddleware);

    // Class-level middleware runs before anything we attach per action. When the
    // whole controller needs auth we can hoist the guard to class level and stay
    // ahead of it; otherwise the public routes would inherit auth too.
    if (foreignClassMiddleware.length && publicCount === 0) {
      storage.uses.unshift({
        target: controller,
        middleware: authMiddleware,
        afterAction: false,
      } as UseEntry as unknown as (typeof storage.uses)[number]);
      needsAuth.forEach(({ ref }) => report.protectedRoutes.push(ref));
      continue;
    }

    if (foreignClassMiddleware.length) {
      const names = foreignClassMiddleware.map(use => use.middleware.name || 'anonymous').join(', ');
      const message =
        `${controller.name}: class-level middleware (${names}) runs before the injected auth guard on ` +
        `${needsAuth.length} route(s), because the controller also has @Public() routes. ` +
        `Add @UseBefore(authMiddleware) at class level, or move that middleware onto the actions.`;
      if (strict) throw new Error(`enforceGlobalAuth: ${message}`);
      report.warnings.push(message);
    }

    for (const { action, ref } of needsAuth) {
      storage.uses.unshift({
        target: controller,
        method: String(action.method ?? ''),
        middleware: authMiddleware,
        afterAction: false,
      } as UseEntry as unknown as (typeof storage.uses)[number]);
      report.protectedRoutes.push(ref);
    }
  }

  logReport(report, logger);
  return report;
}

function logReport(report: AuthGuardReport, logger?: EnforceGlobalAuthOptions['logger']): void {
  if (!logger) return;

  const total = report.protectedRoutes.length + report.alreadyProtected.length + report.publicRoutes.length;
  logger.info?.(
    `Auth guard: ${total} routes - ${report.protectedRoutes.length} newly protected, ` +
      `${report.alreadyProtected.length} already protected, ${report.publicRoutes.length} public`,
  );

  // The open endpoints are the interesting part of the boot log; name them all.
  for (const route of report.publicRoutes) {
    logger.warn?.(
      `Auth guard: PUBLIC ${route.httpMethod} ${route.route} (${route.controller}.${route.action})` +
        (route.reason ? ` - ${route.reason}` : ' - no reason given'),
    );
  }

  for (const warning of report.warnings) {
    logger.warn?.(`Auth guard: ${warning}`);
  }
}
