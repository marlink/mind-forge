import { Request, Response, NextFunction } from 'express';
import logger from '../lib/logger.js';
import * as Sentry from '@sentry/node';

export class AppError extends Error {
  statusCode: number;
  status: string;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: AppError | Error,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  const statusCode = err instanceof AppError ? err.statusCode : 500;
  const status = err instanceof AppError ? err.status : 'error';
  const requestId = req.headers['x-request-id'] || 'unknown';

  // Log error
  logger.error('Request error', {
    message: err.message,
    statusCode,
    stack: err.stack,
    path: req.path,
    method: req.method,
    requestId,
  });

  // Send to Sentry for non-operational errors
  if (!(err instanceof AppError) && process.env.SENTRY_DSN) {
    const requestIdStr = Array.isArray(requestId) ? requestId[0] : requestId;
    Sentry.captureException(err, {
      tags: {
        path: req.path,
        method: req.method,
        requestId: requestIdStr,
      },
    });
  }

  res.status(statusCode).json({
    status,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    requestId,
  });
};

