'use client';

import * as React from 'react';
import { Smartphone, Zap, CreditCard, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const WALLET_NUMBER = '01012345678';
export const INSTAPAY_IPA = 'egfootball5@instapay';

interface SubscribePaymentDetailsProps {
  method: 'vodafone_cash' | 'instapay';
  setMethod: (m: 'vodafone_cash' | 'instapay') => void;
  amountEgp: number;
  isArabic: boolean;
  copyToClipboard: (text: string) => void;
  copiedText: string | null;
  onOpenPriorityAccess?: () => void;
}

export function SubscribePaymentDetails({
  method,
  setMethod,
  amountEgp,
  isArabic,
  copyToClipboard,
  copiedText,
  onOpenPriorityAccess,
}: SubscribePaymentDetailsProps) {
  return (
    <div className="space-y-4">
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

          {/* Clickable Credit Card Priority Access */}
          <button
            type="button"
            onClick={() => onOpenPriorityAccess?.()}
            title={isArabic ? 'انقر للتسجيل في قائمة الأولوية' : 'Click to join Priority Access'}
            className="p-3 rounded-xl border border-amber-500/30 bg-amber-500/[0.05] hover:bg-amber-500/[0.1] text-amber-300 flex flex-col items-center gap-1.5 cursor-pointer transition-all active:scale-[0.98] relative"
          >
            <CreditCard className="w-4 h-4 text-amber-400" />
            <span className="text-[11px] font-bold">{isArabic ? 'فيزا / كارت' : 'Card'}</span>
            <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
              {isArabic ? 'قريباً • سجل' : 'Priority'}
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
    </div>
  );
}
