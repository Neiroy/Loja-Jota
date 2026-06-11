'use client';

import { Toaster } from 'sonner';

export function AppToaster() {
  return (
    <Toaster
      position="top-right"
      closeButton
      toastOptions={{
        classNames: {
          toast:
            'border border-stone-200/80 bg-white text-stone-900 shadow-sm !rounded-xl',
          title: 'text-stone-900',
          description: 'text-stone-600',
          closeButton: 'border-stone-200/80 bg-white text-stone-500',
        },
      }}
    />
  );
}
