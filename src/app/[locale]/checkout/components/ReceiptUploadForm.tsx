'use client';

import React from 'react';
import Image from 'next/image';
import { Link } from '@/i18n/routing';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface ReceiptUploadFormProps {
  file: File | null;
  setFile: (f: File | null) => void;
  previewUrl: string | null;
  setPreviewUrl: (url: string | null) => void;
  uploading: boolean;
  progress: number;
  agreedToSlotPolicy: boolean;
  setAgreedToSlotPolicy: (agreed: boolean) => void;
  onUpload: () => void;
}

export function ReceiptUploadForm({
  file,
  setFile,
  previewUrl,
  setPreviewUrl,
  uploading,
  progress,
  agreedToSlotPolicy,
  setAgreedToSlotPolicy,
  onUpload,
}: ReceiptUploadFormProps) {
  const t = useTranslations('Checkout');
  const tForm = useTranslations('FormConsent');

  return (
    <div className="space-y-6">
      {/* File Upload Box */}
      <div className="space-y-3">
        <label className="block text-foreground font-extrabold text-sm flex items-center gap-1.5">
          <FileText className="w-4 h-4 text-primary" /> {t('uploadLabel')}
        </label>

        <div className="flex flex-col gap-4">
          <input
            type="file"
            accept="image/*,.pdf"
            onChange={(e) => {
              const selected = e.target.files?.[0] || null;
              setFile(selected);
              if (selected && selected.type.startsWith('image/')) {
                setPreviewUrl(URL.createObjectURL(selected));
              } else {
                setPreviewUrl(null);
              }
            }}
            disabled={uploading}
            className="w-full text-foreground file:me-4 file:py-2.5 file:px-5 file:rounded-2xl file:border-0 file:text-xs file:font-black file:bg-primary file:text-black hover:file:bg-primary/90 cursor-pointer border border-dashed border-border p-4 rounded-3xl hover:border-primary/50 transition-colors bg-background/20"
          />

          {previewUrl && (
            <div className="border border-border rounded-2xl p-3 bg-background/40 max-w-xs mx-auto text-center space-y-2">
              <p className="text-xs text-muted-foreground font-bold">{t('receiptPreview')}</p>
              <div className="aspect-[3/4] relative w-full h-60 rounded-xl overflow-hidden border border-border">
                <Image src={previewUrl} alt="Receipt Preview" fill className="object-cover" />
              </div>
            </div>
          )}
        </div>

        {uploading && (
          <div className="space-y-1.5 pt-2">
            <div className="flex justify-between text-xs text-muted-foreground font-bold">
              <span>{t('uploadingReceipt')}</span>
              <span className="font-mono">{progress.toFixed(0)}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-primary h-2.5 rounded-full transition-all duration-300 shadow-[0_0_10px_rgba(57,255,20,0.5)]"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Consent & Submit Button */}
      <div className="flex flex-col gap-4 pt-2">
        <div className="w-full flex items-start gap-3 p-3.5 rounded-xl bg-white/5 border border-white/10 text-xs text-muted-foreground leading-relaxed">
          <input
            type="checkbox"
            id="slot-hold-consent"
            checked={agreedToSlotPolicy}
            onChange={(e) => setAgreedToSlotPolicy(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded accent-primary cursor-pointer shrink-0"
          />
          <label htmlFor="slot-hold-consent" className="cursor-pointer select-none">
            <span>{tForm('slotHoldNotice')} </span>
            <Link
              href="/refund"
              target="_blank"
              className="text-primary underline hover:text-primary/80 ltr:ml-1 rtl:mr-1 font-semibold"
            >
              (Refund Policy)
            </Link>
          </label>
        </div>

        <Button
          className="w-full bg-primary text-black font-black hover:bg-primary/90 shadow-lg text-lg h-14 rounded-xl transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={onUpload}
          disabled={!file || uploading || !agreedToSlotPolicy}
        >
          {uploading ? t('uploading') : t('submitBtn')}
        </Button>
      </div>
    </div>
  );
}
