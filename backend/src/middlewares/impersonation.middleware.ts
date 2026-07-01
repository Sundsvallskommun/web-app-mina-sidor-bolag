import { NextFunction, Request, Response } from 'express';
import { HttpException } from '@exceptions/HttpException';
import { logger } from '@utils/logger';

const impersonationMiddleware = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    if (req.user.permissions.canImpersonateUser) {
      next();
    } else {
      next(new HttpException(401, 'Not Authorized as administrator'));
    }
  } catch (error) {
    logger.error('Error in admin middleware', error);
    next(new HttpException(401, `Failed to authorize administrator: ${error}`));
  }
};

export default impersonationMiddleware;
