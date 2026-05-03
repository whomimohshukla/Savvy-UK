import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../config/database';
import { AppError } from '../../utils/AppError';
import { runBenefitsCheck } from '../../services/ai/benefitsAI.service';
import { cacheGet, cacheSet, cacheDel, CacheKeys, CACHE_TTL } from '../../config/redis';
import { AuthRequest } from '../../middleware/authenticate';
import { logger } from '../../config/logger';

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
        benefitsFound: result.benefits as unknown as import('@prisma/client').Prisma.InputJsonValue,
        benefitsAlreadyClaiming: (result.alreadyClaiming ?? []) as unknown as import('@prisma/client').Prisma.InputJsonValue,
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
    if (error instanceof AppError) {
      return next(error);
    }

    const message = error instanceof Error ? error.message : 'Benefits check failed';
    const lowered = message.toLowerCase();
    const status = typeof error === 'object' && error !== null && 'status' in error
      ? (error as { status?: number }).status
      : undefined;

    logger.error('Benefits AI check failed', {
      userId: req.userId,
      status,
      message,
    });

    if (status === 401 || status === 403 || lowered.includes('api key') || lowered.includes('permission') || lowered.includes('unauthorized') || lowered.includes('forbidden')) {
      return next(new AppError('Benefits AI is not configured correctly. Check the backend AI API key and provider settings.', 503));
    }

    if (status === 404 || lowered.includes('model') && lowered.includes('not found')) {
      return next(new AppError('Benefits AI model is unavailable. Check GEMINI_MODEL in backend/.env or switch provider.', 503));
    }

    if (status === 429 || lowered.includes('rate limit') || lowered.includes('quota') || lowered.includes('429') || lowered.includes('resource has been exhausted')) {
      return next(new AppError('Benefits AI quota or rate limit was hit. Check your Gemini API usage, then try again.', 503));
    }

    if (lowered.includes('json') || lowered.includes('response')) {
      return next(new AppError('Benefits AI returned an invalid response. Please try again.', 502));
    }

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

// GET /api/v1/benefits/history?page=1&limit=10
export async function getBenefitsHistory(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.userId!;
    const page = Number(req.query.page) || 1;
    const limit = Math.min(Number(req.query.limit) || 10, 50);
    const skip = (page - 1) * limit;

    const [history, total] = await Promise.all([
      prisma.benefitsCheck.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        select: { id: true, totalPotentialValue: true, aiSummary: true, createdAt: true },
      }),
      prisma.benefitsCheck.count({ where: { userId } }),
    ]);

    res.json({
      success: true,
      data: history,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
}
