'use client';

import { useOnlinePresence } from '@/hooks/useOnlinePresence';
import { Users } from 'lucide-react';
import { useLocale } from 'next-intl';

export default function PresenceIndicator() {
  const { onlineCount, isOnline } = useOnlinePresence();
  const locale = useLocale();

  if (!isOnline && onlineCount === 0) return null;

  return (
    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold animate-in fade-in zoom-in duration-500">
      <div className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
      </div>
      <Users className="w-3.5 h-3.5" />
      <span>{locale === 'ar' ? 'متصل الآن' : 'Online'}</span>
    </div>
  );
}
