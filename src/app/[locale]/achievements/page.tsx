'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { Medal, Trophy, Star, Shield, Lock, CheckCircle2, Flame, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  progress: number;
  maxProgress: number;
  unlocked: boolean;
  category: 'Matches' | 'Scoring' | 'Loyalty' | 'Social';
}

export default function AchievementsPage() {
  const achievements: Achievement[] = [
    {
      id: '1',
      title: 'First Touch',
      description: 'Book and complete your first 5-a-side match on Kickoff.',
      icon: '⚽',
      progress: 0,
      maxProgress: 1,
      unlocked: false,
      category: 'Matches',
    },
    {
      id: '2',
      title: 'Hat-Trick Hero',
      description: 'Score 3 goals in a single public match lobby.',
      icon: '🎩',
      progress: 0,
      maxProgress: 3,
      unlocked: false,
      category: 'Scoring',
    },
    {
      id: '3',
      title: 'Stadium Hopper',
      description: 'Play matches across 3 different registered pitches in Obour.',
      icon: '🏟️',
      progress: 0,
      maxProgress: 3,
      unlocked: false,
      category: 'Matches',
    },
    {
      id: '4',
      title: 'Night Owl',
      description: 'Play a late night slot match (between 10 PM - 2 AM).',
      icon: '🌙',
      progress: 0,
      maxProgress: 1,
      unlocked: false,
      category: 'Loyalty',
    },
    {
      id: '5',
      title: 'Clean Sheet Master',
      description: 'Keep a clean sheet as Goalkeeper or Defender in 5 matches.',
      icon: '🧤',
      progress: 3,
      maxProgress: 5,
      unlocked: false,
      category: 'Matches',
    },
    {
      id: '6',
      title: 'Fairplay Captain',
      description: 'Maintain 100% attendance rate for 10 consecutive matches without warnings.',
      icon: '🏅',
      progress: 8,
      maxProgress: 10,
      unlocked: false,
      category: 'Loyalty',
    },
  ];

  return (
    <div className="min-h-screen bg-black py-10 px-4 md:px-8 max-w-6xl mx-auto space-y-8">
      {/* Level Header Banner */}
      <div className="global-box p-8 rounded-3xl border-white/10 shadow-2xl space-y-6 relative overflow-hidden bg-black">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 text-center md:text-start">
            <div className="w-20 h-20 rounded-3xl bg-primary/20 border-2 border-primary flex items-center justify-center text-4xl shadow-xl glow-primary-sm">
              🎖️
            </div>
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-black uppercase mb-1">
                <Sparkles className="w-3.5 h-3.5" /> Level 7 Pitch Veteran
              </div>
              <h1 className="text-3xl md:text-4xl font-black text-foreground">
                Player <span className="text-gradient-primary">Achievements</span>
              </h1>
              <p className="text-sm text-muted-foreground">Unlock trophies & gain platform reputation</p>
            </div>
          </div>

          <div className="w-full md:w-64 space-y-2">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-muted-foreground">XP Progress</span>
              <span className="text-primary font-black">2,450 / 3,000 XP</span>
            </div>
            <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden p-0.5">
              <div className="h-full bg-primary rounded-full glow-primary-sm" style={{ width: '81%' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Grid of Badges */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {achievements.map((ach) => (
          <motion.div key={ach.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <Card
              className={`stadium-glass border-white/10 rounded-3xl p-6 shadow-xl relative overflow-hidden transition-all ${
                ach.unlocked ? 'border-primary/40 glow-primary-sm' : 'opacity-70'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-3xl shadow-inner">
                  {ach.icon}
                </div>
                {ach.unlocked ? (
                  <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-black">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Unlocked
                  </span>
                ) : (
                  <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-white/5 text-muted-foreground border border-white/10 text-xs font-bold">
                    <Lock className="w-3.5 h-3.5" /> Locked
                  </span>
                )}
              </div>

              <div className="mt-4 space-y-2">
                <h3 className="font-black text-lg text-foreground">{ach.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{ach.description}</p>
              </div>

              <div className="mt-4 pt-4 border-t border-white/10 space-y-1.5">
                <div className="flex justify-between text-[11px] font-bold">
                  <span className="text-muted-foreground">Progress</span>
                  <span className={ach.unlocked ? 'text-primary font-black' : 'text-muted-foreground'}>
                    {ach.progress} / {ach.maxProgress}
                  </span>
                </div>
                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      ach.unlocked ? 'bg-primary' : 'bg-white/30'
                    }`}
                    style={{ width: `${(ach.progress / ach.maxProgress) * 100}%` }}
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
