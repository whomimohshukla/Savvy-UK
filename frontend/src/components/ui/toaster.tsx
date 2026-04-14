'use client';

import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from '@radix-ui/react-toast';
import { useToastStore } from '@/lib/store/toast.store';

export function Toaster() {
  return (
    <ToastProvider>
      <ToastViewport className="fixed bottom-0 right-0 z-[100] flex max-h-screen w-full flex-col-reverse gap-2 p-4 sm:max-w-[420px]" />
    </ToastProvider>
  );
}
