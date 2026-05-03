import { Request, Response, NextFunction } from 'express';
import { logger } from '../config/logger';

export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const startMs = Date.now();
  const { method, url } = req;

  res.on('finish', () => {
    const duration = Date.now() - startMs;
    const status = res.statusCode;
    const level = status >= 500 ? 'error' : status >= 400 ? 'warn' : 'info';

    logger[level](`${method} ${url} ${status} — ${duration}ms`, {
      requestId: req.requestId,
      ip: req.ip,
      userAgent: req.get('user-agent'),
      duration,
    });
  });

  next();
}
