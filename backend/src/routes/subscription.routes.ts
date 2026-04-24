import express, { Router } from 'express';
import {
  getPlans,
  getCurrentSubscription,
  createCheckout,
  handleWebhook,
} from '../controllers/subscription/subscription.controller';
import {
  createStripeCheckout,
  createStripePortal,
  handleStripeWebhook,
} from '../controllers/subscription/stripe.controller';
import { authenticate } from '../middleware/authenticate';

const router = Router();

// ── Dodo Payments webhook (no auth, JSON body already parsed) ──────────────────
router.post('/webhook', handleWebhook);

// ── Stripe webhook (no auth — MUST receive raw body for signature verification) ─
router.post(
  '/stripe/webhook',
  express.raw({ type: 'application/json' }),
  handleStripeWebhook,
);

// ── All routes below require authentication ───────────────────────────────────
router.use(authenticate);

router.get('/plans', getPlans);
router.get('/current', getCurrentSubscription);

// Dodo Payments checkout
router.post('/create-checkout', createCheckout);

// Stripe checkout & customer portal
router.post('/stripe/checkout', createStripeCheckout);
router.post('/stripe/portal', createStripePortal);

export default router;
