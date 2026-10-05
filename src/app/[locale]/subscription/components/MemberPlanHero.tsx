'use client';

import * as React from 'react';
import { Crown, Zap, Clock, Trophy, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SubscriptionBadge } from '@/components/subscription/SubscriptionBadge';
import { SubscriptionTier } from '@/types/subscription';
import { User } from '@/types';

interface MemberPlanHeroProps {
  currentTier: SubscriptionTier;
  appUser: User | null;
  isOwner: boolean;
  isArabic: boolean;
  onUpgradeClick: () => void;
}

export const MemberPlanHero: React.FC<MemberPlanHeroProps> = ({
  currentTier,
  appUser,
  isOwner,
  isArabic,
  onUpgradeClick,
}) => {
  const isVip = currentTier === 'vip' || isOwner;
  const isPro = currentTier === 'pro';

  return (
    <Card className="rounded-3xl border-border bg-card/90 shadow-2xl overflow-hidden backdrop-blur-xl">
      <div className={`p-6 md:p-8 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-6 ${
        isVip ? 'bg-amber-500/10' : isPro ? 'bg-primary/10' : 'bg-muted/40'
      }`}>
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <span className="text-2xl">
              {isVip ? '👑' : isPro ? '⚡' : '⚽'}
            </span>
            <h2 className="text-2xl md:text-3xl font-black text-foreground">
              {isOwner
                ? (isArabic ? 'حساب الإدارة (مزايا VIP دائمة)' : 'Administrator (Permanent VIP)')
                : isVip
                ? (isArabic ? 'عضوية Pitch Pass VIP' : 'Pitch Pass VIP Membership')
                : isPro
                ? (isArabic ? 'عضوية Pitch Pass Pro' : 'Pitch Pass Pro Membership')
                : (isArabic ? 'عضوية اللاعب العادية (مجانية)' : 'Standard Free Player Pass')}
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground font-medium">
            {isVip
              ? (isArabic ? 'تتمتع بأعلى تصنيف وخصومات حصرية على جميع الملاعب وحجوزات الخماسي.' : 'Active elite tier with highest booking discounts and priority access across all pitches.')
              : isPro
              ? (isArabic ? 'مزايا خصومات منتظمة ومهلة دفع ممتدة مع كل حجز.' : 'Regular booking discounts and extended deposit buffer active on your account.')
              : (isArabic ? 'يمكنك الترقية للاستفادة من خصومات فورية ومهلة حجز مضاعفة للتحويل عبر انستاباي/فودافون كاش.' : 'Upgrade to unlock instant booking savings and double reservation lock buffers.')}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 shrink-0">
          <div className="px-4 py-2 rounded-2xl bg-background border border-border flex items-center gap-2 shadow-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-black text-foreground">
              {isOwner
                ? (isArabic ? 'نشط دائماً' : 'Forever Active')
                : currentTier !== 'free'
                ? (isArabic ? 'اشتراك نشط' : 'Active Pass')
                : (isArabic ? 'حساب نشط' : 'Active Account')}
            </span>
          </div>

          {!isVip && (
            <Button
              onClick={onUpgradeClick}
              className="bg-primary text-black font-black hover:bg-primary/90 rounded-2xl glow-primary px-6 py-2.5 text-xs sm:text-sm cursor-pointer shadow-lg"
            >
              <span>{isPro ? (isArabic ? 'ترقية إلى VIP' : 'Upgrade to VIP') : (isArabic ? 'ترقية العضوية' : 'Upgrade Pass')}</span>
              <ArrowRight className="w-4 h-4 ms-1.5" />
            </Button>
          )}
        </div>
      </div>

      <CardContent className="p-6 md:p-8 space-y-6">
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
          {isArabic ? 'مزايا الحجز المطبقة على حسابك حالياً:' : 'Active Booking Privileges on Your Account:'}
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-background border border-border space-y-1.5 shadow-sm">
            <div className="flex items-center gap-2 text-primary font-black text-sm">
              <Zap className="w-4 h-4 text-primary" />
              <span>{isArabic ? 'خصم الحجز المباشر' : 'Pitch Booking Discount'}</span>
            </div>
            <p className="text-xl font-black text-foreground font-mono">
              {isVip ? '15% OFF' : isPro ? '10% OFF' : '0% (Standard)'}
            </p>
            <p className="text-[11px] text-muted-foreground">
              {isArabic ? 'يطبق تلقائياً عند تأكيد الحجز' : 'Auto-deducted at pitch checkout'}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-background border border-border space-y-1.5 shadow-sm">
            <div className="flex items-center gap-2 text-amber-400 font-black text-sm">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>{isArabic ? 'مهلة قفل الحجز للدفع' : 'Payment Hold Window'}</span>
            </div>
            <p className="text-xl font-black text-foreground font-mono">
              {isVip ? (isArabic ? '25 دقيقة' : '25 Minutes') : isPro ? (isArabic ? '20 دقيقة' : '20 Minutes') : (isArabic ? '15 دقيقة' : '15 Minutes')}
            </p>
            <p className="text-[11px] text-muted-foreground">
              {isArabic ? 'مهلة تحويل العربون دون إلغاء الحصة' : 'Buffer to send Instapay / Cash receipt'}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-background border border-border space-y-1.5 shadow-sm">
            <div className="flex items-center gap-2 text-emerald-400 font-black text-sm">
              <Trophy className="w-4 h-4 text-emerald-400" />
              <span>{isArabic ? 'دخول البطولات والشارة' : 'Tournaments & Badge'}</span>
            </div>
            <p className="text-base font-black text-foreground">
              {isVip ? (isArabic ? 'تذكرة بطولة شهرية مجانية 🎟️' : 'Monthly Free Entry 🎟️') : isPro ? (isArabic ? 'خصم 50% على البطولات' : '50% Off Tournaments') : (isArabic ? 'تسجيل بالرسوم العادية' : 'Standard Tournament Fee')}
            </p>
            <p className="text-[11px] text-muted-foreground">
              {isVip ? (isArabic ? 'شارة VIP ذهبية في التحديات' : 'Golden VIP badge in lobby') : (isArabic ? 'أولوية في قوائم الانتظار' : 'Priority matchmaking')}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
