import Link from 'next/link';
import { ArrowLeft, FileText } from 'lucide-react';

export const metadata = { title: 'Terms of Service' };

const SECTIONS = [
  {
    title: '1. Acceptance of terms',
    content: 'By creating an account or using Savvy UK, you agree to these Terms of Service. If you do not agree, please do not use the service. We may update these terms periodically; continued use after changes constitutes acceptance.',
  },
  {
    title: '2. Service description',
    content: 'Savvy UK is an AI-powered informational tool that identifies potential UK benefit entitlements, energy tariff savings, and broadband social tariff eligibility based on information you provide. We are not a regulated financial adviser. All results are for guidance only and should be verified at gov.uk or with a qualified adviser.',
  },
  {
    title: '3. Eligibility',
    content: 'You must be 18 years or older and a resident of the United Kingdom to use Savvy UK. By registering, you confirm these conditions are met.',
  },
  {
    title: '4. User responsibilities',
    content: 'You are responsible for providing accurate information. Deliberately providing false information to gain benefit eligibility indications you are not entitled to may constitute benefit fraud under UK law. You must keep your login credentials confidential.',
  },
  {
    title: '5. Disclaimers',
    content: 'Savvy UK makes no guarantees that benefit check results are accurate or complete. Eligibility rules change frequently. Always verify results at gov.uk. We are not liable for any financial decisions made based on our output. Energy and broadband savings estimates are indicative and based on publicly available tariff data.',
  },
  {
    title: '6. Subscriptions & payments',
    content: 'Free plan features are provided at no cost. Pro (£4.99/month) and Premium (£9.99/month) plans are billed monthly. You may cancel at any time; cancellation takes effect at the end of the current billing period. Payments are processed securely via Dodo Payments. We offer a 14-day money-back guarantee on first-time paid subscriptions.',
  },
  {
    title: '7. Intellectual property',
    content: 'All content, design, and code within Savvy UK is owned by Savvy UK Ltd. You may not copy, reproduce, or distribute any part of the service without written permission.',
  },
  {
    title: '8. Termination',
    content: 'You may delete your account at any time from Settings. We reserve the right to suspend or terminate accounts that violate these terms, misuse the service, or engage in fraudulent activity.',
  },
  {
    title: '9. Governing law',
    content: 'These terms are governed by the laws of England and Wales. Any disputes shall be resolved in the courts of England and Wales.',
  },
  {
    title: '10. Contact',
    content: 'For questions about these terms, email legal@savvy-uk.com or write to Savvy UK Ltd, United Kingdom.',
  },
];

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-100">
        <div className="mx-auto max-w-3xl px-5 py-6">
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700 mb-6 transition-colors">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to home
          </Link>
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-slate-100">
              <FileText className="h-6 w-6 text-slate-600" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">Terms of Service</h1>
              <p className="text-slate-500 mt-1">Last updated: April 2026 · Effective immediately</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-5 py-10 space-y-4">
        {SECTIONS.map((s) => (
          <div key={s.title} className="rounded-2xl border border-slate-100 bg-white p-6 shadow-card">
            <h2 className="text-base font-bold text-slate-900 mb-3">{s.title}</h2>
            <p className="text-sm text-slate-600 leading-relaxed">{s.content}</p>
          </div>
        ))}

        <div className="rounded-2xl border border-amber-100 bg-amber-50 p-5">
          <p className="text-sm text-amber-800 leading-relaxed">
            <strong>Important:</strong> Savvy UK is an informational tool only and is not a regulated financial adviser.
            Always verify benefit eligibility directly at{' '}
            <a href="https://www.gov.uk/benefits" className="underline" target="_blank" rel="noopener">gov.uk</a>.
          </p>
        </div>

        <p className="text-center text-xs text-slate-400 pb-4">
          © {new Date().getFullYear()} Savvy UK Ltd. All rights reserved.
        </p>
      </div>
    </div>
  );
}
