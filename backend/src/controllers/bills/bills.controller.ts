import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../config/database';
import { AppError } from '../../utils/AppError';
import { analyzeBillWithAI } from '../../services/ai/billsAI.service';
import { extractTextFromPDF } from '../../services/pdf/pdfParser.service';
import { cacheDel, CacheKeys } from '../../config/redis';
import { AuthRequest } from '../../middleware/authenticate';
import { AlertType, BillType } from '@prisma/client';
import { logger } from '../../config/logger';

function getAlertTypeForBill(type: BillType): AlertType | null {
  if (type === 'ENERGY') return 'ENERGY_SAVING';
  if (type === 'BROADBAND') return 'BROADBAND_SAVING';
  return null;
}

// POST /api/v1/bills/upload
export async function uploadBill(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.userId!;
    const { type } = req.body;
    const file = req.file;

    if (!file) throw new AppError('No file uploaded', 400);
    if (!Object.values(BillType).includes(type)) {
      throw new AppError(`Invalid bill type. Must be one of: ${Object.values(BillType).join(', ')}`, 400);
    }

    // Extract text from PDF
    const rawText = await extractTextFromPDF(file.buffer);

    // Run AI analysis
    const analysis = await analyzeBillWithAI(rawText, type, userId);

    // Save to DB
    const bill = await prisma.bill.create({
      data: {
        userId,
        type: type as BillType,
        supplier: analysis.supplier,
        annualCost: analysis.annualCost,
        monthlyAmount: analysis.monthlyAmount,
        extractedData: analysis.extractedData,
        aiAnalysis: analysis.narrative,
        potentialSaving: analysis.potentialSaving,
        fileName: file.originalname,
      },
    });

    // Create alert if saving found
    if (analysis.potentialSaving && analysis.potentialSaving > 0) {
      const alertType = getAlertTypeForBill(type as BillType);

      if (alertType) {
        await prisma.alert.create({
          data: {
            userId,
            type: alertType,
            title: `Save £${Math.round(analysis.potentialSaving)}/year on your ${type.toLowerCase()} bill`,
            message: analysis.narrative,
            valueAmount: analysis.potentialSaving,
            actionUrl: analysis.affiliateUrl,
            actionLabel: 'See best deals',
          },
        });
      }

      await prisma.savingsRecord.create({
        data: {
          userId,
          category: type.toLowerCase(),
          description: `${type} bill saving via ${analysis.supplier ?? 'current supplier'}`,
          annualSaving: analysis.potentialSaving,
        },
      });
    }

    await cacheDel(CacheKeys.userDashboard(userId));

    res.status(201).json({ success: true, data: bill });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Bill upload failed';

    logger.error('Bill upload failed', {
      userId: req.userId,
      message,
    });

    if (message.toLowerCase().includes('pdf') || message.toLowerCase().includes('extract')) {
      return next(new AppError(message, 400));
    }

    next(error);
  }
}

// GET /api/v1/bills
export async function getBills(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.userId!;
    const { type } = req.query;

    const bills = await prisma.bill.findMany({
      where: {
        userId,
        ...(type ? { type: type as BillType } : {}),
      },
      orderBy: { uploadedAt: 'desc' },
    });

    res.json({ success: true, data: bills });
  } catch (error) {
    next(error);
  }
}

// GET /api/v1/bills/:id
export async function getBill(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.userId!;
    const { id } = req.params;

    const bill = await prisma.bill.findFirst({ where: { id, userId } });
    if (!bill) throw new AppError('Bill not found', 404);

    res.json({ success: true, data: bill });
  } catch (error) {
    next(error);
  }
}

// DELETE /api/v1/bills/:id
export async function deleteBill(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.userId!;
    const { id } = req.params;

    const bill = await prisma.bill.findFirst({ where: { id, userId } });
    if (!bill) throw new AppError('Bill not found', 404);

    await prisma.bill.delete({ where: { id } });
    await cacheDel(CacheKeys.userDashboard(userId));

    res.json({ success: true, message: 'Bill deleted' });
  } catch (error) {
    next(error);
  }
}
