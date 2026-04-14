import { ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/index';
import { cn } from '@/lib/utils/cn';
import { formatCurrency } from '@/lib/utils/cn';

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
  income_support: { emoji: '💷', bg: 'bg-green-50' },
  disability:     { emoji: '♿', bg: 'bg-blue-50' },
  housing:        { emoji: '🏠', bg: 'bg-amber-50' },
  childcare:      { emoji: '👶', bg: 'bg-pink-50' },
  energy:         { emoji: '⚡', bg: 'bg-yellow-50' },
  health:         { emoji: '🏥', bg: 'bg-red-50' },
};

export function BenefitCard({ benefit }: { benefit: Benefit }) {
  const [expanded, setExpanded] = useState(false);
  const prob = probConfig[benefit.probability];
  const cat = categoryConfig[benefit.category] || { emoji: '💡', bg: 'bg-gray-50' };

  return (
    <div className="card overflow-hidden transition-all">
      {/* Header */}
      <div
        className="flex items-start gap-4 p-5 cursor-pointer hover:bg-gray-50/50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className={cn('flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-xl', cat.bg)}>
          {cat.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h3 className="font-semibold text-gray-900 text-sm">{benefit.name}</h3>
            <Badge variant={prob.variant}>{prob.label}</Badge>
          </div>
          <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">{benefit.description}</p>
        </div>
        <div className="flex-shrink-0 text-right ml-3">
          <p className="text-lg font-bold text-green-600 tabular-nums">
            {formatCurrency(benefit.annualValue)}
          </p>
          <p className="text-xs text-gray-400">/year</p>
        </div>
        <div className="flex-shrink-0 text-gray-300 ml-1 mt-0.5">
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </div>
      </div>

      {/* Expanded content */}
      {expanded && (
        <div className="border-t border-gray-100 bg-gray-50/50 px-5 pb-5 pt-4 animate-fade-in">
          {benefit.claimSteps?.length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2.5">
                How to claim
              </p>
              <ol className="space-y-1.5">
                {benefit.claimSteps.map((step, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-gray-600">
                    <span className="flex-shrink-0 flex h-5 w-5 items-center justify-center rounded-full bg-green-100 text-green-700 text-xs font-bold mt-0.5">
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
              className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 transition-colors"
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
