'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { Crown, Sparkles, Shield, Zap, HelpCircle } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { useLocale } from 'next-intl';
import { getUserSubscriptionTier } from '@/lib/subscription/featureGating';
import { BillingCycle, SubscriptionOrder, SubscriptionTier } from '@/types/subscription';
import { getUserSubscriptionOrders } from '@/lib/subscription/subscriptionService';
import { BillingCycleToggle } from '@/components/subscription/BillingCycleToggle';
import { PricingCard } from '@/components/subscription/PricingCard';
import { SubscribeModal } from '@/components/subscription/SubscribeModal';
import { SubscriptionOrderHistory } from '@/components/subscription/SubscriptionOrderHistory';
import { SubscriptionBadge } from '@/components/subscription/SubscriptionBadge';

export default function SubscriptionPage() {
  const locale = useLocale();
  const isArabic = locale === 'ar';
  const appUser = useAuthStore((s) => s.appUser);

  const [cycle, setCycle] = React.useState<BillingCycle>('monthly');
  const [modalTier, setModalTier] = React.useState<'pro' | 'vip' | null>(null);
  const [orders, setOrders] = React.useState<SubscriptionOrder[]>([]);
  const [loadingOrders, setLoadingOrders] = React.useState(false);

  const currentTier: SubscriptionTier = getUserSubscriptionTier(appUser);
  const isOwner = appUser?.role === 'owner' || appUser?.role === 'admin';

  const loadOrders = React.useCallback(async () => {
    if (!appUser?.uid) return;
    setLoadingOrders(true);
    try {
      const data = await getUserSubscriptionOrders(appUser.uid);
      setOrders(data);
    } catch {
      // Graceful fallback
    } finally {
      setLoadingOrders(false);
    }
  }, [appUser?.uid]);

  React.useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  return (
    <div
      className="min-h-screen py-10 px-4 md:px-8 max-w-6xl mx-auto space-y-12"
      dir={isArabic ? 'rtl' : 'ltr'}
    >
      {/* Header Banner */}
      <motion.div
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4 max-w-2xl mx-auto"
      >
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-xs font-black uppercase text-foreground/80">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>{isArabic ? 'باقات عضوية ملاعب الخماسي' : 'EGFootball5 Membership Passes'}</span>
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

      {/* Billing Cycle Selector */}
      <BillingCycleToggle cycle={cycle} onChange={setCycle} isArabic={isArabic} />

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10 items-stretch">
        <PricingCard
          tier="free"
          cycle={cycle}
          currentTier={currentTier}
          onSelect={(t) => setModalTier(t)}
          isArabic={isArabic}
        />
        <PricingCard
          tier="pro"
          cycle={cycle}
          currentTier={currentTier}
          onSelect={(t) => setModalTier(t)}
          isArabic={isArabic}
        />
        <PricingCard
          tier="vip"
          cycle={cycle}
          currentTier={currentTier}
          onSelect={(t) => setModalTier(t)}
          isArabic={isArabic}
        />
      </div>

      {/* User's Order History */}
      {appUser && (
        <SubscriptionOrderHistory
          orders={orders}
          loading={loadingOrders}
          isArabic={isArabic}
        />
      )}

      {/* Value Guarantee / ROI Section */}
      <div className="p-6 md:p-8 rounded-2xl bg-card/30 border border-white/10 space-y-6">
        <div className="flex items-center gap-2.5">
          <Shield className="w-5 h-5 text-emerald-400" />
          <h2 className="text-base font-black text-foreground">
            {isArabic ? 'كيف تعيد الباقة تكلفتها سريعاً؟' : 'How the Pass Pays for Itself'}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-muted-foreground">
          <div className="space-y-1.5 p-4 rounded-xl bg-white/[0.02] border border-white/5">
            <span className="font-black text-foreground block text-sm">
              {isArabic ? '1. توفير الحجوزات الأسبوعية' : '1. Weekly Booking Savings'}
            </span>
            <p className="leading-relaxed">
              {isArabic
                ? 'إذا كنت تلعب مباراة أسبوعياً بسعر 400 ج.م، يوفر لك اشتراك VIP مبلغ 160 ج.م شهرياً من رسوم الحجز وحدها!'
                : 'Playing once a week on a 400 EGP pitch saves you 160 EGP monthly just from booking fees!'}
            </p>
          </div>

          <div className="space-y-1.5 p-4 rounded-xl bg-white/[0.02] border border-white/5">
            <span className="font-black text-foreground block text-sm">
              {isArabic ? '2. راحة البال وعدم ضياع الموعد' : '2. Zero-Stress Deposit Buffer'}
            </span>
            <p className="leading-relaxed">
              {isArabic
                ? 'تمديد مهلة الدفع لـ 20 أو 25 دقيقة يمنحك وقتاً كافياً للتحويل وتأكيد الحصة بدون خوف من إلغاء الحجز فجأة.'
                : 'Extending your deposit window to 20 or 25 minutes gives you ample time to transfer without losing your slot.'}
            </p>
          </div>

          <div className="space-y-1.5 p-4 rounded-xl bg-white/[0.02] border border-white/5">
            <span className="font-black text-foreground block text-sm">
              {isArabic ? '3. دخول البطولات الرسمية' : '3. Tournament Gala Entries'}
            </span>
            <p className="leading-relaxed">
              {isArabic
                ? 'تذكرة البطولة المجانية الشهرية تغطي رسم اشتراك البطولة بالكامل (قيمتها تتراوح بين 150 - 300 ج.م).'
                : 'Your free monthly tournament ticket covers full team registration worth 150 - 300 EGP.'}
            </p>
          </div>
        </div>
      </div>

      {/* Subscribe Modal */}
      {modalTier && (
        <SubscribeModal
          isOpen={modalTier !== null}
          onClose={() => setModalTier(null)}
          tier={modalTier}
          cycle={cycle}
          onSuccess={loadOrders}
          isArabic={isArabic}
        />
      )}
    </div>
  );
}
