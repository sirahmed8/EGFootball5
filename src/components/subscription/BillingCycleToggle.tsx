'use client';

import * as React from 'react';
import { BillingCycle } from '@/types/subscription';

interface BillingCycleToggleProps {
  cycle: BillingCycle;
  onChange: (cycle: BillingCycle) => void;
  isArabic: boolean;
}

export function BillingCycleToggle({ cycle, onChange, isArabic }: BillingCycleToggleProps) {
  return (
    <div className="flex items-center justify-center gap-3">
      <div
        role="radiogroup"
        aria-label={isArabic ? 'دورة الفوترة' : 'Billing Cycle'}
        className="inline-flex p-1.5 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-md relative"
      >
        <button
          type="button"
          role="radio"
          aria-checked={cycle === 'monthly'}
          onClick={() => onChange('monthly')}
          className={`px-5 py-2.5 rounded-xl text-xs md:text-sm font-black transition-all duration-200 cursor-pointer ${
            cycle === 'monthly'
              ? 'bg-foreground text-background shadow-md'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {isArabic ? 'شهرياً' : 'Monthly'}
        </button>

        <button
          type="button"
          role="radio"
          aria-checked={cycle === 'quarterly'}
          onClick={() => onChange('quarterly')}
          className={`px-5 py-2.5 rounded-xl text-xs md:text-sm font-black transition-all duration-200 flex items-center gap-2 cursor-pointer ${
            cycle === 'quarterly'
              ? 'bg-foreground text-background shadow-md'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <span>{isArabic ? '3 أشهر' : '3 Months'}</span>
          <span
            className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
              cycle === 'quarterly'
                ? 'bg-emerald-600 text-white'
                : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
            }`}
          >
            {isArabic ? 'وفر حتى 17%' : 'Save up to 17%'}
          </span>
        </button>
      </div>
    </div>
  );
}
