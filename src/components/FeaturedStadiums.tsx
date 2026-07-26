'use client';

import * as React from 'react';
import Image from 'next/image';
import { Link } from '@/i18n/routing';
import { Star, MapPin, Zap, ArrowRight, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { collection, getDocs, query, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useQuery } from '@tanstack/react-query';
import { Pitch } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';

export function FeaturedStadiums({ isArabic }: { isArabic: boolean }) {
  const { data: pitches = [], isLoading } = useQuery({
    queryKey: ['featured_pitches'],
    queryFn: async () => {
      const q = query(collection(db, 'pitches'), limit(6));
      const snap = await getDocs(q);
      return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Pitch));
    },
  });

  if (!isLoading && pitches.length === 0) {
    return null;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="text-start space-y-1.5">
          <span className="inline-flex items-center gap-1.5 text-xs font-black text-primary uppercase tracking-wider bg-primary/10 px-3.5 py-1.5 rounded-full border border-primary/30">
            <Zap className="w-3.5 h-3.5 text-primary" />
            {isArabic ? 'الملاعب المتاحة' : 'Featured Stadiums'}
          </span>
          <h3 className="text-3xl sm:text-4xl font-black text-foreground tracking-tight">
            {isArabic ? 'استكشف ملاعب خماسي مجهزة وموثقة' : 'Featured Pitch Selection'}
          </h3>
        </div>
        <Link href="/home">
          <Button variant="outline" className="border-primary/40 text-primary hover:bg-primary/10 font-bold rounded-2xl gap-2 cursor-pointer">
            {isArabic ? 'تصفح كل الملاعب' : 'View All Pitches'}
            <ArrowRight className="w-4 h-4 rtl:rotate-180" />
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-3xl border border-border bg-card p-4 space-y-4 shadow-xl">
              <Skeleton className="h-52 w-full rounded-2xl" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-32 rounded-lg" />
                <Skeleton className="h-6 w-3/4 rounded-lg" />
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-20 rounded-xl" />
                  <Skeleton className="h-6 w-24 rounded-xl" />
                </div>
              </div>
              <div className="pt-4 border-t border-border flex justify-between items-center">
                <Skeleton className="h-8 w-24 rounded-lg" />
                <Skeleton className="h-10 w-28 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {pitches.map((stadium) => (
            <div
              key={stadium.id}
              className="group relative rounded-3xl overflow-hidden bg-card border border-border hover:border-primary/50 transition-all duration-300 shadow-xl flex flex-col justify-between"
            >
              {/* Image header */}
              <div className="relative h-52 w-full overflow-hidden bg-muted">
                <Image
                  src={stadium.imagePreviewUrl || '/pitch_preview.jpg'}
                  alt={stadium.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-card via-card/20 to-black/40" />

                {/* Rating badge */}
                {stadium.rating && (
                  <div className="absolute top-3 end-3 bg-background/90 text-amber-400 font-black text-xs px-3 py-1 rounded-full border border-amber-500/40 flex items-center gap-1.5 shadow-md">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <span>{stadium.rating}</span>
                    {stadium.reviewsCount && (
                      <span className="text-muted-foreground text-[10px]">({stadium.reviewsCount})</span>
                    )}
                  </div>
                )}
              </div>

              {/* Content body */}
              <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{stadium.locationName || (isArabic ? 'مدينة العبور' : 'Obour City')}</span>
                  </div>

                  <h4 className="text-xl font-black text-foreground group-hover:text-primary transition-colors line-clamp-1">
                    {stadium.name}
                  </h4>

                  <div className="flex flex-wrap gap-2 pt-1">
                    <span className="text-[11px] font-extrabold px-3 py-1 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      ⚽ {stadium.capacity || '5v5'} {stadium.surfaceType || (isArabic ? 'نجيل صناعي' : 'Turf')}
                    </span>
                    <span className="text-[11px] font-extrabold px-3 py-1 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                      {isArabic ? 'إضاءة تراك' : 'Floodlights'}
                    </span>
                  </div>
                </div>

                {/* Footer pricing & quick book */}
                <div className="pt-4 border-t border-border flex items-center justify-between gap-3">
                  <div>
                    <span className="text-2xl sm:text-3xl font-black text-primary font-mono">
                      {stadium.pricePerHour}
                    </span>
                    <span className="text-xs text-muted-foreground font-bold ms-1">
                      {isArabic ? 'ج.م / ساعة' : ' EGP/hr'}
                    </span>
                  </div>

                  <Link href={`/book?pitchId=${stadium.id}`}>
                    <Button size="sm" className="bg-primary text-black font-black hover:bg-primary/90 rounded-xl px-5 py-5 shadow-md hover:scale-105 transition-all cursor-pointer">
                      {isArabic ? 'احجز الآن' : 'Book Pitch'}
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
