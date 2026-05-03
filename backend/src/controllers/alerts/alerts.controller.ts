import { Response, NextFunction } from 'express';
import { prisma } from '../../config/database';
import { AppError } from '../../utils/AppError';
import { cacheDel, CacheKeys } from '../../config/redis';
import { AuthRequest } from '../../middleware/authenticate';

function parseAlertStatus(status: unknown): 'UNREAD' | 'READ' | 'DISMISSED' | undefined {
  if (typeof status !== 'string' || !status.trim()) return undefined;

  const normalized = status.trim().toUpperCase();
  if (normalized === 'UNREAD' || normalized === 'READ' || normalized === 'DISMISSED') {
    return normalized;
  }

  throw new AppError('Invalid alert status filter', 400);
}

// GET /api/v1/alerts
export async function getAlerts(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.userId!;
    const { status, limit = '20', offset = '0' } = req.query;
    const parsedStatus = parseAlertStatus(status);

    const alerts = await prisma.alert.findMany({
      where: {
        userId,
        ...(parsedStatus ? { status: parsedStatus } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit as string),
      skip: parseInt(offset as string),
    });

    const unreadCount = await prisma.alert.count({
      where: { userId, status: 'UNREAD' },
    });

    res.json({ success: true, data: { alerts, unreadCount } });
  } catch (error) {
    next(error);
  }
}

// PATCH /api/v1/alerts/:id/read
export async function markRead(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.userId!;
    const { id } = req.params;

    const alertId = String(id);
    const alert = await prisma.alert.findFirst({ where: { id: alertId, userId } });
    if (!alert) throw new AppError('Alert not found', 404);

    await prisma.alert.update({
      where: { id: alertId },
      data: { status: 'READ', readAt: new Date() },
    });

    await cacheDel(CacheKeys.userDashboard(userId));
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
}

// PATCH /api/v1/alerts/read-all
export async function markAllRead(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.userId!;

    await prisma.alert.updateMany({
      where: { userId, status: 'UNREAD' },
      data: { status: 'READ', readAt: new Date() },
    });

    await cacheDel(CacheKeys.userDashboard(userId));
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
}

// DELETE /api/v1/alerts/:id
export async function dismissAlert(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.userId!;
    const { id } = req.params;

    await prisma.alert.updateMany({
      where: { id: String(id), userId },
      data: { status: 'DISMISSED' },
    });

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
}
