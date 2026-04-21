import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { rateLimit } from 'express-rate-limit';

import { logger } from './config/logger';
import { env } from './config/env';
import { connectRedis } from './config/redis';

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
import { errorHandler } from './middleware/errorHandler';
import { notFound } from './middleware/notFound';
import { requestLogger } from './middleware/requestLogger';

// Cron jobs
import { startCronJobs } from './services/cron/scheduler';

const app = express();

// ─── Security ─────────────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: env.FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ─── Global rate limit ────────────────────────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX_REQUESTS,
  standardHeaders: true,
  legacyHeaders: false,
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
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'savvy-uk-api',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    env: env.NODE_ENV,
  });
});

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/benefits', benefitsRoutes);
app.use('/api/v1/bills', billsRoutes);
app.use('/api/v1/energy', energyRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/alerts', alertsRoutes);
app.use('/api/v1/subscription', subscriptionRoutes);
app.use('/api/v1/affiliate', affiliateRoutes);

// ─── Error handlers ───────────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ─── Bootstrap ────────────────────────────────────────────────────────────────
async function bootstrap() {
  try {
    await connectRedis();

    if (env.NODE_ENV === 'production') {
      startCronJobs();
      logger.info('✅ Cron jobs started');
    }

    app.listen(env.PORT, () => {
      logger.info(`🚀 Savvy UK API running on port ${env.PORT}`);
      logger.info(`📍 Environment: ${env.NODE_ENV}`);
      logger.info(`🌐 CORS origin: ${env.FRONTEND_URL}`);
    });
  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

bootstrap();

export default app;
