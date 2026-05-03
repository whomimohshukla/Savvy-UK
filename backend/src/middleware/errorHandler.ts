import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';
import { logger } from '../config/logger';

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  const requestId = req.requestId;

  if (err instanceof AppError) {
    // Log 5xx server-side errors; let 4xx pass silently
    if (err.statusCode >= 500) {
      logger.error(`[${requestId}] AppError:`, {
        message: err.message,
        statusCode: err.statusCode,
        url: req.url,
        method: req.method,
      });
    }
    res.status(err.statusCode).json({
      success: false,
      error: err.message,
      requestId,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
    return;
  }

  logger.error(`[${requestId}] Unhandled error:`, {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
  });

  res.status(500).json({
    success: false,
    error: 'Internal server error',
    requestId,
    ...(process.env.NODE_ENV === 'development' && {
      message: err.message,
      stack: err.stack,
    }),
  });
}

export function notFound(req: Request, res: Response): void {
  res.status(404).json({
    success: false,
    error: `Route ${req.method} ${req.url} not found`,
    requestId: req.requestId,
  });
}
