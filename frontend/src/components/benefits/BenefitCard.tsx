'use client';

import { ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/index';
import { cn, formatCurrency } from '@/lib/utils/cn';

export interface Benefit {
  name: string;
  description: string;
  annualValue: number;
  probability: 'HIGH' | 'MEDIUM' | 'LOW';
  claimUrl: string;
  claimSteps: string[];
  category: string;
}

const probConfig = {
  HIGH:   { variant: 'green'  as const, label: 'High chance' },
  MEDIUM: { variant: 'amber'  as const, label: 'Medium chance' },
  LOW:    { variant: 'gray'   as const, label: 'Low chance' },
};

const categoryConfig: Record<string, { emoji: string; bg: string }> = {
  income_support: { emoji: '💷', bg: 'bg-emerald-50' },
  disability:     { emoji: '♿', bg: 'bg-blue-50' },
  housing:        { emoji: '🏠', bg: 'bg-amber-50' },
  childcare:      { emoji: '👶', bg: 'bg-pink-50' },
  energy:         { emoji: '⚡', bg: 'bg-yellow-50' },
  health:         { emoji: '🏥', bg: 'bg-red-50' },
};

export function BenefitCard({ benefit }: { benefit: Benefit }) {
  const [expanded, setExpanded] = useState(false);
  const prob = probConfig[benefit.probability];
  const cat = categoryConfig[benefit.category] || { emoji: '💡', bg: 'bg-slate-50' };

  return (
    <div className="card overflow-hidden transition-all hover:shadow-card-hover">
      {/* Header */}
      <div
        className="flex items-start gap-4 p-5 cursor-pointer hover:bg-slate-50/50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className={cn('flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl text-xl', cat.bg)}>
          {cat.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h3 className="font-bold text-slate-900 text-sm">{benefit.name}</h3>
            <Badge variant={prob.variant}>{prob.label}</Badge>
          </div>
          <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed">{benefit.description}</p>
        </div>
        <div className="flex-shrink-0 text-right ml-3">
          <p className="text-lg font-black text-emerald-600 tabular-nums">
            {formatCurrency(benefit.annualValue)}
          </p>
          <p className="text-xs text-slate-400 font-medium">/year</p>
        </div>
        <div className="flex-shrink-0 text-slate-300 ml-1 mt-0.5">
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </div>
      </div>

      {/* Expanded */}
      {expanded && (
        <div className="border-t border-slate-100 bg-slate-50/50 px-5 pb-5 pt-4 animate-fade-in">
          {benefit.claimSteps?.length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">
                How to claim
              </p>
              <ol className="space-y-2">
                {benefit.claimSteps.map((step, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-slate-600">
                    <span className="flex-shrink-0 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold mt-0.5">
                      {i + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          )}
          {benefit.claimUrl && (
            <a
              href={benefit.claimUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-600 transition-colors shadow-glow-sm"
            >
              Claim on GOV.UK
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}
        </div>
      )}
    </div>
  );
}
