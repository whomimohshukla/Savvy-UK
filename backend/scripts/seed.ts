import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  const hash = await bcrypt.hash('Password123!', 12);

  const user = await prisma.user.upsert({
    where: { email: 'demo@claimwise.co.uk' },
    update: {},
    create: {
      email: 'demo@claimwise.co.uk',
      passwordHash: hash,
      name: 'Demo User',
      postcode: 'SW1A 1AA',
      plan: 'PRO',
      onboardingDone: true,
      userProfile: {
        create: {
          hasChildren: true,
          childrenCount: 2,
          isEmployed: true,
          annualIncome: 28000,
          privateTenant: true,
          claimsChildBenefit: true,
          currentEnergySupplier: 'British Gas',
        },
      },
    },
  });

  await prisma.alert.createMany({
    data: [
      { userId: user.id, type: 'BENEFIT_FOUND', title: "You may be entitled to Child Tax Credit", message: "Based on your income and 2 children, you could claim up to £2,780/year.", valueAmount: 2780, actionUrl: 'https://www.gov.uk/child-tax-credit' },
      { userId: user.id, type: 'ENERGY_SAVING', title: "Switch and save £340 on energy", message: "Your current British Gas tariff is above market rate. Octopus Energy could save you £340/year.", valueAmount: 340, actionUrl: '#', actionLabel: 'See deals' },
      { userId: user.id, type: 'BROADBAND_SAVING', title: "Broadband social tariff available", message: "As a Universal Credit claimant you qualify for BT Home Essentials at £15/month — saving £144/year.", valueAmount: 144 },
    ],
  });

  await prisma.savingsRecord.createMany({
    data: [
      { userId: user.id, category: 'benefits', description: 'Child Tax Credit', annualSaving: 2780 },
      { userId: user.id, category: 'energy', description: 'Energy switch to Octopus', annualSaving: 340 },
      { userId: user.id, category: 'broadband', description: 'BT Home Essentials social tariff', annualSaving: 144, claimed: true, claimedAt: new Date() },
    ],
  });

  console.log('✅ Demo user created: demo@claimwise.co.uk / Password123!');
  console.log('✅ Sample alerts and savings created');
  console.log('🎉 Seed complete!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
