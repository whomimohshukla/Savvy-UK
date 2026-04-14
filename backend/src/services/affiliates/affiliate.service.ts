import { prisma } from '../../config/database';
import { env } from '../../config/env';
import { logger } from '../../config/logger';

// Affiliate partner configurations
// These are the companies that pay us commission when users switch
const AFFILIATE_PARTNERS: Record<string, {
  name: string;
  baseUrl: string;
  affiliateParam: string;
  affiliateId: string | undefined;
  commissionGbp: number; // what they pay us per conversion
  type: 'ENERGY_SWITCH' | 'BROADBAND_SWITCH' | 'INSURANCE_REFERRAL' | 'MORTGAGE_REFERRAL';
}> = {
  energy_shop: {
    name: 'The Energy Shop',
    baseUrl: 'https://www.theenergyshop.com/compare',
    affiliateParam: 'aff_id',
    affiliateId: env.ENERGY_SHOP_AFFILIATE_ID,
    commissionGbp: 35, // £30-40 per dual fuel switch
    type: 'ENERGY_SWITCH',
  },
  ukpower: {
    name: 'UKPower',
    baseUrl: 'https://www.ukpower.co.uk/home_energy/compare',
    affiliateParam: 'ref',
    affiliateId: env.UKPOWER_AFFILIATE_ID,
    commissionGbp: 30,
    type: 'ENERGY_SWITCH',
  },
  uswitch: {
    name: 'Uswitch',
    baseUrl: 'https://www.uswitch.com/broadband/',
    affiliateParam: 'affid',
    affiliateId: env.USWITCH_AFFILIATE_ID,
    commissionGbp: 20, // ~£15-25 per broadband switch
    type: 'BROADBAND_SWITCH',
  },
  switchity: {
    name: 'Switchity',
    baseUrl: 'https://switchity.co.uk/broadband',
    affiliateParam: 'ref',
    affiliateId: env.SWITCHITY_AFFILIATE_ID,
    commissionGbp: 18,
    type: 'BROADBAND_SWITCH',
  },
  gocompare_insurance: {
    name: 'GoCompare Insurance',
    baseUrl: 'https://www.gocompare.com/home-insurance/',
    affiliateParam: 'aff',
    affiliateId: env.GOCOMPARE_AFFILIATE_ID,
    commissionGbp: 60, // £50-80 per insurance purchase
    type: 'INSURANCE_REFERRAL',
  },
};

export async function getAffiliateUrl(
  partner: string,
  userId: string | undefined
): Promise<string> {
  const config = AFFILIATE_PARTNERS[partner];
  if (!config || !config.affiliateId) {
    // Fallback to non-affiliate URL if not configured
    return config?.baseUrl ?? 'https://www.uswitch.com';
  }

  const url = new URL(config.baseUrl);
  url.searchParams.set(config.affiliateParam, config.affiliateId);
  if (userId) url.searchParams.set('uid', userId.slice(0, 8)); // partial for privacy

  return url.toString();
}

export async function trackAffiliateClick(params: {
  userId?: string;
  partner: string;
  type: string;
  sessionId?: string;
}): Promise<string> {
  const config = AFFILIATE_PARTNERS[params.partner];
  if (!config) throw new Error(`Unknown affiliate partner: ${params.partner}`);

  try {
    await prisma.affiliateClick.create({
      data: {
        userId: params.userId ?? null,
        type: config.type,
        partner: params.partner,
        sessionId: params.sessionId,
      },
    });
  } catch (err) {
    logger.error('Failed to track affiliate click:', err);
    // Don't throw — we still want to redirect user
  }

  return getAffiliateUrl(params.partner, params.userId);
}

// Called by webhook when conversion confirmed by affiliate network
export async function recordConversion(params: {
  partner: string;
  sessionId?: string;
  commissionGbp?: number;
}): Promise<void> {
  const config = AFFILIATE_PARTNERS[params.partner];

  await prisma.affiliateClick.updateMany({
    where: {
      partner: params.partner,
      sessionId: params.sessionId,
      converted: false,
    },
    data: {
      converted: true,
      convertedAt: new Date(),
      commissionGbp: params.commissionGbp ?? config?.commissionGbp,
    },
  });

  logger.info(`Affiliate conversion recorded: ${params.partner}, £${params.commissionGbp ?? config?.commissionGbp}`);
}

// Revenue analytics — total affiliate earnings
export async function getAffiliateRevenue(period: 'week' | 'month' | 'year' = 'month') {
  const since = new Date();
  if (period === 'week') since.setDate(since.getDate() - 7);
  else if (period === 'month') since.setMonth(since.getMonth() - 1);
  else since.setFullYear(since.getFullYear() - 1);

  const result = await prisma.affiliateClick.aggregate({
    where: { converted: true, convertedAt: { gte: since } },
    _sum: { commissionGbp: true },
    _count: true,
  });

  return {
    totalRevenue: result._sum.commissionGbp ?? 0,
    conversions: result._count,
    period,
  };
}
