'use client';

import * as React from 'react';
import { MessageSquare } from 'lucide-react';
import { useTranslations } from 'next-intl';

export function WhatsAppSupportButton() {

  const t = useTranslations('Support');
  const whatsappNumber = '201000000000';
  const textMsg = encodeURIComponent(t('whatsappText'));

  return (
    <a
      href={`https://wa.me/${whatsappNumber}?text=${textMsg}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 start-6 z-40 flex items-center gap-2 px-4 py-3 rounded-full bg-emerald-500 text-black font-extrabold text-sm shadow-[0_0_25px_rgba(16,185,129,0.5)] hover:scale-105 transition-all group"
      aria-label={t('whatsappButton')}
    >
      <MessageSquare className="w-5 h-5 fill-black group-hover:animate-bounce" />
      <span className="hidden sm:inline">
        {t('whatsappButton')}
      </span>
    </a>
  );
}
