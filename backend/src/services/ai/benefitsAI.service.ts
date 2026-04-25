import { callAI, extractJSON } from './aiProvider';
import { logger } from '../../config/logger';

export interface BenefitResult {
  name: string;
  description: string;
  annualValue: number;
  probability: 'HIGH' | 'MEDIUM' | 'LOW';
  claimUrl: string;
  claimSteps: string[];
  category: string;
}

export interface BenefitsCheckResult {
  benefits: BenefitResult[];
  alreadyClaiming: string[];
  totalValue: number;
  summary: string;
  confidence: number;
}

const SYSTEM_PROMPT = `You are an expert UK welfare benefits adviser with deep knowledge of all UK government benefits, social tariffs, and financial support schemes as of 2025.

You help people identify ALL benefits and support they are entitled to but may not be claiming. You are thorough, accurate, and cite the current 2025/26 rates.

Key benefits to check:
- Universal Credit (£300–£1,800+/month depending on circumstances)
- Personal Independence Payment / PIP (£28.70–£184.30/week)
- Carer's Allowance (£81.90/week)
- Pension Credit (average £3,900/year unclaimed)
- Housing Benefit / Local Housing Allowance
- Council Tax Reduction / Support (up to 100%)
- Child Benefit (£25.60/week first child, £16.95 subsequent)
- Child Tax Credit
- Working Tax Credit
- Warm Home Discount (£150 one-off)
- Winter Fuel Payment (£200–£300)
- Free School Meals
- Healthy Start vouchers (pregnant/young children)
- Employment and Support Allowance (ESA)
- Jobseeker's Allowance (JSA)
- Attendance Allowance (for over-65s)
- Broadband social tariffs (save £144–£250/year)
- Water social tariffs (save £100–£300/year)
- Free NHS prescriptions, dental, eye tests
- Help to Save account (50% bonus up to £1,200)
- Budgeting Advance / Budgeting Loan
- Discretionary Housing Payment
- Local welfare assistance / hardship funds

IMPORTANT: Only suggest benefits with HIGH or MEDIUM probability based on the user's actual situation. Never invent benefits. Always give realistic annual values using current 2025/26 rates.

Respond ONLY with a valid JSON object in this exact schema:
{
  "benefits": [
    {
      "name": "Benefit name",
      "description": "Plain English explanation of what this is and why they qualify",
      "annualValue": 1200,
      "probability": "HIGH",
      "claimUrl": "https://www.gov.uk/...",
      "claimSteps": ["Step 1", "Step 2", "Step 3"],
      "category": "income_support | disability | housing | childcare | energy | health"
    }
  ],
  "alreadyClaiming": ["Universal Credit", "Child Benefit"],
  "totalValue": 4500,
  "summary": "2-3 sentence plain English summary of findings",
  "confidence": 0.85
}`;

export async function runBenefitsCheck(
  userId: string,
  profile: Record<string, any>
): Promise<BenefitsCheckResult> {
  logger.info(`Running benefits check for user ${userId}`);

  const userContext = buildUserContext(profile);

  try {
    const result = await callAI({
      systemPrompt: SYSTEM_PROMPT,
      cacheSystem: true,
      userMessage: `Please check what UK benefits and financial support this person may be entitled to:

${userContext}

Analyse carefully and list every benefit they might qualify for but aren't already claiming. Be specific about annual values using current 2025/26 rates.`,
      maxTokens: 4096,
    });

    const parsed = extractJSON<BenefitsCheckResult>(result.text);
    logger.info(`Benefits check complete [${result.provider}]: found ${parsed.benefits.length} benefits, £${parsed.totalValue} total`);
    return parsed;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown AI error';
    logger.warn(`AI benefits check failed, using rules fallback: ${message}`);

    const fallback = runRulesBasedBenefitsCheck(profile);
    logger.info(`Benefits check complete [fallback]: found ${fallback.benefits.length} benefits, £${fallback.totalValue} total`);
    return fallback;
  }
}

