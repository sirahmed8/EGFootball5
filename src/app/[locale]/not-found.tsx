'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { Compass, Home, ArrowLeft, ArrowRight, ShieldAlert } from 'lucide-react';

export default function LocalizedNotFound() {
  const locale = useLocale();
  const isArabic = locale === 'ar';
  const ArrowIcon = isArabic ? ArrowLeft : ArrowRight;

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full bg-card/80 border border-border/60 rounded-2xl p-8 text-center backdrop-blur-md shadow-2xl relative overflow-hidden">
        {/* Subtle pitch accent line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-primary to-emerald-500" />
        
        {/* Icon container */}
        <div className="w-16 h-16 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-6 text-primary">
          <ShieldAlert className="w-8 h-8" aria-hidden="true" />
        </div>

        {/* Code badge */}
        <span className="inline-block text-xs font-mono font-semibold tracking-wider text-muted-foreground uppercase bg-muted/60 px-3 py-1 rounded-md mb-3 border border-border/40">
          HTTP 404
        </span>

        {/* Heading */}
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mb-3 text-balance">
          {isArabic ? 'الصفحة غير موجودة' : 'Page Out of Bounds'}
        </h1>

        {/* Description */}
        <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
          {isArabic
            ? 'المسار الذي طلبته غير متاح أو تم نقله. يمكنك العودة إلى الملعب أو استكشاف الحجوزات المتاحة.'
            : 'The requested route does not exist or has been relocated. Return to the home pitch or explore current matches.'}
        </p>

        {/* Action CTAs (Fitts's Law 44px height, tactile physics) */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href={`/${locale}`}
            className="flex-1 min-h-11 inline-flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground font-medium text-sm px-5 py-2.5 shadow-sm hover:opacity-95 active:scale-[0.98] transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <Home className="w-4 h-4" aria-hidden="true" />
            <span>{isArabic ? 'الرئيسية' : 'Return Home'}</span>
          </Link>

          <Link
            href={`/${locale}/home`}
            className="flex-1 min-h-11 inline-flex items-center justify-center gap-2 rounded-xl bg-muted/60 border border-border/60 hover:bg-muted text-foreground font-medium text-sm px-5 py-2.5 active:scale-[0.98] transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            <Compass className="w-4 h-4" aria-hidden="true" />
            <span>{isArabic ? 'الملاعب' : 'Browse Pitches'}</span>
            <ArrowIcon className="w-3.5 h-3.5" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </div>
  );
}
