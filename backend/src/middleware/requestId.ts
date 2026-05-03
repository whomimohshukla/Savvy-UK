import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      requestId?: string;
    }
  }
}

export function requestId(req: Request, res: Response, next: NextFunction): void {
  const id =
    (req.headers['x-request-id'] as string) ||
    `req_${crypto.randomBytes(8).toString('hex')}`;
  req.requestId = id;
  res.setHeader('X-Request-ID', id);
  next();
}
