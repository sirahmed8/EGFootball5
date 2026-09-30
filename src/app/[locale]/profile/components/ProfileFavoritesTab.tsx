'use client';

import React from 'react';
import { useRouter } from '@/i18n/routing';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, MapPin, ArrowRight } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import { Pitch } from '@/types';

interface ProfileFavoritesTabProps {
  preferredPitchId: string;
  pitchesCache: Record<string, Pitch>;
}

export function ProfileFavoritesTab({
  preferredPitchId,
  pitchesCache,
}: ProfileFavoritesTabProps) {
  const router = useRouter();
  const t = useTranslations('Profile');
  const locale = useLocale();

  return (
    <Card className="bg-card/70 border-border p-6 rounded-3xl space-y-4 shadow-lg">
      <h3 className="font-extrabold text-foreground text-sm flex items-center gap-2">
        <Heart className="w-4 h-4 text-red-500 fill-red-500" />
        <span>{locale === 'ar' ? 'الملعب الأكثر حجزا' : 'Most Booked Pitch'}</span>
      </h3>

      {preferredPitchId && pitchesCache[preferredPitchId] ? (
        <div className="p-5 rounded-2xl border border-border bg-background/50 flex items-center justify-between">
          <div>
            <h4 className="font-extrabold text-foreground text-lg">
              {pitchesCache[preferredPitchId].name}
            </h4>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1 font-medium">
              <MapPin className="w-3.5 h-3.5 text-primary" />
              <span>{pitchesCache[preferredPitchId].locationName}</span>
            </p>
          </div>

          <Button
            onClick={() => router.push(`/book?pitchId=${preferredPitchId}`)}
            className="bg-primary text-black font-black text-xs rounded-xl px-5 py-5"
          >
            <span>{t('quickBook')}</span>
            <ArrowRight className="w-3.5 h-3.5 ms-1 rtl:rotate-180" />
          </Button>
        </div>
      ) : (
        <div className="p-8 text-center border border-dashed border-border rounded-2xl bg-background/40 space-y-3">
          <p className="text-xs text-muted-foreground font-medium">{t('noFavText')}</p>
          <Button
            onClick={() => router.push('/home')}
            variant="outline"
            className="border-primary/40 text-primary hover:bg-primary/10 font-black rounded-xl text-xs px-5 py-4 cursor-pointer"
          >
            <span>{t('exploreStadiumsCta')}</span>
            <ArrowRight className="w-3.5 h-3.5 ms-1 rtl:rotate-180" />
          </Button>
        </div>
      )}
    </Card>
  );
}
