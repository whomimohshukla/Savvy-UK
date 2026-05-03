import { Router } from 'express';
import { runScan, getScanHistory, clickAffiliate } from '../controllers/energy/energy.controller';
import { authenticate } from '../middleware/authenticate';
import { validate } from '../middleware/validate';
import { energyScanSchema } from '../validators/energy.validators';
import { paginationSchema } from '../validators/bills.validators';
import { createUserAiRateLimiter } from '../middleware/aiRateLimit';
import { env } from '../config/env';

const userAiLimiter = createUserAiRateLimiter(env.AI_RATE_LIMIT_MAX);

const router = Router();
router.use(authenticate);

router.post('/scan',            userAiLimiter, validate(energyScanSchema), runScan);
router.get('/history',          validate(paginationSchema, 'query'), getScanHistory);
router.post('/click-affiliate', clickAffiliate);

export default router;
