'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Check, Upload, Smartphone, Zap, CreditCard, Lock, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/useAuthStore';
import { BillingCycle, SUBSCRIPTION_PRICING } from '@/types/subscription';
import { createSubscriptionOrder } from '@/lib/subscription/subscriptionService';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase/config';

interface SubscribeModalProps {
  isOpen: boolean;
  onClose: () => void;
  tier: 'pro' | 'vip';
  cycle: BillingCycle;
  onSuccess: () => void;
  isArabic: boolean;
}

const WALLET_NUMBER = '01012345678';
const INSTAPAY_IPA = 'egfootball5@instapay';

export function SubscribeModal({
  isOpen,
  onClose,
  tier,
  cycle,
  onSuccess,
  isArabic,
}: SubscribeModalProps) {
  const appUser = useAuthStore((s) => s.appUser);
  const [method, setMethod] = React.useState<'vodafone_cash' | 'instapay'>('vodafone_cash');
  const [senderIdentifier, setSenderIdentifier] = React.useState('');
  const [receiptFile, setReceiptFile] = React.useState<File | null>(null);
  const [copiedText, setCopiedText] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const pricing = SUBSCRIPTION_PRICING[tier];
  const isQuarterly = cycle === 'quarterly';
  const amountEgp = isQuarterly ? pricing.quarterlyEgp : pricing.monthlyEgp;
  const durationDays = isQuarterly ? 90 : 30;

  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSubmitting) onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isSubmitting, onClose]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    toast.success(isArabic ? 'تم النسخ إلى الحافظة' : 'Copied to clipboard');
    setTimeout(() => setCopiedText(null), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appUser) {
      toast.error(isArabic ? 'يرجى تسجيل الدخول أولاً' : 'Please sign in first');
      return;
    }

    const trimmedSender = senderIdentifier.trim();
    if (!trimmedSender || trimmedSender.length < 3) {
      toast.error(
        isArabic
          ? 'يرجى إدخال رقم الهاتف أو عنوان إنستا باي المحول منه'
          : 'Please enter the sender phone or InstaPay handle'
      );
      return;
    }

    setIsSubmitting(true);
    try {
      let receiptUrl = '';
      if (receiptFile) {
        const storageRef = ref(storage, `subscriptions/${appUser.uid}/${Date.now()}_receipt.jpg`);
        await uploadBytes(storageRef, receiptFile);
        receiptUrl = await getDownloadURL(storageRef);
      }

      await createSubscriptionOrder(
        {
          tier,
          billingCycle: cycle,
          paymentMethod: method,
          senderPhoneOrIpa: trimmedSender,
          receiptUrl,
          idempotencyKey: `${appUser.uid}_${tier}_${cycle}_${Date.now()}`,
        },
        appUser
      );

      toast.success(
        isArabic
          ? 'تم إرسال طلب الاشتراك بنجاح! سيتم التحقق وتفعيل الباقة فوراً.'
          : 'Subscription request submitted! Will be reviewed and activated shortly.'
      );
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error.message || (isArabic ? 'حدث خطأ أثناء الإرسال' : 'Failed to submit request'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => !isSubmitting && onClose()}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            dir={isArabic ? 'rtl' : 'ltr'}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg rounded-2xl bg-card border border-white/10 p-6 md:p-8 space-y-6 shadow-2xl relative my-8"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h2 className="text-xl font-black text-foreground">
                  {isArabic ? 'تأكيد الاشتراك والدفع' : 'Complete Subscription'}
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {tier === 'vip' ? 'Pitch Pass VIP' : 'Pro Pass'} ({durationDays} {isArabic ? 'يوم' : 'Days'})
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-foreground transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Price Summary Banner */}
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-between">
              <div>
                <span className="text-xs text-muted-foreground block">
                  {isArabic ? 'المبلغ المطلوب تحويله:' : 'Amount to transfer:'}
                </span>
                <span className="text-2xl font-black font-mono text-emerald-400">
                  {amountEgp} {isArabic ? 'ج.م' : 'EGP'}
                </span>
              </div>
              <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {isArabic ? 'سعر نهائي شامل' : 'All-inclusive'}
              </span>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                {isArabic ? 'طريقة الدفع' : 'Payment Method'}
              </label>

              <div className="grid grid-cols-3 gap-2">
                {/* Vodafone Cash */}
                <button
                  type="button"
                  onClick={() => setMethod('vodafone_cash')}
                  className={`p-3 rounded-xl border text-xs font-black flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                    method === 'vodafone_cash'
                      ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                      : 'border-white/10 bg-white/[0.02] text-muted-foreground hover:border-white/20'
                  }`}
                >
                  <Smartphone className="w-4 h-4" />
                  <span>Vodafone Cash</span>
                </button>

                {/* InstaPay */}
                <button
                  type="button"
                  onClick={() => setMethod('instapay')}
                  className={`p-3 rounded-xl border text-xs font-black flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                    method === 'instapay'
                      ? 'border-purple-500 bg-purple-500/10 text-purple-400'
                      : 'border-white/10 bg-white/[0.02] text-muted-foreground hover:border-white/20'
                  }`}
                >
                  <Zap className="w-4 h-4" />
                  <span>InstaPay</span>
                </button>

                {/* Disabled Credit Card - strictly adhering to user instructions */}
                <button
                  type="button"
                  disabled
                  aria-disabled="true"
                  title={isArabic ? 'بوابة الدفع قريباً' : 'Payment Gateway Soon'}
                  className="p-3 rounded-xl border border-white/5 bg-white/[0.01] text-muted-foreground/40 flex flex-col items-center gap-1.5 cursor-not-allowed select-none relative"
                >
                  <CreditCard className="w-4 h-4 opacity-40" />
                  <span className="text-[11px]">{isArabic ? 'بطاقة بنكية' : 'Bank Card'}</span>
                  <span className="text-[9px] font-black px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    {isArabic ? 'قريباً' : 'Soon'}
                  </span>
                </button>
              </div>
            </div>

            {/* Transfer Instructions Box */}
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10 space-y-3">
              <span className="text-xs font-bold text-muted-foreground block">
                {method === 'vodafone_cash'
                  ? (isArabic ? 'حول المبلغ لرقم فودافون كاش التالي:' : 'Transfer to this Vodafone Cash wallet:')
                  : (isArabic ? 'حول المبلغ لعنوان إنستا باي التالي:' : 'Transfer to this InstaPay IPA:')}
              </span>

              <div className="flex items-center justify-between bg-black/40 p-2.5 rounded-lg border border-white/10">
                <span className="font-mono font-black text-sm text-foreground select-all">
                  {method === 'vodafone_cash' ? WALLET_NUMBER : INSTAPAY_IPA}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(method === 'vodafone_cash' ? WALLET_NUMBER : INSTAPAY_IPA)}
                  className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  {copiedText ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span className="ms-1">{copiedText ? (isArabic ? 'تم' : 'Copied') : (isArabic ? 'نسخ' : 'Copy')}</span>
                </Button>
              </div>
            </div>

            {/* Submission Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground">
                  {method === 'vodafone_cash'
                    ? (isArabic ? 'رقم الهاتف المحول منه' : 'Sender Phone Number')
                    : (isArabic ? 'اسم المستخدم أو رقم الحساب في إنستا باي' : 'Sender InstaPay Handle / Phone')}
                  <span className="text-destructive ms-1">*</span>
                </label>
                <Input
                  required
                  placeholder={method === 'vodafone_cash' ? '010XXXXXXXX' : 'username@instapay'}
                  value={senderIdentifier}
                  onChange={(e) => setSenderIdentifier(e.target.value)}
                  className="rounded-xl bg-background/50 border-white/10 text-xs font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground flex items-center justify-between">
                  <span>{isArabic ? 'صورة إيصال التحويل (اختياري)' : 'Transfer Receipt Screenshot (Optional)'}</span>
                  <span className="text-[10px] text-muted-foreground/80">{isArabic ? 'لتسريع المراجعة' : 'For faster review'}</span>
                </label>
                <div className="flex items-center gap-2">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setReceiptFile(e.target.files?.[0] || null)}
                    className="rounded-xl bg-background/50 border-white/10 text-xs file:text-xs file:bg-white/10 file:rounded-lg file:border-0 file:px-3 file:py-1 file:text-foreground file:cursor-pointer"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  disabled={isSubmitting}
                  onClick={onClose}
                  className="w-1/2 rounded-xl py-5 text-xs font-bold border-white/10"
                >
                  {isArabic ? 'إلغاء' : 'Cancel'}
                </Button>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-1/2 rounded-xl py-5 text-xs font-black transition-transform active:scale-[0.98] cursor-pointer ${
                    tier === 'vip'
                      ? 'bg-amber-500 hover:bg-amber-400 text-black'
                      : 'bg-sky-600 hover:bg-sky-500 text-white'
                  }`}
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-1.5">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {isArabic ? 'جاري الإرسال...' : 'Submitting...'}
                    </span>
                  ) : (
                    <span>{isArabic ? 'تأكيد وإرسال الطلب' : 'Submit Verification'}</span>
                  )}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
