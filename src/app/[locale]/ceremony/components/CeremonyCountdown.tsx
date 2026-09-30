'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Timer, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TimeLeft } from '../types';

interface CeremonyCountdownProps {
  hasActiveTimer: boolean;
  timeLeft: TimeLeft;
  isArabic: boolean;
  isAdminOrOwner: boolean;
  onOpenEditModal: () => void;
}

export function CeremonyCountdown({
  hasActiveTimer,
  timeLeft,
  isArabic,
  isAdminOrOwner,
  onOpenEditModal,
}: CeremonyCountdownProps) {
  if (hasActiveTimer) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="flex flex-wrap justify-center gap-4 md:gap-6"
      >
        {[
          { label: isArabic ? 'أيام' : 'Days', value: timeLeft.days },
          { label: isArabic ? 'ساعات' : 'Hours', value: timeLeft.hours },
          { label: isArabic ? 'دقائق' : 'Minutes', value: timeLeft.minutes },
          { label: isArabic ? 'ثواني' : 'Seconds', value: timeLeft.seconds },
        ].map((item, idx) => (
          <div
            key={idx}
            className="flex flex-col items-center justify-center p-4 md:p-6 rounded-3xl bg-black border border-white/10 min-w-[100px] md:min-w-[130px] shadow-xl"
          >
            <span className="text-3xl md:text-5xl font-black text-primary mb-1 font-mono">
              {item.value.toString().padStart(2, '0')}
            </span>
            <span className="text-[11px] md:text-xs font-black text-muted-foreground uppercase tracking-widest text-center whitespace-nowrap">
              {item.label}
            </span>
          </div>
        ))}
      </motion.div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-8 rounded-3xl bg-black border border-white/10 max-w-2xl mx-auto text-center space-y-4 shadow-xl">
      <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto">
        <Timer className="w-7 h-7" />
      </div>
      <div className="space-y-1">
        <h2 className="text-xl font-black text-amber-400">
          {isArabic ? 'حالة الموسم: الموسم الرياضي مستمر' : 'Season Status: Season in Progress'}
        </h2>
        <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
          {isArabic
            ? 'سيتم الإعلان عن موعد حفل ختام الموسم، العد التنازلي، وتوزيع الكؤوس (الحذاء الذهبي، القفاز الذهبي، صانع الألعاب، أفضل لاعب، اللعب النظيف، وكأس الفرق) وتشكيلة الموسم المثالية (TOTS) فور تحديده من إدارة الإستاد.'
            : 'The official season finale date, awards gala countdown, trophy honors (Golden Boot, Golden Glove, Playmaker, MVP, Fair Play, Champion Squad), and Team of the Season (TOTS) roster will be unveiled once scheduled by stadium management.'}
        </p>
      </div>
      {isAdminOrOwner && (
        <Button
          onClick={onOpenEditModal}
          className="bg-amber-500 text-black hover:bg-amber-400 font-black rounded-2xl text-xs px-5 py-3 cursor-pointer glow-amber"
        >
          <Settings className="w-4 h-4 me-1.5" />
          <span>{isArabic ? 'تحديد موعد ختام الموسم' : 'Schedule Season Finale Date'}</span>
        </Button>
      )}
    </div>
  );
}
