'use client';

import * as React from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

interface ReceiptLightboxModalProps {
  receiptUrl: string | null;
  onClose: () => void;
}

export function ReceiptLightboxModal({ receiptUrl, onClose }: ReceiptLightboxModalProps) {
  React.useEffect(() => {
    if (!receiptUrl) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [receiptUrl, onClose]);

  if (!receiptUrl) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-in fade-in duration-200 cursor-zoom-out"
      onClick={onClose}
    >
      <div className="relative max-w-3xl max-h-[85vh] w-full flex flex-col justify-center items-center">
        <Image
          src={receiptUrl}
          alt="Receipt Zoom"
          width={800}
          height={600}
          unoptimized
          className="object-contain rounded-lg max-h-[75vh] max-w-full shadow-2xl border border-white/10"
          onClick={(e) => e.stopPropagation()}
        />
        <Button
          className="mt-6 bg-primary text-black font-extrabold hover:bg-primary/90 rounded-full px-8 py-2 h-auto cursor-pointer"
          onClick={onClose}
        >
          Close
        </Button>
      </div>
    </div>
  );
}
