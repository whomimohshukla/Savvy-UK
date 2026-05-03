import { z } from 'zod';

export const benefitsCheckSchema = z
  .object({
    // Household
    hasChildren: z.boolean().optional(),
    childrenCount: z.number().int().min(0).max(20).optional(),
    hasDisabledMember: z.boolean().optional(),
    hasCarerInHousehold: z.boolean().optional(),
    isPensioner: z.boolean().optional(),
    // Employment
    isEmployed: z.boolean().optional(),
    isUnemployed: z.boolean().optional(),
    isSelfEmployed: z.boolean().optional(),
    // Income
    annualIncome: z.number().min(0).max(1_000_000).nullable().optional(),
    // Current benefits
    claimsUniversalCredit: z.boolean().optional(),
    claimsPensionCredit: z.boolean().optional(),
    claimsESA: z.boolean().optional(),
    claimsJSA: z.boolean().optional(),
    claimsPIP: z.boolean().optional(),
    claimsCarersAllowance: z.boolean().optional(),
    claimsHousingBenefit: z.boolean().optional(),
    claimsChildBenefit: z.boolean().optional(),
    claimsCouncilTaxReduction: z.boolean().optional(),
    // Housing
    homeOwner: z.boolean().optional(),
    privateTenant: z.boolean().optional(),
    socialHousingTenant: z.boolean().optional(),
    // Energy
    currentEnergySupplier: z.string().trim().max(100).optional(),
    onPrepayMeter: z.boolean().optional(),
    hasSmartMeter: z.boolean().optional(),
  })
  .strip();
