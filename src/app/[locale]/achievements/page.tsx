'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { Lock, CheckCircle2, Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useAuthStore } from '@/store/useAuthStore';
import { AchievementsPageSkeleton } from '@/components/skeletons/PageSkeletons';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  progress: number;
  maxProgress: number;
  unlocked: boolean;
  category: 'Matches' | 'Scoring' | 'Goals' | 'Loyalty' | 'Social';
  reward?: string;
}

const RANK_TITLES: [number, string][] = [
  [1, 'Rookie Player'],
  [3, 'Amateur Baller'],
  [5, 'Semi-Pro Striker'],
  [8, 'Pitch Veteran'],
  [12, 'Stadium Legend'],
  [Infinity, 'Hall of Famer 🏆'],
];

function getRankTitle(lvl: number): string {
  for (const [threshold, title] of RANK_TITLES) {
    if (lvl <= threshold) return title;
  }
  return 'Hall of Famer 🏆';
}

const CATEGORY_COLORS: Record<string, string> = {
  Matches: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  Scoring: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  Goals: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
  Loyalty: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  Social: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
};

export default function AchievementsPage() {
  const appUser = useAuthStore((s) => s.appUser);
  const loading = useAuthStore((s) => s.loading);

  if (loading) return <AchievementsPageSkeleton />;

  // Pull real stats from user profile
  const matchesPlayed = appUser?.matchesPlayed || 0;
  const goals = appUser?.goals || 0;
  const assists = appUser?.assists || 0;
  const saves = appUser?.saves || 0;

  const level = Math.max(1, Math.floor(matchesPlayed / 3) + 1);
  const currentXP = matchesPlayed * 100 + goals * 30 + assists * 20;
  const targetXP = level * 300;
  const xpPercentage = Math.min(100, Math.round((currentXP / targetXP) * 100));

  const achievements: Achievement[] = [
    {
      id: '1',
      title: 'First Touch',
      description: 'Book and complete your first 5-a-side match.',
      icon: '⚽',
      progress: Math.min(1, matchesPlayed),
      maxProgress: 1,
      unlocked: matchesPlayed >= 1,
      category: 'Matches',
      reward: '+100 XP',
    },
    {
      id: '2',
      title: 'Veteran Baller',
      description: 'Play 10 matches on the platform.',
      icon: '🏟️',
      progress: Math.min(10, matchesPlayed),
      maxProgress: 10,
      unlocked: matchesPlayed >= 10,
      category: 'Matches',
      reward: '+500 XP',
    },
    {
      id: '3',
      title: 'Legend of the Pitch',
      description: 'Complete 25 matches — a true platform veteran.',
      icon: '👑',
      progress: Math.min(25, matchesPlayed),
      maxProgress: 25,
      unlocked: matchesPlayed >= 25,
      category: 'Matches',
      reward: 'Gold Badge',
    },
    {
      id: '4',
      title: 'First Goal',
      description: 'Score your first goal in a public match.',
      icon: '🥅',
      progress: Math.min(1, goals),
      maxProgress: 1,
      unlocked: goals >= 1,
      category: 'Goals',
      reward: '+30 XP',
    },
    {
      id: '5',
      title: 'Hat-Trick Hero',
      description: 'Score 3 or more goals total across all matches.',
      icon: '🎩',
      progress: Math.min(3, goals),
      maxProgress: 3,
      unlocked: goals >= 3,
      category: 'Goals',
      reward: '+150 XP',
    },
    {
      id: '6',
      title: 'Top Striker',
      description: 'Score 10 goals in competitive matches.',
      icon: '🔥',
      progress: Math.min(10, goals),
      maxProgress: 10,
      unlocked: goals >= 10,
      category: 'Scoring',
      reward: 'Striker Badge',
    },
    {
      id: '7',
      title: 'Playmaker',
      description: 'Record 5 assists — the team needs you.',
      icon: '🅰️',
      progress: Math.min(5, assists),
      maxProgress: 5,
      unlocked: assists >= 5,
      category: 'Scoring',
      reward: '+200 XP',
    },
    {
      id: '8',
      title: 'Clean Sheet Keeper',
      description: 'Record 3 saves or clean sheets as goalkeeper.',
      icon: '🧤',
      progress: Math.min(3, saves),
      maxProgress: 3,
      unlocked: saves >= 3,
      category: 'Loyalty',
      reward: 'GK Badge',
    },
    {
      id: '9',
      title: 'Night Owl',
      description: 'Play a late night match (10 PM – 2 AM slot).',
      icon: '🌙',
      progress: matchesPlayed >= 1 ? 1 : 0,
      maxProgress: 1,
      unlocked: matchesPlayed >= 1,
      category: 'Loyalty',
      reward: '+50 XP',
    },
    {
      id: '10',
      title: 'Community Pillar',
      description: 'Join or create a squad community.',
      icon: '🛡️',
      progress: 0,
      maxProgress: 1,
      unlocked: false,
      category: 'Social',
      reward: 'Community Badge',
    },
    {
      id: '11',
      title: 'Challenge Accepted',
      description: 'Post or accept a squad challenge in the arena.',
      icon: '⚔️',
      progress: 0,
      maxProgress: 1,
      unlocked: false,
      category: 'Social',
      reward: '+100 XP',
    },
    {
      id: '12',
      title: 'Goal Clip Star',
      description: 'Submit a goal clip to the Goal of the Month contest.',
      icon: '🎬',
      progress: 0,
      maxProgress: 1,
      unlocked: false,
      category: 'Social',
      reward: 'Fame Badge',
    },
  ];

  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const completionPct = Math.round((unlockedCount / achievements.length) * 100);

  const categories = ['All', 'Matches', 'Goals', 'Scoring', 'Loyalty', 'Social'] as const;
  const [activeCategory, setActiveCategory] = React.useState<string>('All');

  const displayed = activeCategory === 'All'
    ? achievements
    : achievements.filter((a) => a.category === activeCategory);

  return (
    <div className="min-h-screen bg-black py-10 px-4 md:px-8 max-w-6xl mx-auto space-y-8">
      {/* Level Header Banner */}
      <div className="global-box p-5 sm:p-8 rounded-3xl border-white/10 shadow-2xl space-y-6 relative overflow-hidden bg-black">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-start">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-primary/20 border-2 border-primary flex items-center justify-center text-3xl sm:text-4xl shadow-xl glow-primary-sm shrink-0">
              🎖️
            </div>
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-black uppercase mb-1 max-w-full">
                <Sparkles className="w-3.5 h-3.5 shrink-0" /> Level {level} • {getRankTitle(level)}
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-foreground">
                Player <span className="text-gradient-primary">Achievements</span>
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {unlockedCount}/{achievements.length} unlocked · {completionPct}% complete
              </p>
            </div>
          </div>

          <div className="w-full md:w-72 space-y-3">
            {/* XP Bar */}
            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-muted-foreground">XP Progress</span>
                <span className="text-primary font-black">{currentXP} / {targetXP} XP</span>
              </div>
              <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden p-0.5">
                <div
                  className="h-full bg-primary rounded-full glow-primary-sm transition-all duration-700"
                  style={{ width: `${xpPercentage}%` }}
                />
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="rounded-xl bg-white/5 border border-white/10 p-2">
                <div className="font-black text-lg text-primary">{matchesPlayed}</div>
                <div className="text-muted-foreground font-bold text-[10px]">Matches</div>
              </div>
              <div className="rounded-xl bg-white/5 border border-white/10 p-2">
                <div className="font-black text-lg text-amber-400">{goals}</div>
                <div className="text-muted-foreground font-bold text-[10px]">Goals</div>
              </div>
              <div className="rounded-xl bg-white/5 border border-white/10 p-2">
                <div className="font-black text-lg text-emerald-400">{assists}</div>
                <div className="text-muted-foreground font-bold text-[10px]">Assists</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Category filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-1 px-1">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-2xl text-xs font-black transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              activeCategory === cat
                ? 'bg-primary text-black glow-primary-sm'
                : 'global-box border-white/10 text-muted-foreground hover:text-foreground'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Achievement Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {displayed.map((ach, idx) => (
          <motion.div
            key={ach.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.04 }}
          >
            <Card
              className={`stadium-glass border-white/10 rounded-3xl p-5 sm:p-6 shadow-xl relative overflow-hidden transition-all ${
                ach.unlocked ? 'border-primary/40 glow-primary-sm' : 'opacity-60 hover:opacity-80'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center text-2xl sm:text-3xl shadow-inner shrink-0 ${
                    ach.unlocked ? 'bg-primary/20 border-2 border-primary/40' : 'bg-white/5 border border-white/10'
                  }`}>
                    {ach.icon}
                  </div>
                  {ach.unlocked ? (
                    <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-black">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> Unlocked
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/5 text-muted-foreground border border-white/10 text-xs font-bold">
                      <Lock className="w-3.5 h-3.5 shrink-0" /> Locked
                    </span>
                  )}
                </div>

                <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border shrink-0 ${CATEGORY_COLORS[ach.category]}`}>
                  {ach.category}
                </span>
              </div>

              <div className="mt-4 space-y-1">
                <h3 className="font-black text-base text-foreground">{ach.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{ach.description}</p>
                {ach.reward && (
                  <p className="text-[10px] font-black text-amber-400">🎁 Reward: {ach.reward}</p>
                )}
              </div>

              {/* Progress bar */}
              <div className="mt-4 pt-4 border-t border-white/10 space-y-1.5">
                <div className="flex justify-between text-[11px] font-bold">
                  <span className="text-muted-foreground">Progress</span>
                  <span className={ach.unlocked ? 'text-primary font-black' : 'text-muted-foreground'}>
                    {ach.progress} / {ach.maxProgress}
                  </span>
                </div>
                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      ach.unlocked ? 'bg-primary' : 'bg-white/30'
                    }`}
                    style={{ width: `${Math.min(100, (ach.progress / ach.maxProgress) * 100)}%` }}
                  />
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
