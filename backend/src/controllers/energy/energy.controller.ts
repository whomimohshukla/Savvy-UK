import { Response, NextFunction } from 'express';
import { prisma } from '../../config/database';
import { AppError } from '../../utils/AppError';
import { runEnergyScan } from '../../services/ai/energyAI.service';
import { cacheGet, cacheSet, cacheDel, CacheKeys, CACHE_TTL } from '../../config/redis';
import { AuthRequest } from '../../middleware/authenticate';
import { trackAffiliateClick } from '../../services/affiliates/affiliate.service';

// POST /api/v1/energy/scan
export async function runScan(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.userId!;
    const { currentSupplier, currentTariff, annualUsageKwh, postcode } = req.body;

    if (!postcode) throw new AppError('Postcode is required for energy scan', 400);

    const result = await runEnergyScan({
      userId,
      currentSupplier,
      currentTariff,
      annualUsageKwh,
      postcode,
    });

    const scan = await prisma.energyScan.create({
      data: {
        userId,
        currentSupplier,
        currentTariff,
        annualUsageKwh,
        currentAnnualCost: result.currentAnnualCost,
        bestDealSupplier: result.bestDeal?.supplier,
        bestDealAnnualCost: result.bestDeal?.annualCost,
        potentialSaving: result.potentialSaving,
        affiliateUrl: result.affiliateUrl,
        affiliateProvider: result.affiliateProvider,
        warmHomeDiscount: result.warmHomeDiscount,
        warmHomeDiscountVal: result.warmHomeDiscountVal,
        aiRecommendation: result.recommendation,
      },
    });

    if (result.potentialSaving && result.potentialSaving > 50) {
      await prisma.alert.create({
        data: {
          userId,
          type: 'ENERGY_SAVING',
          title: `Switch and save £${Math.round(result.potentialSaving)} this year`,
          message: result.recommendation,
          valueAmount: result.potentialSaving,
          actionUrl: result.affiliateUrl,
          actionLabel: `Switch to ${result.bestDeal?.supplier}`,
        },
      });
    }

    await cacheDel(CacheKeys.userDashboard(userId));

    res.json({ success: true, data: { scan, result } });
  } catch (error) {
    next(error);
  }
}

// GET /api/v1/energy/history
export async function getScanHistory(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.userId!;

    const scans = await prisma.energyScan.findMany({
      where: { userId },
      orderBy: { scannedAt: 'desc' },
      take: 10,
    });

    res.json({ success: true, data: scans });
  } catch (error) {
    next(error);
  }
}

// POST /api/v1/energy/click-affiliate
// Track when user clicks a switch link — this is how we earn commission
export async function clickAffiliate(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.userId;
    const { partner, type, scanId } = req.body;

    const affiliateUrl = await trackAffiliateClick({
      userId,
      partner,
      type: type ?? 'ENERGY_SWITCH',
      sessionId: req.headers['x-session-id'] as string,
    });

    res.json({ success: true, data: { redirectUrl: affiliateUrl } });
  } catch (error) {
    next(error);
  }
}
