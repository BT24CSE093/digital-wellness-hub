import { Response } from 'express';

export interface ApiResponseOptions<T> {
  res: Response;
  statusCode?: number;
  data?: T;
  meta?: Record<string, unknown>;
  message?: string;
}

export interface ApiErrorOptions {
  res: Response;
  statusCode?: number;
  code?: string;
  message: string;
  details?: unknown;
}

export function sendSuccess<T>({
  res,
  statusCode = 200,
  data,
  meta,
}: ApiResponseOptions<T>): Response {
  return res.status(statusCode).json({
    success: true,
    ...(data !== undefined ? { data } : {}),
    ...(meta ? { meta } : {}),
  });
}

export function sendError({
  res,
  statusCode = 500,
  code = 'INTERNAL_SERVER_ERROR',
  message,
  details,
}: ApiErrorOptions): Response {
  return res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      ...(details !== undefined ? { details } : {}),
    },
  });
}
