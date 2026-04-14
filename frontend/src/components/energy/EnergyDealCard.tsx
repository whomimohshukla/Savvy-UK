import { ExternalLink, Star } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { formatCurrency } from '@/lib/utils/cn';

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
  'Octopus Energy': 'bg-purple-100 text-purple-700',
  'Outfox Energy':  'bg-orange-100 text-orange-700',
  'EDF Energy':     'bg-blue-100 text-blue-700',
  "E.ON Next":      'bg-cyan-100 text-cyan-700',
  'British Gas':    'bg-blue-100 text-blue-700',
  'Ovo Energy':     'bg-green-100 text-green-700',
};

function supplierInitials(name: string) {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

export function EnergyDealCard({ deal, isBest, onSwitch, index }: EnergyDealCardProps) {
  const colorClass = SUPPLIER_COLORS[deal.supplier] || 'bg-gray-100 text-gray-600';

  return (
    <div className={cn(
      'flex items-center gap-4 rounded-xl border p-4 transition-all',
      isBest
        ? 'border-green-200 bg-green-50/50 shadow-sm'
        : 'border-gray-100 bg-white hover:border-gray-200',
    )}>
      {/* Rank */}
      <div className={cn(
        'flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-sm font-bold',
        isBest ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-500',
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
          <p className="font-semibold text-gray-900 text-sm">{deal.supplier}</p>
          {isBest && (
            <span className="rounded-full bg-green-600 px-2 py-0.5 text-[10px] font-bold text-white">
              Best deal
            </span>
          )}
        </div>
        <p className="text-xs text-gray-500 mt-0.5">{deal.tariffName}</p>
      </div>

      {/* Price */}
      <div className="text-right flex-shrink-0">
        <p className="font-bold text-gray-900 text-sm tabular-nums">{formatCurrency(deal.annualCost)}/yr</p>
        {deal.saving > 0 && (
          <p className="text-xs text-green-600 font-medium tabular-nums">
            Save {formatCurrency(deal.saving)}
          </p>
        )}
      </div>

      {/* Switch button */}
      <button
        onClick={onSwitch}
        className={cn(
          'flex-shrink-0 flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors',
          isBest
            ? 'bg-green-600 text-white hover:bg-green-700'
            : 'border border-gray-200 text-gray-600 hover:bg-gray-50',
        )}
      >
        Switch
        <ExternalLink className="h-3 w-3" />
      </button>
    </div>
  );
}
