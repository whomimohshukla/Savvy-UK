import cron from 'node-cron';
import { prisma } from '../../config/database';
import { runBenefitsCheck } from '../ai/benefitsAI.service';
import { logger } from '../../config/logger';

export function startCronJobs(): void {
  // Monthly auto-scan — runs 1st of every month at 8am
  cron.schedule('0 8 1 * *', async () => {
    logger.info('Starting monthly auto-scan for PREMIUM users...');
    await runMonthlyScan();
  });

  // Weekly alerts digest — every Monday 9am
  cron.schedule('0 9 * * 1', async () => {
    logger.info('Sending weekly digest emails...');
    // TODO: send digest emails
  });

  // Clean expired refresh tokens — daily at 3am
  cron.schedule('0 3 * * *', async () => {
    const deleted = await prisma.refreshToken.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    });
    logger.info(`Cleaned ${deleted.count} expired refresh tokens`);
  });

  logger.info('✅ All cron jobs registered');
}

async function runMonthlyScan(): Promise<void> {
  const premiumUsers = await prisma.user.findMany({
    where: { plan: 'PREMIUM' },
    include: { userProfile: true },
    take: 500, // process in batches
  });

  logger.info(`Running monthly scan for ${premiumUsers.length} PREMIUM users`);

  for (const user of premiumUsers) {
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

      // Small delay to avoid hammering Claude API
      await new Promise(r => setTimeout(r, 1000));
    } catch (err) {
      logger.error(`Monthly scan failed for user ${user.id}:`, err);
    }
  }

  logger.info('Monthly scan complete');
}
