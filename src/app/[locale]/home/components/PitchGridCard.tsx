'use client';

import React from 'react';
import Image from 'next/image';
import { Pitch } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Phone, Star, ArrowRight } from 'lucide-react';

interface PitchGridCardProps {
  pitch: Pitch;
  onPreview: (pitch: Pitch) => void;
  onBook: (pitchId: string) => void;
  t: (key: string) => string;
}

export function PitchGridCard({ pitch, onPreview, onBook, t }: PitchGridCardProps) {
  return (
    <Card className="stadium-glass border-white/10 card-lift overflow-hidden hover:border-primary/50 transition-all duration-300 group flex flex-col justify-between shadow-2xl rounded-3xl h-full">
      <div>
        <div className="aspect-video relative w-full bg-slate-900 overflow-hidden">
          <Image
            src={pitch.imagePreviewUrl || '/pitch_preview.jpg'}
            alt={pitch.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-black/30" />

          {/* Price Tag */}
          <div className="absolute top-3 end-3 bg-background/90 backdrop-blur-md px-3.5 py-1 rounded-full text-primary font-black text-sm border border-primary/30 shadow-md font-mono">
            {pitch.pricePerHour || 350} {t('egpPerHour')}
          </div>

          {/* Rating Tag */}
          {pitch.rating ? (
            <div className="absolute top-3 start-3 bg-black/75 backdrop-blur-md px-2.5 py-1 rounded-full text-amber-400 font-bold text-xs flex items-center gap-1 border border-amber-400/30">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
              <span>{pitch.rating}</span>
            </div>
          ) : (
            <div className="absolute top-3 start-3">
              <span className="text-xs font-bold text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30">
                New
              </span>
            </div>
          )}
        </div>

        <CardHeader className="p-5 pb-2">
          <CardTitle className="text-2xl font-black text-foreground group-hover:text-primary transition-colors">
            {pitch.name}
          </CardTitle>
          <CardDescription className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
            <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            {pitch.mapLink ? (
              <a
                href={pitch.mapLink}
                target="_blank"
                rel="noreferrer"
                className="hover:text-primary hover:underline truncate font-semibold"
              >
                {pitch.locationName || t('viewOnMap')}
              </a>
            ) : (
              <span className="truncate font-semibold">{pitch.locationName || t('locationNotSpecified')}</span>
            )}
          </CardDescription>
        </CardHeader>

        <CardContent className="px-5 pt-2 pb-4 space-y-3 text-xs text-muted-foreground">
          <div className="p-3 rounded-2xl bg-muted/40 border border-border/50 space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-semibold">{t('manager')}:</span>
              <span className="text-foreground font-extrabold">{pitch.managerName || 'إدارة الملعب'}</span>
            </div>
            {pitch.adminPhone && (
              <div className="flex justify-between items-center border-t border-border/30 pt-1.5">
                <span className="font-semibold">{t('contact')}:</span>
                <a
                  href={`tel:${pitch.adminPhone}`}
                  className="text-emerald-400 hover:underline flex items-center gap-1 font-mono font-black"
                >
                  <Phone className="w-3 h-3" />
                  {pitch.adminPhone}
                </a>
              </div>
            )}
          </div>
        </CardContent>
      </div>

      <div className="p-5 pt-0 flex gap-2">
        <Button
          variant="outline"
          onClick={() => onPreview(pitch)}
          className="flex-1 border-border text-foreground hover:bg-muted font-bold text-xs py-5 rounded-2xl cursor-pointer"
        >
          {t('previewBtn')}
        </Button>

        <Button
          className="flex-[2] bg-primary text-black font-black hover:bg-primary/90 rounded-2xl py-5 flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(57,255,20,0.25)] cursor-pointer"
          onClick={() => onBook(pitch.id)}
        >
          <span>{t('bookNow')}</span>
          <ArrowRight className="w-4 h-4 rtl:rotate-180" />
        </Button>
      </div>
    </Card>
  );
}
