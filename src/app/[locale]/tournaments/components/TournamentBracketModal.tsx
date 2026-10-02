'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Portal } from '@/components/Portal';

export interface TournamentMatch {
  team1: string;
  score1: string | number;
  team2: string;
  score2: string | number;
  winner?: string;
}

export interface TournamentRound {
  name: string;
  matches: TournamentMatch[];
}

export interface Tournament {
  id: string;
  name: string;
  subtitle?: string;
  squadCount?: number;
  status?: 'upcoming' | 'live' | 'completed';
  rounds?: TournamentRound[];
  createdAt?: number;
}

interface TournamentBracketModalProps {
  tournament: Tournament | null;
  onClose: () => void;
  isArabic: boolean;
}

export function TournamentBracketModal({
  tournament,
  onClose,
  isArabic,
}: TournamentBracketModalProps) {
  React.useEffect(() => {
    if (!tournament) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [tournament, onClose]);

  if (!tournament || !tournament.rounds) return null;

  return (
    <Portal>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="w-full max-w-4xl stadium-glass border-white/10 rounded-3xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto space-y-6"
            dir={isArabic ? 'rtl' : 'ltr'}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h2 className="text-xl font-black text-foreground flex items-center gap-2">
                <Sparkles className="text-primary" /> {isArabic ? 'شجرة مواجهات' : ''}{' '}
                {tournament.name}
              </h2>
              <button
                onClick={onClose}
                className="p-2 rounded-full bg-white/5 hover:bg-white/10 cursor-pointer"
                aria-label="Close"
              >
                <X className="w-5 h-5 text-muted-foreground hover:text-foreground" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
              {tournament.rounds.map((round, rIdx) => (
                <div key={rIdx} className="space-y-4">
                  <h3 className="text-xs font-black text-center uppercase tracking-wider text-muted-foreground bg-white/5 py-1.5 rounded-xl border border-white/10">
                    {round.name}
                  </h3>
                  <div className="space-y-4">
                    {round.matches.map((m, mIdx) => (
                      <Card
                        key={mIdx}
                        className="stadium-glass border-white/10 rounded-2xl p-4 shadow-md space-y-2 hover:border-emerald-500/40 transition-colors"
                      >
                        <div
                          className={`flex justify-between items-center text-xs font-bold ${
                            m.winner === m.team1 ? 'text-emerald-400 font-black' : 'text-foreground'
                          }`}
                        >
                          <span>{m.team1}</span>
                          <span className="font-mono">{m.score1}</span>
                        </div>
                        <div className="h-px bg-white/10" />
                        <div
                          className={`flex justify-between items-center text-xs font-bold ${
                            m.winner === m.team2 ? 'text-emerald-400 font-black' : 'text-foreground'
                          }`}
                        >
                          <span>{m.team2}</span>
                          <span className="font-mono">{m.score2}</span>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </Portal>
  );
}
