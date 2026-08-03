'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { Trophy, ThumbsUp, Upload, Sparkles, Video, Flame, Award, CheckCircle2, Inbox } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { collection, getDocs, query, orderBy, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useAuthStore } from '@/store/useAuthStore';

interface GoalSubmission {
  id: string;
  player: string;
  team: string;
  title: string;
  votes: number;
  videoUrl?: string;
  date: string;
}

export default function GoalOfTheMonthPage() {
  const firebaseUser = useAuthStore((s) => s.firebaseUser);
  const appUser = useAuthStore((s) => s.appUser);
  const [goals, setGoals] = React.useState<GoalSubmission[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [votedIds, setVotedIds] = React.useState<string[]>([]);
  const [isUploading, setIsUploading] = React.useState(false);
  const [newTitle, setNewTitle] = React.useState('');
  const [newVideoUrl, setNewVideoUrl] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    async function fetchGoals() {
      setLoading(true);
      try {
        const snap = await getDocs(query(collection(db, 'goal_contest'), orderBy('votes', 'desc')));
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() } as GoalSubmission));
        setGoals(list);
      } catch (err) {
        console.error(err);
        setGoals([]);
      } finally {
        setLoading(false);
      }
    }
    fetchGoals();
  }, []);

  const handleVote = async (id: string) => {
    if (!firebaseUser) {
      toast.error('Please sign in to vote for goals');
      return;
    }
    if (votedIds.includes(id)) {
      toast.error('You have already voted for this goal!');
      return;
    }
    setVotedIds((prev) => [...prev, id]);
    setGoals((prev) =>
      prev.map((g) => (g.id === id ? { ...g, votes: (g.votes || 0) + 1 } : g))
    );
    try {
      const target = goals.find((g) => g.id === id);
      if (target) {
        await updateDoc(doc(db, 'goal_contest', id), {
          votes: (target.votes || 0) + 1,
        });
      }
      toast.success('Vote recorded! 🗳️');
    } catch (err) {
      console.error(err);
    }
  };

  const handleGoalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firebaseUser) {
      toast.error('Please sign in to submit a goal');
      return;
    }
    if (!newTitle.trim()) {
      toast.error('Please enter a goal description');
      return;
    }
    setSubmitting(true);
    try {
      const newGoal = {
        player: appUser?.name || firebaseUser.displayName || 'Player',
        team: appUser?.city || 'Local Squad',
        title: newTitle.trim(),
        votes: 1,
        videoUrl: newVideoUrl.trim() || '',
        date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      };
      const docRef = await addDoc(collection(db, 'goal_contest'), newGoal);
      setGoals((prev) => [{ id: docRef.id, ...newGoal }, ...prev]);
      toast.success('Goal clip submitted successfully! ⚽');
      setIsUploading(false);
      setNewTitle('');
      setNewVideoUrl('');
    } catch (err) {
      console.error(err);
      toast.error('Failed to submit goal');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black py-10 px-4 md:px-8 max-w-6xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="global-box p-8 md:p-12 rounded-3xl border-white/10 shadow-2xl space-y-4 text-center relative overflow-hidden bg-black">
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
      {loading ? (
        <div className="text-center py-12 space-y-3">
          <div className="w-10 h-10 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
          <p className="text-xs text-muted-foreground font-medium">Loading contest submissions...</p>
        </div>
      ) : goals.length === 0 ? (
        <Card className="global-box border-white/10 rounded-3xl p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-3xl mx-auto">
            ⚽
          </div>
          <h3 className="text-xl font-black text-foreground">No Goal Clips Submitted Yet</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Be the first player to submit an incredible 5-a-side goal clip this month and claim the top spot!
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {goals.map((g, idx) => (
            <motion.div key={g.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}>
              <Card className="global-box border-white/10 rounded-3xl p-6 shadow-xl card-lift flex flex-col justify-between h-full space-y-4">
                <div className="space-y-3">
                  <div className="w-full h-44 rounded-2xl bg-black border border-white/10 flex items-center justify-center text-5xl relative overflow-hidden group">
                    ⚽
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
                    <Flame className="w-4 h-4 text-amber-400" /> {g.votes || 0} Votes
                  </div>

                  <Button
                    onClick={() => handleVote(g.id)}
                    disabled={votedIds.includes(g.id)}
                    className="px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 bg-primary text-black hover:bg-primary/90 disabled:opacity-50"
                  >
                    <ThumbsUp className="w-3.5 h-3.5" /> Vote
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Upload Goal Modal */}
      {isUploading && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="global-box border-white/10 rounded-3xl p-6 max-w-md w-full space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-lg font-black text-foreground flex items-center gap-2">
                <Video className="w-5 h-5 text-primary" /> Submit Goal Video Clip
              </h3>
              <button onClick={() => setIsUploading(false)} className="text-muted-foreground hover:text-foreground cursor-pointer">
                ✕
              </button>
            </div>

            <form onSubmit={handleGoalSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase block mb-1">Goal Description / Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Volley into top corner off crossbar"
                  required
                  className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-foreground text-sm font-medium focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase block mb-1">Video Link (Optional)</label>
                <input
                  type="text"
                  value={newVideoUrl}
                  onChange={(e) => setNewVideoUrl(e.target.value)}
                  placeholder="TikTok, Instagram, or YouTube video URL"
                  className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-foreground text-sm font-medium focus:outline-none focus:border-primary"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setIsUploading(false)} className="flex-1 rounded-xl">
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting} className="flex-1 bg-primary text-black font-black rounded-xl">
                  {submitting ? 'Submitting...' : 'Submit Clip'}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
