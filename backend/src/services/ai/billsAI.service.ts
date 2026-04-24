import { callAI, extractJSON } from './aiProvider';
import { logger } from '../../config/logger';
import { getAffiliateUrl } from '../affiliates/affiliate.service';

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
    "standingCharges": {}
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

  try {
    const result = await callAI({
      systemPrompt: BILL_SYSTEM_PROMPT,
      cacheSystem: true,
      userMessage: `Please analyse this ${billType} bill and identify all savings opportunities:\n\n${billText.slice(0, 8000)}`,
      maxTokens: 2048,
    });

    const parsed = extractJSON<any>(result.text);
    logger.info(`Bill analysis complete [${result.provider}]`);

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
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown AI error';
    logger.warn(`AI bill analysis failed, using rules fallback: ${message}`);
    return buildFallbackBillAnalysis(billText, billType);
  }
}

function buildFallbackBillAnalysis(billText: string, billType: string): BillAnalysisResult {
  const supplier = extractSupplier(billText);
  const monthlyAmount = extractMoney(billText, [
    /total (?:amount )?(?:due|to pay)[^\d]{0,10}£?\s*(\d+(?:\.\d{1,2})?)/i,
    /monthly (?:charge|amount|cost)[^\d]{0,10}£?\s*(\d+(?:\.\d{1,2})?)/i,
    /direct debit[^\d]{0,10}£?\s*(\d+(?:\.\d{1,2})?)/i,
  ]);
  const annualCost = monthlyAmount ? Math.round(monthlyAmount * 12 * 100) / 100 : null;
  const potentialSaving = estimatePotentialSaving(billType, annualCost);
  const recommendations = buildRecommendations(billType, potentialSaving);

  return {
    supplier,
    annualCost,
    monthlyAmount,
    extractedData: {
      source: 'rules_fallback',
      textPreview: billText.slice(0, 500),
      recommendations,
    },
    narrative: buildNarrative(billType, supplier, annualCost, potentialSaving),
    potentialSaving,
    affiliateUrl: null,
    recommendations,
  };
}

function extractSupplier(text: string): string | null {
  const knownSuppliers = [
    'British Gas',
    'Octopus Energy',
    'E.ON Next',
    'EDF Energy',
    'Scottish Power',
    'OVO Energy',
    'Shell Energy',
    'Virgin Media',
    'BT',
    'Sky',
    'TalkTalk',
    'Vodafone',
    'Three',
    'EE',
    'O2',
  ];

  const match = knownSuppliers.find((supplier) => text.toLowerCase().includes(supplier.toLowerCase()));
  return match ?? null;
}

function extractMoney(text: string, patterns: RegExp[]): number | null {
  for (const pattern of patterns) {
    const match = text.match(pattern);
    const value = match?.[1] ? Number(match[1]) : NaN;
    if (!Number.isNaN(value) && value > 0) return value;
  }
  return null;
}

function estimatePotentialSaving(billType: string, annualCost: number | null): number | null {
  if (billType === 'ENERGY') {
    if (!annualCost) return 220;
    return Math.max(150, Math.round(annualCost * 0.12));
  }
  if (billType === 'BROADBAND') return annualCost ? Math.max(120, Math.round(annualCost * 0.2)) : 180;
  if (billType === 'MOBILE') return annualCost ? Math.max(90, Math.round(annualCost * 0.25)) : 120;
  if (billType === 'WATER') return 100;
  if (billType === 'COUNCIL_TAX') return annualCost ? Math.max(150, Math.round(annualCost * 0.1)) : 200;
  return null;
}

function buildRecommendations(billType: string, potentialSaving: number | null): string[] {
  if (billType === 'ENERGY') {
    return [
      'Compare your tariff against current fixed and tracker deals',
      'Check Warm Home Discount eligibility',
      potentialSaving ? `A switch may save around GBP ${potentialSaving} per year` : 'Review standing charge and unit rate against current market offers',
    ];
  }
  if (billType === 'BROADBAND') {
    return [
      'Check whether your contract minimum term has ended',
      'Ask your provider for retention pricing',
      'Review social tariffs if your household receives qualifying benefits',
    ];
  }
  if (billType === 'MOBILE') {
    return [
      'Compare your current tariff with SIM-only deals',
      'Check whether you are out of minimum term',
      'Match your data allowance to actual usage',
    ];
  }
  if (billType === 'WATER') {
    return [
      'Check local water social tariffs',
      'Review WaterSure if your household has medical or large-family needs',
    ];
  }
  if (billType === 'COUNCIL_TAX') {
    return [
      'Check single person discount eligibility',
      'Review council tax reduction and disability reduction rules',
    ];
  }
  return ['Review this bill for cheaper market alternatives and hardship support options'];
}

function buildNarrative(billType: string, supplier: string | null, annualCost: number | null, potentialSaving: number | null): string {
  const supplierText = supplier ? ` from ${supplier}` : '';
  const annualText = annualCost ? ` We estimate the annual cost at around GBP ${annualCost}.` : '';
  const savingText = potentialSaving ? ` A review or switch could save roughly GBP ${potentialSaving} per year.` : ' We could not estimate a reliable saving from the uploaded text alone.';
  return `We extracted enough text to review your ${billType.toLowerCase()} bill${supplierText}.${annualText}${savingText}`;
}
