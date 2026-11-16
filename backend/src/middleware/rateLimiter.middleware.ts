import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';
import { sendError } from '../utils/apiResponse';
import { env } from '../config/env';

/**
 * Rate limiter for sensitive authentication endpoints (login, register, refresh).
 * Allows 10 requests per 15 minutes per IP address in production/dev.
 * Relaxed in test environment to avoid interfering with automated tests.
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: env.NODE_ENV === 'test' ? 1000 : 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req: Request, res: Response) => {
    sendError({
      res,
      statusCode: 429,
      code: 'TOO_MANY_REQUESTS',
      message: 'Too many authentication attempts. Please try again after 15 minutes.',
    });
  },
});

/**
 * General rate limiter for standard public & community mutation endpoints.
 * Allows 100 requests per 15 minutes in production to prevent spam/scraping.
 */
export const generalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: env.NODE_ENV === 'test' ? 5000 : 100,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req: Request, res: Response) => {
    sendError({
      res,
      statusCode: 429,
      code: 'TOO_MANY_REQUESTS',
      message: 'Too many requests. Please slow down and try again later.',
    });
  },
});
