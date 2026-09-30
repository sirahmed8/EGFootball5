'use client';

import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { ShieldAlert, Shirt, Coffee, Sparkles, Check } from 'lucide-react';

export interface BookingAddonsState {
  referee: boolean;
  bibs: boolean;
  drinks: boolean;
}

interface BookingAddonsProps {
  addons: BookingAddonsState;
  setAddons: React.Dispatch<React.SetStateAction<BookingAddonsState>>;
  isArabic: boolean;
}

export function BookingAddons({ addons, setAddons, isArabic }: BookingAddonsProps) {
  return (
    <Card className="stadium-glass shadow-xl rounded-3xl border-border/40 overflow-hidden">
      <div className="p-4 sm:p-5 border-b border-white/5 bg-white/[0.02]">
        <h3 className="text-base font-black text-foreground flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>{isArabic ? 'إضافات وتجهيزات المباراة' : 'Match Equipment & Addons'}</span>
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          {isArabic
            ? 'حدد التجهيزات الإضافية التي ترغب بتوفيرها في الملعب قبل وصول فريقك'
            : 'Select optional perks to be prepared at the pitch before your match'}
        </p>
      </div>

      <CardContent className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Referee Addon */}
        <div
          role="checkbox"
          aria-checked={addons.referee}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === ' ' || e.key === 'Enter') {
              e.preventDefault();
              setAddons((prev) => ({ ...prev, referee: !prev.referee }));
            }
          }}
          onClick={() => setAddons((prev) => ({ ...prev, referee: !prev.referee }))}
          className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 select-none ${
            addons.referee
              ? 'bg-emerald-500/10 border-emerald-500/40 text-foreground shadow-sm'
              : 'bg-white/[0.02] border-white/5 text-muted-foreground hover:border-white/10'
          }`}
        >
          <div
            className={`w-4 h-4 rounded border mt-0.5 flex items-center justify-center transition-colors shrink-0 ${
              addons.referee
                ? 'bg-emerald-500 border-emerald-500 text-white'
                : 'border-white/20 bg-black/20'
            }`}
          >
            {addons.referee && <Check className="w-3 h-3 stroke-[3]" />}
          </div>
          <div className="space-y-0.5 flex-1 min-w-0">
            <Label
              htmlFor="addon-referee"
              className="text-xs font-black text-foreground flex items-center gap-1.5 cursor-pointer"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>{isArabic ? 'حكم معتمد' : 'Official Referee'}</span>
            </Label>
            <span className="text-[11px] text-emerald-400 font-mono font-bold block">+150 EGP</span>
          </div>
        </div>

        {/* Bibs Addon */}
        <div
          role="checkbox"
          aria-checked={addons.bibs}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === ' ' || e.key === 'Enter') {
              e.preventDefault();
              setAddons((prev) => ({ ...prev, bibs: !prev.bibs }));
            }
          }}
          onClick={() => setAddons((prev) => ({ ...prev, bibs: !prev.bibs }))}
          className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 select-none ${
            addons.bibs
              ? 'bg-emerald-500/10 border-emerald-500/40 text-foreground shadow-sm'
              : 'bg-white/[0.02] border-white/5 text-muted-foreground hover:border-white/10'
          }`}
        >
          <div
            className={`w-4 h-4 rounded border mt-0.5 flex items-center justify-center transition-colors shrink-0 ${
              addons.bibs
                ? 'bg-emerald-500 border-emerald-500 text-white'
                : 'border-white/20 bg-black/20'
            }`}
          >
            {addons.bibs && <Check className="w-3 h-3 stroke-[3]" />}
          </div>
          <div className="space-y-0.5 flex-1 min-w-0">
            <Label
              htmlFor="addon-bibs"
              className="text-xs font-black text-foreground flex items-center gap-1.5 cursor-pointer"
            >
              <Shirt className="w-3.5 h-3.5 text-sky-400 shrink-0" />
              <span>{isArabic ? 'طاقم تيشيرتات/صديري' : 'Team Bibs Set'}</span>
            </Label>
            <span className="text-[11px] text-emerald-400 font-mono font-bold block">+50 EGP</span>
          </div>
        </div>

        {/* Drinks Addon */}
        <div
          role="checkbox"
          aria-checked={addons.drinks}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === ' ' || e.key === 'Enter') {
              e.preventDefault();
              setAddons((prev) => ({ ...prev, drinks: !prev.drinks }));
            }
          }}
          onClick={() => setAddons((prev) => ({ ...prev, drinks: !prev.drinks }))}
          className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 select-none ${
            addons.drinks
              ? 'bg-emerald-500/10 border-emerald-500/40 text-foreground shadow-sm'
              : 'bg-white/[0.02] border-white/5 text-muted-foreground hover:border-white/10'
          }`}
        >
          <div
            className={`w-4 h-4 rounded border mt-0.5 flex items-center justify-center transition-colors shrink-0 ${
              addons.drinks
                ? 'bg-emerald-500 border-emerald-500 text-white'
                : 'border-white/20 bg-black/20'
            }`}
          >
            {addons.drinks && <Check className="w-3 h-3 stroke-[3]" />}
          </div>
          <div className="space-y-0.5 flex-1 min-w-0">
            <Label
              htmlFor="addon-drinks"
              className="text-xs font-black text-foreground flex items-center gap-1.5 cursor-pointer"
            >
              <Coffee className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>{isArabic ? 'مياه معدنية ومشروبات' : 'Water & Hydration Pack'}</span>
            </Label>
            <span className="text-[11px] text-emerald-400 font-mono font-bold block">+100 EGP</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
