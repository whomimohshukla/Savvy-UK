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
  HIGH:   { variant: 'green' as const, label: 'High chance' },
  MEDIUM: { variant: 'gray'  as const, label: 'Medium chance' },
  LOW:    { variant: 'gray'  as const, label: 'Low chance' },
};

export function BenefitCard({ benefit }: { benefit: Benefit }) {
  const [expanded, setExpanded] = useState(false);
  const prob = probConfig[benefit.probability] ?? probConfig.LOW;

  return (
    <div className="card overflow-hidden transition-all hover:shadow-md">
      {/* Header */}
      <div
        className="flex items-start gap-4 p-5 cursor-pointer hover:bg-emerald-50/40 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-xl">
          💷
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h3 className="font-bold text-green-900 text-sm">{benefit.name}</h3>
            <Badge variant={prob.variant}>{prob.label}</Badge>
          </div>
          <p className="text-sm text-green-600 line-clamp-2 leading-relaxed">{benefit.description}</p>
        </div>
        <div className="flex-shrink-0 text-right ml-3">
          <p className="text-lg font-black text-emerald-600 tabular-nums">
            {formatCurrency(benefit.annualValue)}
          </p>
          <p className="text-xs text-green-400 font-medium">/year</p>
        </div>
        <div className="flex-shrink-0 text-green-300 ml-1 mt-0.5">
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </div>
      </div>

      {/* Expanded */}
      {expanded && (
        <div className="border-t border-emerald-100 bg-emerald-50/40 px-5 pb-5 pt-4 animate-fade-in">
          {benefit.claimSteps?.length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-bold uppercase tracking-widest text-green-400 mb-3">
                How to claim
              </p>
              <ol className="space-y-2">
                {benefit.claimSteps.map((step, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-green-700">
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
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-600 transition-colors"
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
