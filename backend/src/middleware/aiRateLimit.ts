import { Response, NextFunction } from 'express';
import { AuthRequest } from './authenticate';
import { getRedis, CacheKeys } from '../config/redis';
import { AppError } from '../utils/AppError';

/**
 * Per-user Redis-backed AI rate limiter.
 * Falls through silently if Redis is unavailable (graceful degradation).
 */
export function createUserAiRateLimiter(maxPerHour: number) {
  return async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    const userId = req.userId;
    if (!userId) {
      next();
      return;
    }

    const r = getRedis();
    if (!r) {
      next();
      return;
    }

    const key = CacheKeys.rateLimitAI(userId);
    try {
      const current = await r.incr(key);
      if (current === 1) await r.expire(key, 3600); // 1-hour sliding window

      res.setHeader('X-AI-RateLimit-Limit', maxPerHour);
      res.setHeader('X-AI-RateLimit-Remaining', Math.max(0, maxPerHour - current));

      if (current > maxPerHour) {
        const ttl = await r.ttl(key);
        const minutes = Math.ceil(ttl / 60);
        return next(
          new AppError(
            `AI request limit reached. Try again in ${minutes} minute${minutes !== 1 ? 's' : ''}.`,
            429
          )
        );
      }
    } catch {
      // Redis error — allow request through to avoid blocking legitimate users
    }

    next();
  };
}
