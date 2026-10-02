'use client';

import * as React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Crown } from 'lucide-react';
import { Card } from '@/components/ui/card';

export interface PlayerRank {
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
  isVip?: boolean;
  vipTier?: string;
}

export function PlayerAvatar({
  src,
  name,
  size = 32,
}: {
  src: string;
  name: string;
  size?: number;
}) {
  if (src && src.startsWith('http')) {
    return (
      <Image
        src={src}
        alt={name}
        width={size}
        height={size}
        className="rounded-full object-cover"
      />
    );
  }
  return <span className="text-xl leading-none">⚽</span>;
}

export function getPositionBadgeClass(position: string): string {
  const pos = position.toUpperCase();
  if (pos === 'GK') return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
  if (pos === 'DEF') return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
  if (pos === 'MID') return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
  if (pos === 'STR' || pos === 'FWD') return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
  return 'bg-white/10 text-muted-foreground border-white/10';
}

interface LeaderboardPodiumProps {
  topThree: PlayerRank[];
  getMetricValue: (p: PlayerRank) => string | number;
}

export function LeaderboardPodium({ topThree, getMetricValue }: LeaderboardPodiumProps) {
  if (topThree.length < 3) return null;

  return (
    <div className="grid grid-cols-3 gap-4 md:gap-6 items-end pt-4 max-w-3xl mx-auto text-center">
      {/* 2nd Place */}
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card className="global-box border-slate-400/40 bg-black rounded-3xl p-4 shadow-xl flex flex-col items-center space-y-2 relative overflow-hidden">
          <div className="w-12 h-12 rounded-full bg-slate-400/20 border border-slate-400/40 flex items-center justify-center shadow-inner overflow-hidden">
            <PlayerAvatar src={topThree[1]?.avatar} name={topThree[1]?.name} size={48} />
          </div>
          <div className="text-sm font-black text-foreground truncate max-w-[120px]">{topThree[1]?.name}</div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-400/20 text-slate-300">2nd Place</span>
          <div className="text-lg font-black text-slate-300 pt-1">{getMetricValue(topThree[1])}</div>
        </Card>
      </motion.div>

      {/* 1st Place */}
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}>
        <Card className="global-box border-amber-400/50 bg-black rounded-3xl p-5 shadow-2xl flex flex-col items-center space-y-2 relative overflow-hidden glow-primary-sm">
          <Crown className="w-6 h-6 text-amber-400" />
          <div className="w-14 h-14 rounded-full bg-amber-400/20 border border-amber-400/50 flex items-center justify-center shadow-inner overflow-hidden">
            <PlayerAvatar src={topThree[0]?.avatar} name={topThree[0]?.name} size={56} />
          </div>
          <div className="text-base font-black text-foreground truncate max-w-[140px]">{topThree[0]?.name}</div>
          <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-amber-400 text-black shadow-md">#1 Champion</span>
          <div className="text-xl font-black text-amber-400 pt-1">{getMetricValue(topThree[0])}</div>
        </Card>
      </motion.div>

      {/* 3rd Place */}
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card className="global-box border-amber-700/40 bg-black rounded-3xl p-4 shadow-xl flex flex-col items-center space-y-2 relative overflow-hidden">
          <div className="w-12 h-12 rounded-full bg-amber-700/20 border border-amber-700/40 flex items-center justify-center shadow-inner overflow-hidden">
            <PlayerAvatar src={topThree[2]?.avatar} name={topThree[2]?.name} size={48} />
          </div>
          <div className="text-sm font-black text-foreground truncate max-w-[120px]">{topThree[2]?.name}</div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-700/20 text-amber-500">3rd Place</span>
          <div className="text-lg font-black text-amber-500 pt-1">{getMetricValue(topThree[2])}</div>
        </Card>
      </motion.div>
    </div>
  );
}
