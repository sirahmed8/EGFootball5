'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { Shield, Share2, Sparkles, RefreshCw, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface PlayerSpot {
  id: string;
  role: 'GK' | 'DEF' | 'MID' | 'STR';
  name: string;
  x: number; // percentage from left
  y: number; // percentage from top
}

export function PitchTacticalBoard() {
  const [formation, setFormation] = React.useState<'1-2-1' | '2-1-1' | '2-2'>('1-2-1');
  const [players, setPlayers] = React.useState<PlayerSpot[]>([
    { id: '1', role: 'GK', name: 'Goalkeeper', x: 50, y: 85 },
    { id: '2', role: 'DEF', name: 'Left Back', x: 25, y: 62 },
    { id: '3', role: 'DEF', name: 'Right Back', x: 75, y: 62 },
    { id: '4', role: 'MID', name: 'Playmaker', x: 50, y: 40 },
    { id: '5', role: 'STR', name: 'Striker', x: 50, y: 18 },
  ]);
  const [copied, setCopied] = React.useState(false);

  const applyFormation = (fmt: '1-2-1' | '2-1-1' | '2-2') => {
    setFormation(fmt);
    if (fmt === '1-2-1') {
      setPlayers([
        { id: '1', role: 'GK', name: 'Goalkeeper', x: 50, y: 85 },
        { id: '2', role: 'DEF', name: 'Left Back', x: 25, y: 62 },
        { id: '3', role: 'DEF', name: 'Right Back', x: 75, y: 62 },
        { id: '4', role: 'MID', name: 'Playmaker', x: 50, y: 40 },
        { id: '5', role: 'STR', name: 'Striker', x: 50, y: 18 },
      ]);
    } else if (fmt === '2-1-1') {
      setPlayers([
        { id: '1', role: 'GK', name: 'Goalkeeper', x: 50, y: 85 },
        { id: '2', role: 'DEF', name: 'Center Defender', x: 35, y: 68 },
        { id: '3', role: 'DEF', name: 'Stopper', x: 65, y: 68 },
        { id: '4', role: 'MID', name: 'Midfielder', x: 50, y: 45 },
        { id: '5', role: 'STR', name: 'Target Man', x: 50, y: 20 },
      ]);
    } else {
      setPlayers([
        { id: '1', role: 'GK', name: 'Goalkeeper', x: 50, y: 85 },
        { id: '2', role: 'DEF', name: 'Left Defender', x: 28, y: 65 },
        { id: '3', role: 'DEF', name: 'Right Defender', x: 72, y: 65 },
        { id: '4', role: 'STR', name: 'Left Forward', x: 30, y: 25 },
        { id: '5', role: 'STR', name: 'Right Forward', x: 70, y: 25 },
      ]);
    }
  };

  const handleShareLineup = () => {
    const summary = `⚽ Kickoff 5-a-Side Tactical Formation [${formation}]\n` +
      players.map((p) => `- ${p.role}: ${p.name}`).join('\n') +
      `\n\nBook your pitch now on EGFootball5!`;

    navigator.clipboard.writeText(summary);
    setCopied(true);
    toast.success('Lineup copied to clipboard! Share on WhatsApp 📲');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="stadium-glass border-white/10 rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl relative overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-black">
            <Sparkles className="w-3.5 h-3.5" /> Interactive Tactics Board
          </div>
          <h2 className="text-2xl font-black text-foreground">5-a-Side Pitch Lineup Board</h2>
          <p className="text-xs text-muted-foreground">Select team formations or drag player pins anywhere on the turf</p>
        </div>

        <div className="flex items-center gap-2">
          {['1-2-1', '2-1-1', '2-2'].map((fmt) => (
            <button
              key={fmt}
              onClick={() => applyFormation(fmt as any)}
              className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                formation === fmt ? 'bg-primary text-black shadow-lg glow-primary-sm' : 'bg-white/5 border border-white/10 text-muted-foreground'
              }`}
            >
              {fmt}
            </button>
          ))}
        </div>
      </div>

      {/* Turf Graphic Board */}
      <div className="relative w-full h-96 bg-emerald-950/70 rounded-3xl border-2 border-emerald-500/40 overflow-hidden shadow-inner flex flex-col justify-between p-4">
        {/* Pitch Lines */}
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-0.5 bg-emerald-500/30 pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 border border-emerald-500/30 rounded-full pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-20 border-b border-x border-emerald-500/30 rounded-b-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-40 h-20 border-t border-x border-emerald-500/30 rounded-t-3xl pointer-events-none" />

        {/* Player Pins with Drag Support */}
        {players.map((p) => (
          <motion.div
            key={p.id}
            drag
            dragConstraints={{ left: -140, right: 140, top: -140, bottom: 140 }}
            dragElastic={0.1}
            whileDrag={{ scale: 1.15, zIndex: 30 }}
            animate={{ left: `${p.x}%`, top: `${p.y}%` }}
            transition={{ type: 'spring', stiffness: 220, damping: 22 }}
            className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center cursor-grab active:cursor-grabbing group z-10"
          >
            <div className={`w-11 h-11 rounded-2xl border-2 flex items-center justify-center font-black text-xs shadow-xl transition-all ${
              p.role === 'GK'
                ? 'bg-amber-400 border-amber-300 text-black shadow-amber-500/30'
                : p.role === 'DEF'
                ? 'bg-blue-500 border-blue-400 text-white shadow-blue-500/30'
                : p.role === 'MID'
                ? 'bg-emerald-400 border-emerald-300 text-black shadow-emerald-500/30'
                : 'bg-rose-500 border-rose-400 text-white shadow-rose-500/30'
            }`}>
              {p.role}
            </div>
            <span className="mt-1 px-2.5 py-0.5 rounded-full bg-black/90 text-[10px] font-bold text-white whitespace-nowrap shadow-md border border-white/10 group-hover:border-primary">
              {p.name}
            </span>
          </motion.div>
        ))}
      </div>

      {/* Share Action */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
        <div className="text-xs text-muted-foreground leading-normal">
          Active Formation: <strong className="text-foreground">{formation} Diamond</strong> (Drag tokens to fine-tune)
        </div>
        <Button
          onClick={handleShareLineup}
          className="w-full sm:w-auto bg-primary text-black hover:bg-primary/90 font-black px-6 py-3 rounded-2xl glow-primary-sm cursor-pointer flex items-center justify-center gap-2 shrink-0"
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          {copied ? 'Copied Lineup!' : 'Share Lineup on WhatsApp'}
        </Button>
      </div>
    </div>
  );
}
