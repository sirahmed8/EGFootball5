'use client';

import { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { doc, getDoc, collection, getCountFromServer } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useTranslations } from 'next-intl';

export function LandingStats() {
  const t = useTranslations('Landing');
  
  const [pitchesCount, setPitchesCount] = useState(0); 
  const [usersCount, setUsersCount] = useState(0);
  const [matchesCount, setMatchesCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const pSnap = await getCountFromServer(collection(db, 'pitches'));
        setPitchesCount(pSnap.data().count || 0); 
        
        const statsSnap = await getDoc(doc(db, 'stats', 'global'));
        if (statsSnap.exists()) {
          const data = statsSnap.data();
          setUsersCount(data.users || 0);
          setMatchesCount(data.bookings || 0);
        }
      } catch (e) {
        console.error("Could not fetch real stats", e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="space-y-4 flex flex-col items-center">
            <div className="w-24 h-12 bg-primary/20 animate-pulse rounded-md"></div>
            <div className="w-16 h-4 bg-muted animate-pulse rounded-md"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
      <div className="space-y-2 transform hover:scale-105 transition-transform">
        <p className="text-5xl font-black text-primary drop-shadow-[0_0_10px_rgba(57,255,20,0.5)]">
          {usersCount > 1000 ? `${(usersCount/1000).toFixed(1)}k+` : usersCount}
        </p>
        <p className="text-muted-foreground font-semibold uppercase tracking-wider">{t('players')}</p>
      </div>
      <div className="space-y-2 transform hover:scale-105 transition-transform">
        <p className="text-5xl font-black text-primary drop-shadow-[0_0_10px_rgba(57,255,20,0.5)]">
          {pitchesCount}
        </p>
        <p className="text-muted-foreground font-semibold uppercase tracking-wider">{t('stadiums')}</p>
      </div>
      <div className="space-y-2 transform hover:scale-105 transition-transform">
        <p className="text-5xl font-black text-primary drop-shadow-[0_0_10px_rgba(57,255,20,0.5)]">
          {matchesCount > 1000 ? `${(matchesCount/1000).toFixed(1)}k` : matchesCount}
        </p>
        <p className="text-muted-foreground font-semibold uppercase tracking-wider">{t('matches')}</p>
      </div>
      <div className="space-y-2 transform hover:scale-105 transition-transform">
        <p className="text-5xl font-black text-primary drop-shadow-[0_0_10px_rgba(57,255,20,0.5)]">4.9</p>
        <div className="flex justify-center text-yellow-500 drop-shadow-[0_0_5px_rgba(234,179,8,0.5)]">
          <Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" />
        </div>
        <p className="text-muted-foreground font-semibold uppercase tracking-wider">{t('rating')}</p>
      </div>
    </div>
  );
}
