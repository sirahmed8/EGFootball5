'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Crown, DollarSign, Coins } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { useLocale } from 'next-intl';
import { getUserSubscriptionTier } from '@/lib/subscription/featureGating';
import { BillingCycle, SubscriptionTier } from '@/types/subscription';
import { SupportedCurrency } from '@/lib/currency';
import { BillingCycleToggle } from '@/components/subscription/BillingCycleToggle';
import { PricingCard } from '@/components/subscription/PricingCard';
import { SubscribeModal } from '@/components/subscription/SubscribeModal';
import { SubscriptionBadge } from '@/components/subscription/SubscriptionBadge';
import { PricingComparisonTable } from './components/PricingComparisonTable';
import { PricingFaqSection } from './components/PricingFaqSection';

export default function PricingPage() {
  const locale = useLocale();
  const isArabic = locale === 'ar';
  const appUser = useAuthStore((s) => s.appUser);

  const [cycle, setCycle] = React.useState<BillingCycle>('annual');
  const [currency, setCurrency] = React.useState<SupportedCurrency>('EGP');
  const [modalTier, setModalTier] = React.useState<'pro' | 'vip' | null>(null);

  const currentTier: SubscriptionTier = getUserSubscriptionTier(appUser);
  const isOwner = appUser?.role === 'owner' || appUser?.role === 'admin';

  return (
    <div
      className="min-h-screen py-10 px-4 md:px-8 max-w-6xl mx-auto space-y-14"
      dir={isArabic ? 'rtl' : 'ltr'}
    >
      {/* Header Banner */}
      <motion.div
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4 max-w-3xl mx-auto"
      >
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-xs font-black uppercase text-foreground/80">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>{isArabic ? 'خطط وباقات عضوية EGFootball5' : 'EGFootball5 Membership Passes'}</span>
        </div>

        <h1 className="text-3xl md:text-5xl font-black text-foreground tracking-tight">
          {isArabic ? (
            <>وفر مصاريف حجزك مع <span className="text-amber-400">Pitch Pass</span></>
          ) : (
            <>Play More, Save More with <span className="text-amber-400">Pitch Pass</span></>
          )}
        </h1>

        <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
          {isArabic
            ? 'اشتراكات مصممة للاعبي وقادة الخماسي بالعبور والقاهرة. خصومات فورية مستردة مع كل حجز، مهلة إضافية لتأكيد التحويل، وبطاقات مميزة.'
            : 'Tailored for 5-a-side captains and weekly squads in Obour and Cairo. Instant booking savings, extra payment lock buffers, and elite badges.'}
        </p>

        {isOwner && (
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold flex items-center justify-center gap-2 shadow-sm">
            <Crown className="w-4 h-4" />
            <span>
              {isArabic
                ? 'حسابك كإدارة: جميع مزايا Pitch Pass VIP مفتوحة ومفعلة دائماً!'
                : 'Admin Status: All Pitch Pass VIP features permanently unlocked!'}
            </span>
          </div>
        )}

        {currentTier !== 'free' && !isOwner && (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center justify-center gap-2">
            <SubscriptionBadge tier={currentTier} size="sm" isArabic={isArabic} />
            <span>
              {isArabic
                ? `باقتك الحالية مفعلة بنجاح (${currentTier === 'vip' ? 'Pitch Pass VIP' : 'Pro Pass'})`
                : `Your active tier: ${currentTier === 'vip' ? 'Pitch Pass VIP' : 'Pro Pass'}`}
            </span>
          </div>
        )}
      </motion.div>

      {/* Controls: Billing Cycle + Currency Switcher */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <BillingCycleToggle cycle={cycle} onChange={setCycle} isArabic={isArabic} />

        {/* Currency Switcher */}
        <div
          role="radiogroup"
          aria-label={isArabic ? 'العملة' : 'Currency'}
          className="inline-flex p-1.5 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-md gap-1"
        >
          <button
            type="button"
            role="radio"
            aria-checked={currency === 'EGP'}
            onClick={() => setCurrency('EGP')}
            className={`px-3 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
              currency === 'EGP'
                ? 'bg-foreground text-background shadow-md'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Coins className="w-3.5 h-3.5" />
            <span>{isArabic ? 'ج.م (EGP)' : 'EGP (ج.م)'}</span>
          </button>

          <button
            type="button"
            role="radio"
            aria-checked={currency === 'USD'}
            onClick={() => setCurrency('USD')}
            className={`px-3 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
              currency === 'USD'
                ? 'bg-foreground text-background shadow-md'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>USD ($)</span>
          </button>
        </div>
      </div>

      {/* Tier Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch">
        <PricingCard
          tier="free"
          cycle={cycle}
          currentTier={currentTier}
          onSelect={(t) => setModalTier(t)}
          isArabic={isArabic}
          currency={currency}
        />

        <PricingCard
          tier="pro"
          cycle={cycle}
          currentTier={currentTier}
          onSelect={(t) => setModalTier(t)}
          isArabic={isArabic}
          currency={currency}
        />

        <PricingCard
          tier="vip"
          cycle={cycle}
          currentTier={currentTier}
          onSelect={(t) => setModalTier(t)}
          isArabic={isArabic}
          currency={currency}
        />
      </div>

      {/* Full Feature Comparison Matrix */}
      <PricingComparisonTable isArabic={isArabic} />

      {/* FAQ Section */}
      <PricingFaqSection isArabic={isArabic} />

      {/* Subscribe & Payment Modal */}
      {modalTier && (
        <SubscribeModal
          isOpen={!!modalTier}
          onClose={() => setModalTier(null)}
          tier={modalTier}
          cycle={cycle}
          onSuccess={() => {
            setModalTier(null);
          }}
          isArabic={isArabic}
        />
      )}
    </div>
  );
}
