'use client';

import { useEffect, useRef } from 'react';
import { X, CheckCircle2, AlertCircle, AlertTriangle, Info, Bell } from 'lucide-react';
import { useToastStore, ToastVariant, Toast } from '@/lib/store/toast.store';
import { cn } from '@/lib/utils/cn';

const VARIANTS: Record<string, {
  icon: React.ReactNode;
  bar: string;
  iconWrap: string;
  border: string;
}> = {
  success:     { icon: <CheckCircle2 className="h-4.5 w-4.5" />,  bar: 'bg-emerald-500', iconWrap: 'bg-emerald-100 text-emerald-600', border: 'border-emerald-100' },
  error:       { icon: <AlertCircle  className="h-4.5 w-4.5" />,  bar: 'bg-red-500',     iconWrap: 'bg-red-100 text-red-600',         border: 'border-red-100'     },
  destructive: { icon: <AlertCircle  className="h-4.5 w-4.5" />,  bar: 'bg-red-500',     iconWrap: 'bg-red-100 text-red-600',         border: 'border-red-100'     },
  warning:     { icon: <AlertTriangle className="h-4.5 w-4.5" />, bar: 'bg-emerald-400', iconWrap: 'bg-emerald-100 text-emerald-600', border: 'border-emerald-100' },
  info:        { icon: <Info         className="h-4.5 w-4.5" />,  bar: 'bg-emerald-500', iconWrap: 'bg-emerald-100 text-emerald-600', border: 'border-emerald-100' },
  default:     { icon: <Bell         className="h-4.5 w-4.5" />,  bar: 'bg-emerald-500', iconWrap: 'bg-emerald-100 text-emerald-600', border: 'border-emerald-100' },
};

function ToastItem({ t, onRemove }: { t: Toast; onRemove: () => void }) {
  const key = (t.variant ?? 'default') as string;
  const cfg = VARIANTS[key] ?? VARIANTS.default;
  const duration = t.duration ?? 4500;
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(onRemove, duration);
    if (barRef.current) {
      barRef.current.style.transition = `width ${duration}ms linear`;
      requestAnimationFrame(() => {
        if (barRef.current) barRef.current.style.width = '0%';
      });
    }
    return () => clearTimeout(timer);
  }, [duration, onRemove]);

  return (
    <div
      className={cn(
        'pointer-events-auto w-full max-w-sm rounded-2xl border bg-white shadow-[0_8px_32px_rgba(0,0,0,0.12)] overflow-hidden',
        'animate-slide-in-right',
        cfg.border,
      )}
    >
      {/* Progress bar */}
      <div className={cn('h-0.5 w-full', cfg.bar)} ref={barRef} />

      <div className="flex items-start gap-3 p-4">
        {/* Icon */}
        <div className={cn('flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl', cfg.iconWrap)}>
          {cfg.icon}
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0 pt-0.5">
          <p className="text-sm font-bold text-green-950 leading-snug">{t.title}</p>
          {t.description && (
            <p className="mt-0.5 text-xs text-green-600 leading-relaxed">{t.description}</p>
          )}
        </div>

        {/* Close */}
        <button
          onClick={onRemove}
          className="flex-shrink-0 mt-0.5 rounded-lg p-1 text-green-400 hover:bg-emerald-50 hover:text-green-600 transition-colors"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

export function Toaster() {
  const { toasts, remove } = useToastStore();

  return (
    <div className="fixed top-4 right-4 z-[500] flex flex-col gap-2.5 w-full max-w-sm pointer-events-none">
      {toasts.map((t) => (
        <ToastItem key={t.id} t={t} onRemove={() => remove(t.id)} />
      ))}
    </div>
  );
}
