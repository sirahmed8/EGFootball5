'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { Crown, Sparkles, Shield, HelpCircle, FileText, ArrowRight } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import { getUserSubscriptionTier } from '@/lib/subscription/featureGating';
import { BillingCycle, SubscriptionOrder, SubscriptionTier } from '@/types/subscription';
import { getUserSubscriptionOrders } from '@/lib/subscription/subscriptionService';
import { BillingCycleToggle } from '@/components/subscription/BillingCycleToggle';
import { PricingCard } from '@/components/subscription/PricingCard';
import { SubscribeModal } from '@/components/subscription/SubscribeModal';
import { SubscriptionOrderHistory } from '@/components/subscription/SubscriptionOrderHistory';
import { MemberPlanHero } from './components/MemberPlanHero';

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
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2"
      >
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-black uppercase text-primary">
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          <span>{isArabic ? 'لوحة تحكم العضوية والاشتراكات' : 'Member Pass & Billing Hub'}</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-black text-foreground tracking-tight">
          {isArabic ? 'عضويتك وباقات ' : 'Your Membership & '}<span className="text-primary">{isArabic ? 'Pitch Pass' : 'Pitch Pass'}</span>
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground">
          {isArabic
            ? 'تابع تفاصيل باقتك الحالية، سجل الفواتير والمبالغ، وقم بترقية اشتراكك للاستفادة من أعلى نسبة خصم على الحجوزات.'
            : 'Review your active tier benefits, check invoice records, and manage your pass options.'}
        </p>
      </motion.div>

      {/* Active Member Plan Status Card */}
      <MemberPlanHero
        currentTier={currentTier}
        appUser={appUser}
        isOwner={isOwner}
        isArabic={isArabic}
        onUpgradeClick={() => setModalTier(currentTier === 'pro' ? 'vip' : 'pro')}
      />

      {/* Available Plans & Upgrades Section */}
      <div className="space-y-6 pt-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
          <div>
            <h2 className="text-xl font-black text-foreground">
              {isArabic ? 'ترقية وتغيير الباقة' : 'Explore & Upgrade Membership'}
            </h2>
            <p className="text-xs text-muted-foreground">
              {isArabic
                ? 'اختر باقة تناسب عدد مبارياتك الشهرية ووفر مئات الجنيهات مع كل حجز.'
                : 'Choose a pass matching your match frequency and save on every booking.'}
            </p>
          </div>
          <BillingCycleToggle cycle={cycle} onChange={setCycle} isArabic={isArabic} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
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
      </div>

      {/* Invoices & Order History */}
      {appUser && (
        <div className="space-y-4 pt-4 border-t border-border">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-black text-foreground">
              {isArabic ? 'سجل الفواتير والإيصالات' : 'Invoices & Billing History'}
            </h2>
          </div>
          <SubscriptionOrderHistory
            orders={orders}
            loading={loadingOrders}
            isArabic={isArabic}
          />
        </div>
      )}

      {/* Membership Policies & Cancellation Guarantee */}
      <div className="p-6 md:p-8 rounded-3xl bg-card border border-border space-y-4">
        <div className="flex items-center gap-2 text-foreground font-black text-sm">
          <Shield className="w-5 h-5 text-emerald-400" />
          <span>{isArabic ? 'سياسة العضوية والضمانات' : 'Membership Commitments & Policy'}</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-muted-foreground leading-relaxed">
          <div className="p-4 rounded-2xl bg-muted/30 border border-border/50 space-y-1">
            <span className="font-bold text-foreground block">
              {isArabic ? 'إلغاء الاشتراك في أي وقت' : 'Cancel Anytime With Zero Friction'}
            </span>
            <p>
              {isArabic
                ? 'لا توجد التزامات طويلة الأجل. يمكنك إيقاف التجديد في أي وقت قبل دورة الفوترة القادمة.'
                : 'No lock-in contracts. You can pause or cancel renewal before your next cycle.'}
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-muted/30 border border-border/50 space-y-1">
            <span className="font-bold text-foreground block">
              {isArabic ? 'خصومات فورية بدون تعقيد' : 'Instant Verified Discounts'}
            </span>
            <p>
              {isArabic
                ? 'تخصم النسبة تلقائياً من العربون والمبلغ الإجمالي عند حجز أي ملعب دون الحاجة لإدخال كود.'
                : 'Discounts apply automatically at checkout without needing manual promo codes.'}
            </p>
          </div>
        </div>
        <div className="pt-2 text-xs text-muted-foreground">
          <Link href="/refund" className="text-primary underline font-bold hover:text-primary/80">
            {isArabic ? 'عرض سياسة الاسترجاع والإلغاء الكاملة' : 'View full refund & cancellation terms'}
          </Link>
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
