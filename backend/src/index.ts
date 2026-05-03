import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { rateLimit } from 'express-rate-limit';

import { logger } from './config/logger';
import { env } from './config/env';
import { connectRedis, getRedis } from './config/redis';
import { prisma } from './config/database';

// Routes
import authRoutes from './routes/auth.routes';
import benefitsRoutes from './routes/benefits.routes';
import billsRoutes from './routes/bills.routes';
import energyRoutes from './routes/energy.routes';
import dashboardRoutes from './routes/dashboard.routes';
import alertsRoutes from './routes/alerts.routes';
import subscriptionRoutes from './routes/subscription.routes';
import affiliateRoutes from './routes/affiliate.routes';

// Middleware
import { errorHandler, notFound } from './middleware/errorHandler';
import { requestLogger } from './middleware/requestLogger';
import { requestId } from './middleware/requestId';

// Cron jobs
import { startCronJobs } from './services/cron/scheduler';

const app = express();

// ─── Security ─────────────────────────────────────────────────────────────────
app.use(helmet());
app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
  })
);

// ─── Request ID (must come before logging so logs include the ID) ─────────────
app.use(requestId);

// ─── Global rate limit ────────────────────────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX_REQUESTS,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.ip ?? 'unknown',
  message: { success: false, error: 'Too many requests, please try again later.' },
});
app.use(globalLimiter);

// ─── Body parsing ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(compression());

// ─── Request logging ──────────────────────────────────────────────────────────
app.use(requestLogger);

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/health', async (_req, res) => {
  const health: Record<string, unknown> = {
    status: 'ok',
    service: 'claimwise-api',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    env: env.NODE_ENV,
  };

  try {
    await prisma.$queryRaw`SELECT 1`;
    health.database = 'ok';
  } catch {
    health.database = 'error';
    health.status = 'degraded';
  }

  const redisClient = getRedis();
  if (redisClient) {
    try {
      await redisClient.ping();
      health.redis = 'ok';
    } catch {
      health.redis = 'error';
    }
  } else {
    health.redis = 'disabled';
  }

  const statusCode = health.status === 'ok' ? 200 : 503;
  res.status(statusCode).json(health);
});

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/v1/auth',         authRoutes);
app.use('/api/v1/benefits',     benefitsRoutes);
app.use('/api/v1/bills',        billsRoutes);
app.use('/api/v1/energy',       energyRoutes);
app.use('/api/v1/dashboard',    dashboardRoutes);
app.use('/api/v1/alerts',       alertsRoutes);
app.use('/api/v1/subscription', subscriptionRoutes);
app.use('/api/v1/affiliate',    affiliateRoutes);

// ─── Error handlers ───────────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ─── Bootstrap ────────────────────────────────────────────────────────────────
let server: ReturnType<typeof app.listen>;

async function bootstrap() {
  try {
    await connectRedis();

    if (env.NODE_ENV === 'production') {
      startCronJobs();
      logger.info('✅ Cron jobs started');
    }

    server = app.listen(env.PORT, () => {
      logger.info(`🚀 ClaimWise UK API running on port ${env.PORT}`);
      logger.info(`📍 Environment: ${env.NODE_ENV}`);
      logger.info(`🌐 CORS origin: ${env.FRONTEND_URL}`);
    });
  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// ─── Graceful shutdown ────────────────────────────────────────────────────────
function gracefulShutdown(signal: string) {
  logger.info(`${signal} received — shutting down gracefully`);
  server?.close(async () => {
    logger.info('HTTP server closed');
    await prisma.$disconnect();
    logger.info('Database disconnected');
    process.exit(0);
  });

  // Force exit after 10s if connections won't drain
  setTimeout(() => {
    logger.error('Graceful shutdown timed out — forcing exit');
    process.exit(1);
  }, 10_000).unref();
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT',  () => gracefulShutdown('SIGINT'));

bootstrap();

export default app;
