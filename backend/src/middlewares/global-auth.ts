import { getMetadataArgsStorage } from 'routing-controllers';

type Ctor = { readonly name: string; readonly prototype: unknown };
type Middleware = { readonly name: string } & ((...args: never[]) => unknown);

interface UseEntry {
  target: Ctor;
  method?: string;
  middleware: Middleware;
  afterAction: boolean;
}

type MetadataStorage = ReturnType<typeof getMetadataArgsStorage>;
type ActionArgs = MetadataStorage['actions'][number];
type StoredUse = MetadataStorage['uses'][number];

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
  reason?: string;
}

export interface AuthGuardReport {
  protectedRoutes: RouteRef[];
  alreadyProtected: RouteRef[];
  publicRoutes: RouteRef[];
  warnings: string[];
}

export interface EnforceGlobalAuthOptions {
  authMiddleware: Middleware;
  controllers?: Ctor[];
  logger?: { info?: (message: string) => void; warn?: (message: string) => void };
  strict?: boolean;
}

const publicClasses = new Map<Ctor, string | undefined>();
const publicMethods = new Map<Ctor, Map<string, string | undefined>>();

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

const prototypeChain = (target: Ctor): Ctor[] => {
  const chain: Ctor[] = [];
  for (
    let current: any = target;
    typeof current === 'function' && current !== Function.prototype;
    current = Object.getPrototypeOf(current)
  ) {
    chain.push(current);
  }
  return chain;
};

const resolvePublic = (target: Ctor, method: string): { isPublic: boolean; reason?: string } => {
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
};

const describeRoute = (
  controller: Ctor,
  action: { method?: string; type?: string; route?: unknown },
  basePath: string,
  reason?: string,
): RouteRef => {
  const route = typeof action.route === 'string' ? action.route : String(action.route ?? '');
  return {
    controller: controller.name,
    action: String(action.method ?? ''),
    httpMethod: String(action.type ?? '').toUpperCase(),
    route: `${basePath}${route}` || '/',
    ...(reason ? { reason } : {}),
  };
};

export const enforceGlobalAuth = (options: EnforceGlobalAuthOptions): AuthGuardReport => {
  const { authMiddleware, controllers, logger, strict = false } = options;

  if (typeof authMiddleware !== 'function') {
    throw new TypeError('enforceGlobalAuth: authMiddleware must be a function');
  }

  const storage = getMetadataArgsStorage();
  const report: AuthGuardReport = { protectedRoutes: [], alreadyProtected: [], publicRoutes: [], warnings: [] };
  const scope = controllers ? new Set<Ctor>(controllers) : null;

  for (const [controller, actions] of groupActionsByController(storage.actions, scope)) {
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
};

const groupActionsByController = (actions: ActionArgs[], scope: Set<Ctor> | null): Map<Ctor, ActionArgs[]> => {
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
};

const controllerBasePath = (storage: MetadataStorage, controller: Ctor): string => {
  const args = storage.controllers.find(entry => entry.target === controller);
  return typeof args?.route === 'string' ? args.route : '';
};

const hasActionLevelAuth = (
  storage: MetadataStorage,
  controller: Ctor,
  method: string,
  authMiddleware: Middleware,
): boolean => {
  return storage.uses.some(
    use => use.target === controller && use.method === method && use.middleware === authMiddleware,
  );
};

const classifyActions = (
  storage: MetadataStorage,
  controller: Ctor,
  actions: ActionArgs[],
  authMiddleware: Middleware,
  classIsAuthed: boolean,
): ClassifiedActions => {
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
};

const injectAuth = (storage: MetadataStorage, controller: Ctor, authMiddleware: Middleware, method?: string): void => {
  const entry: UseEntry = { target: controller, middleware: authMiddleware, afterAction: false };
  if (method !== undefined) entry.method = method;
  storage.uses.unshift(entry as unknown as StoredUse);
};

const orderingConflictMessage = (controller: Ctor, foreignClassMiddleware: StoredUse[], routeCount: number): string => {
  const names = foreignClassMiddleware.map(use => use.middleware.name || 'anonymous').join(', ');
  return (
    `${controller.name}: class-level middleware (${names}) runs before the injected auth guard on ` +
    `${routeCount} route(s), because the controller also has @Public() routes. ` +
    `Add @UseBefore(authMiddleware) at class level, or move that middleware onto the actions.`
  );
};

const protectController = (args: {
  storage: MetadataStorage;
  controller: Ctor;
  classified: ClassifiedActions;
  foreignClassMiddleware: StoredUse[];
  authMiddleware: Middleware;
  strict: boolean;
}): { protectedRoutes: RouteRef[]; warning?: string } => {
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

  if (warning && strict) {
    throw new Error(`enforceGlobalAuth: ${warning}`);
  }

  for (const { action } of needsAuth) {
    injectAuth(storage, controller, authMiddleware, String(action.method ?? ''));
  }

  return { protectedRoutes, warning };
};

const logReport = (report: AuthGuardReport, logger?: EnforceGlobalAuthOptions['logger']): void => {
  if (!logger) return;

  const total = report.protectedRoutes.length + report.alreadyProtected.length + report.publicRoutes.length;
  logger.info?.(
    `Auth guard: ${total} routes - ${report.protectedRoutes.length} newly protected, ` +
      `${report.alreadyProtected.length} already protected, ${report.publicRoutes.length} public`,
  );

  for (const route of report.publicRoutes) {
    logger.warn?.(
      `Auth guard: PUBLIC ${route.httpMethod} ${route.route} (${route.controller}.${route.action})` +
        (route.reason ? ` - ${route.reason}` : ' - no reason given'),
    );
  }

  for (const warning of report.warnings) {
    logger.warn?.(`Auth guard: ${warning}`);
  }
};
