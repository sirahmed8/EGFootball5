'use client';

import * as React from 'react';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { MapPin, Phone } from 'lucide-react';
import { Pitch } from '@/types';

interface BookingPitchHeaderProps {
  pitch: Pitch;
  isArabic: boolean;
}

export function BookingPitchHeader({ pitch, isArabic }: BookingPitchHeaderProps) {
  return (
    <Card className="stadium-glass shadow-2xl overflow-hidden rounded-3xl border-border/40">
      <div className="relative h-48 md:h-64 w-full">
        <Image
          src={pitch.imagePreviewUrl || '/pitch_preview.jpg'}
          alt={pitch.name}
          fill
          unoptimized
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
        <div className="absolute bottom-6 start-6 end-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-4xl font-black text-white">{pitch.name}</h1>
            <div className="flex items-center gap-3 text-xs md:text-sm text-white/80 font-medium mt-1">
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4 text-emerald-400" />
                {pitch.locationName}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Phone className="w-4 h-4 text-emerald-400" />
                {pitch.adminPhone}
              </span>
            </div>
          </div>
          <div className="text-end">
            <span className="text-2xl md:text-3xl font-black text-emerald-400 font-mono">
              {pitch.pricePerHour} EGP
            </span>
            <span className="text-xs text-white/70 block">
              {isArabic ? 'لكل ساعة' : 'per hour'}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}
