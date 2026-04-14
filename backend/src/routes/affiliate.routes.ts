import { Router } from 'express';
import { trackAffiliateClick, recordConversion } from '../services/affiliates/affiliate.service';
import { authenticate } from '../middleware/authenticate';
import { AuthRequest } from '../middleware/authenticate';
import { Response, NextFunction } from 'express';

const router = Router();

router.post('/click', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { partner, type } = req.body;
    const url = await trackAffiliateClick({
      userId: req.userId,
      partner,
      type,
      sessionId: req.headers['x-session-id'] as string,
    });
    res.json({ success: true, data: { redirectUrl: url } });
  } catch (err) { next(err); }
});

// Called by affiliate networks to confirm conversions
router.post('/conversion', async (req, res, next) => {
  try {
    await recordConversion(req.body);
    res.json({ success: true });
  } catch (err) { next(err); }
});

export default router;
