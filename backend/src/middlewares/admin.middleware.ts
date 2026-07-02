import { NextFunction, Response } from 'express';
import { HttpException } from '@exceptions/HttpException';
import { RequestWithUser } from '@/interfaces/auth.interface';

/**
 * Authorizes admin-only routes. Must run after `authMiddleware` so an
 * unauthenticated request yields 401; authenticated non-admins get 403.
 */
const adminMiddleware = (req: RequestWithUser, res: Response, next: NextFunction) => {
  if (!req.isAuthenticated?.()) {
    return next(new HttpException(401, 'Not Authorized'));
  }
  if (req.user?.userType !== 'admin') {
    return next(new HttpException(403, 'MISSING_PERMISSIONS'));
  }
  next();
};

export default adminMiddleware;
