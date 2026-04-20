import { ExternalLink, Star } from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils/cn';

interface Deal {
  supplier: string;
  annualCost: number;
  tariffName: string;
  saving: number;
}

interface EnergyDealCardProps {
  deal: Deal;
  isBest?: boolean;
  onSwitch: () => void;
  index: number;
}

const SUPPLIER_COLORS: Record<string, string> = {
  'Octopus Energy': 'bg-violet-100 text-violet-700',
  'Outfox Energy':  'bg-orange-100 text-orange-700',
  'EDF Energy':     'bg-blue-100 text-blue-700',
  "E.ON Next":      'bg-cyan-100 text-cyan-700',
  'British Gas':    'bg-blue-100 text-blue-700',
  'Ovo Energy':     'bg-emerald-100 text-emerald-700',
};

function supplierInitials(name: string) {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

export function EnergyDealCard({ deal, isBest, onSwitch, index }: EnergyDealCardProps) {
  const colorClass = SUPPLIER_COLORS[deal.supplier] || 'bg-slate-100 text-slate-600';

  return (
    <div className={cn(
      'flex items-center gap-4 rounded-2xl border p-4 transition-all',
      isBest
        ? 'border-emerald-200 bg-emerald-50/40 shadow-card'
        : 'border-slate-100 bg-white hover:border-slate-200 hover:shadow-card',
    )}>
      {/* Rank */}
      <div className={cn(
        'flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl text-sm font-bold',
        isBest ? 'bg-emerald-500 text-white shadow-glow-sm' : 'bg-slate-100 text-slate-500',
      )}>
        {isBest ? <Star className="h-4 w-4" /> : index + 1}
      </div>

      {/* Supplier avatar */}
      <div className={cn('flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-xs font-bold', colorClass)}>
        {supplierInitials(deal.supplier)}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-bold text-slate-900 text-sm">{deal.supplier}</p>
          {isBest && (
            <span className="rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-bold text-white">
              Best deal
            </span>
          )}
        </div>
        <p className="text-xs text-slate-500 mt-0.5 font-medium">{deal.tariffName}</p>
      </div>

      {/* Price */}
      <div className="text-right flex-shrink-0">
        <p className="font-bold text-slate-900 text-sm tabular-nums">{formatCurrency(deal.annualCost)}/yr</p>
        {deal.saving > 0 && (
          <p className="text-xs text-emerald-600 font-semibold tabular-nums">
            Save {formatCurrency(deal.saving)}
          </p>
        )}
      </div>

      {/* Switch */}
      <button
        onClick={onSwitch}
        className={cn(
          'flex-shrink-0 flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition-all',
          isBest
            ? 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-glow-sm'
            : 'border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300',
        )}
      >
        Switch
        <ExternalLink className="h-3 w-3" />
      </button>
    </div>
  );
}
