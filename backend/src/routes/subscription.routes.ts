import { Router } from 'express';
import { getPlans, getCurrentSubscription, createCheckout, handleWebhook } from '../controllers/subscription/subscription.controller';
import { authenticate } from '../middleware/authenticate';
const router = Router();
router.post('/webhook', handleWebhook); // no auth — Dodo calls this
router.use(authenticate);
router.get('/plans', getPlans);
router.get('/current', getCurrentSubscription);
router.post('/create-checkout', createCheckout);
export default router;
