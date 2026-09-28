'use client';

import * as React from 'react';
import { Check, Crown, Zap, Shield, Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BillingCycle, SubscriptionTier, SUBSCRIPTION_PRICING } from '@/types/subscription';

interface PricingCardProps {
  tier: SubscriptionTier;
  cycle: BillingCycle;
  currentTier: SubscriptionTier;
  onSelect: (tier: 'pro' | 'vip') => void;
  isArabic: boolean;
}

export function PricingCard({
  tier,
  cycle,
  currentTier,
  onSelect,
  isArabic,
}: PricingCardProps) {
  const isFree = tier === 'free';
  const isPro = tier === 'pro';
  const isVip = tier === 'vip';
  const isCurrent = currentTier === tier;

  const pricing = SUBSCRIPTION_PRICING[tier];
  const isQuarterly = cycle === 'quarterly';
  const price = isQuarterly ? pricing.quarterlyEgp : pricing.monthlyEgp;
  const effectiveMonthly = isQuarterly ? Math.round(pricing.quarterlyEgp / 3) : pricing.monthlyEgp;

  const perks = React.useMemo(() => {
    if (isFree) {
      return [
        isArabic ? 'حجز الملاعب في العبور والقاهرة' : 'Book pitches in Obour & Cairo',
        isArabic ? 'مهلة دفع 15 دقيقة لتأكيد الحجز' : '15-Minute deposit lock window',
        isArabic ? 'الانضمام للمباريات المفتوحة' : 'Join public match lobbies',
        isArabic ? 'نصيحة تكتيكية من مدرب AI كل ساعتين' : '1 AI Coach tip every 2 hours',
      ];
    }
    if (isPro) {
      return [
        isArabic ? 'خصم 5% تلقائي على جميع الحجوزات' : '5% Off all pitch bookings',
        isArabic ? 'مهلة دفع 20 دقيقة (5 دقائق إضافية)' : '20-Minute deposit lock buffer',
        isArabic ? 'شارة Pro زرقاء في البروفايل والصدارة' : 'Blue Pro Badge on profile & leaderboard',
        isArabic ? 'إنشاء غرف مباريات خاصة برمز سري' : 'Create private passcode-locked match lobbies',
        isArabic ? 'استشارات مدرب AI تكتيكية غير محدودة' : 'Unlimited AI Coach tactical analysis',
        isArabic ? 'أولوية في الدعم الفني' : 'Priority support response',
      ];
    }
    // VIP
    return [
      isArabic ? 'خصم 10% تلقائي على جميع الحجوزات' : '10% Off all pitch bookings',
      isArabic ? 'مهلة دفع 25 دقيقة (10 دقائق إضافية)' : '25-Minute deposit lock buffer',
      isArabic ? 'تاج VIP ذهبي مضيء في البروفايل والمباريات' : 'Golden VIP Crown Badge everywhere',
      isArabic ? 'تذكرة مجانية للبطولات والكؤوس الشهرية' : 'Free voucher for monthly tournaments',
      isArabic ? 'إنشاء غرف مباريات خاصة برمز سري' : 'Create private passcode-locked match lobbies',
      isArabic ? 'استشارات مدرب AI تكتيكية ولياقية بلا حدود' : 'Unlimited AI Coach tactical & fitness insights',
      isArabic ? 'أولوية قصوى ودعم مخصص VIP' : 'VIP dedicated priority customer line',
    ];
  }, [isFree, isPro, isArabic]);

  // Visual card styles
  let borderClass = 'border-white/10 hover:border-white/20';
  let badgeHeader = null;
  let bgGradient = 'bg-card/50';

  if (isPro) {
    borderClass = 'border-sky-500/30 hover:border-sky-500/50 shadow-[0_0_30px_rgba(14,165,233,0.08)]';
    bgGradient = 'bg-gradient-to-b from-sky-500/[0.04] to-card/60';
    badgeHeader = (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-sky-500/10 text-sky-400 border border-sky-500/20">
        <Zap className="w-3.5 h-3.5" />
        {isArabic ? 'الأكثر طلباً للاعبين' : 'Most Popular'}
      </span>
    );
  } else if (isVip) {
    borderClass = 'border-amber-500/40 hover:border-amber-500/60 shadow-[0_0_40px_rgba(245,158,11,0.12)] md:-translate-y-2';
    bgGradient = 'bg-gradient-to-b from-amber-500/[0.08] to-card/80';
    badgeHeader = (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/30 shadow-[0_0_12px_rgba(245,158,11,0.2)]">
        <Crown className="w-3.5 h-3.5" />
        {isArabic ? 'الباقة النخبوية الشاملة' : 'Ultimate Pass'}
      </span>
    );
  }

  return (
    <Card
      className={`rounded-2xl p-6 md:p-8 flex flex-col justify-between transition-all duration-300 relative overflow-hidden backdrop-blur-md ${borderClass} ${bgGradient}`}
    >
      {/* Background Ambience */}
      {isVip && (
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
      )}
      {isPro && (
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-sky-500/10 rounded-full blur-2xl pointer-events-none" />
      )}

      <div className="space-y-6 relative z-10">
        {/* Tier Header */}
        <div className="space-y-3 pb-5 border-b border-white/10">
          <div className="flex items-center justify-between min-h-7">
            {badgeHeader ? (
              badgeHeader
            ) : (
              <span className="text-[11px] font-black uppercase tracking-wider text-muted-foreground">
                {isArabic ? 'الباقة المجانية' : 'Starter Tier'}
              </span>
            )}
          </div>

          <div>
            <h3 className="text-2xl font-black text-foreground">
              {isFree ? (isArabic ? 'اللاعب الأساسي' : 'Starter') : isPro ? 'Pro Pass' : 'Pitch Pass VIP'}
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              {isFree
                ? (isArabic ? 'المزايا الأساسية للعب والاستمتاع' : 'Essential features for casual games')
                : isPro
                ? (isArabic ? 'للاعبين المنتظمين لتوفير المصاريف' : 'For active players looking to save')
                : (isArabic ? 'لقادة الفرق واللاعبين الدائمين' : 'For captains and serious competitors')}
            </p>
          </div>

          {/* Price display in Egyptian Pound */}
          <div className="pt-2">
            <div className="flex items-baseline gap-1.5">
              <span className="text-4xl font-black font-mono tracking-tight text-foreground">
                {price}
              </span>
              <span className="text-sm font-black text-muted-foreground">
                {isArabic ? 'ج.م' : 'EGP'}
              </span>
              {!isFree && (
                <span className="text-xs text-muted-foreground font-medium">
                  {isQuarterly
                    ? (isArabic ? '/ 3 أشهر' : '/ 3 months')
                    : (isArabic ? '/ شهر' : '/ month')}
                </span>
              )}
            </div>

            {!isFree && isQuarterly && (
              <p className="text-[11px] text-emerald-400 font-semibold mt-1">
                {isArabic
                  ? `يعادل ${effectiveMonthly} ج.م شهرياً (وفرت ${pricing.discountPercentQuarterly}%)`
                  : `Equivalent to ${effectiveMonthly} EGP/mo (Save ${pricing.discountPercentQuarterly}%)`}
              </p>
            )}
          </div>
        </div>

        {/* Perks List */}
        <ul className="space-y-3 text-xs">
          {perks.map((perk, idx) => (
            <li key={idx} className="flex items-start gap-2.5">
              <span
                className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                  isVip
                    ? 'bg-amber-500/20 text-amber-400'
                    : isPro
                    ? 'bg-sky-500/20 text-sky-400'
                    : 'bg-white/10 text-muted-foreground'
                }`}
              >
                <Check className="w-2.5 h-2.5" />
              </span>
              <span className="text-foreground/90 font-medium leading-relaxed">{perk}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* CTA Button */}
      <div className="pt-8 relative z-10">
        {isCurrent ? (
          <Button
            disabled
            variant="outline"
            className="w-full rounded-xl py-5 text-xs font-black bg-white/5 border-white/10 text-muted-foreground"
          >
            {isArabic ? 'باقتك الحالية' : 'Current Plan'}
          </Button>
        ) : isFree ? (
          <Button
            disabled
            variant="outline"
            className="w-full rounded-xl py-5 text-xs font-black bg-white/5 border-white/10 text-muted-foreground"
          >
            {isArabic ? 'مشمولة تلقائياً' : 'Included by Default'}
          </Button>
        ) : (
          <Button
            onClick={() => onSelect(tier as 'pro' | 'vip')}
            className={`w-full rounded-xl py-5 text-xs font-black transition-transform active:scale-[0.98] cursor-pointer shadow-md ${
              isVip
                ? 'bg-amber-500 hover:bg-amber-400 text-black shadow-amber-500/20'
                : 'bg-sky-600 hover:bg-sky-500 text-white shadow-sky-600/20'
            }`}
          >
            {isVip ? <Crown className="w-4 h-4 me-1.5 inline" /> : <Zap className="w-4 h-4 me-1.5 inline" />}
            {isArabic
              ? isPro
                ? 'ترقية إلى Pro Pass'
                : 'اشترك في Pitch Pass VIP'
              : isPro
              ? 'Upgrade to Pro Pass'
              : 'Get Pitch Pass VIP'}
          </Button>
        )}
      </div>
    </Card>
  );
}
