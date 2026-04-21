-- CreateEnum
CREATE TYPE "Plan" AS ENUM ('FREE', 'PRO', 'PREMIUM');

-- CreateEnum
CREATE TYPE "BillType" AS ENUM ('ENERGY', 'BROADBAND', 'MOBILE', 'WATER', 'COUNCIL_TAX', 'TV_LICENCE', 'OTHER');

-- CreateEnum
CREATE TYPE "AlertType" AS ENUM ('BENEFIT_FOUND', 'ENERGY_SAVING', 'BROADBAND_SAVING', 'PRICE_CAP_CHANGE', 'BENEFIT_DEADLINE', 'MONTHLY_SCAN');

-- CreateEnum
CREATE TYPE "AlertStatus" AS ENUM ('UNREAD', 'READ', 'DISMISSED', 'ACTED_ON');

-- CreateEnum
CREATE TYPE "AffiliateType" AS ENUM ('ENERGY_SWITCH', 'BROADBAND_SWITCH', 'INSURANCE_REFERRAL', 'MORTGAGE_REFERRAL');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'CANCELLED', 'PAST_DUE', 'TRIALING');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT,
    "postcode" TEXT,
    "householdSize" INTEGER NOT NULL DEFAULT 1,
    "plan" "Plan" NOT NULL DEFAULT 'FREE',
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "googleId" TEXT,
    "avatarUrl" TEXT,
    "onboardingDone" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "hasChildren" BOOLEAN NOT NULL DEFAULT false,
    "childrenCount" INTEGER NOT NULL DEFAULT 0,
    "hasDisabledMember" BOOLEAN NOT NULL DEFAULT false,
    "hasCarerInHousehold" BOOLEAN NOT NULL DEFAULT false,
    "isPensioner" BOOLEAN NOT NULL DEFAULT false,
    "isEmployed" BOOLEAN NOT NULL DEFAULT false,
    "isUnemployed" BOOLEAN NOT NULL DEFAULT false,
    "isSelfEmployed" BOOLEAN NOT NULL DEFAULT false,
    "annualIncome" DOUBLE PRECISION,
    "claimsUniversalCredit" BOOLEAN NOT NULL DEFAULT false,
    "claimsPensionCredit" BOOLEAN NOT NULL DEFAULT false,
    "claimsESA" BOOLEAN NOT NULL DEFAULT false,
    "claimsJSA" BOOLEAN NOT NULL DEFAULT false,
    "claimsPIP" BOOLEAN NOT NULL DEFAULT false,
    "claimsCarersAllowance" BOOLEAN NOT NULL DEFAULT false,
    "claimsHousingBenefit" BOOLEAN NOT NULL DEFAULT false,
    "claimsChildBenefit" BOOLEAN NOT NULL DEFAULT false,
    "claimsCouncilTaxReduction" BOOLEAN NOT NULL DEFAULT false,
    "homeOwner" BOOLEAN NOT NULL DEFAULT false,
    "privateTenant" BOOLEAN NOT NULL DEFAULT false,
    "socialHousingTenant" BOOLEAN NOT NULL DEFAULT false,
    "currentEnergySupplier" TEXT,
    "onPrepayMeter" BOOLEAN NOT NULL DEFAULT false,
    "hasSmartMeter" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "benefits_checks" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "totalPotentialValue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "benefitsFound" JSONB NOT NULL,
    "benefitsAlreadyClaiming" JSONB NOT NULL DEFAULT '[]',
    "aiSummary" TEXT,
    "confidenceScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "benefits_checks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bills" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "BillType" NOT NULL,
    "supplier" TEXT,
    "annualCost" DOUBLE PRECISION,
    "monthlyAmount" DOUBLE PRECISION,
    "extractedData" JSONB,
    "aiAnalysis" TEXT,
    "potentialSaving" DOUBLE PRECISION,
    "fileUrl" TEXT,
    "fileName" TEXT,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "energy_scans" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "currentSupplier" TEXT,
    "currentTariff" TEXT,
    "annualUsageKwh" DOUBLE PRECISION,
    "currentAnnualCost" DOUBLE PRECISION,
    "bestDealSupplier" TEXT,
    "bestDealAnnualCost" DOUBLE PRECISION,
    "potentialSaving" DOUBLE PRECISION,
    "affiliateUrl" TEXT,
    "affiliateProvider" TEXT,
    "warmHomeDiscount" BOOLEAN NOT NULL DEFAULT false,
    "warmHomeDiscountVal" DOUBLE PRECISION,
    "aiRecommendation" TEXT,
    "scannedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "energy_scans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alerts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "AlertType" NOT NULL,
    "status" "AlertStatus" NOT NULL DEFAULT 'UNREAD',
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "actionUrl" TEXT,
    "actionLabel" TEXT,
    "valueAmount" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "readAt" TIMESTAMP(3),

    CONSTRAINT "alerts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "savings_records" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "annualSaving" DOUBLE PRECISION NOT NULL,
    "claimed" BOOLEAN NOT NULL DEFAULT false,
    "claimedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "savings_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscriptions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "dodoCustomerId" TEXT,
    "dodoSubscriptionId" TEXT,
    "plan" "Plan" NOT NULL,
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'ACTIVE',
    "priceGbp" DOUBLE PRECISION NOT NULL,
    "currentPeriodStart" TIMESTAMP(3),
    "currentPeriodEnd" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "affiliate_clicks" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "type" "AffiliateType" NOT NULL,
    "partner" TEXT NOT NULL,
    "sessionId" TEXT,
    "converted" BOOLEAN NOT NULL DEFAULT false,
    "commissionGbp" DOUBLE PRECISION,
    "clickedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "convertedAt" TIMESTAMP(3),

    CONSTRAINT "affiliate_clicks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "monthly_scans" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "benefitsValue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "energySaving" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "newAlertsCount" INTEGER NOT NULL DEFAULT 0,
    "scannedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "monthly_scans_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_googleId_key" ON "users"("googleId");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_token_key" ON "refresh_tokens"("token");

