'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Award, Users, Calendar, Shield, Crown, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';

export default function TournamentsPage() {
  const [registered, setRegistered] = React.useState(false);

  const bracketRounds: Array<{ name: string; matches: Array<{ team1: string; score1: string | number; team2: string; score2: string | number; winner?: string }> }> = [
    {
      name: 'Quarter-Finals',
      matches: [
        { team1: 'Obour Eagles', score1: 4, team2: 'Nile Knights', score2: 2, winner: 'Obour Eagles' },
        { team1: 'Delta Gunners', score1: 3, team2: 'Cairo Strikers', score2: 1, winner: 'Delta Gunners' },
        { team1: 'Pyramid Lions', score1: 5, team2: 'Sphinx United', score2: 4, winner: 'Pyramid Lions' },
        { team1: 'Zamalek Casuals', score1: 2, team2: 'Al Ahly Amateurs', score2: 3, winner: 'Al Ahly Amateurs' },
      ],
    },
    {
      name: 'Semi-Finals',
      matches: [
        { team1: 'Obour Eagles', score1: 3, team2: 'Delta Gunners', score2: 2, winner: 'Obour Eagles' },
        { team1: 'Pyramid Lions', score1: 1, team2: 'Al Ahly Amateurs', score2: 2, winner: 'Al Ahly Amateurs' },
      ],
    },
    {
      name: 'Grand Final 🏆',
      matches: [
        { team1: 'Obour Eagles', score1: 'TBD', team2: 'Al Ahly Amateurs', score2: 'TBD' },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-mesh py-10 px-4 md:px-8 max-w-6xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="stadium-glass p-8 md:p-12 rounded-3xl border-white/10 shadow-2xl space-y-4 text-center relative overflow-hidden">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-black uppercase">
          <Trophy className="w-4 h-4 text-amber-400" /> EGFootball5 Tournament Gala 2026
        </div>
        <h1 className="text-4xl md:text-6xl font-black text-foreground tracking-tight">
          Amateur <span className="text-gradient-primary">Tournaments & Cups</span>
        </h1>
        <p className="text-sm md:text-base text-muted-foreground max-w-xl mx-auto font-medium">
          Compete in Egypt's premier 5-a-side knockout cups. Real-time bracket trees, live stats, and 10,000 EGP cash prizes!
        </p>

        <div className="pt-2">
          <Button
            onClick={() => {
              setRegistered(true);
              toast.success('Squad registered for upcoming Obour Summer Cup! 🏆');
            }}
            disabled={registered}
            size="lg"
            className={`font-black px-8 py-6 rounded-2xl cursor-pointer flex items-center gap-2 mx-auto ${
              registered ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-primary text-black hover:bg-primary/90 glow-primary'
            }`}
          >
            <Crown className="w-5 h-5" /> {registered ? 'Squad Registered ✓' : 'Register Squad in Cup'}
          </Button>
        </div>
      </div>

      {/* Bracket Tree Visualizer */}
      <div className="stadium-glass p-6 md:p-8 rounded-3xl border-white/10 shadow-xl space-y-6">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <h2 className="text-xl font-black text-foreground flex items-center gap-2">
            <Sparkles className="text-primary" /> Obour Summer Cup Knockout Bracket Tree
          </h2>
          <span className="text-xs font-mono font-bold text-emerald-400">8 Squads • Live Elimination</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          {bracketRounds.map((round, rIdx) => (
            <div key={rIdx} className="space-y-4">
              <h3 className="text-xs font-black text-center uppercase tracking-wider text-muted-foreground bg-white/5 py-1.5 rounded-xl border border-white/10">
                {round.name}
              </h3>
              <div className="space-y-4">
                {round.matches.map((m, mIdx) => (
                  <Card key={mIdx} className="stadium-glass border-white/10 rounded-2xl p-4 shadow-md space-y-2 hover:border-emerald-500/40 transition-colors">
                    <div className={`flex justify-between items-center text-xs font-bold ${m.winner === m.team1 ? 'text-emerald-400 font-black' : 'text-foreground'}`}>
                      <span>{m.team1}</span>
                      <span className="font-mono">{m.score1}</span>
                    </div>
                    <div className="h-px bg-white/10" />
                    <div className={`flex justify-between items-center text-xs font-bold ${m.winner === m.team2 ? 'text-emerald-400 font-black' : 'text-foreground'}`}>
                      <span>{m.team2}</span>
                      <span className="font-mono">{m.score2}</span>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
