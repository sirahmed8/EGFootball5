'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Crown, CheckCircle2, Sparkles, Shield, Zap, Award, Clock, Phone, CreditCard, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/useAuthStore';
import { useLocale } from 'next-intl';
import { isUserVip } from '@/lib/vip';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

export default function SubscriptionPage() {
  const locale = useLocale();
  const isArabic = locale === 'ar';
  const firebaseUser = useAuthStore((s) => s.firebaseUser);
  const appUser = useAuthStore((s) => s.appUser);

  const isOwner = appUser?.role === 'owner' || appUser?.role === 'admin';
  const isVip = isUserVip(appUser);

  const [subscribeTier, setSubscribeTier] = React.useState<'pro' | 'vip' | null>(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = React.useState(false);
  const [selectedMethod, setSelectedMethod] = React.useState<'vodafone' | 'instapay' | 'card'>('vodafone');
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (!subscribeTier && !isSuccessModalOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSubscribeTier(null);
        setIsSuccessModalOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [subscribeTier, isSuccessModalOpen]);

  const perks = [
    {
      title: isArabic ? 'خصم 10% تلقائي على جميع الحجوزات' : '10% Off All Booking Fees',
      desc: isArabic ? 'خصم ثابت 10% ينطبق تلقائياً عند حجز أي ملعب على المنصة.' : 'Flat 10% discount applied automatically on all pitch reservations.',
      icon: '⚽',
    },
    {
      title: isArabic ? 'تمديد مهلة القفل المؤقت لـ 20 دقيقة' : '20-Min Deposit Lock Extension',
      desc: isArabic ? 'مهلة حصرية 20 دقيقة (بدلاً من 15 دقيقة) لإتمام التحويل بالفودافون كاش أو إنستا باي.' : 'Extra 5-minute buffer (20 min total) to complete Vodafone Cash / InstaPay transfers.',
      icon: '⏱️',
    },
    {
      title: isArabic ? 'تاج VIP ذهبي للملف الشخصي' : 'Golden VIP Crown Profile Badge',
      desc: isArabic ? 'شارة تاج ذهبية مضيئة تظهر بجانب اسمك في البروفايل، قوائم الصدارة والمباريات العامة.' : 'Shiny VIP Crown badge displayed next to your name on profiles, leaderboards & lobbies.',
      icon: '👑',
    },
    {
      title: isArabic ? 'دخول مجاني لبطولات المجتمع الشهرية' : 'Free Monthly Tournament Cup Pass',
      desc: isArabic ? 'اشتراك مجاني كامل في جميع البطولات والدوريات الرسمية المنظمة بالعبور والقاهرة.' : 'Free registration voucher into monthly community knockout tournament galas.',
      icon: '🏆',
    },
    {
      title: isArabic ? 'تحليل تكتيكي غير محدود مع مدرب AI' : 'Unlimited AI Coach Tactical Insights',
      desc: isArabic ? 'استشارات تكتيكية وتحليل أداء لا محدود بدون مهلة انتظار.' : 'Unlimited real-time tactical & fitness advice without hourly cooldowns.',
      icon: '🤖',
    },
  ];

  const handleActivateVip = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firebaseUser) {
      toast.error(isArabic ? 'يرجى تسجيل الدخول أولاً للاشتراك' : 'Please sign in first to subscribe');
      return;
    }
    setSubmitting(true);
    try {
      const thirtyDays = Date.now() + 30 * 24 * 60 * 60 * 1000;
      await updateDoc(doc(db, 'users', firebaseUser.uid), {
        isVip: true,
        vipExpiry: thirtyDays,
        vipTier: subscribeTier === 'pro' ? 'Pro Pass' : 'Pitch Pass VIP',
      });

      setSubscribeTier(null);
      setIsSuccessModalOpen(true);
    } catch (err) {
      console.error(err);
      toast.error(isArabic ? 'فشل التفعيل. يرجى التواصل مع الدعم.' : 'Activation failed. Please contact support.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black py-10 px-4 md:px-8 max-w-5xl mx-auto space-y-10" dir={isArabic ? 'rtl' : 'ltr'}>
      {/* Header Banner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4 global-box p-8 md:p-12 rounded-3xl border-amber-500/30 shadow-2xl relative overflow-hidden bg-black"
      >
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-black uppercase">
          <Crown className="w-4 h-4 text-amber-400 animate-pulse" /> {isArabic ? 'عضوية اللاعب الممتازة (VIP)' : 'VIP Player Pass'}
        </div>
        <h1 className="text-4xl md:text-6xl font-black text-foreground tracking-tight">
          Pitch Pass <span className="text-gradient-primary">VIP Pass</span>
        </h1>
        <p className="text-sm md:text-base text-muted-foreground max-w-xl mx-auto font-medium">
          {isArabic
            ? 'مزايا حصرية ومصممة خصيصاً للاعبي الخماسي بالعبور والقاهرة. خصومات تلقائية، مهلة حجز إضافية، وتاج VIP ذهبي.'
            : 'Premium, fair perks designed for dedicated 5-a-side players across Obour City and Cairo.'}
        </p>

        {isOwner && (
          <div className="mt-4 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/40 text-amber-400 text-xs font-black max-w-md mx-auto flex items-center justify-center gap-2 shadow-lg">
            <Crown className="w-5 h-5 text-amber-400" />
            <span>{isArabic ? '👑 بصفتك المالِك: جميع مزايا Pitch Pass VIP مفعّلة بحسابك دائماً ومجاناً!' : '👑 Owner VIP Status: All Pitch Pass VIP Features Permanently Unlocked!'}</span>
          </div>
        )}
      </motion.div>

      <div className="max-w-6xl mx-auto w-full grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
        
        {/* Basic Tier */}
        <Card className="global-box border-white/10 rounded-3xl p-6 md:p-8 space-y-6 bg-black/50 flex flex-col justify-between opacity-80 hover:opacity-100 transition-opacity">
          <div className="border-b border-white/10 pb-4">
            <span className="text-xs font-black uppercase text-muted-foreground">{isArabic ? 'لاعب مبتدئ' : 'Basic Player'}</span>
            <h2 className="text-2xl font-black text-foreground">Free Tier</h2>
            <div className="mt-2 text-3xl font-black text-white font-mono">0 EGP</div>
          </div>
          <div className="space-y-3.5 flex-1">
            <div className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /><span className="text-xs text-muted-foreground">Standard 5-a-side bookings</span></div>
            <div className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /><span className="text-xs text-muted-foreground">10-min deposit lock</span></div>
            <div className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /><span className="text-xs text-muted-foreground">1 AI Tactical tip per hour</span></div>
          </div>
          <Button disabled variant="outline" className="w-full mt-4 bg-white/5 border-white/10 rounded-2xl">{isArabic ? 'باقتك الحالية' : 'Current Plan'}</Button>
        </Card>

        {/* Pro Tier */}
        <Card className="global-box border-blue-500/30 rounded-3xl p-6 md:p-8 space-y-6 bg-black flex flex-col justify-between shadow-[0_0_30px_rgba(59,130,246,0.1)] hover:border-blue-500/50 transition-all">
          <div className="border-b border-white/10 pb-4">
            <span className="text-xs font-black uppercase text-blue-400">{isArabic ? 'لاعب محترف' : 'Pro Player'}</span>
            <h2 className="text-2xl font-black text-foreground text-blue-100">Pro Pass</h2>
            <div className="mt-2"><span className="text-3xl font-black text-blue-400 font-mono">199 EGP</span><span className="text-xs text-muted-foreground">/mo</span></div>
          </div>
          <div className="space-y-3.5 flex-1">
            <div className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" /><span className="text-xs text-muted-foreground font-medium">5% Off All Booking Fees</span></div>
            <div className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" /><span className="text-xs text-muted-foreground font-medium">15-Min Deposit Lock Buffer</span></div>
            <div className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" /><span className="text-xs text-muted-foreground font-medium">Blue Pro Profile Badge</span></div>
            <div className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" /><span className="text-xs text-muted-foreground font-medium">Priority Support</span></div>
          </div>
          <Button onClick={() => setSubscribeTier('pro')} className="w-full mt-4 bg-blue-600 text-white hover:bg-blue-500 font-black rounded-2xl glow-primary-sm border-0">{isArabic ? 'ترقية لمحترف' : 'Upgrade to Pro'}</Button>
        </Card>

        {/* VIP Tier */}
        <Card className="global-box border-amber-500/50 rounded-3xl p-6 md:p-8 space-y-6 bg-gradient-to-b from-amber-500/10 to-black flex flex-col justify-between shadow-[0_0_40px_rgba(245,158,11,0.2)] transform md:-translate-y-4">
          <div className="absolute top-0 right-0 p-4 opacity-20"><Crown className="w-24 h-24 text-amber-500 blur-sm" /></div>
          <div className="border-b border-amber-500/20 pb-4 relative z-10">
            <span className="text-xs font-black uppercase text-amber-400 flex items-center gap-1"><Crown className="w-3 h-3"/> {isArabic ? 'لاعب VIP' : 'Elite VIP'}</span>
            <h2 className="text-2xl font-black text-white">Pitch Pass VIP</h2>
            <div className="mt-2"><span className="text-4xl font-black text-amber-400 font-mono drop-shadow-md">399 EGP</span><span className="text-xs text-amber-500/70">/mo</span></div>
          </div>
          <div className="space-y-3.5 flex-1 relative z-10">
            {perks.map((perk, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span className="text-xs text-amber-100/80 font-bold leading-relaxed">{perk.title}</span>
              </div>
            ))}
          </div>
          {isVip ? (
            <div className="p-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-center relative z-10 mt-4">
              <div className="text-emerald-400 font-black text-sm flex items-center justify-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> {appUser?.vipTier || 'Active VIP'}
              </div>
            </div>
          ) : (
            <Button
              onClick={() => setSubscribeTier('vip')}
              size="lg"
              className="w-full mt-4 py-6 text-sm font-black rounded-2xl bg-amber-500 text-black hover:bg-amber-400 cursor-pointer shadow-lg shadow-amber-500/30 relative z-10"
            >
              <Crown className="w-5 h-5 me-2" />
              {isArabic ? 'اشترك VIP الآن' : 'Get Pitch Pass VIP'}
            </Button>
          )}
        </Card>
      </div>

      {/* Subscribe Modal */}
      <AnimatePresence>
        {subscribeTier !== null && (
          <div
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setSubscribeTier(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={`w-full max-w-lg stadium-glass rounded-3xl p-6 md:p-8 space-y-5 bg-black relative shadow-2xl ${subscribeTier === 'pro' ? 'border-blue-500/30' : 'border-amber-500/30'}`}
              dir={isArabic ? 'rtl' : 'ltr'}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h3 className="text-xl font-black text-foreground flex items-center gap-2">
                  {subscribeTier === 'pro' ? (
                    <><Sparkles className="w-5 h-5 text-blue-400" /> {isArabic ? 'تفعيل اشتراك Pro Pass' : 'Activate Pro Pass'}</>
                  ) : (
                    <><Crown className="w-5 h-5 text-amber-400" /> {isArabic ? 'تفعيل اشتراك Pitch Pass VIP' : 'Activate Pitch Pass VIP'}</>
                  )}
                </h3>
                <button onClick={() => setSubscribeTier(null)} className="p-2 rounded-full bg-white/5 hover:bg-white/10 cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className={`p-4 rounded-2xl border space-y-1 ${subscribeTier === 'pro' ? 'bg-blue-500/10 border-blue-500/30' : 'bg-amber-500/10 border-amber-500/30'}`}>
                <div className="flex justify-between items-center font-black text-sm">
                  <span>{subscribeTier === 'pro' ? 'Pro Pass' : 'Pitch Pass VIP'} (30 Days)</span>
                  <span className={`${subscribeTier === 'pro' ? 'text-blue-400' : 'text-amber-400'} font-mono`}>
                    {subscribeTier === 'pro' ? '199 EGP' : '399 EGP'}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {subscribeTier === 'pro'
                    ? (isArabic ? 'يتضمن: خصم 5% على الحجوزات + 15 دقيقة قفل + شارة Pro زرقاء + دعم أولوية.' : 'Includes: 5% Off Bookings + 15-Min Lock Buffer + Blue Pro Badge + Priority Support.')
                    : (isArabic ? 'يتضمن: خصم 10% على الحجوزات + 20 دقيقة قفل + شارة تاج ذهبية + دخول بطولات مجاني + AI بلا حدود.' : 'Includes: 10% Off Bookings + 20-Min Lock Buffer + Golden VIP Badge + Free Tournaments + Unlimited AI Coach.')}
                </p>
              </div>

              <form onSubmit={handleActivateVip} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase">{isArabic ? 'اختر طريقة الدفع' : 'Payment Method'}</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedMethod('vodafone')}
                      className={`p-3 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1 cursor-pointer transition-all ${
                        selectedMethod === 'vodafone' ? 'border-primary bg-primary/10 text-primary' : 'border-white/10 bg-white/5 text-muted-foreground'
                      }`}
                    >
                      <Phone className="w-4 h-4" /> Vodafone Cash
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedMethod('instapay')}
                      className={`p-3 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1 cursor-pointer transition-all ${
                        selectedMethod === 'instapay' ? 'border-primary bg-primary/10 text-primary' : 'border-white/10 bg-white/5 text-muted-foreground'
                      }`}
                    >
                      <Zap className="w-4 h-4" /> InstaPay
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedMethod('card')}
                      className={`p-3 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1 cursor-pointer transition-all ${
                        selectedMethod === 'card' ? 'border-primary bg-primary/10 text-primary' : 'border-white/10 bg-white/5 text-muted-foreground'
                      }`}
                    >
                      <CreditCard className="w-4 h-4" /> Credit Card
                    </button>
                  </div>
                </div>

                {selectedMethod === 'vodafone' && (
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs space-y-1">
                    <span className="text-muted-foreground block">{isArabic ? 'رقم محفظة فودافون كاش لـ EGFootball5:' : 'Vodafone Cash Wallet:'}</span>
                    <span className="font-mono font-black text-emerald-400 text-sm block">01012345678</span>
                  </div>
                )}

                {selectedMethod === 'instapay' && (
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs space-y-1">
                    <span className="text-muted-foreground block">{isArabic ? 'عنوان إنستا باي (IPA):' : 'InstaPay IPA:'}</span>
                    <span className="font-mono font-black text-emerald-400 text-sm block">egfootball5@instapay</span>
                  </div>
                )}

                {selectedMethod === 'card' && (
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs space-y-1">
                    <span className="text-muted-foreground block">{isArabic ? 'بوابة Paymob / الفيزا والماستركارد (بيئة تجريبية جاهزة):' : 'Paymob / Visa & Mastercard Sandbox:'}</span>
                    <span className="font-mono font-black text-amber-400 text-xs block">Ready for API keys — Click Activate for instant sandbox activation</span>
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <Button type="button" variant="outline" onClick={() => setSubscribeTier(null)} className="w-1/2 rounded-2xl">
                    {isArabic ? 'إلغاء' : 'Cancel'}
                  </Button>
                  <Button type="submit" disabled={submitting} className={`w-1/2 text-white font-black rounded-2xl cursor-pointer ${subscribeTier === 'pro' ? 'bg-blue-600 hover:bg-blue-500 glow-primary-sm' : 'bg-amber-500 text-black hover:bg-amber-400 glow-amber'}`}>
                    {submitting ? (isArabic ? 'جاري التفعيل...' : 'Activating...') : (subscribeTier === 'pro' ? (isArabic ? 'تأكيد الترقية للمحترفين ⚡' : 'Confirm Pro Upgrade ⚡') : (isArabic ? 'تأكيد وتفعيل VIP 👑' : 'Confirm & Activate 👑'))}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* VIP Activation Celebration Modal */}
      <AnimatePresence>
        {isSuccessModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-lg flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 20 }}
              className="w-full max-w-lg bg-black border-2 border-amber-500/60 rounded-3xl p-6 md:p-8 space-y-6 text-center relative shadow-[0_0_60px_rgba(245,158,11,0.35)] overflow-hidden"
              dir={isArabic ? 'rtl' : 'ltr'}
            >
              {/* Gold Ambient Glow Background */}
              <div className="absolute -top-20 -left-20 w-64 h-64 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

              <div className="relative space-y-4">
                <div className="w-20 h-20 rounded-3xl bg-amber-500/10 border-2 border-amber-500/40 flex items-center justify-center mx-auto shadow-2xl">
                  <Crown className="w-10 h-10 text-amber-400 animate-bounce" />
                </div>

                <div className="space-y-1">
                  <span className="text-xs font-black uppercase text-amber-400 tracking-widest block">
                    {isArabic ? '👑 تم التفعيل بنجاح!' : '👑 MEMBERSHIP UNLOCKED!'}
                  </span>
                  <h2 className="text-2xl md:text-3xl font-black text-foreground tracking-tight">
                    {isArabic ? 'أهلاً بك في عالم VIP الممتاز! 🎉' : 'Welcome to Pitch Pass VIP Elite! 🎉'}
                  </h2>
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed max-w-md mx-auto font-medium">
                  {isArabic
                    ? 'تهانينا! أصبحت الآن عضواً مميزاً في منصة EGFootball5. تم تفعيل جميع المزايا بحسابك تلقائياً عبر جميع ملاعب العبور والقاهرة.'
                    : 'Congratulations! All VIP perks have been activated on your profile automatically across all partner arenas in Obour & Cairo.'}
                </p>

                <div className="p-4 rounded-2xl bg-white/5 border border-amber-500/30 text-start space-y-2.5 text-xs">
                  <div className="font-extrabold text-amber-400 text-xs border-b border-white/10 pb-2">
                    {isArabic ? '✨ المزايا المفتوحة بحسابك الآن:' : '✨ Unlocked VIP Perks:'}
                  </div>
                  {perks.map((p, i) => (
                    <div key={i} className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span className="font-bold text-foreground text-[11px]">{p.title}</span>
                    </div>
                  ))}
                </div>

                <Button
                  onClick={() => setIsSuccessModalOpen(false)}
                  className="w-full py-6 text-base font-black rounded-2xl bg-amber-500 text-black hover:bg-amber-400 cursor-pointer shadow-lg glow-amber"
                >
                  <Crown className="w-5 h-5 me-2" />
                  {isArabic ? '⚽ ابدأ باللعب كـ VIP الآن' : '⚽ Start Playing Like a VIP'}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
