import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../config/database';
import { AppError } from '../../utils/AppError';
import { runBenefitsCheck } from '../../services/ai/benefitsAI.service';
import { cacheGet, cacheSet, cacheDel, CacheKeys, CACHE_TTL } from '../../config/redis';
import { AuthRequest } from '../../middleware/authenticate';

// POST /api/v1/benefits/check
export async function checkBenefits(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.userId!;
    const profileData = req.body;

    // Update user profile
    await prisma.userProfile.upsert({
      where: { userId },
      update: profileData,
      create: { userId, ...profileData },
    });

    // Run AI benefits check
    const result = await runBenefitsCheck(userId, profileData);

    // Save result to DB
    const benefitsCheck = await prisma.benefitsCheck.create({
      data: {
        userId,
        totalPotentialValue: result.totalValue,
        benefitsFound: result.benefits,
        benefitsAlreadyClaiming: result.alreadyClaiming,
        aiSummary: result.summary,
        confidenceScore: result.confidence,
      },
    });

    // Create alerts for new benefits found
    if (result.benefits.length > 0) {
      await prisma.alert.createMany({
        data: result.benefits.map((b: any) => ({
          userId,
          type: 'BENEFIT_FOUND',
          title: `You may be entitled to ${b.name}`,
          message: b.description,
          valueAmount: b.annualValue,
          actionUrl: b.claimUrl,
          actionLabel: 'How to claim',
        })),
      });
    }

    // Save savings records
    if (result.benefits.length > 0) {
      await prisma.savingsRecord.createMany({
        data: result.benefits.map((b: any) => ({
          userId,
          category: 'benefits',
          description: b.name,
          annualSaving: b.annualValue,
        })),
      });
    }

    // Bust cache
    await cacheDel(CacheKeys.userDashboard(userId));
    await cacheDel(CacheKeys.userBenefits(userId));

    res.json({ success: true, data: { ...benefitsCheck, result } });
  } catch (error) {
    next(error);
  }
}

// GET /api/v1/benefits/latest
export async function getLatestBenefits(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.userId!;

    const cached = await cacheGet(CacheKeys.userBenefits(userId));
    if (cached) {
      return res.json({ success: true, data: cached, cached: true });
    }

    const latest = await prisma.benefitsCheck.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    await cacheSet(CacheKeys.userBenefits(userId), latest, CACHE_TTL.BENEFITS);
    res.json({ success: true, data: latest });
  } catch (error) {
    next(error);
  }
}

// GET /api/v1/benefits/history
export async function getBenefitsHistory(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.userId!;

    const history = await prisma.benefitsCheck.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true, totalPotentialValue: true, aiSummary: true, createdAt: true,
      },
    });

    res.json({ success: true, data: history });
  } catch (error) {
    next(error);
  }
}
