'use client';

import * as React from 'react';
import { useRouter } from '@/i18n/routing';
import { Button } from '@/components/ui/button';
import { Bot } from 'lucide-react';

interface AIChatAuthRequiredProps {
  isArabic: boolean;
  onClose: () => void;
}

export function AIChatAuthRequired({ isArabic, onClose }: AIChatAuthRequiredProps) {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-6 space-y-4 my-auto bg-muted/20 rounded-3xl border border-border/40">
      <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-md">
        <Bot className="w-8 h-8" />
      </div>
      <div className="space-y-2 max-w-xs">
        <h3 className="text-xl font-black text-foreground">
          {isArabic ? 'تسجيل الدخول مطلوب' : 'Sign In Required'}
        </h3>
        <p className="text-xs text-muted-foreground leading-relaxed font-medium">
          {isArabic
            ? 'يرجى تسجيل الدخول لاستخدام مساعد EGFootball5 الذكي لحجز الملاعب والبحث التلقائي والإرشادات.'
            : 'Please sign in to unlock AI-powered pitch search, booking assistance, and tactical advice.'}
        </p>
      </div>
      <Button
        onClick={() => {
          onClose();
          router.push('/login');
        }}
        className="bg-emerald-500 hover:bg-emerald-400 text-black font-black rounded-2xl px-6 py-5 w-full text-xs cursor-pointer shadow-lg shadow-emerald-500/20"
      >
        {isArabic ? 'تسجيل الدخول / إنشاء حساب' : 'Sign In / Register'}
      </Button>
    </div>
  );
}
