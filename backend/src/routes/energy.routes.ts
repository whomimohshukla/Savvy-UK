import { Router } from 'express';
import { runScan, getScanHistory, clickAffiliate } from '../controllers/energy/energy.controller';
import { authenticate } from '../middleware/authenticate';

const router = Router();
router.use(authenticate);
router.post('/scan', runScan);
router.get('/history', getScanHistory);
router.post('/click-affiliate', clickAffiliate);
export default router;
