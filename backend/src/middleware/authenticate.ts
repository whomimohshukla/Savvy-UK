import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { prisma } from '../config/database';
import { AppError } from '../utils/AppError';
import { cacheGet, cacheSet, cacheDel, CacheKeys, CACHE_TTL } from '../config/redis';

export interface AuthRequest extends Request {
  userId?: string;
  userPlan?: string;
}

export async function authenticate(
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      throw new AppError('No token provided', 401);
    }

    const token = authHeader.split(' ')[1];
    const payload = jwt.verify(token, env.JWT_SECRET) as {
      userId: string;
      email: string;
    };

    req.userId = payload.userId;

    // Cache plan lookup — avoids a DB hit on every authenticated request
    const cached = await cacheGet<string>(CacheKeys.userPlan(payload.userId));
    if (cached) {
      req.userPlan = cached;
      next();
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { plan: true },
    });

    if (!user) {
      throw new AppError('User not found', 401);
    }

    req.userPlan = user.plan;
    await cacheSet(CacheKeys.userPlan(payload.userId), user.plan, CACHE_TTL.USER_PLAN);
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      next(new AppError('Token expired', 401));
    } else if (error instanceof jwt.JsonWebTokenError) {
      next(new AppError('Invalid token', 401));
    } else {
      next(error);
    }
  }
}

// Require specific plan tier
export function requirePlan(...plans: string[]) {
  return (req: AuthRequest, _res: Response, next: NextFunction) => {
    if (!req.userPlan || !plans.includes(req.userPlan)) {
      next(new AppError('Upgrade your plan to access this feature', 403));
    } else {
      next();
    }
  };
}

// Invalidate the cached plan for a user — call after plan change/upgrade
export async function invalidatePlanCache(userId: string): Promise<void> {
  await cacheDel(CacheKeys.userPlan(userId));
}
