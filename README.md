# 🇬🇧 Savvy UK — AI Bill & Benefits Checker

> **The AI-powered tool that finds every penny of unclaimed UK benefits and bill savings.**
> Built for Indian developers targeting UK customers. No UK company needed. Earns in £GBP.

---

## 📊 The Market Opportunity

| Stat | Value | Source |
|------|-------|--------|
| Benefits unclaimed/year | **£24.1 billion** | Policy in Practice 2025 |
| Households missing out | **7 million+** | Policy in Practice 2025 |
| Average found/household | **£6,000/year** | Policy in Practice 2025 |
| Broadband eligible but not claiming | **97%** | Ofcom 2025 |
| UK adults: cost of living = #1 problem | **88%** | ONS Dec 2025 |

---

## 💰 5 Revenue Streams

### 1. Freemium Subscriptions (Main Revenue)
| Plan | Price | Target |
|------|-------|--------|
| Free | £0/mo | Acquisition |
| **Pro** | **£4.99/mo** | Main revenue |
| Premium | £9.99/mo | Power users |

**1,000 Pro users = £4,990/month = £59,880/year**

### 2. Energy Switching Affiliate
- The Energy Shop: **£30–40** per dual fuel switch
- UKPower: **£30** per switch
- **100 switches/month = £3,500/month**

### 3. Broadband Social Tariff Affiliate
- Uswitch: **£15–25** per switch
- Switchity: **£18** per switch
- **50 switches/month = £1,000/month**

### 4. B2B White-Label
- UK housing associations, councils, charities
- **£500–2,000/month per organisation**
- 10 clients = **£5,000–20,000/month**

### 5. Insurance Referrals (Phase 2)
- GoCompare: **£50–80** per insurance purchase
- Mortgage referrals: **£100–200** per lead

---

## 🏗️ Tech Stack

### Backend (Express + Node.js)
| Tech | Purpose |
|------|---------|
| **Express + TypeScript** | REST API |
| **PostgreSQL — Neon** | Primary database (free tier) |
| **Redis — Upstash** | Caching + rate limiting (free tier) |
| **Prisma ORM** | Type-safe DB queries + migrations |
| **Claude AI** | Benefits analysis, bill parsing, energy comparison |
| **Dodo Payments** | Merchant of Record — India→UK payments |
| **JWT + Refresh Tokens** | Secure auth with rotation |
| **Google Auth Library** | Google OAuth ID token verification |
| **node-cron** | Monthly auto-scans for Premium users |
| **pdf-parse + Multer** | PDF upload and text extraction |
| **Winston** | Structured logging |
| **Zod** | Runtime env + input validation |

### Frontend (Next.js 15)
| Tech | Purpose |
|------|---------|
| **Next.js 15 + TypeScript** | React framework, App Router |
| **Tailwind CSS** | Utility-first styling |
| **Google Identity Services** | One-tap Google Sign-In |
| **Zustand** | Global auth state (persisted) |
| **React Hook Form** | Form state + validation |
| **Recharts** | Savings charts |
| **Lucide React** | Icons |

---

## 📁 Project Structure

