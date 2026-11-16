import { Request, Response, NextFunction } from 'express';
import { UserRole } from '@prisma/client';
import { sendError } from '../utils/apiResponse';

export function requireRole(allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendError({
        res,
        statusCode: 401,
        code: 'UNAUTHORIZED',
        message: 'Authentication required before checking permissions.',
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      sendError({
        res,
        statusCode: 403,
        code: 'FORBIDDEN',
        message: 'You do not have permission to access this resource.',
      });
      return;
    }

    next();
  };
}
