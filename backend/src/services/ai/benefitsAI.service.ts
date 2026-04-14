import Anthropic from '@anthropic-ai/sdk';
import { env } from '../../config/env';
import { logger } from '../../config/logger';

const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });

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

  const message = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: `Please check what UK benefits and financial support this person may be entitled to:

${userContext}

Analyse carefully and list every benefit they might qualify for but aren't already claiming. Be specific about annual values using current 2025/26 rates.`,
      },
    ],
  });

  const content = message.content[0];
  if (content.type !== 'text') {
    throw new Error('Unexpected response type from Claude');
  }

  try {
    const jsonMatch = content.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON found in response');
    const result = JSON.parse(jsonMatch[0]) as BenefitsCheckResult;
    logger.info(`Benefits check complete: found ${result.benefits.length} benefits, £${result.totalValue} total`);
    return result;
  } catch (err) {
    logger.error('Failed to parse benefits AI response:', content.text);
    throw new Error('Failed to parse benefits analysis');
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
