'use client';

import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { toast } from 'sonner';
import { useRouter } from '@/i18n/routing';

interface CountdownTimerProps {
  lockedUntil?: number | null;
}

export function CountdownTimer({ lockedUntil }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState(600);
  const locale = useLocale();
  const router = useRouter();

  useEffect(() => {
    if (!lockedUntil) return;
    
    const timer = setInterval(() => {
      const now = Date.now();
      const diff = Math.floor((lockedUntil - now) / 1000);
      if (diff <= 0) {
        clearInterval(timer);
        toast.error(locale === 'ar' ? 'انتهت صلاحية الحجز المؤقت الخاص بك.' : 'Your temporary lock has expired.');
        router.push('/book');
      } else {
        setTimeLeft(diff);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [lockedUntil, router, locale]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <span className="text-primary font-black text-lg bg-primary/10 px-3 py-1 rounded-full ml-1 border border-primary/20 shadow-[0_0_15px_rgba(57,255,20,0.15)]">
      {formatTime(timeLeft)}
    </span>
  );
}
