import { callAI, extractJSON } from './aiProvider';
import { logger } from '../../config/logger';
import { getAffiliateUrl } from '../affiliates/affiliate.service';

interface EnergyScanInput {
  userId: string;
  currentSupplier?: string;
  currentTariff?: string;
  annualUsageKwh?: number;
  postcode: string;
}

export interface EnergyScanResult {
  currentAnnualCost: number | null;
  bestDeal: { supplier: string; annualCost: number; tariffName: string } | null;
  potentialSaving: number | null;
  affiliateUrl: string | null;
  affiliateProvider: string;
  warmHomeDiscount: boolean;
  warmHomeDiscountVal: number | null;
  recommendation: string;
  deals: Array<{ supplier: string; annualCost: number; tariffName: string; saving: number }>;
}

const ENERGY_SYSTEM_PROMPT = `You are a UK energy market expert with up-to-date knowledge of all energy tariffs, suppliers, and the Ofgem price cap.

Current Ofgem price cap (Q1 2026):
- Electricity: 24.5p/kWh, standing charge: 60.97p/day
- Gas: 6.04p/kWh, standing charge: 29.82p/day
- Typical household annual bill: £1,849/year

Top competitive deals currently available (early 2026):
- Octopus Energy Intelligent: ~£1,520/year, smart meter required
- Outfox Energy: ~£1,530/year fixed 12 months
- EDF Energy: ~£1,549/year fixed
- E.ON Next: ~£1,580/year
- British Gas: ~£1,650/year
- Ovo Energy: ~£1,610/year

Warm Home Discount: £150 one-off, available if on qualifying benefits (UC, Pension Credit, ESA)

Given the user's situation, calculate their likely current annual cost and the best available deal. Respond ONLY in JSON:
{
  "currentAnnualCost": 1849,
  "bestDeal": {
    "supplier": "Octopus Energy",
    "annualCost": 1520,
    "tariffName": "Intelligent Octopus"
  },
  "potentialSaving": 329,
  "warmHomeDiscount": false,
  "warmHomeDiscountVal": null,
  "recommendation": "Plain English 2-3 sentence recommendation",
  "deals": [
    { "supplier": "Octopus Energy", "annualCost": 1520, "tariffName": "Intelligent Octopus", "saving": 329 },
    { "supplier": "Outfox Energy", "annualCost": 1530, "tariffName": "Fixed 12M", "saving": 319 },
    { "supplier": "EDF Energy", "annualCost": 1549, "tariffName": "EDF Fixed", "saving": 300 }
  ],
  "affiliateProvider": "energy_shop"
}`;

export async function runEnergyScan(input: EnergyScanInput): Promise<EnergyScanResult> {
  logger.info(`Running energy scan for user ${input.userId}, postcode ${input.postcode}`);

  const userContext = [
    input.currentSupplier && `Current supplier: ${input.currentSupplier}`,
    input.currentTariff && `Current tariff: ${input.currentTariff}`,
    input.annualUsageKwh && `Annual usage: ${input.annualUsageKwh} kWh`,
    `Postcode area: ${input.postcode.substring(0, 4)}`,
  ].filter(Boolean).join('\n');

  const result = await callAI({
    systemPrompt: ENERGY_SYSTEM_PROMPT,
    cacheSystem: true,
    userMessage: `Find the best energy deals for this household:\n${userContext || 'Average UK household, no specific details provided'}`,
    maxTokens: 2048,
  });

  const parsed = extractJSON<any>(result.text);
  logger.info(`Energy scan complete [${result.provider}]`);

  const affiliateUrl = await getAffiliateUrl(
    parsed.affiliateProvider || 'energy_shop',
    input.userId
  );

  return {
    currentAnnualCost: parsed.currentAnnualCost ?? null,
    bestDeal: parsed.bestDeal ?? null,
    potentialSaving: parsed.potentialSaving ?? null,
    affiliateUrl,
    affiliateProvider: parsed.affiliateProvider ?? 'energy_shop',
    warmHomeDiscount: parsed.warmHomeDiscount ?? false,
    warmHomeDiscountVal: parsed.warmHomeDiscountVal ?? null,
    recommendation: parsed.recommendation ?? '',
    deals: parsed.deals ?? [],
  };
}
