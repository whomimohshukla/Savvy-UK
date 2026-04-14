import Redis from 'ioredis';
import { env } from './env';
import { logger } from './logger';

let redis: Redis | null = null;

export function getRedis(): Redis {
  if (!redis) {
    throw new Error('Redis not connected. Call connectRedis() first.');
  }
  return redis;
}

export async function connectRedis(): Promise<void> {
  redis = new Redis(env.REDIS_URL, {
    maxRetriesPerRequest: 3,
    retryStrategy: (times) => {
      if (times > 5) return null;
      return Math.min(times * 200, 2000);
    },
    enableOfflineQueue: false,
  });

  return new Promise((resolve, reject) => {
    redis!.on('connect', () => {
      logger.info('Redis connected');
      resolve();
    });
    redis!.on('error', (err) => {
      logger.error('Redis error:', err);
      reject(err);
    });
  });
}

// ─── Cache helpers ────────────────────────────────────────────────────────────

export async function cacheGet<T>(key: string): Promise<T | null> {
  const r = getRedis();
  const val = await r.get(key);
  if (!val) return null;
  try {
    return JSON.parse(val) as T;
  } catch {
    return null;
  }
}

export async function cacheSet(
  key: string,
  value: unknown,
  ttlSeconds = 3600
): Promise<void> {
  const r = getRedis();
  await r.setex(key, ttlSeconds, JSON.stringify(value));
}

export async function cacheDel(key: string): Promise<void> {
  const r = getRedis();
  await r.del(key);
}

export async function cacheDelPattern(pattern: string): Promise<void> {
  const r = getRedis();
  const keys = await r.keys(pattern);
  if (keys.length > 0) {
    await r.del(...keys);
  }
}

// TTL constants (seconds)
export const CACHE_TTL = {
  SHORT: 60 * 5,          // 5 minutes
  MEDIUM: 60 * 30,        // 30 minutes
  LONG: 60 * 60 * 2,      // 2 hours
  VERY_LONG: 60 * 60 * 24, // 24 hours
  BENEFITS: 60 * 60 * 6,  // 6 hours — benefit rules don't change often
  ENERGY: 60 * 30,        // 30 minutes — tariffs change more
  USER_DASHBOARD: 60 * 10, // 10 minutes
};

// Cache key generators
export const CacheKeys = {
  userDashboard: (userId: string) => `dashboard:${userId}`,
  userBenefits: (userId: string) => `benefits:${userId}`,
  userAlerts: (userId: string) => `alerts:${userId}`,
  energyTariffs: (postcode: string) => `energy:tariffs:${postcode}`,
  benefitRules: () => `benefits:rules`,
  session: (token: string) => `session:${token}`,
  rateLimitAI: (userId: string) => `ratelimit:ai:${userId}`,
};
