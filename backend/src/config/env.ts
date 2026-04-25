import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(5000),
  FRONTEND_URL: z.string().url().default('http://localhost:3000'),

  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  REDIS_URL: z.string().min(1, 'REDIS_URL is required'),

  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 chars'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 chars'),
  JWT_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

  // AI Provider — use 'gemini' (free) or 'claude' (paid, high quality)
  AI_PROVIDER: z.enum(['gemini', 'claude']).default('gemini'),
  ANTHROPIC_API_KEY: z.string().startsWith('sk-ant-').optional(),
  GEMINI_API_KEY: z.string().optional(),
  GEMINI_MODEL: z.string().default('gemini-2.0-flash'),

  // Google OAuth
  GOOGLE_CLIENT_ID: z.string().min(1, 'GOOGLE_CLIENT_ID is required for Google login'),
  GOOGLE_CLIENT_SECRET: z.string().optional(),

  // Email — Nodemailer (Gmail SMTP, free)
  SMTP_HOST: z.string().default('smtp.gmail.com'),
  SMTP_PORT: z.coerce.number().default(587),
  SMTP_USER: z.string().optional(),        // your Gmail address
  SMTP_PASS: z.string().optional(),        // Gmail App Password (not your login password)
  EMAIL_FROM: z.string().default('ClaimWise UK <noreply@claimwise.co.uk>'),

  // Resend (alternative, optional)
  RESEND_API_KEY: z.string().optional(),

  DODO_API_KEY: z.string().optional(),
  DODO_WEBHOOK_SECRET: z.string().optional(),

  // Stripe Payments
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  STRIPE_PRO_PRICE_ID: z.string().optional(),
  STRIPE_PREMIUM_PRICE_ID: z.string().optional(),

  PLAN_FREE_PRICE: z.coerce.number().default(0),
  PLAN_PRO_PRICE: z.coerce.number().default(499),
  PLAN_PREMIUM_PRICE: z.coerce.number().default(999),

  ENERGY_SHOP_AFFILIATE_ID: z.string().optional(),
  UKPOWER_AFFILIATE_ID: z.string().optional(),
  USWITCH_AFFILIATE_ID: z.string().optional(),
  SWITCHITY_AFFILIATE_ID: z.string().optional(),
  GOCOMPARE_AFFILIATE_ID: z.string().optional(),

  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(900000),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().default(100),
  AI_RATE_LIMIT_MAX: z.coerce.number().default(20),

  MAX_FILE_SIZE_MB: z.coerce.number().default(10),
  UPLOAD_DIR: z.string().default('./uploads'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:');
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

const data = parsed.data;

if (data.AI_PROVIDER === 'claude' && !data.ANTHROPIC_API_KEY) {
  console.error('❌ ANTHROPIC_API_KEY is required when AI_PROVIDER=claude');
  process.exit(1);
}
if (data.AI_PROVIDER === 'gemini' && !data.GEMINI_API_KEY) {
  console.error('❌ GEMINI_API_KEY is required when AI_PROVIDER=gemini');
  console.error('   Get a free key at: https://aistudio.google.com/app/apikey');
  process.exit(1);
}

export const env = data;
export type Env = typeof env;
