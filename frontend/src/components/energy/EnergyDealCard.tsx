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

function supplierInitials(name: string) {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

export function EnergyDealCard({ deal, isBest, onSwitch, index }: EnergyDealCardProps) {
  return (
    <div className={cn(
      'flex items-center gap-4 rounded-2xl border p-4 transition-all',
      isBest
        ? 'border-emerald-200 bg-emerald-50/40 shadow-sm'
        : 'border-emerald-100 bg-white hover:border-emerald-200 hover:shadow-sm',
    )}>
      {/* Rank */}
      <div className={cn(
        'flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl text-sm font-bold',
        isBest ? 'bg-emerald-500 text-white' : 'bg-emerald-100 text-emerald-600',
      )}>
        {isBest ? <Star className="h-4 w-4" /> : index + 1}
      </div>

      {/* Supplier avatar */}
      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-xs font-bold text-emerald-700">
        {supplierInitials(deal.supplier)}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-bold text-green-900 text-sm">{deal.supplier}</p>
          {isBest && (
            <span className="rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-bold text-white">
              Best deal
            </span>
          )}
        </div>
        <p className="text-xs text-green-500 mt-0.5 font-medium">{deal.tariffName}</p>
      </div>

      {/* Price */}
      <div className="text-right flex-shrink-0">
        <p className="font-bold text-green-900 text-sm tabular-nums">{formatCurrency(deal.annualCost)}/yr</p>
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
            ? 'bg-emerald-500 text-white hover:bg-emerald-600'
            : 'border border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-300',
        )}
      >
        Switch
        <ExternalLink className="h-3 w-3" />
      </button>
    </div>
  );
}