```
savvy-uk/
├── package.json                    # Root workspace
├── README.md
├── docs/
│   └── GOOGLE_OAUTH.md             # Google login setup guide
│
├── backend/
│   ├── .env.example                # Copy to .env
│   ├── prisma/schema.prisma        # Full DB schema (14 models)
│   ├── scripts/seed.ts             # Demo data seeder
│   └── src/
│       ├── index.ts                # Express server entry
│       ├── config/
│       │   ├── env.ts              # Zod-validated env
│       │   ├── database.ts         # Prisma singleton
│       │   ├── redis.ts            # Redis client + cache helpers
│       │   └── logger.ts           # Winston logger
│       ├── controllers/
│       │   ├── auth/
│       │   │   ├── auth.controller.ts      # Register, login, refresh, logout, me
│       │   │   ├── google.controller.ts    # Google OAuth verification
│       │   │   └── profile.controller.ts   # Profile + onboarding update
│       │   ├── benefits/           # AI benefits check + history
│       │   ├── bills/              # PDF upload + AI analysis
│       │   ├── energy/             # AI energy comparison + affiliate click
│       │   ├── dashboard/          # Aggregated dashboard data (cached)
│       │   ├── alerts/             # CRUD alerts
│       │   └── subscription/       # Dodo Payments checkout + webhook
│       ├── middleware/
│       │   ├── authenticate.ts     # JWT auth middleware
│       │   └── errorHandler.ts     # Global error handler
│       ├── routes/                 # One router per domain
│       └── services/
│           ├── ai/
│           │   ├── benefitsAI.service.ts   # Claude benefits analysis
│           │   ├── billsAI.service.ts      # Claude bill parsing
│           │   └── energyAI.service.ts     # Claude energy comparison
│           ├── affiliates/
│           │   └── affiliate.service.ts    # Commission tracking + URLs
│           ├── pdf/pdfParser.service.ts    # PDF text extraction
│           └── cron/scheduler.ts           # Monthly scans + cleanup
│
└── frontend/
    ├── .env.example                # Copy to .env.local
    ├── next.config.js
    ├── tailwind.config.js
    └── src/
        ├── app/
        │   ├── layout.tsx                      # Root layout + Inter font
        │   ├── page.tsx                        # Landing page (marketing)
        │   ├── auth/
        │   │   ├── page.tsx                    # Login (email + Google)
        │   │   ├── register/page.tsx           # Register (email + Google)
        │   │   └── forgot-password/page.tsx    # Password reset
        │   ├── onboarding/page.tsx             # Multi-step onboarding wizard
        │   └── dashboard/
        │       ├── layout.tsx                  # Sidebar + topbar layout
        │       ├── page.tsx                    # Dashboard home
        │       ├── benefits/page.tsx           # Full benefits check form + results
        │       ├── bills/page.tsx              # PDF upload + bill list
        │       ├── energy/page.tsx             # Energy comparison + deal cards
        │       ├── savings/page.tsx            # Savings tracker + chart
        │       ├── alerts/page.tsx             # Notifications centre
        │       └── settings/page.tsx           # Account, plan, billing
        ├── components/
        │   ├── ui/
        │   │   ├── Button.tsx                  # All button variants
        │   │   ├── FormFields.tsx              # Input, Select, Checkbox, Textarea
        │   │   ├── toaster.tsx                 # Custom toast UI (top-right, animated progress)
        │   │   └── index.tsx                   # Card, Badge, Spinner, EmptyState
        │   ├── layout/
        │   │   ├── Sidebar.tsx                 # Full sidebar with nav + upgrade banner
        │   │   └── Topbar.tsx                  # Mobile header + alerts bell
        │   ├── dashboard/
        │   │   ├── StatCard.tsx                # Metric cards
        │   │   └── SavingsChart.tsx            # Recharts bar chart
        │   ├── benefits/
        │   │   └── BenefitCard.tsx             # Expandable benefit with claim steps
        │   ├── energy/
        │   │   └── EnergyDealCard.tsx          # Energy deal comparison card
        │   └── shared/
        │       └── GoogleSignInButton.tsx      # Google Identity Services button
        └── lib/
            ├── api/client.ts                   # Typed API client + auto token refresh
            ├── hooks/useApi.ts                 # useFetch + useMutation hooks
            ├── store/
            │   ├── auth.store.ts               # Zustand auth state (persisted)
            │   └── toast.store.ts              # Toast notifications
            └── utils/cn.ts                     # Tailwind merge + formatters
```

---

## 🚀 Quick Start (15 minutes)

