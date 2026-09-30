'use client';

import React from 'react';
import Image from 'next/image';
import { Pitch } from '@/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, ArrowRight } from 'lucide-react';

interface PitchListCardProps {
  pitch: Pitch;
  onBook: (pitchId: string) => void;
  t: (key: string) => string;
}

export function PitchListCard({ pitch, onBook, t }: PitchListCardProps) {
  return (
    <Card className="bg-card/70 border-border backdrop-blur-xl p-4 rounded-3xl hover:border-primary/40 transition-all flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
      <div className="flex items-center gap-4 w-full sm:w-auto">
        <div className="w-24 h-24 relative rounded-2xl overflow-hidden bg-slate-900 shrink-0">
          <Image
            src={pitch.imagePreviewUrl || '/pitch_preview.jpg'}
            alt={pitch.name}
            fill
            className="object-cover"
          />
        </div>
        <div>
          <h3 className="text-xl font-extrabold text-foreground">{pitch.name}</h3>
          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1 font-medium">
            <MapPin className="w-3.5 h-3.5 text-primary" />
            <span>{pitch.locationName || t('locationNotSpecified')}</span>
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {t('manager')}: <strong className="text-foreground">{pitch.managerName || 'إدارة الملعب'}</strong>
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
        <div className="text-start">
          <span className="text-xl font-black text-primary font-mono block">
            {pitch.pricePerHour || 350} EGP
          </span>
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">
            {t('egpPerHour')}
          </span>
        </div>

        <Button
          className="bg-primary text-black font-extrabold hover:bg-primary/90 rounded-2xl px-6 py-5 flex items-center gap-1.5 shadow-md cursor-pointer"
          onClick={() => onBook(pitch.id)}
        >
          <span>{t('bookNow')}</span>
          <ArrowRight className="w-4 h-4 rtl:rotate-180" />
        </Button>
      </div>
    </Card>
  );
}
