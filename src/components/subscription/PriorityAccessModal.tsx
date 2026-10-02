'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bell, CheckCircle2, Sparkles, Loader2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { joinPriorityAccess } from '@/lib/subscription/priorityAccessService';
import { useAuthStore } from '@/store/useAuthStore';

interface PriorityAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  tier: 'pro' | 'vip';
  cycle: 'monthly' | 'annual' | 'quarterly';
  isArabic: boolean;
}

export function PriorityAccessModal({
  isOpen,
  onClose,
  tier,
  cycle,
  isArabic,
}: PriorityAccessModalProps) {
  const appUser = useAuthStore((s) => s.appUser);
  const [email, setEmail] = React.useState(appUser?.email || '');
  const [name, setName] = React.useState(appUser?.name || '');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);

  React.useEffect(() => {
    if (appUser?.email) setEmail(appUser.email);
    if (appUser?.name) setName(appUser.name);
  }, [appUser]);

  React.useEffect(() => {
    if (!isOpen) {
      setIsSuccess(false);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      toast.error(isArabic ? 'يرجى إدخال بريد إلكتروني صحيح' : 'Please enter a valid email');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await joinPriorityAccess({
        email: email.trim(),
        name: name.trim() || undefined,
        tier,
        cycle,
      });

      if (res.success) {
        setIsSuccess(true);
        toast.success(
          isArabic
            ? 'تم تسجيلك بنجاح في قائمة الوصول المبكر!'
            : 'You have been registered for priority access!'
        );
      }
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error.message || 'Failed to join');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
        dir={isArabic ? 'rtl' : 'ltr'}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-md p-6 rounded-3xl bg-card border border-white/10 shadow-2xl text-foreground"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 end-4 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          {!isSuccess ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-foreground">
                    {isArabic ? 'الدفع الإلكتروني المباشر قريباً' : 'Direct Card Checkout Coming Soon'}
                  </h3>
                  <p className="text-xs text-muted-foreground font-medium">
                    {isArabic ? 'انضم لأولوية الوصول والتفعيل الفوري' : 'Join the priority early access list'}
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 text-xs text-muted-foreground leading-relaxed">
                {isArabic ? (
                  <>
                    بوابات الدفع بالفيزا والماستركارد قيد التدقيق النهائي. يمكنك الدفع حالياً عبر{' '}
                    <strong className="text-foreground">فودافون كاش وإنستاباي</strong>، أو تسجيل
                    بريدك هنا لتصلك دعوة فورية وإشعار إطلاق الدفع التلقائي.
                  </>
                ) : (
                  <>
                    Direct Visa/Mastercard checkout is in final review. You can currently subscribe via{' '}
                    <strong className="text-foreground">Vodafone Cash & InstaPay</strong>, or leave your
                    email below to receive instant launch notification.
                  </>
                )}
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground/80">
                    {isArabic ? 'الاسم' : 'Name'}
                  </label>
                  <Input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={isArabic ? 'كابتن الفريق' : 'Team Captain'}
                    className="bg-black/30 border-white/10 rounded-xl text-xs py-2.5"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground/80">
                    {isArabic ? 'البريد الإلكتروني' : 'Email Address'} *
                  </label>
                  <Input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="captain@example.com"
                    className="bg-black/30 border-white/10 rounded-xl text-xs py-2.5"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-5 rounded-xl font-black text-xs bg-amber-500 hover:bg-amber-400 text-black cursor-pointer shadow-lg shadow-amber-500/20 active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Bell className="w-4 h-4" />
                    <span>{isArabic ? 'تسجيل في قائمة الأولوية' : 'Join Priority Access'}</span>
                  </>
                )}
              </Button>
            </form>
          ) : (
            <div className="text-center py-6 space-y-4">
              <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-xl font-black text-foreground">
                  {isArabic ? 'أهلاً بك في قائمة الأولوية!' : 'You Are on the Priority List!'}
                </h3>
                <p className="text-xs text-muted-foreground max-w-xs mx-auto leading-relaxed">
                  {isArabic
                    ? 'سنرسل لك إشعاراً حصرياً فور تفعيل بوابات الدفع الإلكتروني المباشرة مع هدية ترحيبية.'
                    : 'We will notify you the moment online card payments launch, along with an exclusive bonus.'}
                </p>
              </div>
              <Button
                onClick={onClose}
                className="w-full py-4 rounded-xl font-bold text-xs bg-white/10 hover:bg-white/20 text-foreground cursor-pointer"
              >
                {isArabic ? 'إغلاق' : 'Close'}
              </Button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
