import { Response, NextFunction } from 'express';
import { prisma } from '../../config/database';
import { cacheGet, cacheSet, CacheKeys, CACHE_TTL } from '../../config/redis';
import { AuthRequest } from '../../middleware/authenticate';

// GET /api/v1/dashboard
export async function getDashboard(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.userId!;

    const cached = await cacheGet(CacheKeys.userDashboard(userId));
    if (cached) return res.json({ success: true, data: cached, cached: true });

    const [
      user,
      latestBenefits,
      latestEnergyScan,
      bills,
      unreadAlerts,
      totalSavings,
      savingsRecords,
    ] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: { name: true, plan: true, postcode: true, onboardingDone: true },
      }),
      prisma.benefitsCheck.findFirst({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        select: { totalPotentialValue: true, createdAt: true, benefitsFound: true },
      }),
      prisma.energyScan.findFirst({
        where: { userId },
        orderBy: { scannedAt: 'desc' },
        select: { potentialSaving: true, bestDealSupplier: true, scannedAt: true },
      }),
      prisma.bill.findMany({
        where: { userId },
        select: { type: true, potentialSaving: true, uploadedAt: true },
        orderBy: { uploadedAt: 'desc' },
        take: 5,
      }),
      prisma.alert.count({ where: { userId, status: 'UNREAD' } }),
      prisma.savingsRecord.aggregate({
        where: { userId, claimed: true },
        _sum: { annualSaving: true },
      }),
      prisma.savingsRecord.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
    ]);

    // Calculate total potential (unclaimed + claimed)
    const totalPotential =
      (latestBenefits?.totalPotentialValue ?? 0) +
      (latestEnergyScan?.potentialSaving ?? 0) +
      bills.reduce((sum: number, b: { potentialSaving: number | null }) => sum + (b.potentialSaving ?? 0), 0);

    const dashboard = {
      user,
      summary: {
        totalPotentialSaving: Math.round(totalPotential),
        totalClaimedSaving: Math.round(totalSavings._sum.annualSaving ?? 0),
        unreadAlerts,
        benefitsFound: latestBenefits
          ? (latestBenefits.benefitsFound as any[]).length
          : 0,
      },
      latestBenefits,
      latestEnergyScan,
      recentBills: bills,
      recentSavings: savingsRecords,
    };

    await cacheSet(CacheKeys.userDashboard(userId), dashboard, CACHE_TTL.USER_DASHBOARD);

    res.json({ success: true, data: dashboard });
  } catch (error) {
    next(error);
  }
}

// GET /api/v1/dashboard/savings
export async function getSavings(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.userId!;

    const [records, totals] = await Promise.all([
      prisma.savingsRecord.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.savingsRecord.groupBy({
        by: ['category'],
        where: { userId },
        _sum: { annualSaving: true },
        _count: true,
      }),
    ]);

    res.json({ success: true, data: { records, totals } });
  } catch (error) {
    next(error);
  }
}

// PATCH /api/v1/dashboard/savings/:id/claimed
export async function markSavingClaimed(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.userId!;
    const { id } = req.params;

    const record = await prisma.savingsRecord.findFirst({ where: { id, userId } });
    if (!record) {
      res.status(404).json({ success: false, error: 'Record not found' });
      return;
    }

    const updated = await prisma.savingsRecord.update({
      where: { id },
      data: { claimed: true, claimedAt: new Date() },
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
}
