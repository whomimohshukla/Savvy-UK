import cron from 'node-cron';
import { prisma } from '../../config/database';
import { runBenefitsCheck } from '../ai/benefitsAI.service';
import { sendDigestEmail } from '../email/email.service';
import { logger } from '../../config/logger';

export function startCronJobs(): void {
  // Monthly auto-scan — 1st of every month at 8am
  cron.schedule('0 8 1 * *', async () => {
    logger.info('Starting monthly auto-scan for PREMIUM users...');
    await runMonthlyScan();
  });

  // Weekly alerts digest — every Monday 9am
  cron.schedule('0 9 * * 1', async () => {
    logger.info('Sending weekly digest emails...');
    await sendWeeklyDigest();
  });

  // Clean expired refresh tokens — daily 3am
  cron.schedule('0 3 * * *', async () => {
    const deleted = await prisma.refreshToken.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    });
    logger.info(`Cleaned ${deleted.count} expired refresh tokens`);
  });

  logger.info('✅ All cron jobs registered');
}

// ─── Monthly scan — cursor-based batching ────────────────────────────────────

const SCAN_BATCH_SIZE = 50;
const SCAN_DELAY_MS = 1000; // 1 sec between users to avoid AI rate limit

async function runMonthlyScan(): Promise<void> {
  let cursor: string | undefined;
  let processed = 0;
  let failed = 0;

  while (true) {
    const users = await prisma.user.findMany({
      where: { plan: 'PREMIUM' },
      include: { userProfile: true },
      take: SCAN_BATCH_SIZE,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      orderBy: { id: 'asc' },
    });

    if (users.length === 0) break;

    for (const user of users) {
      try {
        if (!user.userProfile) continue;

        const result = await runBenefitsCheck(user.id, user.userProfile);

        await prisma.monthlyScan.create({
          data: {
            userId: user.id,
            benefitsValue: result.totalValue,
            newAlertsCount: result.benefits.length,
          },
        });

        if (result.benefits.length > 0) {
          await prisma.alert.create({
            data: {
              userId: user.id,
              type: 'MONTHLY_SCAN',
              title: `Monthly scan complete — £${Math.round(result.totalValue)} found`,
              message: result.summary,
              valueAmount: result.totalValue,
              actionUrl: '/dashboard/benefits',
              actionLabel: 'View results',
            },
          });
        }

        processed++;
        await new Promise((r) => setTimeout(r, SCAN_DELAY_MS));
      } catch (err) {
        failed++;
        logger.error(`Monthly scan failed for user ${user.id}:`, err);
      }
    }

    cursor = users[users.length - 1].id;
    if (users.length < SCAN_BATCH_SIZE) break;
  }

  logger.info(`Monthly scan complete — processed: ${processed}, failed: ${failed}`);
}

// ─── Weekly digest ────────────────────────────────────────────────────────────

async function sendWeeklyDigest(): Promise<void> {
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  // Find users who have unread alerts from the last 7 days
  const usersWithAlerts = await prisma.alert.groupBy({
    by: ['userId'],
    where: { status: 'UNREAD', createdAt: { gte: weekAgo } },
    _count: { id: true },
    _sum: { valueAmount: true },
  });

  logger.info(`Sending weekly digest to ${usersWithAlerts.length} users`);

  let sent = 0;
  let failed = 0;

  for (const entry of usersWithAlerts) {
    try {
      const [user, topAlerts] = await Promise.all([
        prisma.user.findUnique({
          where: { id: entry.userId },
          select: { email: true, name: true },
        }),
        prisma.alert.findMany({
          where: {
            userId: entry.userId,
            status: 'UNREAD',
            createdAt: { gte: weekAgo },
          },
          select: { title: true, type: true, valueAmount: true },
          orderBy: { valueAmount: 'desc' },
          take: 8,
        }),
      ]);

      if (!user) continue;

      await sendDigestEmail(user.email, user.name ?? '', {
        alertCount: entry._count.id,
        totalValue: entry._sum.valueAmount ?? 0,
        alerts: topAlerts,
      });

      sent++;
      await new Promise((r) => setTimeout(r, 300)); // Respect SMTP rate limits
    } catch (err) {
      failed++;
      logger.error(`Digest email failed for user ${entry.userId}:`, err);
    }
  }

  logger.info(`Weekly digest complete — sent: ${sent}, failed: ${failed}`);
}
