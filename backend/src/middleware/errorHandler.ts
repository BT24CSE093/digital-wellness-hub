import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/apiResponse';

export class AppError extends Error {
  public statusCode: number;
  public code: string;

  constructor(message: string, statusCode = 500, code = 'APPLICATION_ERROR') {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  const isProduction = process.env.NODE_ENV === 'production';
  console.error('Unhandled API Error:', err);

  const customErr = err as { status?: number; statusCode?: number; code?: string };
  const statusCode = customErr.statusCode || customErr.status || 500;
  const code = customErr.code || (statusCode >= 500 ? 'INTERNAL_SERVER_ERROR' : 'APPLICATION_ERROR');

  const message =
    isProduction && statusCode === 500
      ? 'An unexpected internal server error occurred.'
      : err.message || 'Internal Server Error';

  sendError({
    res,
    statusCode,
    code,
    message,
    details: !isProduction && statusCode === 500 ? { stack: err.stack } : undefined,
  });
}