function buildUserContext(profile: Record<string, any>): string {
  const lines: string[] = [];

  if (profile.hasChildren) lines.push(`- Has ${profile.childrenCount || 1} dependent child(ren)`);
  if (profile.hasDisabledMember) lines.push('- Has a disabled household member');
  if (profile.hasCarerInHousehold) lines.push('- Has an unpaid carer in the household');
  if (profile.isPensioner) lines.push('- Is a pensioner / over state pension age');
  if (profile.isEmployed) lines.push('- Currently employed');
  if (profile.isUnemployed) lines.push('- Currently unemployed / seeking work');
  if (profile.isSelfEmployed) lines.push('- Self-employed');
  if (profile.annualIncome) lines.push(`- Annual household income: £${profile.annualIncome}`);
  if (profile.claimsUniversalCredit) lines.push('- Currently claims Universal Credit');
  if (profile.claimsPensionCredit) lines.push('- Currently claims Pension Credit');
  if (profile.claimsESA) lines.push('- Currently claims ESA');
  if (profile.claimsJSA) lines.push('- Currently claims JSA');
  if (profile.claimsPIP) lines.push('- Currently claims PIP');
  if (profile.claimsCarersAllowance) lines.push("- Currently claims Carer's Allowance");
  if (profile.claimsHousingBenefit) lines.push('- Currently claims Housing Benefit');
  if (profile.claimsChildBenefit) lines.push('- Currently claims Child Benefit');
  if (profile.claimsCouncilTaxReduction) lines.push('- Currently claims Council Tax Reduction');
  if (profile.homeOwner) lines.push('- Homeowner');
  if (profile.privateTenant) lines.push('- Private tenant (renting)');
  if (profile.socialHousingTenant) lines.push('- Social housing tenant');
  if (profile.onPrepayMeter) lines.push('- On a prepayment energy meter');
  if (profile.currentEnergySupplier) lines.push(`- Energy supplier: ${profile.currentEnergySupplier}`);
  if (profile.postcode) lines.push(`- Postcode area: ${profile.postcode.substring(0, 4)}`);

  return lines.join('\n') || 'No specific profile data provided — please give general guidance.';
}

