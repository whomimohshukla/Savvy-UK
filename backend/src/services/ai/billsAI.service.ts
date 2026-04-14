import Anthropic from '@anthropic-ai/sdk';
import { env } from '../../config/env';
import { logger } from '../../config/logger';
import { getAffiliateUrl } from '../affiliates/affiliate.service';

const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });

export interface BillAnalysisResult {
  supplier: string | null;
  annualCost: number | null;
  monthlyAmount: number | null;
  extractedData: Record<string, any>;
  narrative: string;
  potentialSaving: number | null;
  affiliateUrl: string | null;
  recommendations: string[];
}

const BILL_SYSTEM_PROMPT = `You are an expert UK household bill analyser. Extract key data from bills and identify savings opportunities.

For ENERGY bills, check:
- Current tariff type (standard variable vs fixed)
- Unit rates vs current Ofgem price cap (electricity: 24.5p/kWh, gas: 6.04p/kWh as of Q1 2026)
- Potential savings from switching supplier (typically £150-£400/year)
- Warm Home Discount eligibility (£150)
- Smart meter eligibility
- Economy 7 / EV tariff opportunities

For BROADBAND bills, check:
- Current monthly cost vs market rate
- Contract end date
- Speed vs price ratio
- Social tariff eligibility (if on benefits — save £144-£250/year)
- Cheaper alternatives (NOW, Onestream, Vodafone Essentials)

For WATER bills, check:
- Whether WaterSure tariff applies (for medical or large family needs)
- Water social tariff eligibility

For MOBILE bills, check:
- Cost vs SIM-only deals (often save £15-£30/month)
- Data usage vs allowance

For COUNCIL TAX, check:
- Single person discount (25% off)
- Disability reduction
- Council Tax Support scheme eligibility

Respond ONLY with valid JSON:
{
  "supplier": "British Gas",
  "annualCost": 1850,
  "monthlyAmount": 154.17,
  "extractedData": {
    "accountNumber": "...",
    "tariffName": "...",
    "electricityUnitRate": 24.5,
    "gasUnitRate": 6.04,
    "standingCharges": {...}
  },
  "narrative": "Plain English 2-3 sentence analysis",
  "potentialSaving": 280,
  "recommendations": ["Switch to Octopus Intelligent tariff", "Apply for Warm Home Discount"],
  "affiliatePartner": "energy_shop"
}`;

export async function analyzeBillWithAI(
  billText: string,
  billType: string,
  userId: string
): Promise<BillAnalysisResult> {
  logger.info(`Analysing ${billType} bill for user ${userId}`);

  const message = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2048,
    system: BILL_SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: `Please analyse this ${billType} bill and identify all savings opportunities:\n\n${billText.slice(0, 8000)}`,
      },
    ],
  });

  const content = message.content[0];
  if (content.type !== 'text') throw new Error('Unexpected response type');

  try {
    const jsonMatch = content.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON in response');
    const parsed = JSON.parse(jsonMatch[0]);

    const affiliateUrl = parsed.affiliatePartner
      ? await getAffiliateUrl(parsed.affiliatePartner, userId)
      : null;

    return {
      supplier: parsed.supplier ?? null,
      annualCost: parsed.annualCost ?? null,
      monthlyAmount: parsed.monthlyAmount ?? null,
      extractedData: parsed.extractedData ?? {},
      narrative: parsed.narrative ?? '',
      potentialSaving: parsed.potentialSaving ?? null,
      affiliateUrl,
      recommendations: parsed.recommendations ?? [],
    };
  } catch (err) {
    logger.error('Failed to parse bill AI response');
    throw new Error('Failed to analyse bill');
  }
}
