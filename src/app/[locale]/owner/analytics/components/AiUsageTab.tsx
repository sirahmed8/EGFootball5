'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Bot, Zap, DollarSign } from 'lucide-react';

interface AiUsageTabProps {
  isArabic: boolean;
  totalAiRequests: number;
  totalAiTokens: number;
  estimatedAiCost: number;
  fmt: (n: number) => string;
}

export function AiUsageTab({
  isArabic,
  totalAiRequests,
  totalAiTokens,
  estimatedAiCost,
  fmt,
}: AiUsageTabProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <Card className="stadium-glass border-violet-500/30 rounded-3xl p-6 bg-black space-y-2">
          <div className="flex justify-between items-center text-muted-foreground text-xs font-extrabold uppercase">
            <span>{isArabic ? 'طلبات AI (كوتشينج)' : 'AI Coach Requests'}</span>
            <Bot className="w-5 h-5 text-violet-400" />
          </div>
          <p className="text-3xl font-black text-violet-400 font-mono">{fmt(totalAiRequests)}</p>
          <p className="text-[10px] text-muted-foreground">
            {isArabic ? 'إجمالي المحادثات مع الكوتش' : 'Total AI coaching sessions'}
          </p>
        </Card>
        <Card className="stadium-glass border-blue-500/30 rounded-3xl p-6 bg-black space-y-2">
          <div className="flex justify-between items-center text-muted-foreground text-xs font-extrabold uppercase">
            <span>{isArabic ? 'إجمالي الـ Tokens المستخدمة' : 'Total Tokens Consumed'}</span>
            <Zap className="w-5 h-5 text-blue-400" />
          </div>
          <p className="text-3xl font-black text-blue-400 font-mono">{fmt(totalAiTokens)}</p>
          <p className="text-[10px] text-muted-foreground">
            {isArabic ? 'تقريبي بناءً على سجلات الطلبات' : 'Approximate from logged requests'}
          </p>
        </Card>
        <Card className="stadium-glass border-rose-500/30 rounded-3xl p-6 bg-black space-y-2">
          <div className="flex justify-between items-center text-muted-foreground text-xs font-extrabold uppercase">
            <span>{isArabic ? 'التكلفة التقديرية للـ API' : 'Estimated API Cost'}</span>
            <DollarSign className="w-5 h-5 text-rose-400" />
          </div>
          <p className="text-3xl font-black text-rose-400 font-mono">${estimatedAiCost.toFixed(4)}</p>
          <p className="text-[10px] text-muted-foreground">≈ $0.002 / 1k tokens</p>
        </Card>
      </div>
    </div>
  );
}
