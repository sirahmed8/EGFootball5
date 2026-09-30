'use client';

import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tag, Check, X } from 'lucide-react';

interface BookingPromoCodeProps {
  promoInput: string;
  setPromoInput: (val: string) => void;
  appliedDiscount: number;
  onApply: () => void;
  onRemove: () => void;
  isArabic: boolean;
}

export function BookingPromoCode({
  promoInput,
  setPromoInput,
  appliedDiscount,
  onApply,
  onRemove,
  isArabic,
}: BookingPromoCodeProps) {
  return (
    <Card className="stadium-glass shadow-xl rounded-3xl border-border/40 overflow-hidden">
      <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <Tag className="w-4 h-4 text-primary shrink-0" />
          <span className="text-xs font-black text-foreground whitespace-nowrap">
            {isArabic ? 'كوبون الخصم:' : 'Promo Code:'}
          </span>
        </div>

        {appliedDiscount > 0 ? (
          <div className="flex items-center justify-between w-full sm:w-auto gap-2 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-xl">
            <span className="text-xs font-black text-emerald-400 flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5" />
              {isArabic
                ? `تم تفعيل خصم ${Math.round(appliedDiscount * 100)}%`
                : `${Math.round(appliedDiscount * 100)}% Discount Applied`}
            </span>
            <button
              type="button"
              onClick={onRemove}
              className="p-1 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
              title={isArabic ? 'إزالة الكوبون' : 'Remove promo code'}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              onApply();
            }}
            className="flex items-center gap-2 w-full sm:w-auto"
          >
            <Input
              type="text"
              placeholder={isArabic ? 'مثال: KICKOFF10' : 'e.g. KICKOFF10'}
              value={promoInput}
              onChange={(e) => setPromoInput(e.target.value)}
              className="h-9 w-full sm:w-44 text-xs font-mono font-bold uppercase rounded-xl bg-background/50 border-white/10"
            />
            <Button
              type="submit"
              size="sm"
              className="h-9 px-4 rounded-xl text-xs font-black bg-primary text-black hover:bg-primary/90 cursor-pointer shadow-xs"
            >
              {isArabic ? 'تطبيق' : 'Apply'}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
