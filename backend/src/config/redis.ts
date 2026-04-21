import Redis from 'ioredis';
import { env } from './env';
import { logger } from './logger';

let redis: Redis | null = null;
let redisAvailable = false;

export function getRedis(): Redis | null {
  return redisAvailable ? redis : null;
}

export async function connectRedis(): Promise<void> {
  return new Promise((resolve) => {
    const client = new Redis(env.REDIS_URL, {
      maxRetriesPerRequest: 1,
      retryStrategy: (times) => {
        if (times > 2) return null;
        return Math.min(times * 200, 1000);
      },
      enableOfflineQueue: false,
      connectTimeout: 5000,
      lazyConnect: true,
    });

    const timeout = setTimeout(() => {
      logger.warn('⚠️  Redis unavailable — caching disabled (set REDIS_URL to enable)');
      client.disconnect();
      resolve();
    }, 6000);

    client.connect().then(() => {
      clearTimeout(timeout);
      redis = client;
      redisAvailable = true;
      logger.info('Redis connected');
      resolve();
    }).catch(() => {
      clearTimeout(timeout);
      logger.warn('⚠️  Redis unavailable — caching disabled (set REDIS_URL to enable)');
      resolve();
    });

    client.on('error', () => {
      // Suppress repeated error logs once we know it's unavailable
    });
  });
}

// ─── Cache helpers ────────────────────────────────────────────────────────────

export async function cacheGet<T>(key: string): Promise<T | null> {
  const r = getRedis();
  if (!r) return null;
  try {
    const val = await r.get(key);
    if (!val) return null;
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
  if (!r) return;
  try {
    await r.setex(key, ttlSeconds, JSON.stringify(value));
  } catch {}
}

export async function cacheDel(key: string): Promise<void> {
  const r = getRedis();
  if (!r) return;
  try {
    await r.del(key);
  } catch {}
}

export async function cacheDelPattern(pattern: string): Promise<void> {
  const r = getRedis();
  if (!r) return;
  try {
    const keys = await r.keys(pattern);
    if (keys.length > 0) await r.del(...keys);
  } catch {}
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