-- CreateIndex
CREATE INDEX "refresh_tokens_userId_idx" ON "refresh_tokens"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "user_profiles_userId_key" ON "user_profiles"("userId");

-- CreateIndex
CREATE INDEX "benefits_checks_userId_idx" ON "benefits_checks"("userId");

-- CreateIndex
CREATE INDEX "bills_userId_idx" ON "bills"("userId");

-- CreateIndex
CREATE INDEX "bills_type_idx" ON "bills"("type");

-- CreateIndex
CREATE INDEX "energy_scans_userId_idx" ON "energy_scans"("userId");

-- CreateIndex
CREATE INDEX "alerts_userId_status_idx" ON "alerts"("userId", "status");

-- CreateIndex
CREATE INDEX "savings_records_userId_idx" ON "savings_records"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_userId_key" ON "subscriptions"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_dodoSubscriptionId_key" ON "subscriptions"("dodoSubscriptionId");

-- CreateIndex
CREATE INDEX "affiliate_clicks_userId_idx" ON "affiliate_clicks"("userId");

-- CreateIndex
CREATE INDEX "affiliate_clicks_type_converted_idx" ON "affiliate_clicks"("type", "converted");

-- CreateIndex
CREATE INDEX "monthly_scans_userId_idx" ON "monthly_scans"("userId");

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "benefits_checks" ADD CONSTRAINT "benefits_checks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bills" ADD CONSTRAINT "bills_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "energy_scans" ADD CONSTRAINT "energy_scans_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alerts" ADD CONSTRAINT "alerts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "savings_records" ADD CONSTRAINT "savings_records_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "affiliate_clicks" ADD CONSTRAINT "affiliate_clicks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "monthly_scans" ADD CONSTRAINT "monthly_scans_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
