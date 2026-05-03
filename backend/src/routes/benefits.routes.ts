import { Router } from 'express';
import { checkBenefits, getLatestBenefits, getBenefitsHistory } from '../controllers/benefits/benefits.controller';
import { authenticate } from '../middleware/authenticate';
import { validate } from '../middleware/validate';
import { benefitsCheckSchema } from '../validators/benefits.validators';
import { paginationSchema } from '../validators/bills.validators';
import { createUserAiRateLimiter } from '../middleware/aiRateLimit';
import { env } from '../config/env';

const userAiLimiter = createUserAiRateLimiter(env.AI_RATE_LIMIT_MAX);

const router = Router();
router.use(authenticate);

router.post('/check',   userAiLimiter, validate(benefitsCheckSchema), checkBenefits);
router.get('/latest',  getLatestBenefits);
router.get('/history', validate(paginationSchema, 'query'), getBenefitsHistory);

export default router;
