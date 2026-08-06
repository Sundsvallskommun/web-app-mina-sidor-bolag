import { NextFunction, Response } from 'express';
import rateLimit, { ipKeyGenerator } from 'express-rate-limit';
import { HttpException } from '@exceptions/HttpException';
import { RequestWithUser } from '@interfaces/auth.interface';
import { getAdministrableBusiness } from '@services/ownership.service';
import { logger } from '@utils/logger';

/**
 * Guards the endpoints that translate a personnummer into a partyId and a name.
 *
 * These are unavoidable - you cannot add someone as a delegate or mandate holder
 * without first resolving who they are - but they turn any valid session into a
 * population register lookup. Three things narrow that down: only sessions that
 * could actually complete the flow may call them, the rate is capped so the
 * endpoint cannot be walked in bulk, and every lookup is attributable.
 */

/**
 * Per-session cap. Generous enough for real use (typing a personnummer retries,
 * correcting a typo) and far below what bulk enumeration needs.
 */
export const identityLookupLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  // Per session rather than per IP: users behind a shared municipal NAT must not
  // exhaust each other's budget, and a session is the thing we can hold to account.
  // The IP fallback goes through ipKeyGenerator so IPv6 clients are bucketed by
  // subnet rather than by address, which they could otherwise rotate freely.
  keyGenerator: (req: any) => req.sessionID ?? ipKeyGenerator(req.ip),
  handler: (req: any, _res, next) => {
    logger.warn(`Identity lookup rate limit hit by party '${req.user?.partyId ?? 'unknown'}'`);
    next(new HttpException(429, 'TOO_MANY_LOOKUPS'));
  },
});

/**
 * Only an organization representative who could go on to grant a mandate has any
 * business resolving a stranger's personnummer. Mirrors `mandate.middleware.ts`.
 */
export const requireMandateAdministrator = (req: RequestWithUser, _res: Response, next: NextFunction) => {
  try {
    getAdministrableBusiness(req);
    return next();
  } catch (error) {
    return next(error);
  }
};

/**
 * Records that a lookup happened and who made it. Deliberately logs a masked
 * personnummer - enough to correlate an investigation, not enough to rebuild the
 * register from log files.
 */
export const logIdentityLookup = (req: RequestWithUser, personNumber: string): void => {
  const masked =
    typeof personNumber === 'string' && personNumber.length > 4 ? `${personNumber.slice(0, -4)}****` : '****';
  logger.info(`Identity lookup by party '${req.user?.partyId ?? 'unknown'}' for '${masked}'`);
};
