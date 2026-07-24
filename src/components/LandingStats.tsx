'use client';

import { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useTranslations } from 'next-intl';

export function LandingStats() {
  const t = useTranslations('Landing');
  
  const [stats, setStats] = useState({
    pitches: 0,
    users: 0,
    matches: 0,
    isLoading: true
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const statsSnap = await getDoc(doc(db, 'stats', 'global'));
        
        let usersCount = 0;
        let matchesCount = 0;
        let pitchesCount = 0;

        if (statsSnap.exists()) {
          const data = statsSnap.data();
          usersCount = data.users || 0;
          matchesCount = data.bookings || 0;
          pitchesCount = data.pitches || 0;
        }

        setStats({
          pitches: pitchesCount,
          users: usersCount,
          matches: matchesCount,
          isLoading: false
        });
      } catch (e) {
        console.error("Could not fetch real stats", e);
        setStats(prev => ({ ...prev, isLoading: false }));
      }
    };
    fetchStats();
  }, []);

  if (stats.isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="p-6 rounded-2xl bg-card/40 border border-border/50 backdrop-blur-xl flex flex-col items-center justify-center space-y-3 relative overflow-hidden">
            <div className="w-20 h-10 rounded-xl bg-primary/15 animate-shimmer" />
            <div className="w-16 h-3 rounded-md bg-muted/30 animate-shimmer" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
      <div className="space-y-2 transform hover:scale-105 transition-transform">
        <p className="text-5xl font-black text-primary drop-shadow-[0_0_10px_rgba(57,255,20,0.5)]">
          {stats.users > 1000 ? `${(stats.users/1000).toFixed(1)}k+` : stats.users}
        </p>
        <p className="text-muted-foreground font-semibold uppercase tracking-wider">{t('players')}</p>
      </div>
      <div className="space-y-2 transform hover:scale-105 transition-transform">
        <p className="text-5xl font-black text-primary drop-shadow-[0_0_10px_rgba(57,255,20,0.5)]">
          {stats.pitches}
        </p>
        <p className="text-muted-foreground font-semibold uppercase tracking-wider">{t('stadiums')}</p>
      </div>
      <div className="space-y-2 transform hover:scale-105 transition-transform">
        <p className="text-5xl font-black text-primary drop-shadow-[0_0_10px_rgba(57,255,20,0.5)]">
          {stats.matches > 1000 ? `${(stats.matches/1000).toFixed(1)}k` : stats.matches}
        </p>
        <p className="text-muted-foreground font-semibold uppercase tracking-wider">{t('matches')}</p>
      </div>
      <div className="space-y-2 transform hover:scale-105 transition-transform">
        <p className="text-5xl font-black text-primary drop-shadow-[0_0_10px_rgba(57,255,20,0.5)]">4.9</p>
        <div className="flex justify-center text-yellow-500 drop-shadow-[0_0_5px_rgba(234,179,8,0.5)]">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="w-4 h-4 fill-current" />
          ))}
        </div>
        <p className="text-muted-foreground font-semibold uppercase tracking-wider">{t('rating')}</p>
      </div>
    </div>
  );
}
