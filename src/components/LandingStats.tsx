'use client';

import { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { collection, getCountFromServer } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useTranslations } from 'next-intl';

export function LandingStats() {
  const t = useTranslations('Landing');
  
  const [pitchesCount, setPitchesCount] = useState(45); // Fallback
  const [usersCount, setUsersCount] = useState(12000);
  const [matchesCount, setMatchesCount] = useState(8500);

  useEffect(() => {
    // Fetch real pitches count
    const fetchStats = async () => {
      try {
        const pSnap = await getCountFromServer(collection(db, 'pitches'));
        setPitchesCount(pSnap.data().count || 2); // default to a few if low
      } catch (e) {
        console.error("Could not fetch real stats", e);
      }
    };
    fetchStats();
  }, []);

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
