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

export default async function LandingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'Landing' });

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground font-sans selection:bg-primary/30 overflow-x-hidden relative">
      <LandingRedirect />

      {/* ── HERO SECTION ──────────────────────────────────────────────── */}
      <section className="relative min-h-[85vh] flex flex-col items-center justify-center text-center px-4 py-16 overflow-hidden bg-background">
        <div className="relative z-10 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-700">
          {/* Top Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs sm:text-sm font-extrabold">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>{t('heroBadge')}</span>
          </div>

          {/* Main Hero Headline */}
          <h1 className="text-5xl sm:text-7xl md:text-8xl font-black tracking-tighter text-foreground leading-[1.05]">
            EG<span className="text-primary">Football5</span>
          </h1>

          <p className="text-xl sm:text-3xl font-black text-primary tracking-tight max-w-3xl mx-auto">
            {t('heroSubtitle')}
          </p>

          <p className="text-muted-foreground text-base sm:text-xl max-w-2xl mx-auto leading-relaxed font-medium">
            {t('heroDescription')}
          </p>

          {/* Interactive Quick Search Hero Widget */}
          <div className="pt-2">
            <QuickSearchHero />
          </div>

          {/* Primary CTA Buttons */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            <Link href="/home">
              <Button
                size="lg"
                className="bg-primary text-black hover:bg-primary/90 font-black text-lg px-9 py-7 rounded-2xl shadow-lg hover:scale-105 transition-all cursor-pointer"
              >
                {t('browsePitches')}
              </Button>
            </Link>
            <Link href="/matches">
              <Button
                size="lg"
                variant="outline"
                className="border-border text-foreground hover:bg-muted font-black text-lg px-9 py-7 rounded-2xl cursor-pointer hover:scale-105 transition-all"
              >
                <Trophy className="w-5 h-5 me-2 text-primary" />
                {t('publicMatchesBtn')}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── LIVE AVAILABILITY MARQUEE TICKER ───────────────────────────── */}
      <LiveSlotsMarquee />

      {/* ── FEATURED STADIUMS SECTION ───────────────────────────────────── */}
      <section className="py-20 px-4 max-w-7xl mx-auto w-full relative z-10">
        <FeaturedStadiums isArabic={locale === 'ar'} />
      </section>


      {/* ── LIVE STATS COUNTER ────────────────────────────────────────── */}
      <section className="py-16 px-4 bg-card border-y border-border relative">
        <div className="max-w-6xl mx-auto text-center space-y-8">
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-muted-foreground uppercase">
            {t('trustedBy')}
          </h2>
          <LandingStats />
        </div>
      </section>

      {/* ── HOW IT WORKS (3-STEP WORKFLOW) ────────────────────────────── */}
      <section className="py-24 px-4 relative overflow-hidden bg-background">
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
            <Card className="bg-card border-border hover:border-primary/50 transition-all p-7 space-y-4 relative group rounded-3xl shadow-lg">
              <div className="w-14 h-14 rounded-2xl bg-muted border border-border flex items-center justify-center text-primary font-black text-2xl group-hover:scale-105 transition-transform">
                1
              </div>
              <h3 className="text-2xl font-black text-foreground">
                {t('step1Title')}
              </h3>
              <p className="text-muted-foreground leading-relaxed text-sm font-medium">
                {t('step1Desc')}
              </p>
            </Card>

            <Card className="bg-card border-border hover:border-emerald-500/50 transition-all p-7 space-y-4 relative group rounded-3xl shadow-lg">
              <div className="w-14 h-14 rounded-2xl bg-muted border border-border flex items-center justify-center text-emerald-400 font-black text-2xl group-hover:scale-105 transition-transform">
                2
              </div>
              <h3 className="text-2xl font-black text-foreground">
                {t('step2Title')}
              </h3>
              <p className="text-muted-foreground leading-relaxed text-sm font-medium">
                {t('step2Desc')}
              </p>
            </Card>

            <Card className="bg-card border-border hover:border-teal-500/50 transition-all p-7 space-y-4 relative group rounded-3xl shadow-lg">
              <div className="w-14 h-14 rounded-2xl bg-muted border border-border flex items-center justify-center text-teal-400 font-black text-2xl group-hover:scale-105 transition-transform">
                3
              </div>
              <h3 className="text-2xl font-black text-foreground">
                {t('step3Title')}
              </h3>
              <p className="text-muted-foreground leading-relaxed text-sm font-medium">
                {t('step3Desc')}
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* ── PLAYER TESTIMONIALS & REVIEWS ─────────────────────────────── */}
      <section className="py-24 px-4 bg-card border-y border-border relative overflow-hidden">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <span className="px-3.5 py-1.5 rounded-full text-xs font-black bg-amber-500/10 text-amber-400 border border-amber-500/30">
              {t('reviewsBadge')}
            </span>
            <h2 className="text-4xl font-black text-foreground tracking-tight">
              {t('reviewsTitle')}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-background border-border p-6 rounded-3xl space-y-4 relative shadow-lg">
              <Quote className="w-8 h-8 text-muted-foreground/30 absolute top-4 end-4" />
              <div className="flex text-amber-400 gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-sm text-foreground leading-relaxed italic font-medium">
                {t('review1Text')}
              </p>
              <div className="pt-3 border-t border-border">
                <strong className="text-sm text-foreground block font-bold">{t('review1Name')}</strong>
                <span className="text-xs text-muted-foreground font-semibold">{t('review1Role')}</span>
              </div>
            </Card>

            <Card className="bg-background border-border p-6 rounded-3xl space-y-4 relative shadow-lg">
              <Quote className="w-8 h-8 text-muted-foreground/30 absolute top-4 end-4" />
              <div className="flex text-amber-400 gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-sm text-foreground leading-relaxed italic font-medium">
                {t('review2Text')}
              </p>
              <div className="pt-3 border-t border-border">
                <strong className="text-sm text-foreground block font-bold">{t('review2Name')}</strong>
                <span className="text-xs text-muted-foreground font-semibold">{t('review2Role')}</span>
              </div>
            </Card>

            <Card className="bg-background border-border p-6 rounded-3xl space-y-4 relative shadow-lg">
              <Quote className="w-8 h-8 text-muted-foreground/30 absolute top-4 end-4" />
              <div className="flex text-amber-400 gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-sm text-foreground leading-relaxed italic font-medium">
                {t('review3Text')}
              </p>
              <div className="pt-3 border-t border-border">
                <strong className="text-sm text-foreground block font-bold">{t('review3Name')}</strong>
                <span className="text-xs text-muted-foreground font-semibold">{t('review3Role')}</span>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* ── FAQ SECTION ───────────────────────────────────────────────── */}
      <section className="py-24 px-4 bg-background relative border-t border-border">
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-black text-foreground tracking-tight">{t('faqTitle')}</h2>
            <p className="text-muted-foreground text-sm font-medium">
              {t('faqSubtitle')}
            </p>
          </div>

          <div className="space-y-4">
            <Card className="bg-card border-border p-6 rounded-3xl shadow-lg">
              <h3 className="text-lg font-black text-foreground mb-2 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                {t('faq1Q')}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed ps-7 font-medium">
                {t('faq1A')}
              </p>
            </Card>

            <Card className="bg-card border-border p-6 rounded-3xl shadow-lg">
              <h3 className="text-lg font-black text-foreground mb-2 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                {t('faq2Q')}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed ps-7 font-medium">
                {t('faq2A')}
              </p>
            </Card>

            <Card className="bg-card border-border p-6 rounded-3xl shadow-lg">
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
      <section className="py-28 px-4 text-center bg-card border-t border-border relative overflow-hidden">
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
                className="text-xl px-12 py-8 bg-primary text-black hover:bg-primary/90 font-black rounded-2xl shadow-lg hover:scale-105 transition-all cursor-pointer"
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
