import { Router } from 'express';
import { checkBenefits, getLatestBenefits, getBenefitsHistory } from '../controllers/benefits/benefits.controller';
import { authenticate } from '../middleware/authenticate';
import { rateLimit } from 'express-rate-limit';

const aiLimiter = rateLimit({ windowMs: 60 * 60 * 1000, max: 20, message: { success: false, error: 'AI rate limit reached. Try again in an hour.' } });
const router = Router();

router.use(authenticate);
router.post('/check', aiLimiter, checkBenefits);
router.get('/latest', getLatestBenefits);
router.get('/history', getBenefitsHistory);

export default router;
