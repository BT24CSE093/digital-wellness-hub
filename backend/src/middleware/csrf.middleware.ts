import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';
import { sendError } from '../utils/apiResponse';

const ALLOWED_ORIGINS = [
  env.FRONTEND_URL,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
];

/**
 * Validates Origin/Referer headers on state-changing requests to protect
 * cookie-authenticated endpoints against Cross-Site Request Forgery (CSRF).
 */
export function validateCsrfOrigin(req: Request, res: Response, next: NextFunction): void {
  // Safe HTTP methods do not change state
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  // In test mode, allow supertest calls without origin headers
  if (env.NODE_ENV === 'test') {
    return next();
  }

  const origin = req.headers.origin;
  const referer = req.headers.referer;

  let requestOrigin: string | null = null;

  if (origin) {
    requestOrigin = origin;
  } else if (referer) {
    try {
      const url = new URL(referer);
      requestOrigin = url.origin;
    } catch {
      requestOrigin = null;
    }
  }

  if (!requestOrigin || !ALLOWED_ORIGINS.includes(requestOrigin)) {
    sendError({
      res,
      statusCode: 403,
      code: 'CSRF_VALIDATION_FAILED',
      message: 'Cross-origin request rejected for security reasons.',
    });
    return;
  }

  next();
}
