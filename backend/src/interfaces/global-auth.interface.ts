import { getMetadataArgsStorage } from 'routing-controllers';

export type Ctor = { readonly name: string; readonly prototype: unknown };
export type Middleware = { readonly name: string } & ((...args: never[]) => unknown);

export interface UseEntry {
  target: Ctor;
  method?: string;
  middleware: Middleware;
  afterAction: boolean;
}

export type MetadataStorage = ReturnType<typeof getMetadataArgsStorage>;
export type ActionArgs = MetadataStorage['actions'][number];
export type StoredUse = MetadataStorage['uses'][number];

export interface ClassifiedActions {
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
