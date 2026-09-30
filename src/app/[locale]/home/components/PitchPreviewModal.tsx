'use client';

import React from 'react';
import Image from 'next/image';
import { Pitch } from '@/types';
import { Portal } from '@/components/Portal';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, X } from 'lucide-react';

interface PitchPreviewModalProps {
  pitch: Pitch;
  onClose: () => void;
  onBook: (pitchId: string) => void;
  t: (key: string) => string;
}

export function PitchPreviewModal({ pitch, onClose, onBook, t }: PitchPreviewModalProps) {
  return (
    <Portal>
      <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
        <Card className="w-full max-w-lg bg-card/95 border-border backdrop-blur-2xl shadow-2xl p-6 rounded-3xl space-y-4 relative animate-in zoom-in-95 duration-200">
          <button
            onClick={onClose}
            className="absolute top-4 end-4 p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <h3 className="text-2xl font-black text-foreground">{pitch.name}</h3>

          <div className="aspect-video relative w-full rounded-2xl overflow-hidden border border-border bg-slate-900">
            <Image
              src={pitch.imagePreviewUrl || '/pitch_preview.jpg'}
              alt={pitch.name}
              fill
              className="object-cover"
            />
          </div>

          <div className="space-y-3 text-sm">
            <p className="flex items-center gap-2 text-muted-foreground font-medium">
              <MapPin className="w-4 h-4 text-primary shrink-0" />
              <span className="text-foreground">{pitch.locationName}</span>
            </p>
            <div className="flex justify-between items-center p-3 rounded-2xl bg-muted/40 border border-border/50">
              <span className="text-muted-foreground">{t('ratePerHour')}</span>
              <span className="text-xl font-black text-primary font-mono">{pitch.pricePerHour || 350} EGP</span>
            </div>
            <p className="text-muted-foreground text-xs leading-relaxed">
              {t('pitchPreviewDesc')}
            </p>
          </div>

          <div className="pt-2 flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 rounded-2xl font-bold cursor-pointer"
            >
              {t('close')}
            </Button>
            <Button
              onClick={() => {
                onClose();
                onBook(pitch.id);
              }}
              className="flex-1 bg-primary text-black font-black hover:bg-primary/90 rounded-2xl cursor-pointer"
            >
              {t('bookNow')}
            </Button>
          </div>
        </Card>
      </div>
    </Portal>
  );
}