### Prerequisites
- Node.js 20+
- [Neon](https://neon.tech) account (free PostgreSQL)
- [Upstash](https://upstash.com) account (free Redis)
- [Anthropic](https://console.anthropic.com) API key
- [Google Cloud](https://console.cloud.google.com) OAuth credentials

### Step 1 — Install

```bash
git clone <your-repo>
cd savvy-uk
npm install
```

### Step 2 — Backend environment

```bash
cd backend
cp .env.example .env
```

Fill in these required values:
```env
DATABASE_URL="postgresql://..."   # Neon connection string
REDIS_URL="redis://..."           # Upstash connection string
JWT_SECRET="32+ random chars"     # openssl rand -hex 32
JWT_REFRESH_SECRET="32+ chars"    # openssl rand -hex 32
ANTHROPIC_API_KEY="sk-ant-..."
GOOGLE_CLIENT_ID="xxx.apps.googleusercontent.com"
```

### Step 3 — Frontend environment

```bash
cd ../frontend
cp .env.example .env.local
```

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
```

### Step 4 — Database setup

```bash
cd ../backend
npm run db:push    # Push schema to Neon
npm run db:seed    # Create demo user + sample data
```

### Step 5 — Run both apps

```bash
cd ..             # root
npm run dev       # starts both on :3000 and :5000
```

### Demo login
- **Email:** `demo@savvy-uk.com`
- **Password:** `Password123!`

---

## 🔑 All API Endpoints

### Auth
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/v1/auth/register` | ❌ | Email registration |
| POST | `/api/v1/auth/login` | ❌ | Email login |
| POST | `/api/v1/auth/google` | ❌ | **Google OAuth** — verify ID token |
| POST | `/api/v1/auth/refresh` | ❌ | Rotate access token |
| POST | `/api/v1/auth/logout` | ✅ | Revoke refresh token |
| GET  | `/api/v1/auth/me` | ✅ | Current user |
| PATCH | `/api/v1/auth/profile` | ✅ | Update profile + onboarding |
| PATCH | `/api/v1/auth/change-password` | ✅ | Change password (email users) |
| POST | `/api/v1/auth/forgot-password` | ❌ | Send password reset email |
| POST | `/api/v1/auth/reset-password` | ❌ | Reset with token |
| DELETE | `/api/v1/auth/account` | ✅ | Permanently delete account |

### Benefits
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/v1/benefits/check` | ✅ | Run AI benefits check |
| GET  | `/api/v1/benefits/latest` | ✅ | Latest check result (cached) |
| GET  | `/api/v1/benefits/history` | ✅ | Past check results |

### Bills
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST   | `/api/v1/bills/upload` | ✅ | Upload PDF bill (multipart) |
| GET    | `/api/v1/bills` | ✅ | List all bills |
| GET    | `/api/v1/bills/:id` | ✅ | Get single bill |
| DELETE | `/api/v1/bills/:id` | ✅ | Delete bill |

### Energy
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/v1/energy/scan` | ✅ | Run AI energy comparison |
| GET  | `/api/v1/energy/history` | ✅ | Past scans |
| POST | `/api/v1/energy/click-affiliate` | ✅ | Track affiliate click |

### Dashboard
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET   | `/api/v1/dashboard` | ✅ | Full dashboard (cached 10min) |
| GET   | `/api/v1/dashboard/savings` | ✅ | All savings records |
| PATCH | `/api/v1/dashboard/savings/:id/claimed` | ✅ | Mark as claimed |

### Alerts
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET    | `/api/v1/alerts` | ✅ | List alerts (filterable) |
| PATCH  | `/api/v1/alerts/:id/read` | ✅ | Mark read |
| PATCH  | `/api/v1/alerts/read-all` | ✅ | Mark all read |
| DELETE | `/api/v1/alerts/:id` | ✅ | Dismiss |

### Subscription
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET  | `/api/v1/subscription/plans` | ✅ | Plan options |
| GET  | `/api/v1/subscription/current` | ✅ | Current subscription |
| POST | `/api/v1/subscription/create-checkout` | ✅ | Dodo checkout URL |
| POST | `/api/v1/subscription/webhook` | ❌ | Dodo webhook |

---

## 🔐 Google OAuth Flow

1. User clicks **Continue with Google** on auth page
2. Google Identity Services shows account picker popup
3. User selects their Google account
4. Google returns an **ID token** to frontend
5. Frontend sends token to `POST /api/v1/auth/google`
6. Backend verifies with `google-auth-library` (no redirect needed)
7. User is upserted in DB (create if new, update `googleId` if existing)
8. Returns JWT access + refresh tokens — same as email login
9. New users go to `/onboarding`, returning users go to `/dashboard`

See `docs/GOOGLE_OAUTH.md` for full setup guide.

---

## 💳 Dodo Payments Setup

Dodo Payments is a **Merchant of Record** — handles UK VAT, compliance, chargebacks. You receive clean payouts to your Indian bank account. No UK company needed.

1. Sign up at [dodopayments.com](https://dodopayments.com) — approved in ~2 hours
2. Add Indian bank account for payouts
3. Create your subscription products (Pro £4.99, Premium £9.99)
4. Copy API key + webhook secret to `backend/.env`
5. Set webhook URL: `https://yourdomain.com/api/v1/subscription/webhook`

---

## 🔗 Affiliate Setup (Earn £30–40/switch)

### Energy (£30–40 per switch)
- **The Energy Shop** → email `partners@theenergyshop.com`
- **UKPower** → `https://www.ukpower.co.uk/about/affiliates`

### Broadband (£15–25 per switch)
- **Uswitch** → `https://www.uswitch.com/affiliates/`
- **Switchity** → `https://switchity.co.uk`

Add affiliate IDs to `backend/.env` — revenue tracking is automatic.

---

## 🚢 Deployment

### Backend → Railway
```bash
npm install -g @railway/cli
railway login && railway init && railway up
```
Set env vars in Railway dashboard. Add Neon DATABASE_URL and Upstash REDIS_URL.

### Frontend → Vercel
```bash
cd frontend && npx vercel
```
Set `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_GOOGLE_CLIENT_ID`.

### Production checklist
- [ ] `NODE_ENV=production` on Railway
- [ ] Strong `JWT_SECRET` (32+ chars)
- [ ] Update CORS origins in `backend/src/index.ts`
- [ ] Register with [ICO](https://ico.org.uk/registration/new) (free, required)
- [ ] Add domain to Google Console authorised origins
- [ ] Set Dodo webhook URL in dashboard
- [ ] Run `npm run db:migrate` (not just `db:push`)

---

## 📈 Growth Playbook

### Month 1–2: First 100 users
- Post on Reddit `r/UKPersonalFinance` (700K members)
- TikTok demo: "£340 found in 2 minutes"
- MoneySavingExpert forum
- LinkedIn DM 20 UK housing associations

### Month 3–6: Scale to 1,000 users
- SEO: "UK benefits calculator 2026", "cheap energy tariff UK"
- Partner with StepChange, Shelter, Citizens Advice
- Referral programme: 1 month free per referral

### Month 6–12: Revenue optimisation
- Launch B2B pricing page
- A/B test Pro at £7.99
- Add insurance comparison
- SEO compounds

---

## 🛡️ Security

| Feature | Detail |
|---------|--------|
| JWT rotation | 15min access + 7-day refresh, one-use-only |
| Rate limiting | 100 req/15min global, 20/hour for AI |
| Helmet | HSTS, CSP, XSS protection |
| CORS | Frontend origin only |
| No PDF storage | Bills processed in memory, never persisted |
| bcrypt | 12 rounds for passwords |
| Zod | Runtime validation on all inputs |

---

## 🔧 Commands

```bash
# Run both apps (from root)
npm run dev

# Individual
npm run frontend    # Next.js :3000
npm run backend     # Express :5000

# Database
npm run db:push     # Push schema (dev)
npm run db:migrate  # Create migration (staging/prod)
npm run db:studio   # Prisma Studio GUI
npm run db:seed     # Seed demo data

# Types
cd frontend && npm run type-check
cd backend  && npm run type-check
```

---

## 📬 Roadmap

### v1.0 (Current) ✅
- Benefits check (40+ schemes)
- PDF bill upload + AI analysis
- Energy comparison
- Smart alerts
- Freemium subscriptions via Dodo
- Google OAuth
- Multi-step onboarding
- Affiliate revenue tracking
- Custom toast notification system (top-right, animated)
- Full settings page — change password, edit profile, upgrade plan, delete account
- Savings tracker with claim-marking + Recharts chart
- Password reset via email token
- JWT auto-refresh with session expiry redirect
- SVG favicon + dynamic OG metadata

### v1.1 (Next)
- [ ] Broadband social tariff dedicated checker
- [ ] Email digest (weekly savings summary)
- [ ] Referral programme
- [ ] Admin revenue dashboard

### v1.2
- [ ] Insurance comparison
- [ ] B2B white-label API
- [ ] React Native mobile app

---

*Data: ONS Dec 2025 · Policy in Practice 2025 · Ofcom 2025 · Ofgem Q1 2026*

