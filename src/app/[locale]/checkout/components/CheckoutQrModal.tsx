'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { QrCode, Download } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { DynamicMatchQrCode } from './DynamicMatchQrCode';

interface CheckoutQrModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId: string;
}

export function CheckoutQrModal({ isOpen, onClose, bookingId }: CheckoutQrModalProps) {
  const t = useTranslations('Checkout');

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-card border border-border p-6 rounded-3xl max-w-sm w-full text-center space-y-4 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center text-primary mx-auto">
          <QrCode className="w-8 h-8 text-primary" />
        </div>

        <h3 className="text-xl font-black text-foreground">{t('digitalPassTitle')}</h3>

        <div className="p-4 rounded-2xl bg-background border border-border space-y-3">
          <DynamicMatchQrCode value={bookingId} />
          <p className="font-bold text-xs font-mono text-primary pt-1">
            MATCH PASS ID: #{bookingId.toUpperCase().slice(0, 10)}
          </p>
        </div>

        <p className="text-xs text-muted-foreground font-medium">
          {t('printPassInstructions')}
        </p>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => window.print()}
            className="flex-1 border-border rounded-xl text-xs font-bold flex items-center justify-center gap-1 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{t('printPass')}</span>
          </Button>
          <Button
            onClick={onClose}
            className="flex-1 bg-primary text-black font-bold rounded-xl text-xs cursor-pointer"
          >
            {t('close')}
          </Button>
        </div>
      </div>
    </div>
  );
}
