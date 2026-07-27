'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { Trophy, ThumbsUp, Upload, Sparkles, Video, Flame, Award, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';

interface GoalSubmission {
  id: string;
  player: string;
  team: string;
  title: string;
  votes: number;
  videoThumb: string;
  date: string;
}

export default function GoalOfTheMonthPage() {
  const [goals, setGoals] = React.useState<GoalSubmission[]>([
    {
      id: 'g1',
      player: 'Ziad Ammar',
      team: 'Obour Eagles',
      title: 'Bicycle kick volley into top corner',
      votes: 142,
      videoThumb: '⚽',
      date: 'July 24, 2026',
    },
    {
      id: 'g2',
      player: 'Omar Khaled',
      team: 'El-Tagamoa Strikers',
      title: 'Solo dribble past 3 defenders & chip keeper',
      votes: 98,
      videoThumb: '🔥',
      date: 'July 21, 2026',
    },
    {
      id: 'g3',
      player: 'Youssef El-Sayed',
      team: 'Obour Stars',
      title: 'Long-range rocket off the crossbar',
      votes: 76,
      videoThumb: '⚡',
      date: 'July 18, 2026',
    },
  ]);

  const [votedIds, setVotedIds] = React.useState<string[]>([]);
  const [isUploading, setIsUploading] = React.useState(false);

  const handleVote = (id: string) => {
    if (votedIds.includes(id)) {
      toast.error('You have already voted for this goal!');
      return;
    }
    setVotedIds((prev) => [...prev, id]);
    setGoals((prev) =>
      prev.map((g) => (g.id === id ? { ...g, votes: g.votes + 1 } : g))
    );
    toast.success('Vote recorded! 🗳️');
  };

  return (
    <div className="min-h-screen bg-mesh py-10 px-4 md:px-8 max-w-6xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="stadium-glass p-8 md:p-12 rounded-3xl border-white/10 shadow-2xl space-y-4 text-center relative overflow-hidden">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-black uppercase">
          <Trophy className="w-4 h-4 text-amber-400" /> Community Contest
        </div>
        <h1 className="text-4xl md:text-6xl font-black text-foreground tracking-tight">
          Goal of the <span className="text-gradient-primary">Month</span>
        </h1>
        <p className="text-sm md:text-base text-muted-foreground max-w-xl mx-auto font-medium">
          Vote for the best 5-a-side goals scored in Obour & Cairo. Monthly winner gets a 2-Hour Pitch Booking Voucher!
        </p>

        <div className="pt-2">
          <Button
            onClick={() => setIsUploading(true)}
            size="lg"
            className="bg-primary text-black hover:bg-primary/90 font-black px-8 py-6 rounded-2xl glow-primary cursor-pointer flex items-center gap-2 mx-auto"
          >
            <Upload className="w-5 h-5" /> Submit Goal Video Clip
          </Button>
        </div>
      </div>

      {/* Goal Submissions Feed */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {goals.map((g, idx) => (
          <motion.div key={g.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}>
            <Card className="stadium-glass border-white/10 rounded-3xl p-6 shadow-xl card-lift flex flex-col justify-between h-full space-y-4">
              <div className="space-y-3">
                <div className="w-full h-44 rounded-2xl bg-emerald-950/60 border border-white/10 flex items-center justify-center text-5xl relative overflow-hidden group">
                  {g.videoThumb}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Video className="w-10 h-10 text-primary animate-pulse" />
                  </div>
                </div>

                <div>
                  <h3 className="font-black text-lg text-foreground">{g.title}</h3>
                  <p className="text-xs text-muted-foreground font-medium mt-1">
                    Scored by <strong className="text-foreground">{g.player}</strong> ({g.team})
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                <div className="text-xs font-black text-emerald-400 flex items-center gap-1">
                  <Flame className="w-4 h-4 text-amber-400" /> {g.votes} Votes
                </div>

                <Button
                  onClick={() => handleVote(g.id)}
                  disabled={votedIds.includes(g.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                    votedIds.includes(g.id)
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-primary text-black hover:bg-primary/90 glow-primary-sm'
                  }`}
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                  {votedIds.includes(g.id) ? 'Voted' : 'Vote'}
                </Button>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
