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
 * Usage - call after the controllers have been imported (their decorators must have
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

/** routing-controllers' metadata store and the two entry shapes read from it. */
type MetadataStorage = ReturnType<typeof getMetadataArgsStorage>;
type ActionArgs = MetadataStorage['actions'][number];
type StoredUse = MetadataStorage['uses'][number];

/** A controller's actions sorted by what the guard needs to do with each. */
interface ClassifiedActions {
  publicRoutes: RouteRef[];
  alreadyProtected: RouteRef[];
  needsAuth: { action: ActionArgs; ref: RouteRef }[];
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

  for (const [controller, actions] of groupActionsByController(storage.actions, scope)) {
    // routing-controllers resolves controller-level middleware with an exact target
    // match and no method, then runs it ahead of all action-level ones.
    const classLevelUses = storage.uses.filter(use => use.target === controller && !use.method);
    const classIsAuthed = classLevelUses.some(use => use.middleware === authMiddleware);

    const classified = classifyActions(storage, controller, actions, authMiddleware, classIsAuthed);
    report.publicRoutes.push(...classified.publicRoutes);
    report.alreadyProtected.push(...classified.alreadyProtected);

    if (!classified.needsAuth.length) continue;

    const foreignClassMiddleware = classLevelUses.filter(use => use.middleware !== authMiddleware);
    const outcome = protectController({
      storage,
      controller,
      classified,
      foreignClassMiddleware,
      authMiddleware,
      strict,
    });

    report.protectedRoutes.push(...outcome.protectedRoutes);
    if (outcome.warning) report.warnings.push(outcome.warning);
  }

  logReport(report, logger);
  return report;
}

/** Groups registered actions by controller, honouring the optional scope. */
function groupActionsByController(actions: ActionArgs[], scope: Set<Ctor> | null): Map<Ctor, ActionArgs[]> {
  const grouped = new Map<Ctor, ActionArgs[]>();

  for (const action of actions) {
    const controller = action.target as Ctor;
    if (scope && !scope.has(controller)) continue;

    const existing = grouped.get(controller);
    if (existing) {
      existing.push(action);
    } else {
      grouped.set(controller, [action]);
    }
  }

  return grouped;
}

/** The `@Controller('/prefix')` base path, so reports show the full route. */
function controllerBasePath(storage: MetadataStorage, controller: Ctor): string {
  const args = storage.controllers.find(entry => entry.target === controller);
  return typeof args?.route === 'string' ? args.route : '';
}

function hasActionLevelAuth(
  storage: MetadataStorage,
  controller: Ctor,
  method: string,
  authMiddleware: Middleware,
): boolean {
  return storage.uses.some(
    use => use.target === controller && use.method === method && use.middleware === authMiddleware,
  );
}

/**
 * Sorts a controller's actions into the three possible outcomes: deliberately
 * public, already carrying the auth middleware, and needing it injected.
 */
function classifyActions(
  storage: MetadataStorage,
  controller: Ctor,
  actions: ActionArgs[],
  authMiddleware: Middleware,
  classIsAuthed: boolean,
): ClassifiedActions {
  const basePath = controllerBasePath(storage, controller);
  const classified: ClassifiedActions = { publicRoutes: [], alreadyProtected: [], needsAuth: [] };

  for (const action of actions) {
    const actionName = String(action.method ?? '');
    const { isPublic, reason } = resolvePublic(controller, actionName);
    const ref = describeRoute(controller, action, basePath, reason);

    if (isPublic) {
      classified.publicRoutes.push(ref);
    } else if (classIsAuthed || hasActionLevelAuth(storage, controller, actionName, authMiddleware)) {
      classified.alreadyProtected.push(ref);
    } else {
      classified.needsAuth.push({ action, ref });
    }
  }

  return classified;
}

/** Registers the auth middleware ahead of everything already stored for this target. */
function injectAuth(storage: MetadataStorage, controller: Ctor, authMiddleware: Middleware, method?: string): void {
  const entry: UseEntry = { target: controller, middleware: authMiddleware, afterAction: false };
  if (method !== undefined) entry.method = method;
  storage.uses.unshift(entry as unknown as StoredUse);
}

function orderingConflictMessage(controller: Ctor, foreignClassMiddleware: StoredUse[], routeCount: number): string {
  const names = foreignClassMiddleware.map(use => use.middleware.name || 'anonymous').join(', ');
  return (
    `${controller.name}: class-level middleware (${names}) runs before the injected auth guard on ` +
    `${routeCount} route(s), because the controller also has @Public() routes. ` +
    `Add @UseBefore(authMiddleware) at class level, or move that middleware onto the actions.`
  );
}

/**
 * Injects the guard for one controller and reports how it went.
 *
 * Class-level middleware runs before anything attached per action. When the whole
 * controller needs auth the guard is hoisted to class level and stays ahead of it.
 * With `@Public()` routes present that is not possible - they would inherit auth
 * too - so the guard goes per action and the ordering is flagged instead.
 */
function protectController(args: {
  storage: MetadataStorage;
  controller: Ctor;
  classified: ClassifiedActions;
  foreignClassMiddleware: StoredUse[];
  authMiddleware: Middleware;
  strict: boolean;
}): { protectedRoutes: RouteRef[]; warning?: string } {
  const { storage, controller, classified, foreignClassMiddleware, authMiddleware, strict } = args;
  const { needsAuth, publicRoutes } = classified;
  const protectedRoutes = needsAuth.map(({ ref }) => ref);

  if (foreignClassMiddleware.length && publicRoutes.length === 0) {
    injectAuth(storage, controller, authMiddleware);
    return { protectedRoutes };
  }

  const warning = foreignClassMiddleware.length
    ? orderingConflictMessage(controller, foreignClassMiddleware, needsAuth.length)
    : undefined;

  // Thrown before injecting anything, so strict mode leaves this controller untouched.
  if (warning && strict) {
    throw new Error(`enforceGlobalAuth: ${warning}`);
  }

  for (const { action } of needsAuth) {
    injectAuth(storage, controller, authMiddleware, String(action.method ?? ''));
  }

  return { protectedRoutes, warning };
}

function logReport(report: AuthGuardReport, logger?: EnforceGlobalAuthOptions['logger']): void {
  if (!logger) return;

  const total = report.protectedRoutes.length + report.alreadyProtected.length + report.publicRoutes.length;
  logger.info?.(
    `Auth guard: ${total} routes - ${report.protectedRoutes.length} newly protected, ` +
      `${report.alreadyProtected.length} already protected, ${report.publicRoutes.length} public`,
  );

  // The open endpoints - everyone must be named.
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