function runRulesBasedBenefitsCheck(profile: Record<string, any>): BenefitsCheckResult {
  const benefits: BenefitResult[] = [];
  const alreadyClaiming: string[] = [];
  const income = Number(profile.annualIncome || 0);
  const childrenCount = Number(profile.childrenCount || 0);
  const hasLowIncome = income > 0 && income <= 30000;
  const hasVeryLowIncome = income > 0 && income <= 20000;

  const addIfMissing = (current: unknown, benefit: BenefitResult, claimedName?: string) => {
    if (current) {
      if (claimedName) alreadyClaiming.push(claimedName);
      return;
    }
    benefits.push(benefit);
  };

  addIfMissing(profile.claimsUniversalCredit, {
    name: 'Universal Credit',
    description: 'You may qualify for Universal Credit if your household income is modest, you are out of work, or your work income is low.',
    annualValue: profile.hasChildren ? 7200 : 4800,
    probability: hasVeryLowIncome || profile.isUnemployed ? 'HIGH' : 'MEDIUM',
    claimUrl: 'https://www.gov.uk/universal-credit',
    claimSteps: [
      'Check eligibility on GOV.UK using your household details',
      'Start an online Universal Credit claim',
      'Prepare income, rent, savings, and childcare information',
    ],
    category: 'income_support',
  }, 'Universal Credit');

  addIfMissing(profile.claimsChildBenefit, {
    name: 'Child Benefit',
    description: 'If you have dependent children, you may be entitled to Child Benefit even if other benefits are not in payment.',
    annualValue: childrenCount > 1 ? 1331.2 + (childrenCount - 1) * 881.4 : 1331.2,
    probability: profile.hasChildren ? 'HIGH' : 'MEDIUM',
    claimUrl: 'https://www.gov.uk/child-benefit',
    claimSteps: [
      'Check whether you already have an open Child Benefit claim',
      'Apply online or by post through HMRC',
      'Provide child details and your National Insurance number',
    ],
    category: 'childcare',
  }, 'Child Benefit');

  addIfMissing(profile.claimsPensionCredit, {
    name: 'Pension Credit',
    description: 'Pension Credit can top up income in retirement and can unlock other support such as council tax help and warm home discounts.',
    annualValue: 3900,
    probability: profile.isPensioner && hasLowIncome ? 'HIGH' : 'MEDIUM',
    claimUrl: 'https://www.gov.uk/pension-credit',
    claimSteps: [
      'Gather pension, savings, and housing cost details',
      'Check eligibility on GOV.UK or by phone',
      'Submit a Pension Credit claim',
    ],
    category: 'income_support',
  }, 'Pension Credit');

  addIfMissing(profile.claimsPIP, {
    name: 'Personal Independence Payment (PIP)',
    description: 'If you or someone in your household has a long-term condition or disability, PIP may help with daily living or mobility costs.',
    annualValue: 3800,
    probability: profile.hasDisabledMember ? 'HIGH' : 'MEDIUM',
    claimUrl: 'https://www.gov.uk/pip',
    claimSteps: [
      'Review the daily living and mobility criteria',
      'Start a new claim with the DWP',
      'Complete the assessment form with examples of day-to-day impact',
    ],
    category: 'disability',
  }, 'PIP');

  addIfMissing(profile.claimsCarersAllowance, {
    name: "Carer's Allowance",
    description: 'If you provide regular unpaid care for someone with a disability benefit, Carer’s Allowance may be available.',
    annualValue: 4258.8,
    probability: profile.hasCarerInHousehold ? 'HIGH' : 'MEDIUM',
    claimUrl: 'https://www.gov.uk/carers-allowance',
    claimSteps: [
      'Confirm the cared-for person receives a qualifying disability benefit',
      'Check weekly caring hours and earnings rules',
      'Complete the Carer’s Allowance claim online',
    ],
    category: 'income_support',
  }, "Carer's Allowance");

  addIfMissing(profile.claimsHousingBenefit, {
    name: 'Housing Benefit or Local Housing Support',
    description: 'Renters on a lower income may qualify for housing support through Housing Benefit or the housing element of Universal Credit.',
    annualValue: 1800,
    probability: (profile.privateTenant || profile.socialHousingTenant) && hasLowIncome ? 'HIGH' : 'MEDIUM',
    claimUrl: 'https://www.gov.uk/housing-benefit',
    claimSteps: [
      'Check whether your council still accepts Housing Benefit claims',
      'Review whether Universal Credit housing support is the right route',
      'Prepare tenancy and rent evidence before applying',
    ],
    category: 'housing',
  }, 'Housing Benefit');

  addIfMissing(profile.claimsCouncilTaxReduction, {
    name: 'Council Tax Reduction',
    description: 'Many local councils offer council tax support for households on lower incomes, including pensioners and families.',
    annualValue: 1200,
    probability: hasLowIncome || profile.isPensioner ? 'HIGH' : 'MEDIUM',
    claimUrl: 'https://www.gov.uk/apply-council-tax-reduction',
    claimSteps: [
      'Find your local council’s council tax support page',
      'Check your income, household, and savings against local rules',
      'Submit your claim with proof of address and income',
    ],
    category: 'housing',
  }, 'Council Tax Reduction');

  if (profile.onPrepayMeter || hasLowIncome || profile.claimsUniversalCredit || profile.claimsPensionCredit) {
    benefits.push({
      name: 'Warm Home Discount',
      description: 'Households on lower incomes or certain benefits may qualify for a one-off energy bill discount, especially if using a prepayment meter.',
      annualValue: 150,
      probability: hasLowIncome || profile.onPrepayMeter ? 'HIGH' : 'MEDIUM',
      claimUrl: 'https://www.gov.uk/the-warm-home-discount-scheme',
      claimSteps: [
        'Check whether your supplier participates in the scheme',
        'Confirm whether you qualify automatically or need to apply',
        'Apply or wait for the discount to be credited to your bill',
      ],
      category: 'energy',
    });
  }

  if (hasLowIncome || profile.claimsUniversalCredit || profile.claimsPensionCredit) {
    benefits.push({
      name: 'Broadband Social Tariff',
      description: 'If your household is on a low income or certain benefits, a cheaper broadband tariff may be available from your provider.',
      annualValue: 180,
      probability: 'HIGH',
      claimUrl: 'https://www.ofcom.org.uk/phones-and-broadband/saving-money/social-tariffs',
      claimSteps: [
        'Check whether your current broadband provider offers a social tariff',
        'Compare social tariff prices and speeds',
        'Contact the provider to switch without leaving your contract if eligible',
      ],
      category: 'energy',
    });
  }

  const dedupedBenefits = dedupeBenefits(benefits).filter((benefit) => benefit.probability !== 'LOW');
  const totalValue = dedupedBenefits.reduce((sum, benefit) => sum + benefit.annualValue, 0);
  const summary = dedupedBenefits.length > 0
    ? `We found ${dedupedBenefits.length} support option${dedupedBenefits.length === 1 ? '' : 's'} using ClaimWise UK's built-in eligibility rules. These results are conservative and based on the details you entered.`
    : 'No clear unclaimed benefits were identified from the answers provided, but a fuller check may still find local or situation-specific support.';

  return {
    benefits: dedupedBenefits,
    alreadyClaiming: Array.from(new Set(alreadyClaiming)),
    totalValue,
    summary,
    confidence: dedupedBenefits.length > 0 ? 0.68 : 0.55,
  };
}

function dedupeBenefits(benefits: BenefitResult[]): BenefitResult[] {
  const seen = new Set<string>();
  const deduped: BenefitResult[] = [];

  for (const benefit of benefits) {
    const key = benefit.name.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(benefit);
  }

  return deduped;
}
