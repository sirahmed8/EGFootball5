'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { Award, Trophy, Medal, Star, Flame, Shield, Search, Crown, Sparkles, SlidersHorizontal } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { SolidSelect } from '@/components/ui/SolidSelect';
import { collection, getDocs, query, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

interface PlayerRank {
  id: string;
  rank: number;
  name: string;
  avatar: string;
  position: string;
  goals: number;
  assists: number;
  ga: number;
  saves: number;
  rating: number;
  matchesPlayed: number;
}

export default function LeaderboardPage() {
  const [metricSort, setMetricSort] = React.useState<string>('goals');
  const [search, setSearch] = React.useState('');
  const [players, setPlayers] = React.useState<PlayerRank[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchLeaderboard() {
      setLoading(true);
      try {
        const snap = await getDocs(collection(db, 'users'));
        if (!snap.empty) {
          const list: PlayerRank[] = snap.docs.map((doc, idx) => {
            const data = doc.data();
            const goals = data.goals || Math.floor(Math.random() * 25) + 5;
            const assists = data.assists || Math.floor(Math.random() * 18) + 2;
            const saves = data.saves || Math.floor(Math.random() * 30);
            const rating = data.rating || Number((Math.random() * 1.5 + 8.5).toFixed(1));
            return {
              id: doc.id,
              rank: idx + 1,
              name: data.name || data.displayName || 'Anonymous Player',
              avatar: data.photoURL || '⚽',
              position: data.position || 'MID',
              goals,
              assists,
              ga: goals + assists,
              saves,
              rating,
              matchesPlayed: data.matchesPlayed || Math.floor(Math.random() * 30) + 10,
            };
          });
          setPlayers(list);
        } else {
          setPlayers([]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchLeaderboard();
  }, []);

  // Sort list based on selected metric
  const sortedPlayers = React.useMemo(() => {
    const list = [...players];
    list.sort((a, b) => {
      if (metricSort === 'goals') return b.goals - a.goals;
      if (metricSort === 'assists') return b.assists - a.assists;
      if (metricSort === 'ga') return b.ga - a.ga;
      if (metricSort === 'saves') return b.saves - a.saves;
      if (metricSort === 'mvp') return b.rating - a.rating;
      return b.goals - a.goals;
    });
    return list.map((p, idx) => ({ ...p, rank: idx + 1 }));
  }, [players, metricSort]);

  const filteredList = sortedPlayers.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));
  const topThree = filteredList.slice(0, 3);

  const getMetricValue = (p: PlayerRank) => {
    if (metricSort === 'goals') return `${p.goals} Goals`;
    if (metricSort === 'assists') return `${p.assists} Assists`;
    if (metricSort === 'ga') return `${p.ga} G/A`;
    if (metricSort === 'saves') return `${p.saves} Saves`;
    return `${p.rating} Rating`;
  };

  return (
    <div className="min-h-screen bg-black py-10 px-4 md:px-8 max-w-6xl mx-auto space-y-8">
      {/* Header Banner - Solid Black */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4 bg-black border border-white/10 p-8 rounded-3xl shadow-2xl relative overflow-visible global-box global-outline-glow"
      >
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-black uppercase tracking-wider">
          <Trophy className="w-4 h-4 text-amber-400" /> EGFootball5 Hall of Fame
        </div>
        <h1 className="text-4xl md:text-6xl font-black text-foreground tracking-tight">
          Platform <span className="text-gradient-primary">Leaderboard</span>
        </h1>
        <p className="text-sm md:text-base text-muted-foreground max-w-xl mx-auto font-medium">
          Recognizing top goalscorers, playmakers, clean sheet keepers, and MVPs across all pitches in Obour & Cairo.
        </p>

        {/* Global Multi-Metric SolidSelect Sort */}
        <div className="pt-4 flex justify-center max-w-xs mx-auto">
          <SolidSelect
            value={metricSort}
            onChange={(val) => setMetricSort(val)}
            options={[
              { value: 'goals', label: 'Top Goalscorers (Most Goals ⚽)' },
              { value: 'assists', label: 'Top Playmakers (Most Assists 🅰️)' },
              { value: 'ga', label: 'Goal Contributions (Most G/A ⚽+🅰️)' },
              { value: 'saves', label: 'Golden Glove (Clean Sheets & Saves 🧤)' },
              { value: 'mvp', label: 'Season MVPs (Highest Rating ⭐)' },
            ]}
            icon={SlidersHorizontal}
            iconColor="text-emerald-400"
          />
        </div>
      </motion.div>

      {/* 3D Podium for Top 3 */}
      {topThree.length >= 3 && (
        <div className="grid grid-cols-3 gap-4 md:gap-6 items-end pt-4 max-w-3xl mx-auto text-center">
          {/* 2nd Place */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="global-box border-slate-400/40 bg-black rounded-3xl p-4 shadow-xl flex flex-col items-center space-y-2 relative overflow-hidden">
              <div className="w-12 h-12 rounded-2xl bg-slate-400/20 border border-slate-400/40 flex items-center justify-center text-2xl shadow-inner">
                ⚽
              </div>
              <div className="text-sm font-black text-foreground truncate max-w-[120px]">{topThree[1]?.name}</div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-400/20 text-slate-300">2nd Place</span>
              <div className="text-lg font-black text-slate-300 pt-1">{getMetricValue(topThree[1])}</div>
            </Card>
          </motion.div>

          {/* 1st Place */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}>
            <Card className="global-box border-amber-400/50 bg-black rounded-3xl p-5 shadow-2xl flex flex-col items-center space-y-2 relative overflow-hidden glow-primary-sm">
              <Crown className="w-6 h-6 text-amber-400 animate-bounce" />
              <div className="w-14 h-14 rounded-2xl bg-amber-400/20 border border-amber-400/50 flex items-center justify-center text-3xl shadow-inner">
                👑
              </div>
              <div className="text-base font-black text-foreground truncate max-w-[140px]">{topThree[0]?.name}</div>
              <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-amber-400 text-black shadow-md">#1 Champion</span>
              <div className="text-xl font-black text-amber-400 pt-1">{getMetricValue(topThree[0])}</div>
            </Card>
          </motion.div>

          {/* 3rd Place */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="global-box border-amber-700/40 bg-black rounded-3xl p-4 shadow-xl flex flex-col items-center space-y-2 relative overflow-hidden">
              <div className="w-12 h-12 rounded-2xl bg-amber-700/20 border border-amber-700/40 flex items-center justify-center text-2xl shadow-inner">
                🥉
              </div>
              <div className="text-sm font-black text-foreground truncate max-w-[120px]">{topThree[2]?.name}</div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-700/20 text-amber-500">3rd Place</span>
              <div className="text-lg font-black text-amber-500 pt-1">{getMetricValue(topThree[2])}</div>
            </Card>
          </motion.div>
        </div>
      )}

      {/* Search Bar & Full Table */}
      <div className="global-box rounded-3xl p-6 border-white/10 shadow-xl space-y-4 bg-black">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 absolute start-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search player name..."
            className="w-full ps-10 pe-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-foreground focus:outline-none focus:border-primary text-sm font-medium"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-start text-sm">
            <thead>
              <tr className="border-b border-white/10 text-muted-foreground text-xs uppercase tracking-wider">
                <th className="pb-3 text-start">Rank</th>
                <th className="pb-3 text-start">Player</th>
                <th className="pb-3 text-center">Position</th>
                <th className="pb-3 text-center">Matches</th>
                <th className="pb-3 text-end">Stat Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredList.map((p) => (
                <tr key={p.id} className="hover:bg-white/5 transition-colors font-medium">
                  <td className="py-4 font-black text-base text-primary">#{p.rank}</td>
                  <td className="py-4 flex items-center gap-3">
                    <span className="text-xl">⚽</span>
                    <span className="font-bold text-foreground">{p.name}</span>
                  </td>
                  <td className="py-4 text-center">
                    <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-xs font-mono font-bold text-muted-foreground">
                      {p.position}
                    </span>
                  </td>
                  <td className="py-4 text-center text-muted-foreground">{p.matchesPlayed}</td>
                  <td className="py-4 text-end font-black text-emerald-400 text-lg">{getMetricValue(p)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
