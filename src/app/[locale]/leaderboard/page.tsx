'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { Award, Trophy, Medal, Star, Flame, Shield, Search, Crown, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface PlayerRank {
  id: string;
  rank: number;
  name: string;
  avatar: string;
  position: 'GK' | 'DEF' | 'MID' | 'STR';
  score: number; // Goals, Clean Sheets, or MVP points
  matchesPlayed: number;
  badge: string;
}

export default function LeaderboardPage() {
  const [tab, setTab] = React.useState<'scorers' | 'keepers' | 'mvp'>('scorers');
  const [search, setSearch] = React.useState('');

  const topScorers: PlayerRank[] = [
    { id: '1', rank: 1, name: 'Ziad Ammar', avatar: '👑', position: 'STR', score: 38, matchesPlayed: 24, badge: 'Gold Boot' },
    { id: '2', rank: 2, name: 'Omar Khaled', avatar: '⚡', position: 'STR', score: 31, matchesPlayed: 21, badge: 'Silver Boot' },
    { id: '3', rank: 3, name: 'Youssef El-Sayed', avatar: '🎯', position: 'MID', score: 27, matchesPlayed: 19, badge: 'Bronze Boot' },
    { id: '4', rank: 4, name: 'Ahmed Hassan', avatar: '⚽', position: 'STR', score: 24, matchesPlayed: 18, badge: 'Top 10' },
    { id: '5', rank: 5, name: 'Mahmoud Tarek', avatar: '🔥', position: 'MID', score: 21, matchesPlayed: 15, badge: 'Top 10' },
    { id: '6', rank: 6, name: 'Karim Mostafa', avatar: '👟', position: 'STR', score: 19, matchesPlayed: 14, badge: 'Top 10' },
  ];

  const topKeepers: PlayerRank[] = [
    { id: '10', rank: 1, name: 'Mohamed El-Shenawy', avatar: '🧤', position: 'GK', score: 14, matchesPlayed: 20, badge: 'Golden Glove' },
    { id: '11', rank: 2, name: 'Mostafa Shobeir', avatar: '🛡️', position: 'GK', score: 11, matchesPlayed: 16, badge: 'Silver Glove' },
    { id: '12', rank: 3, name: 'Aly Lofti', avatar: '🧱', position: 'GK', score: 9, matchesPlayed: 15, badge: 'Bronze Glove' },
  ];

  const topMVPs: PlayerRank[] = [
    { id: '20', rank: 1, name: 'Ahmed Hassan', avatar: '🌟', position: 'MID', score: 9.4, matchesPlayed: 22, badge: 'Season MVP' },
    { id: '21', rank: 2, name: 'Ziad Ammar', avatar: '🔥', position: 'STR', score: 9.1, matchesPlayed: 24, badge: 'Runner Up' },
    { id: '22', rank: 3, name: 'Mohamed El-Shenawy', avatar: '🧤', position: 'GK', score: 8.9, matchesPlayed: 20, badge: 'Pro Wall' },
  ];

  const activeList = tab === 'scorers' ? topScorers : tab === 'keepers' ? topKeepers : topMVPs;
  const filteredList = activeList.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));

  const topThree = filteredList.slice(0, 3);
  const remaining = filteredList.slice(3);

  return (
    <div className="min-h-screen bg-mesh py-10 px-4 md:px-8 max-w-6xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="text-center space-y-4 stadium-glass p-8 rounded-3xl border-white/10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 start-1/2 -translate-x-1/2 w-96 h-32 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-black uppercase tracking-wider">
          <Trophy className="w-4 h-4 text-amber-400" /> EGFootball5 Hall of Fame
        </div>
        <h1 className="text-4xl md:text-6xl font-black text-foreground tracking-tight">
          Platform <span className="text-gradient-primary">Leaderboard</span>
        </h1>
        <p className="text-sm md:text-base text-muted-foreground max-w-xl mx-auto font-medium">
          Recognizing the top goalscorers, shot stoppers, and MVPs across all pitches in Obour & Cairo.
        </p>

        {/* Tab Filters */}
        <div className="pt-4 flex justify-center gap-3">
          {[
            { id: 'scorers', label: 'Top Scorers ⚽', unit: 'Goals' },
            { id: 'keepers', label: 'Golden Glove 🧤', unit: 'Clean Sheets' },
            { id: 'mvp', label: 'Season MVPs 🌟', unit: 'Rating' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id as any)}
              className={`px-5 py-3 rounded-2xl text-xs md:text-sm font-black transition-all cursor-pointer ${
                tab === t.id ? 'bg-primary text-black shadow-lg glow-primary scale-105' : 'bg-white/5 border border-white/10 text-muted-foreground hover:text-foreground'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3D Podium for Top 3 */}
      {topThree.length >= 3 && (
        <div className="grid grid-cols-3 gap-4 md:gap-6 items-end pt-8 max-w-3xl mx-auto text-center">
          {/* 2nd Place */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="stadium-glass border-slate-400/40 rounded-3xl p-4 shadow-xl flex flex-col items-center space-y-2 relative overflow-hidden">
              <div className="w-12 h-12 rounded-2xl bg-slate-400/20 border border-slate-400/40 flex items-center justify-center text-2xl shadow-inner">
                {topThree[1].avatar}
              </div>
              <div className="text-sm font-black text-foreground">{topThree[1].name}</div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-400/20 text-slate-300">2nd Place</span>
              <div className="text-xl font-black text-slate-300 pt-2">{topThree[1].score}</div>
              <div className="w-full h-24 bg-gradient-to-t from-slate-500/20 to-transparent rounded-2xl flex items-center justify-center font-black text-3xl text-slate-400">
                #2
              </div>
            </Card>
          </motion.div>

          {/* 1st Place */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}>
            <Card className="stadium-glass border-amber-400/50 rounded-3xl p-5 shadow-2xl flex flex-col items-center space-y-2 relative overflow-hidden glow-primary-sm">
              <Crown className="w-6 h-6 text-amber-400 absolute top-3 animate-bounce" />
              <div className="w-16 h-16 rounded-2xl bg-amber-400/20 border border-amber-400/50 flex items-center justify-center text-3xl shadow-inner mt-4">
                {topThree[0].avatar}
              </div>
              <div className="text-base font-black text-foreground">{topThree[0].name}</div>
              <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-amber-400 text-black shadow-md">{topThree[0].badge}</span>
              <div className="text-2xl font-black text-amber-400 pt-2">{topThree[0].score}</div>
              <div className="w-full h-32 bg-gradient-to-t from-amber-500/30 to-transparent rounded-2xl flex items-center justify-center font-black text-4xl text-amber-400">
                #1
              </div>
            </Card>
          </motion.div>

          {/* 3rd Place */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="stadium-glass border-amber-700/40 rounded-3xl p-4 shadow-xl flex flex-col items-center space-y-2 relative overflow-hidden">
              <div className="w-12 h-12 rounded-2xl bg-amber-700/20 border border-amber-700/40 flex items-center justify-center text-2xl shadow-inner">
                {topThree[2].avatar}
              </div>
              <div className="text-sm font-black text-foreground">{topThree[2].name}</div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-700/20 text-amber-500">3rd Place</span>
              <div className="text-xl font-black text-amber-500 pt-2">{topThree[2].score}</div>
              <div className="w-full h-20 bg-gradient-to-t from-amber-700/20 to-transparent rounded-2xl flex items-center justify-center font-black text-3xl text-amber-600">
                #3
              </div>
            </Card>
          </motion.div>
        </div>
      )}

      {/* Search Bar & Full Table */}
      <div className="stadium-glass rounded-3xl p-6 border-white/10 shadow-xl space-y-4">
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
                <th className="pb-3 text-end">{tab === 'scorers' ? 'Goals' : tab === 'keepers' ? 'Clean Sheets' : 'Rating'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredList.map((p) => (
                <tr key={p.id} className="hover:bg-white/5 transition-colors font-medium">
                  <td className="py-4 font-black text-base text-primary">#{p.rank}</td>
                  <td className="py-4 flex items-center gap-3">
                    <span className="text-xl">{p.avatar}</span>
                    <span className="font-bold text-foreground">{p.name}</span>
                  </td>
                  <td className="py-4 text-center">
                    <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-xs font-mono font-bold text-muted-foreground">
                      {p.position}
                    </span>
                  </td>
                  <td className="py-4 text-center text-muted-foreground">{p.matchesPlayed}</td>
                  <td className="py-4 text-end font-black text-emerald-400 text-lg">{p.score}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
