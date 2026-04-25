import Stripe from 'stripe';
import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../config/database';
import { AppError } from '../../utils/AppError';
import { env } from '../../config/env';
import { logger } from '../../config/logger';
import { AuthRequest } from '../../middleware/authenticate';

type StripeClient = InstanceType<typeof Stripe>;

function getStripe(): StripeClient {
  if (!env.STRIPE_SECRET_KEY) throw new AppError('Stripe is not configured', 503);
  return new Stripe(env.STRIPE_SECRET_KEY);
}

// POST /api/v1/subscription/stripe/checkout
export async function createStripeCheckout(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.userId!;
    const { plan } = req.body as { plan: 'PRO' | 'PREMIUM' };

    if (!['PRO', 'PREMIUM'].includes(plan)) throw new AppError('Invalid plan', 400);

    const priceId = plan === 'PRO' ? env.STRIPE_PRO_PRICE_ID : env.STRIPE_PREMIUM_PRICE_ID;
    if (!priceId) throw new AppError(`Stripe price ID for ${plan} is not configured`, 503);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, name: true },
    });
    if (!user) throw new AppError('User not found', 404);

    const stripe = getStripe();

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      customer_email: user.email,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${env.FRONTEND_URL}/dashboard?upgrade=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${env.FRONTEND_URL}/dashboard/settings?upgrade=cancelled`,
      metadata: { userId, plan },
      subscription_data: { metadata: { userId, plan } },
    });

    logger.info(`Stripe checkout created for user ${userId}, plan ${plan}`);
    res.json({ success: true, data: { checkoutUrl: session.url } });
  } catch (err) {
    next(err);
  }
}

// POST /api/v1/subscription/stripe/portal
// Lets subscribers manage/cancel their subscription via Stripe customer portal
export async function createStripePortal(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.userId!;
    const stripe = getStripe();

    const subscription = await prisma.subscription.findUnique({ where: { userId } });
    if (!subscription?.stripeCustomerId) {
      throw new AppError('No active Stripe subscription found', 404);
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: subscription.stripeCustomerId,
      return_url: `${env.FRONTEND_URL}/dashboard/settings`,
    });

    res.json({ success: true, data: { portalUrl: session.url } });
  } catch (err) {
    next(err);
  }
}

// POST /api/v1/subscription/stripe/webhook  (raw body, no auth)
export async function handleStripeWebhook(req: Request, res: Response, next: NextFunction) {
  const sig = req.headers['stripe-signature'];
  if (!sig || !env.STRIPE_WEBHOOK_SECRET) {
    return res.status(400).json({ error: 'Missing Stripe signature or webhook secret' });
  }

  let event: any;
  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(req.body as Buffer, sig, env.STRIPE_WEBHOOK_SECRET);
  } catch (err: any) {
    logger.warn(`Stripe webhook signature verification failed: ${err.message}`);
    return res.status(400).json({ error: 'Invalid signature' });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as any;
        if (session.mode !== 'subscription') break;

        const { userId, plan } = session.metadata ?? {};
        if (!userId || !plan) break;

        const stripe = getStripe();
        const sub = await stripe.subscriptions.retrieve(session.subscription as string) as any;

        await prisma.$transaction([
          prisma.user.update({ where: { id: userId }, data: { plan: plan as any } }),
          prisma.subscription.upsert({
            where: { userId },
            update: {
              plan: plan as any,
              status: 'ACTIVE',
              stripeSubscriptionId: sub.id,
              stripeCustomerId: sub.customer as string,
              currentPeriodStart: new Date(sub.current_period_start * 1000),
              currentPeriodEnd: new Date(sub.current_period_end * 1000),
            },
            create: {
              userId,
              plan: plan as any,
              status: 'ACTIVE',
              stripeSubscriptionId: sub.id,
              stripeCustomerId: sub.customer as string,
              priceGbp: plan === 'PRO' ? 4.99 : 9.99,
              currentPeriodStart: new Date(sub.current_period_start * 1000),
              currentPeriodEnd: new Date(sub.current_period_end * 1000),
            },
          }),
        ]);

        logger.info(`Stripe subscription activated: user ${userId} → ${plan}`);
        break;
      }

      case 'customer.subscription.updated': {
        const sub = event.data.object as any;
        const { userId, plan } = sub.metadata ?? {};
        if (!userId) break;

        const status = sub.status === 'active' ? 'ACTIVE'
          : sub.status === 'past_due' ? 'PAST_DUE'
          : sub.status === 'trialing' ? 'TRIALING'
          : 'CANCELLED';

        await prisma.subscription.updateMany({
          where: { stripeSubscriptionId: sub.id },
          data: {
            status: status as any,
            plan: (plan as any) ?? undefined,
            currentPeriodStart: new Date(sub.current_period_start * 1000),
            currentPeriodEnd: new Date(sub.current_period_end * 1000),
          },
        });
        break;
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as any;
        const { userId } = sub.metadata ?? {};
        if (!userId) break;

        await prisma.$transaction([
          prisma.user.update({ where: { id: userId }, data: { plan: 'FREE' } }),
          prisma.subscription.updateMany({
            where: { stripeSubscriptionId: sub.id },
            data: { status: 'CANCELLED', cancelledAt: new Date() },
          }),
        ]);

        logger.info(`Stripe subscription cancelled: user ${userId} → FREE`);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as any;
        const customerId = invoice.customer as string;
        await prisma.subscription.updateMany({
          where: { stripeCustomerId: customerId },
          data: { status: 'PAST_DUE' },
        });
        logger.warn(`Stripe payment failed for customer ${customerId}`);
        break;
      }
    }

    res.json({ received: true });
  } catch (err) {
    logger.error('Stripe webhook processing error:', err);
    next(err);
  }
}
