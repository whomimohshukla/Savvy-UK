import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../config/database';
import { AppError } from '../../utils/AppError';
import { AuthRequest } from '../../middleware/authenticate';

// PATCH /api/v1/auth/profile
export async function updateProfile(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.userId!;
    const {
      name, postcode, householdSize, onboardingDone,
      isPensioner, hasChildren, childrenCount, hasDisabledMember, hasCarerInHousehold,
      isEmployed, isUnemployed, isSelfEmployed, annualIncome,
      claimsUniversalCredit, claimsPensionCredit, claimsESA, claimsJSA, claimsPIP,
      claimsCarersAllowance, claimsHousingBenefit, claimsChildBenefit, claimsCouncilTaxReduction,
      homeOwner, privateTenant, socialHousingTenant,
      onPrepayMeter, currentEnergySupplier,
    } = req.body;

    const [user] = await Promise.all([
      prisma.user.update({
        where: { id: userId },
        data: {
          ...(name !== undefined && { name }),
          ...(postcode !== undefined && { postcode: postcode?.toUpperCase() }),
          ...(householdSize !== undefined && { householdSize: Number(householdSize) }),
          ...(onboardingDone !== undefined && { onboardingDone }),
        },
        select: { id: true, email: true, name: true, plan: true, postcode: true, onboardingDone: true },
      }),
      prisma.userProfile.upsert({
        where: { userId },
        create: {
          userId,
          isPensioner: isPensioner ?? false,
          hasChildren: hasChildren ?? false,
          childrenCount: childrenCount ?? 0,
          hasDisabledMember: hasDisabledMember ?? false,
          hasCarerInHousehold: hasCarerInHousehold ?? false,
          isEmployed: isEmployed ?? false,
          isUnemployed: isUnemployed ?? false,
          isSelfEmployed: isSelfEmployed ?? false,
          annualIncome: annualIncome ? parseFloat(annualIncome) : undefined,
          claimsUniversalCredit: claimsUniversalCredit ?? false,
          claimsPensionCredit: claimsPensionCredit ?? false,
          claimsESA: claimsESA ?? false,
          claimsJSA: claimsJSA ?? false,
          claimsPIP: claimsPIP ?? false,
          claimsCarersAllowance: claimsCarersAllowance ?? false,
          claimsHousingBenefit: claimsHousingBenefit ?? false,
          claimsChildBenefit: claimsChildBenefit ?? false,
          claimsCouncilTaxReduction: claimsCouncilTaxReduction ?? false,
          homeOwner: homeOwner ?? false,
          privateTenant: privateTenant ?? false,
          socialHousingTenant: socialHousingTenant ?? false,
          onPrepayMeter: onPrepayMeter ?? false,
          currentEnergySupplier: currentEnergySupplier ?? undefined,
        },
        update: {
          ...(isPensioner !== undefined && { isPensioner }),
          ...(hasChildren !== undefined && { hasChildren }),
          ...(childrenCount !== undefined && { childrenCount: Number(childrenCount) }),
          ...(hasDisabledMember !== undefined && { hasDisabledMember }),
          ...(hasCarerInHousehold !== undefined && { hasCarerInHousehold }),
          ...(isEmployed !== undefined && { isEmployed }),
          ...(isUnemployed !== undefined && { isUnemployed }),
          ...(isSelfEmployed !== undefined && { isSelfEmployed }),
          ...(annualIncome !== undefined && { annualIncome: parseFloat(annualIncome) }),
          ...(claimsUniversalCredit !== undefined && { claimsUniversalCredit }),
          ...(claimsPensionCredit !== undefined && { claimsPensionCredit }),
          ...(claimsESA !== undefined && { claimsESA }),
          ...(claimsJSA !== undefined && { claimsJSA }),
          ...(claimsPIP !== undefined && { claimsPIP }),
          ...(claimsCarersAllowance !== undefined && { claimsCarersAllowance }),
          ...(claimsHousingBenefit !== undefined && { claimsHousingBenefit }),
          ...(claimsChildBenefit !== undefined && { claimsChildBenefit }),
          ...(claimsCouncilTaxReduction !== undefined && { claimsCouncilTaxReduction }),
          ...(homeOwner !== undefined && { homeOwner }),
          ...(privateTenant !== undefined && { privateTenant }),
          ...(socialHousingTenant !== undefined && { socialHousingTenant }),
          ...(onPrepayMeter !== undefined && { onPrepayMeter }),
          ...(currentEnergySupplier !== undefined && { currentEnergySupplier }),
        },
      }),
    ]);

    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
}
