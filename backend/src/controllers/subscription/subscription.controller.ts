import { Response, NextFunction } from 'express';
import { prisma } from '../../config/database';
import { AppError } from '../../utils/AppError';
import { env } from '../../config/env';
import { AuthRequest } from '../../middleware/authenticate';

const PLANS = {
  FREE: { price: 0, name: 'Free', features: ['1 benefits check/month', '1 bill upload', 'Basic alerts'] },
  PRO: { price: 4.99, name: 'Pro', features: ['Unlimited benefits checks', '5 bill uploads/month', 'Smart alerts', 'Energy comparison', 'Priority support'] },
  PREMIUM: { price: 9.99, name: 'Premium', features: ['Everything in Pro', 'Unlimited bill uploads', 'Monthly auto-scan', 'Insurance comparison', 'White-glove claim help', 'CSV export'] },
};

// GET /api/v1/subscription/plans
export async function getPlans(_req: AuthRequest, res: Response, next: NextFunction) {
  try {
    res.json({ success: true, data: PLANS });
  } catch (error) {
    next(error);
  }
}

// GET /api/v1/subscription/current
export async function getCurrentSubscription(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.userId!;

    const subscription = await prisma.subscription.findUnique({
      where: { userId },
    });

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { plan: true },
    });

    res.json({
      success: true,
      data: {
        subscription,
        plan: user?.plan,
        planDetails: PLANS[user?.plan ?? 'FREE'],
      },
    });
  } catch (error) {
    next(error);
  }
}

// POST /api/v1/subscription/create-checkout
// Creates a Dodo Payments checkout session
export async function createCheckout(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.userId!;
    const { plan } = req.body;

    if (!['PRO', 'PREMIUM'].includes(plan)) {
      throw new AppError('Invalid plan selected', 400);
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, name: true },
    });

    if (!user) throw new AppError('User not found', 404);

    // Dodo Payments API call
    const priceGbp = plan === 'PRO' ? env.PLAN_PRO_PRICE : env.PLAN_PREMIUM_PRICE;

    const dodoResponse = await fetch('https://api.dodopayments.com/v1/subscriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.DODO_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        customer: { email: user.email, name: user.name },
        product: {
          name: `ClaimWise UK ${plan} Plan`,
          description: `Monthly ${plan.toLowerCase()} subscription`,
          price: priceGbp,
          currency: 'GBP',
          interval: 'monthly',
        },
        success_url: `${env.FRONTEND_URL}/dashboard?upgrade=success`,
        cancel_url: `${env.FRONTEND_URL}/settings/billing?upgrade=cancelled`,
        metadata: { userId, plan },
      }),
    });

    if (!dodoResponse.ok) {
      throw new AppError('Failed to create checkout session', 500);
    }

    const dodoData = await dodoResponse.json() as { checkout_url: string };

    res.json({ success: true, data: { checkoutUrl: dodoData.checkout_url } });
  } catch (error) {
    next(error);
  }
}

// POST /api/v1/subscription/webhook
// Dodo Payments webhook — handle subscription events
export async function handleWebhook(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const event = req.body;

    // Verify webhook signature in production
    // const sig = req.headers['dodo-signature'];
    // verifyDodoWebhookSignature(sig, req.body, env.DODO_WEBHOOK_SECRET);

    switch (event.type) {
      case 'subscription.activated': {
        const { userId, plan } = event.data.metadata;
        await prisma.$transaction([
          prisma.user.update({ where: { id: userId }, data: { plan } }),
          prisma.subscription.upsert({
            where: { userId },
            update: {
              plan,
              status: 'ACTIVE',
              dodoSubscriptionId: event.data.id,
              currentPeriodStart: new Date(event.data.current_period_start),
              currentPeriodEnd: new Date(event.data.current_period_end),
            },
            create: {
              userId,
              plan,
              status: 'ACTIVE',
              dodoSubscriptionId: event.data.id,
              dodoCustomerId: event.data.customer_id,
              priceGbp: event.data.price / 100,
              currentPeriodStart: new Date(event.data.current_period_start),
              currentPeriodEnd: new Date(event.data.current_period_end),
            },
          }),
        ]);
        break;
      }

      case 'subscription.cancelled': {
        const { userId } = event.data.metadata;
        await prisma.$transaction([
          prisma.user.update({ where: { id: userId }, data: { plan: 'FREE' } }),
          prisma.subscription.update({
            where: { userId },
            data: { status: 'CANCELLED', cancelledAt: new Date() },
          }),
        ]);
        break;
      }
    }

    res.json({ received: true });
  } catch (error) {
    next(error);
  }
}
