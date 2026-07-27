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

  const isLowTime = timeLeft < 180; // less than 3 minutes

  return (
    <span
      className={`font-mono font-black text-lg px-3.5 py-1.5 rounded-full ms-1 border transition-all duration-300 global-outline-glow ${
        isLowTime
          ? 'bg-red-500/20 text-red-400 border-red-500/40 animate-pulse shadow-[0_0_20px_rgba(239,68,68,0.4)]'
          : 'bg-primary/10 text-primary border-primary/20 shadow-[0_0_15px_rgba(57,255,20,0.15)]'
      }`}
    >
      {formatTime(timeLeft)}
    </span>
  );
}
