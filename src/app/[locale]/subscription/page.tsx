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

  const [isSubscribeModalOpen, setIsSubscribeModalOpen] = React.useState(false);
  const [selectedMethod, setSelectedMethod] = React.useState<'vodafone' | 'instapay' | 'card'>('vodafone');
  const [submitting, setSubmitting] = React.useState(false);

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
        vipTier: 'Pitch Pass VIP',
      });

      toast.success(isArabic ? 'تهانينا! تم تفعيل اشتراك Pitch Pass VIP بنجاح! 👑' : 'Congratulations! Pitch Pass VIP subscription activated! 👑');
      setIsSubscribeModalOpen(false);
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


      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
        {/* 3D Animated VIP Pass Card */}
        <motion.div
          initial={{ rotateY: -10, rotateX: 5 }}
          whileHover={{ rotateY: 0, rotateX: 0, scale: 1.02 }}
          className="global-box border-2 border-amber-500/50 rounded-3xl p-6 md:p-8 shadow-2xl space-y-6 relative overflow-hidden bg-black glow-primary-sm flex flex-col justify-between"
        >
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-black tracking-widest text-amber-400 uppercase">EGFootball5 VIP Pass</span>
              <h3 className="text-2xl font-black text-foreground mt-1">PITCH PASS VIP ELITE</h3>
            </div>
            <Sparkles className="w-8 h-8 text-amber-400 animate-pulse" />
          </div>

          <div className="space-y-2 my-4">
            <div className="text-xs font-mono text-amber-400/60">{isArabic ? 'حالة العضوية الحالية' : 'CURRENT MEMBERSHIP STATUS'}</div>
            <div className="text-lg md:text-xl font-black font-mono tracking-widest text-amber-400 flex items-center gap-2">
              {isVip ? (
                <>
                  <Crown className="w-5 h-5 text-amber-400" />
                  <span>{isArabic ? 'عضوية VIP مفعلة ⚡' : 'ACTIVE VIP PASS ⚡'}</span>
                </>
              ) : (
                <span className="text-muted-foreground">{isArabic ? 'الخطة المجانية (FREE STARTER)' : 'FREE STARTER PLAN'}</span>
              )}
            </div>
          </div>

          <div className="flex justify-between items-end border-t border-amber-500/20 pt-4">
            <div>
              <span className="text-[10px] text-muted-foreground uppercase font-bold block">{isArabic ? 'صاحب الحساب' : 'Cardholder'}</span>
              <span className="text-xs font-black text-amber-400">{appUser?.name || firebaseUser?.displayName || (isArabic ? 'لاعب كيك أوف' : 'Player')}</span>
            </div>
            <div className="text-end">
              <span className="text-[10px] text-muted-foreground uppercase font-bold block">{isArabic ? 'الصلاحية' : 'Valid Across'}</span>
              <span className="text-xs font-bold text-foreground">{isArabic ? 'جميع ملاعب العبور والقاهرة' : 'All Partner Arenas'}</span>
            </div>
          </div>
        </motion.div>

        {/* Subscription Plan & Perks */}
        <Card className="global-box border-amber-500/30 rounded-3xl p-6 md:p-8 shadow-2xl space-y-6 bg-black flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <span className="text-xs font-black uppercase text-amber-400">{isArabic ? 'الاشتراك الشهري الممتاز' : 'Monthly VIP Pass'}</span>
              <h2 className="text-2xl font-black text-foreground">Pitch Pass VIP</h2>
            </div>
            <div className="text-end">
              <span className="text-3xl font-black text-amber-400 font-mono">399 EGP</span>
              <span className="text-xs text-muted-foreground block font-bold">{isArabic ? '/ شهرياً' : '/ month'}</span>
            </div>
          </div>


          <div className="space-y-3.5">
            {perks.map((perk, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <span className="text-lg shrink-0">{perk.icon}</span>
                <div>
                  <h4 className="text-xs font-black text-foreground">{perk.title}</h4>
                  <p className="text-[11px] text-muted-foreground font-medium leading-relaxed">{perk.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {isVip ? (
            <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-center space-y-1 mt-4">
              <div className="text-emerald-400 font-black text-sm flex items-center justify-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> {isArabic ? 'أنت مشترك بالفعل في Pitch Pass VIP!' : 'You are currently a Pitch Pass VIP member!'}
              </div>
              <p className="text-xs text-muted-foreground">
                {isArabic ? 'جميع المزايا مفعّلة بحسابك تلقائياً.' : 'All VIP perks are active on your account automatically.'}
              </p>
            </div>
          ) : (
            <Button
              onClick={() => {
                if (!firebaseUser) {
                  toast.error(isArabic ? 'يرجى تسجيل الدخول أولاً للاشتراك' : 'Please sign in first to subscribe');
                  return;
                }
                setIsSubscribeModalOpen(true);
              }}
              size="lg"
              className="w-full py-6 text-base font-black rounded-2xl bg-amber-500 text-black hover:bg-amber-400 cursor-pointer shadow-lg glow-amber mt-4"
            >
              <Crown className="w-5 h-5 me-2" />
              {isArabic ? 'اشترك الآن بـ (399 ج.م / شهر)' : 'Subscribe Now (399 EGP / mo)'}
            </Button>
          )}
        </Card>
      </div>

      {/* Subscribe Modal */}
      <AnimatePresence>
        {isSubscribeModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-lg stadium-glass border-amber-500/30 rounded-3xl p-6 md:p-8 space-y-5 bg-black relative shadow-2xl"
              dir={isArabic ? 'rtl' : 'ltr'}
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h3 className="text-xl font-black text-foreground flex items-center gap-2">
                  <Crown className="w-5 h-5 text-amber-400" /> {isArabic ? 'تفعيل اشتراك Pitch Pass VIP' : 'Activate Pitch Pass VIP'}
                </h3>
                <button onClick={() => setIsSubscribeModalOpen(false)} className="p-2 rounded-full bg-white/5 hover:bg-white/10 cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-1">
                <div className="flex justify-between items-center font-black text-sm">
                  <span>Pitch Pass VIP (30 Days)</span>
                  <span className="text-amber-400 font-mono">399 EGP</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {isArabic ? 'يتضمن: خصم 10% على الحجوزات + 20 دقيقة قفل + شارة تاج ذهبية + دخول بطولات مجاني + AI بلا حدود.' : 'Includes: 10% Off Bookings + 20-Min Lock Buffer + Golden VIP Badge + Free Tournaments + Unlimited AI Coach.'}
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
                  <Button type="button" variant="outline" onClick={() => setIsSubscribeModalOpen(false)} className="w-1/2 rounded-2xl">
                    {isArabic ? 'إلغاء' : 'Cancel'}
                  </Button>
                  <Button type="submit" disabled={submitting} className="w-1/2 bg-amber-500 text-black font-black rounded-2xl glow-amber cursor-pointer">
                    {submitting ? (isArabic ? 'جاري التفعيل...' : 'Activating...') : (isArabic ? 'تأكيد وتفعيل VIP 👑' : 'Confirm & Activate 👑')}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
