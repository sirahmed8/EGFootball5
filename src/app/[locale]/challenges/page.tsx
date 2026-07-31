'use client';

import * as React from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { motion } from 'framer-motion';
import { Swords, Shield, MapPin, Clock, Plus, Trophy, CheckCircle2, Sparkles, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';

interface Challenge {
  id: string;
  challengerSquad: string;
  squadLogo: string;
  pitchName: string;
  city: string;
  date: string;
  time: string;
  wagerTerms: string;
  accepted: boolean;
}

export default function SquadChallengesPage() {
  const firebaseUser = useAuthStore((s) => s.firebaseUser);

  const [challenges, setChallenges] = React.useState<Challenge[]>([]);

  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [squadName, setSquadName] = React.useState('My Squad');
  const [pitchName, setPitchName] = React.useState('Al Ahly Obour Stadium');
  const [wager, setWager] = React.useState('Loser Pays Pitch Fee');

  const handleAcceptChallenge = (id: string, squad: string) => {
    if (!firebaseUser) {
      toast.error('Please sign in to accept squad challenges');
      return;
    }
    setChallenges((prev) =>
      prev.map((c) => (c.id === id ? { ...c, accepted: true } : c))
    );
    toast.success(`Challenge accepted against ${squad}! Pitch slot locked ⚽`);
  };

  const handleCreateChallenge = (e: React.FormEvent) => {
    e.preventDefault();
    const newC: Challenge = {
      id: `c-${Date.now()}`,
      challengerSquad: squadName,
      squadLogo: '🔥',
      pitchName,
      city: 'Obour',
      date: 'Tomorrow',
      time: '9:00 PM',
      wagerTerms: wager,
      accepted: false,
    };
    setChallenges((prev) => [newC, ...prev]);
    toast.success('Squad Challenge posted to Arena! ⚔️');
    setIsModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-black py-10 px-4 md:px-8 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 stadium-glass p-8 rounded-3xl border-white/10 shadow-xl bg-black">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-black">
            <Swords className="w-4 h-4" /> Squad vs Squad Arena
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-foreground">
            Squad <span className="text-gradient-primary">Challenges</span>
          </h1>
          <p className="text-sm text-muted-foreground">Challenge rival neighborhood teams for 5-a-side matches with pitch stakes.</p>
        </div>

        <Button
          onClick={() => setIsModalOpen(true)}
          size="lg"
          className="bg-primary text-black hover:bg-primary/90 font-black px-6 py-6 rounded-2xl glow-primary cursor-pointer flex items-center gap-2"
        >
          <Plus className="w-5 h-5" /> Post Challenge
        </Button>
      </div>

      {/* Challenges Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {challenges.map((c) => (
          <motion.div key={c.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="stadium-glass border-white/10 rounded-3xl p-6 shadow-xl space-y-4 card-lift bg-black">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-black border border-white/10 flex items-center justify-center text-3xl shadow-inner">
                    {c.squadLogo}
                  </div>
                  <div>
                    <h3 className="font-black text-lg text-foreground">{c.challengerSquad}</h3>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-primary" /> {c.city} • {c.pitchName}
                    </p>
                  </div>
                </div>

                <span className="px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[10px] font-black uppercase">
                  5v5 Challenge
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-black border border-white/10 space-y-1">
                <div className="text-xs font-bold text-muted-foreground">Match Terms & Stakes</div>
                <div className="text-sm font-black text-amber-400">{c.wagerTerms}</div>
                <div className="text-xs text-muted-foreground flex items-center gap-2 pt-1">
                  <Clock className="w-3.5 h-3.5 text-primary" /> {c.date} at {c.time}
                </div>
              </div>

              <Button
                onClick={() => handleAcceptChallenge(c.id, c.challengerSquad)}
                disabled={c.accepted}
                className={`w-full py-3.5 rounded-2xl font-black transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  c.accepted
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-primary text-black hover:bg-primary/90 glow-primary-sm'
                }`}
              >
                {c.accepted ? <CheckCircle2 className="w-4 h-4" /> : <Swords className="w-4 h-4" />}
                {c.accepted ? 'Match Locked & Confirmed!' : 'Accept Challenge ⚔️'}
              </Button>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-lg stadium-glass border-white/10 rounded-3xl p-6 md:p-8 space-y-4 shadow-2xl relative">
            <h2 className="text-2xl font-black text-foreground">Post Squad Challenge</h2>
            <form onSubmit={handleCreateChallenge} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">Your Squad Name</label>
                <input
                  type="text"
                  required
                  value={squadName}
                  onChange={(e) => setSquadName(e.target.value)}
                  className="w-full p-3.5 rounded-2xl bg-white/5 border border-white/10 text-foreground text-sm font-medium"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">Pitch Location</label>
                <input
                  type="text"
                  required
                  value={pitchName}
                  onChange={(e) => setPitchName(e.target.value)}
                  className="w-full p-3.5 rounded-2xl bg-white/5 border border-white/10 text-foreground text-sm font-medium"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">Wager Terms</label>
                <input
                  type="text"
                  required
                  value={wager}
                  onChange={(e) => setWager(e.target.value)}
                  className="w-full p-3.5 rounded-2xl bg-white/5 border border-white/10 text-foreground text-sm font-medium"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} className="w-1/2 stadium-glass border-white/10 text-foreground rounded-2xl">
                  Cancel
                </Button>
                <Button type="submit" className="w-1/2 bg-primary text-black font-black rounded-2xl glow-primary">
                  Post Challenge 🚀
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
