'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Clock, Calendar, Trophy, MessageSquare, ArrowRight, ShieldCheck } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { useTranslations, useLocale } from 'next-intl';

export default function ThankYouPage() {
  const t = useTranslations('ThankYou');
  const locale = useLocale();
  const isArabic = locale === 'ar';

  return (
    <div
      className="min-h-[80vh] flex flex-col items-center justify-center px-4 py-16 max-w-3xl mx-auto text-center space-y-8"
      dir={isArabic ? 'rtl' : 'ltr'}
    >
      {/* Animated Success Badge */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="w-20 h-20 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.3)]"
      >
        <CheckCircle2 className="w-10 h-10" />
      </motion.div>

      {/* Main Heading & Subtitle */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-primary">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>{t('badge')}</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-black text-foreground tracking-tight">
          {t('title')}
        </h1>
        <p className="text-sm md:text-base text-muted-foreground max-w-xl mx-auto leading-relaxed">
          {t('subtitle')}
        </p>
      </div>

      {/* Response Time Guarantee Box */}
      <div className="w-full p-4 md:p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs md:text-sm font-bold flex items-center justify-center gap-3 text-start shadow-sm">
        <Clock className="w-5 h-5 shrink-0 text-amber-400" />
        <span>{t('responseTimePromise')}</span>
      </div>

      {/* 3 Step Timeline */}
      <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-4 text-start">
        {[
          { title: t('step1Title'), desc: t('step1Desc') },
          { title: t('step2Title'), desc: t('step2Desc') },
          { title: t('step3Title'), desc: t('step3Desc') },
        ].map((step, idx) => (
          <div
            key={idx}
            className="p-5 rounded-2xl bg-card border border-white/10 space-y-2 hover:border-primary/40 transition-colors"
          >
            <h3 className="font-extrabold text-sm text-foreground">{step.title}</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">{step.desc}</p>
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4 w-full max-w-md">
        <Link
          href="/profile"
          className="w-full sm:flex-1 py-3.5 px-6 rounded-xl bg-primary text-black font-black text-sm flex items-center justify-center gap-2 shadow-lg hover:bg-primary/90 active:scale-95 transition-all cursor-pointer"
        >
          <Calendar className="w-4 h-4 shrink-0" />
          <span>{t('viewBookings')}</span>
        </Link>
        <Link
          href="/matches"
          className="w-full sm:flex-1 py-3.5 px-6 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-foreground font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
        >
          <Trophy className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{t('exploreMatches')}</span>
        </Link>
      </div>

      <div className="pt-2">
        <Link
          href="/support"
          className="text-xs text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1.5"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>{t('contactSupport')}</span>
          <ArrowRight className="w-3 h-3 rtl:rotate-180" />
        </Link>
      </div>
    </div>
  );
}
