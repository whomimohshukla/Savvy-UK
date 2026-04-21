'use client';

import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from '@radix-ui/react-toast';
import { X } from 'lucide-react';
import { useToastStore } from '@/lib/store/toast.store';

export function Toaster() {
  const { toasts, remove } = useToastStore();

  return (
    <ToastProvider swipeDirection="right">
      {toasts.map((t) => (
        <Toast
          key={t.id}
          onOpenChange={(open) => { if (!open) remove(t.id); }}
          className={`pointer-events-auto flex w-full items-center justify-between gap-3 rounded-xl border p-4 shadow-lg transition-all
            ${t.variant === 'destructive'
              ? 'border-red-200 bg-red-50 text-red-900'
              : 'border-emerald-100 bg-white text-slate-900'
            }`}
        >
          <div className="flex-1 min-w-0">
            {t.title && (
              <ToastTitle className="text-sm font-semibold leading-snug">
                {t.title}
              </ToastTitle>
            )}
            {t.description && (
              <ToastDescription className="mt-0.5 text-xs text-slate-500 leading-relaxed">
                {t.description}
              </ToastDescription>
            )}
          </div>
          <ToastClose
            onClick={() => remove(t.id)}
            className="flex-shrink-0 rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </ToastClose>
        </Toast>
      ))}
      <ToastViewport className="fixed bottom-4 right-4 z-[100] flex max-h-screen w-full max-w-sm flex-col gap-2 outline-none" />
    </ToastProvider>
  );
}
