'use client';

import { useState, useEffect } from 'react';
import { Star, Users, Trophy, ShieldCheck } from 'lucide-react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useTranslations } from 'next-intl';

export function LandingStats() {
  const t = useTranslations('Landing');

  const [stats, setStats] = useState({
    pitches: 0,
    users: 0,
    matches: 0,
    isLoading: true,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [usersSnap, pitchesSnap, bookingsSnap] = await Promise.all([
          getDocs(collection(db, 'users')).catch(() => null),
          getDocs(collection(db, 'pitches')).catch(() => null),
          getDocs(collection(db, 'bookings')).catch(() => null),
        ]);

        const realUsers = usersSnap ? usersSnap.size : 0;
        const realPitches = pitchesSnap ? pitchesSnap.size : 0;
        const realBookings = bookingsSnap ? bookingsSnap.size : 0;

        setStats({
          users: realUsers,
          pitches: realPitches,
          matches: realBookings,
          isLoading: false,
        });
      } catch (e) {
        console.error('Error fetching real stats:', e);
        setStats({ users: 0, pitches: 0, matches: 0, isLoading: false });
      }
    };
    fetchStats();
  }, []);

  if (stats.isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="p-6 rounded-3xl bg-card/40 border border-border/50 backdrop-blur-xl flex flex-col items-center justify-center space-y-3 relative overflow-hidden">
            <div className="w-20 h-10 rounded-xl bg-primary/15 animate-pulse" />
            <div className="w-16 h-3 rounded-md bg-muted/30 animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
      {/* Players Counter */}
      <div className="p-6 rounded-3xl bg-card border border-border hover:border-primary/50 transition-all space-y-2">
        <div className="flex justify-center text-primary mb-1">
          <Users className="w-6 h-6" />
        </div>
        <p className="text-4xl sm:text-5xl font-black text-primary font-mono">
          {stats.users >= 1000 ? `${(stats.users / 1000).toFixed(1)}k+` : `${stats.users}`}
        </p>
        <p className="text-xs sm:text-sm text-muted-foreground font-extrabold uppercase tracking-wider">{t('players')}</p>
      </div>

      {/* Stadiums Counter */}
      <div className="p-6 rounded-3xl bg-card border border-border hover:border-emerald-500/50 transition-all space-y-2">
        <div className="flex justify-center text-emerald-400 mb-1">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <p className="text-4xl sm:text-5xl font-black text-emerald-400 font-mono">
          {stats.pitches}
        </p>
        <p className="text-xs sm:text-sm text-muted-foreground font-extrabold uppercase tracking-wider">{t('stadiums')}</p>
      </div>

      {/* Matches Counter */}
      <div className="p-6 rounded-3xl bg-card border border-border hover:border-amber-500/50 transition-all space-y-2">
        <div className="flex justify-center text-amber-400 mb-1">
          <Trophy className="w-6 h-6" />
        </div>
        <p className="text-4xl sm:text-5xl font-black text-amber-400 font-mono">
          {stats.matches >= 1000 ? `${(stats.matches / 1000).toFixed(1)}k+` : `${stats.matches}`}
        </p>
        <p className="text-xs sm:text-sm text-muted-foreground font-extrabold uppercase tracking-wider">{t('matches')}</p>
      </div>
    </div>
  );
}
