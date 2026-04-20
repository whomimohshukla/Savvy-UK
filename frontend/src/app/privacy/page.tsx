import Link from 'next/link';
import { ArrowLeft, Shield, Lock, Eye, Database, Bell, Mail } from 'lucide-react';

export const metadata = { title: 'Privacy Policy' };

const SECTIONS = [
  {
    icon: <Database className="h-5 w-5 text-emerald-600" />,
    title: 'What data we collect',
    content: [
      'Account information: name, email address, and UK postcode (optional).',
      'Profile data: household size, employment status, income range, and benefit claims — used solely to find your entitlements.',
      'Bill data: PDF bill content analysed by AI. Raw files are not stored permanently.',
      'Usage data: pages visited, features used, and session duration for product improvement.',
    ],
  },
  {
    icon: <Shield className="h-5 w-5 text-emerald-600" />,
    title: 'How we use your data',
    content: [
      'To run AI-powered benefits and bill analysis personalised to your situation.',
      'To send alerts when your entitlements or tariff options change.',
      'To improve our product and fix bugs using anonymised analytics.',
      'We never sell your data to third parties. Ever.',
    ],
  },
  {
    icon: <Lock className="h-5 w-5 text-emerald-600" />,
    title: 'Data security',
    content: [
      'All data is encrypted in transit using TLS 1.3 and at rest using AES-256.',
      'Authentication uses short-lived JWT tokens with automatic rotation.',
      'Passwords are hashed with bcrypt (cost factor 12). We never store plain-text passwords.',
      'Our infrastructure is hosted in UK/EU data centres compliant with UK GDPR.',
    ],
  },
  {
    icon: <Eye className="h-5 w-5 text-emerald-600" />,
    title: 'Your rights',
    content: [
      'Access: request a copy of all data we hold about you.',
      'Rectification: correct any inaccurate data.',
      'Erasure: delete your account and all associated data.',
      'Portability: export your savings data as CSV.',
      'To exercise any right, email privacy@savvy-uk.com.',
    ],
  },
  {
    icon: <Bell className="h-5 w-5 text-emerald-600" />,
    title: 'Cookies',
    content: [
      'We use strictly necessary cookies for authentication (refresh token).',
      'We use analytics cookies (PostHog, anonymised) to understand product usage. You may opt out.',
      'We do not use advertising or tracking cookies.',
    ],
  },
  {
    icon: <Mail className="h-5 w-5 text-emerald-600" />,
    title: 'Contact',
    content: [
      'Data Controller: Savvy UK Ltd.',
      'Privacy queries: privacy@savvy-uk.com',
      'Complaints: you may also lodge a complaint with the ICO at ico.org.uk.',
    ],
  },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-100">
        <div className="mx-auto max-w-3xl px-5 py-6">
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700 mb-6 transition-colors">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to home
          </Link>
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-emerald-100">
              <Shield className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">Privacy Policy</h1>
              <p className="text-slate-500 mt-1">Last updated: April 2026 · Effective immediately</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-3xl px-5 py-10 space-y-5">
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
          <p className="text-sm text-emerald-800 leading-relaxed">
            <strong>The short version:</strong> We collect only what we need to find your entitlements.
            We never sell your data. You can delete everything at any time. Full details below.
          </p>
        </div>

        {SECTIONS.map((s) => (
          <div key={s.title} className="rounded-2xl border border-slate-100 bg-white p-6 shadow-card">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50">
                {s.icon}
              </div>
              <h2 className="text-lg font-bold text-slate-900">{s.title}</h2>
            </div>
            <ul className="space-y-2.5">
              {s.content.map((c, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
                  <p className="text-sm text-slate-600 leading-relaxed">{c}</p>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <p className="text-center text-xs text-slate-400 pb-4">
          © {new Date().getFullYear()} Savvy UK. Savvy UK is an informational tool, not a regulated financial adviser.
        </p>
      </div>
    </div>
  );
}
