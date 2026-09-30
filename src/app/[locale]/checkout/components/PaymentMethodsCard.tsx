'use client';

import React, { useState } from 'react';
import { ShieldCheck, Copy, Check, ExternalLink } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

interface PaymentMethodsCardProps {
  vodafoneNum: string;
  instapayAddress: string;
}

export function PaymentMethodsCard({ vodafoneNum, instapayAddress }: PaymentMethodsCardProps) {
  const t = useTranslations('Checkout');
  const [copiedVodafone, setCopiedVodafone] = useState(false);
  const [copiedInstapay, setCopiedInstapay] = useState(false);

  const copyToClipboard = (text: string, type: 'vodafone' | 'instapay') => {
    navigator.clipboard.writeText(text);
    if (type === 'vodafone') {
      setCopiedVodafone(true);
      setTimeout(() => setCopiedVodafone(false), 2000);
    } else {
      setCopiedInstapay(true);
      setTimeout(() => setCopiedInstapay(false), 2000);
    }
    toast.success(t('copiedText', { text }));
  };

  return (
    <div className="bg-muted/30 p-5 rounded-2xl border border-border space-y-4">
      <h3 className="text-foreground font-extrabold flex items-center justify-between text-sm">
        <span className="flex items-center gap-2">
          <span>💰</span> {t('paymentDetails')}
        </span>
        <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5" />
          {t('secureTransfer')}
        </span>
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Vodafone Cash */}
        <div className="p-4 bg-background/70 border border-border rounded-2xl text-xs space-y-2">
          <span className="text-muted-foreground block font-bold">Vodafone Cash (فودافون كاش)</span>
          <div className="flex items-center justify-between">
            <strong className="text-foreground text-base font-mono font-black" dir="ltr">
              {vodafoneNum}
            </strong>
            <button
              onClick={() => copyToClipboard(vodafoneNum, 'vodafone')}
              className="p-2 rounded-xl bg-muted/60 hover:bg-emerald-500/20 text-muted-foreground hover:text-emerald-400 transition-colors cursor-pointer"
              title="Copy Number"
            >
              {copiedVodafone ? (
                <Check className="w-4 h-4 text-emerald-400" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* InstaPay */}
        <div className="p-4 bg-background/70 border border-border rounded-2xl text-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground block font-bold">InstaPay (إنستا باي)</span>
            <a
              href="instapay://"
              target="_blank"
              rel="noreferrer"
              className="text-[10px] text-primary hover:underline flex items-center gap-0.5 font-bold"
            >
              <span>{t('openApp')}</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
          </div>
          <div className="flex items-center justify-between">
            <strong className="text-foreground text-xs font-mono font-bold truncate" dir="ltr">
              {instapayAddress}
            </strong>
            <button
              onClick={() => copyToClipboard(instapayAddress, 'instapay')}
              className="p-2 rounded-xl bg-muted/60 hover:bg-emerald-500/20 text-muted-foreground hover:text-emerald-400 transition-colors cursor-pointer shrink-0 ms-1"
              title="Copy Address"
            >
              {copiedInstapay ? (
                <Check className="w-4 h-4 text-emerald-400" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
