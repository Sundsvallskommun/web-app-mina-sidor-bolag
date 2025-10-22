import { SignMandateDto } from '@/dtos/bankid.dto';
import { RequestWithUser } from '@/interfaces/auth.interface';
import { logger } from '@/utils/logger';
import { HttpException } from '@exceptions/HttpException';
import { NextFunction, Response } from 'express';

const mandateMiddleware = async (req: RequestWithUser, res: Response, next: NextFunction) => {
  const body: SignMandateDto = req.body;
  try {
    if (req.session.representingBusinessChoices.map(org => org.organizationId).includes(body?.mandate?.grantorId)) {
      next();
    } else {
      next(new HttpException(403, 'You do not have permission to access this resource.'));
    }
  } catch (error) {
    logger.error('Error checking mandate', error);
    next(new HttpException(403, 'Failed to authorize'));
  }
};

export default mandateMiddleware;
