'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Clock, Check, Lock, ShieldCheck } from 'lucide-react';
import { format } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';
import { MotionDiv } from '@/components/MotionWrapper';

interface BookingSlotGridProps {
  blocks: number[];
  targetDuration: number;
  setTargetDuration: (dur: number) => void;
  selectedRange: { start: number; end: number } | null;
  onSlotClick: (block: number) => void;
  getSlotStatus: (block: number) => 'free' | 'locked_by_me' | 'locked_by_other' | 'taken';
  formatTime: (slot: number) => string;
  date: Date | null;
  isArabic: boolean;
}

export function BookingSlotGrid({
  blocks,
  targetDuration,
  setTargetDuration,
  selectedRange,
  onSlotClick,
  getSlotStatus,
  formatTime,
  date,
  isArabic,
}: BookingSlotGridProps) {
  return (
    <Card className="stadium-glass shadow-2xl rounded-3xl border-border/40 overflow-hidden">
      <CardHeader className="p-5 sm:p-6 border-b border-white/5 bg-white/[0.02]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-lg font-black text-foreground">
              {isArabic
                ? `المواعيد المتاحة ليوم ${date ? format(date, 'EEEE, d MMMM', { locale: ar }) : ''}`
                : `Available Slots for ${date ? format(date, 'EEEE, MMM d', { locale: enUS }) : ''}`}
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground mt-1">
              {isArabic
                ? 'حدد مدة المباراة ثم اختر الموعد المناسب لبدء الحجز'
                : 'Select match duration then pick your preferred starting slot'}
            </CardDescription>
          </div>

          {/* Duration Selector Tabs */}
          <div className="inline-flex p-1 rounded-2xl bg-white/[0.04] border border-white/10 self-start sm:self-auto">
            {[
              { val: 1, label: isArabic ? 'ساعة' : '1h' },
              { val: 1.5, label: isArabic ? 'ساعة ونصف' : '1.5h' },
              { val: 2, label: isArabic ? 'ساعتان' : '2h' },
            ].map((dur) => (
              <button
                key={dur.val}
                type="button"
                onClick={() => setTargetDuration(dur.val)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  targetDuration === dur.val
                    ? 'bg-foreground text-background shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {dur.label}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-5 sm:p-6 space-y-6">
        {/* Interactive Slots Grid */}
        <MotionDiv
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.02 } },
          }}
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5"
        >
          {blocks.map((block) => {
            const status = getSlotStatus(block);
            const isSelected =
              selectedRange && block >= selectedRange.start && block <= selectedRange.end;

            let styleClass =
              'bg-white/[0.03] text-foreground border-white/10 hover:border-emerald-500/50 hover:bg-emerald-500/10';
            let cursorClass = 'cursor-pointer active:scale-[0.98]';
            let disabled = false;

            if (status === 'taken' || status === 'locked_by_other') {
              styleClass = 'bg-white/[0.01] text-muted-foreground/40 border-white/5 opacity-40';
              cursorClass = 'cursor-not-allowed';
              disabled = true;
            } else if (status === 'locked_by_me') {
              styleClass = 'bg-amber-500/20 text-amber-300 border-amber-500/40';
            }

            if (isSelected) {
              styleClass =
                'bg-emerald-500 text-black border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.35)] font-black';
            }

            return (
              <button
                key={block}
                type="button"
                disabled={disabled}
                onClick={() => onSlotClick(block)}
                className={`p-3 rounded-2xl border text-xs flex flex-col items-center justify-center gap-1 transition-all ${styleClass} ${cursorClass}`}
              >
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span className="font-mono font-black">{formatTime(block)}</span>
                </div>

                <span className="text-[10px] font-bold">
                  {isSelected
                    ? isArabic ? 'محدد' : 'Selected'
                    : status === 'taken'
                    ? isArabic ? 'محجوز' : 'Booked'
                    : status === 'locked_by_other'
                    ? isArabic ? 'قفل مؤقت' : 'Locked'
                    : status === 'locked_by_me'
                    ? isArabic ? 'حجزي المؤقت' : 'Your Lock'
                    : isArabic ? 'متاح' : 'Available'}
                </span>
              </button>
            );
          })}
        </MotionDiv>

        {/* Legend */}
        <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-md bg-emerald-500" />
            <span>{isArabic ? 'محدد حالياً' : 'Selected Slot'}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-md bg-white/[0.05] border border-white/10" />
            <span>{isArabic ? 'متاح للحجز' : 'Available'}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-md bg-amber-500/40 border border-amber-500/60" />
            <span>{isArabic ? 'مهلة دفع مؤقتة' : 'Locked (Paying)'}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-md bg-white/[0.01] border border-white/5 opacity-40" />
            <span>{isArabic ? 'مباريات محجوزة' : 'Booked'}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
