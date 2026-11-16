import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt.util';
import { sendError } from '../utils/apiResponse';

export function authenticateToken(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    sendError({
      res,
      statusCode: 401,
      code: 'UNAUTHORIZED',
      message: 'Authentication token required.',
    });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = verifyAccessToken(token);
    req.user = payload;
    next();
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Authentication token validation failed.';
    const isExpired = message.toLowerCase().includes('expired');

    sendError({
      res,
      statusCode: 401,
      code: isExpired ? 'TOKEN_EXPIRED' : 'INVALID_TOKEN',
      message: isExpired
        ? 'Access token has expired. Please refresh your session.'
        : 'Invalid authentication token.',
    });
  }
}
