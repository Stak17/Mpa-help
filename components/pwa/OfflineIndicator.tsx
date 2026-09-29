'use client';

import React from 'react';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { useIsMounted } from '@/hooks/useIsMounted';
import { WifiOff } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();
  const isMounted = useIsMounted();

  if (!isMounted || isOnline) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 z-50 flex items-center gap-2.5 rounded-xl bg-amber-600/95 backdrop-blur-sm px-4 py-2.5 text-xs sm:text-sm font-medium text-white shadow-xl border border-amber-400 animate-in slide-in-from-bottom-2">
      <WifiOff className="w-4 h-4 shrink-0 animate-pulse text-amber-200" />
      <div>
        <p className="font-semibold leading-tight">You&apos;re offline</p>
        <p className="text-amber-100 text-xs font-normal">
          Some features require an internet connection. Saved documents and budgets remain accessible.
        </p>
      </div>
    </div>
  );
};
