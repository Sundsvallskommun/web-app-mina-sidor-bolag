import { NextFunction, Response } from 'express';
import rateLimit, { ipKeyGenerator } from 'express-rate-limit';
import { HttpException } from '@exceptions/HttpException';
import { RequestWithUser } from '@interfaces/auth.interface';
import { getAdministrableBusiness } from '@services/ownership.service';
import { logger } from '@utils/logger';

export const identityLookupLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: any) => req.sessionID ?? ipKeyGenerator(req.ip),
  handler: (req: any, _res, next) => {
    logger.warn(`Identity lookup rate limit hit by party '${req.user?.partyId ?? 'unknown'}'`);
    next(new HttpException(429, 'TOO_MANY_LOOKUPS'));
  },
});

export const requireMandateAdministrator = (req: RequestWithUser, _res: Response, next: NextFunction) => {
  try {
    getAdministrableBusiness(req);
    return next();
  } catch (error) {
    return next(error);
  }
};

export const logIdentityLookup = (req: RequestWithUser, personNumber: string): void => {
  const masked =
    typeof personNumber === 'string' && personNumber.length > 4 ? `${personNumber.slice(0, -4)}****` : '****';
  logger.info(`Identity lookup by party '${req.user?.partyId ?? 'unknown'}' for '${masked}'`);
};
