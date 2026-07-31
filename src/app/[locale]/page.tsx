import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import {
  CheckCircle2,
  Trophy,
  Sparkles,
  Star,
  Quote,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { LandingStats } from '@/components/LandingStats';
import { LandingRedirect } from '@/components/LandingRedirect';
import { FeaturedStadiums } from '@/components/FeaturedStadiums';
import { QuickSearchHero } from '@/components/QuickSearchHero';
import { LiveSlotsMarquee } from '@/components/LiveSlotsMarquee';
import { MotionDiv } from '@/components/MotionWrapper';

export default async function LandingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'Landing' });

  return (
    <div className="flex flex-col min-h-screen bg-black text-foreground font-sans selection:bg-primary/30 overflow-x-hidden relative">
      <LandingRedirect />

      {/* Ambient background glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <MotionDiv
          animate={{ y: [0, -20, 0], opacity: [0.5, 0.8, 0.5] }}
          transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
          className="absolute top-10 start-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-primary/15 rounded-full blur-[140px] pointer-events-none"
        />
        <MotionDiv
          animate={{ y: [0, 30, 0], opacity: [0.3, 0.6, 0.3] }}
          transition={{ repeat: Infinity, duration: 8, ease: "easeInOut", delay: 1 }}
          className="absolute top-96 -start-40 w-[500px] h-[500px] bg-emerald-500/15 rounded-full blur-[150px] pointer-events-none"
        />
        <MotionDiv
          animate={{ x: [0, 30, 0], opacity: [0.2, 0.5, 0.2] }}
          transition={{ repeat: Infinity, duration: 7, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-1/4 -end-40 w-[600px] h-[600px] bg-teal-500/10 rounded-full blur-[150px] pointer-events-none"
        />
      </div>

      {/* ── HERO SECTION ──────────────────────────────────────────────── */}
      <section className="relative min-h-[85vh] flex flex-col items-center justify-center text-center px-4 py-16">
        <MotionDiv 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", staggerChildren: 0.15 }}
          className="relative z-10 max-w-5xl mx-auto space-y-8"
        >
          {/* Top Badge */}
          <MotionDiv 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs sm:text-sm font-extrabold shadow-sm backdrop-blur-md"
          >
            <Sparkles className="w-4 h-4 text-emerald-400 animate-spin-slow" />
            <span>{t('heroBadge')}</span>
          </MotionDiv>

          {/* Main Hero Headline */}
          <MotionDiv
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h1 className="text-5xl sm:text-7xl md:text-8xl font-black tracking-tighter text-foreground leading-[1.05]">
              EG<span className="text-gradient-primary">Football5</span>
            </h1>
          </MotionDiv>

          <MotionDiv
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <p className="text-xl sm:text-3xl font-black text-primary tracking-tight max-w-3xl mx-auto">
              {t('heroSubtitle')}
            </p>
          </MotionDiv>

          <MotionDiv
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <p className="text-muted-foreground text-base sm:text-xl max-w-2xl mx-auto leading-relaxed font-medium">
              {t('heroDescription')}
            </p>
          </MotionDiv>

        </MotionDiv>
      </section>

      {/* ── LIVE AVAILABILITY MARQUEE TICKER ───────────────────────────── */}
      <LiveSlotsMarquee />

      {/* ── FEATURED STADIUMS SECTION ───────────────────────────────────── */}
      <section className="py-20 px-4 max-w-7xl mx-auto w-full relative z-10">
        <FeaturedStadiums isArabic={locale === 'ar'} />
      </section>

      {/* ── LIVE STATS COUNTER ────────────────────────────────────────── */}
      <section className="py-16 px-4 stadium-glass border-y border-white/10 relative">
        <div className="max-w-6xl mx-auto text-center space-y-8">
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-muted-foreground uppercase">
            {t('trustedBy')}
          </h2>
          <LandingStats />
        </div>
      </section>

      {/* ── HOW IT WORKS (3-STEP WORKFLOW) ────────────────────────────── */}
      <section className="py-24 px-4 relative overflow-hidden">
        <div className="max-w-6xl mx-auto space-y-16">
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <span className="px-3.5 py-1.5 rounded-full text-xs font-black bg-primary/10 text-primary border border-primary/30">
              {t('simple3step')}
            </span>
            <h2 className="text-4xl sm:text-5xl font-black text-foreground tracking-tight">
              {t('howItWorks')}
            </h2>
            <p className="text-muted-foreground text-lg font-medium">
              {t('howItWorksDesc')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <MotionDiv 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: 0.1 }}
              whileHover={{ y: -5 }}
              className="stadium-glass border-white/10 p-7 space-y-4 relative group rounded-3xl shadow-xl transition-colors hover:border-primary/50"
            >
              <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-black text-2xl group-hover:scale-110 transition-transform glow-primary-sm">
                1
              </div>
              <h3 className="text-2xl font-black text-foreground">
                {t('step1Title')}
              </h3>
              <p className="text-muted-foreground leading-relaxed text-sm font-medium">
                {t('step1Desc')}
              </p>
            </MotionDiv>

            <MotionDiv 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: 0.2 }}
              whileHover={{ y: -5 }}
              className="stadium-glass border-white/10 p-7 space-y-4 relative group rounded-3xl shadow-xl transition-colors hover:border-emerald-500/50"
            >
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-black text-2xl group-hover:scale-110 transition-transform">
                2
              </div>
              <h3 className="text-2xl font-black text-foreground">
                {t('step2Title')}
              </h3>
              <p className="text-muted-foreground leading-relaxed text-sm font-medium">
                {t('step2Desc')}
              </p>
            </MotionDiv>

            <MotionDiv 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: 0.3 }}
              whileHover={{ y: -5 }}
              className="stadium-glass border-white/10 p-7 space-y-4 relative group rounded-3xl shadow-xl transition-colors hover:border-teal-500/50"
            >
              <div className="w-14 h-14 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 font-black text-2xl group-hover:scale-110 transition-transform">
                3
              </div>
              <h3 className="text-2xl font-black text-foreground">
                {t('step3Title')}
              </h3>
              <p className="text-muted-foreground leading-relaxed text-sm font-medium">
                {t('step3Desc')}
              </p>
            </MotionDiv>
          </div>
        </div>
      </section>

      {/* ── FAQ SECTION ───────────────────────────────────────────────── */}
      <section className="py-24 px-4 relative border-t border-white/10">
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-black text-foreground tracking-tight">{t('faqTitle')}</h2>
            <p className="text-muted-foreground text-sm font-medium">
              {t('faqSubtitle')}
            </p>
          </div>

          <div className="space-y-4">
            <Card className="stadium-glass border-white/10 p-6 rounded-3xl shadow-lg">
              <h3 className="text-lg font-black text-foreground mb-2 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                {t('faq1Q')}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed ps-7 font-medium">
                {t('faq1A')}
              </p>
            </Card>

            <Card className="stadium-glass border-white/10 p-6 rounded-3xl shadow-lg">
              <h3 className="text-lg font-black text-foreground mb-2 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                {t('faq2Q')}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed ps-7 font-medium">
                {t('faq2A')}
              </p>
            </Card>

            <Card className="stadium-glass border-white/10 p-6 rounded-3xl shadow-lg">
              <h3 className="text-lg font-black text-foreground mb-2 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                {t('faq3Q')}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed ps-7 font-medium">
                {t('faq3A')}
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA BANNER ──────────────────────────────────────────── */}
      <section className="py-28 px-4 text-center stadium-glass border-t border-white/10 relative overflow-hidden">
        <div className="relative z-10 max-w-3xl mx-auto space-y-8">
          <h2 className="text-5xl sm:text-6xl font-black text-foreground tracking-tight">
            {t('ready')}
          </h2>
          <p className="text-xl text-muted-foreground leading-relaxed font-medium">
            {t('readyDesc')}
          </p>
          <div className="pt-4">
            <Link href="/login">
              <Button
                size="lg"
                className="text-xl px-12 py-8 bg-primary text-black hover:bg-primary/90 font-black rounded-2xl shadow-xl glow-primary hover:scale-105 transition-all cursor-pointer"
              >
                {t('getStarted')}
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
