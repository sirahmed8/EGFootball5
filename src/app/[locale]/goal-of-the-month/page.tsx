'use client';

import * as React from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useLocale } from 'next-intl';
import { motion } from 'framer-motion';
import { Sparkles, ThumbsUp, Upload, CheckCircle2, Video, Inbox, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Portal } from '@/components/Portal';
import { toast } from 'sonner';
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

interface GoalSubmission {
  id: string;
  playerName: string;
  videoUrl: string;
  pitchName: string;
  votes: number;
  votedUsers?: string[];
  title: string;
}

export default function GoalOfTheMonthPage() {
  const locale = useLocale();
  const isArabic = locale === 'ar';
  const firebaseUser = useAuthStore((s) => s.firebaseUser);
  const appUser = useAuthStore((s) => s.appUser);

  const [submissions, setSubmissions] = React.useState<GoalSubmission[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [votingId, setVotingId] = React.useState<string | null>(null);

  // Form State for clip submission
  const [isSubmitOpen, setIsSubmitOpen] = React.useState(false);
  const [goalTitle, setGoalTitle] = React.useState('');
  const [videoUrl, setVideoUrl] = React.useState('');
  const [pitchName, setPitchName] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (!isSubmitOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsSubmitOpen(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isSubmitOpen]);

  // Load real goal contest submissions from Firestore
  React.useEffect(() => {
    async function fetchGoals() {
      setLoading(true);
      try {
        const snap = await getDocs(
          query(collection(db, 'goal_contest'), orderBy('votes', 'desc'))
        );
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() } as GoalSubmission));
        setSubmissions(list);
      } catch (err) {
        console.error(err);
        setSubmissions([]);
      } finally {
        setLoading(false);
      }
    }
    fetchGoals();
  }, []);

  const handleVote = async (goal: GoalSubmission) => {
    if (!firebaseUser) {
      toast.error(isArabic ? 'يرجى تسجيل الدخول للتصويت' : 'Please sign in to vote for Goal of the Month');
      return;
    }
    const currentVoted = goal.votedUsers || [];
    if (currentVoted.includes(firebaseUser.uid)) {
      toast.info(isArabic ? 'لقد قمت بالتصويت لهذا الهدف بالفعل!' : 'You have already voted for this goal!');
      return;
    }

    setVotingId(goal.id);
    try {
      const newVotes = goal.votes + 1;
      const newVotedUsers = [...currentVoted, firebaseUser.uid];
      await updateDoc(doc(db, 'goal_contest', goal.id), {
        votes: newVotes,
        votedUsers: newVotedUsers,
      });

      setSubmissions((prev) =>
        prev.map((g) =>
          g.id === goal.id
            ? { ...g, votes: newVotes, votedUsers: newVotedUsers }
            : g
        )
      );
      toast.success(isArabic ? `تم احتساب صوتك لهدف ${goal.playerName}! ⚽` : `Voted for ${goal.playerName}'s goal! ⚽`);
    } catch (err) {
      console.error(err);
      toast.error(isArabic ? 'فشل التصويت. يرجى المحاولة مرة أخرى.' : 'Failed to register vote. Please try again.');
    } finally {
      setVotingId(null);
    }
  };

  const handleSubmitGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firebaseUser) {
      toast.error(isArabic ? 'يرجى تسجيل الدخول لتقديم مقطع الهدف' : 'Please sign in to submit a goal clip');
      return;
    }
    if (!goalTitle.trim() || !videoUrl.trim()) {
      toast.error(isArabic ? 'يرجى إدخال عنوان الهدف ورابط الفيديو' : 'Please enter goal title and video URL');
      return;
    }
    setSubmitting(true);
    try {
      const newSub = {
        title: goalTitle.trim(),
        videoUrl: videoUrl.trim(),
        pitchName: pitchName.trim() || (isArabic ? 'ملعب بالعبور' : 'Obour Turf Pitch'),
        playerName: appUser?.name || firebaseUser.displayName || (isArabic ? 'لاعب' : 'Player'),
        votes: 0,
        votedUsers: [],
        createdAt: serverTimestamp(),
      };
      const ref = await addDoc(collection(db, 'goal_contest'), newSub);
      setSubmissions((prev) => [{ id: ref.id, ...newSub } as GoalSubmission, ...prev]);
      toast.success(isArabic ? 'تم تقديم مقطع الهدف للمسابقة! 🎬' : 'Goal clip submitted to contest! 🎬');
      setIsSubmitOpen(false);
      setGoalTitle('');
      setVideoUrl('');
      setPitchName('');
    } catch (err) {
      console.error(err);
      toast.error(isArabic ? 'فشل تقديم الهدف. يرجى المحاولة مرة أخرى.' : 'Failed to submit goal. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black py-10 px-4 md:px-8 max-w-6xl mx-auto space-y-8" dir={isArabic ? 'rtl' : 'ltr'}>
      {/* Header Banner */}
      <div className="stadium-glass p-8 md:p-12 rounded-3xl border-white/10 shadow-2xl space-y-4 text-center relative overflow-hidden bg-black">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-black uppercase">
          <Sparkles className="w-4 h-4 text-emerald-400" /> {isArabic ? 'مسابقة المجتمع الشهرية' : 'Community Contest'}
        </div>
        <h1 className="text-4xl md:text-6xl font-black text-foreground tracking-tight">
          {isArabic ? 'مسابقة' : 'Goal of the'} <span className="text-gradient-primary">{isArabic ? 'هدف الشهر' : 'Month'}</span>
        </h1>
        <p className="text-sm md:text-base text-muted-foreground max-w-xl mx-auto font-medium">
          {isArabic
            ? 'صوّت لأفضل أهداف الخماسي المسجلة بالعبور والقاهرة. الفائز بلقب هدف الشهر يحصل على قسيمة حجز ساعتين مجاناً!'
            : 'Vote for the best 5-a-side goals captured on pitch cameras. Winner receives a free 2-hour pitch reservation voucher!'}
        </p>

        <div className="pt-2">
          <Button
            onClick={() => {
              if (!firebaseUser) {
                toast.error(isArabic ? 'يرجى تسجيل الدخول لتقديم مقطع الهدف' : 'Please sign in to submit a goal clip');
                return;
              }
              setIsSubmitOpen(true);
            }}
            className="bg-primary text-black font-black px-8 py-6 rounded-2xl glow-primary cursor-pointer text-sm"
          >
            <Upload className="w-4 h-4 me-2" /> {isArabic ? 'ارفع فيديو الهدف' : 'Submit Goal Video Clip'}
          </Button>
        </div>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="text-center py-20 space-y-3">
          <div className="w-10 h-10 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
          <p className="text-xs text-muted-foreground font-medium">{isArabic ? 'جاري تحميل الأهداف...' : 'Loading goal submissions...'}</p>
        </div>
      ) : submissions.length === 0 ? (
        /* Empty state */
        <Card className="global-box border-white/10 rounded-3xl p-12 text-center space-y-4 bg-black">
          <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-3xl mx-auto">
            <Inbox className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-black text-foreground">{isArabic ? 'لم يتم تقديم مقاطع أهداف هذا الشهر بعد' : 'No Goal Clips Submitted Yet'}</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            {isArabic
              ? 'سجل هدفك الخرافي في مباراتك القادمة وارفع المقطع للانضمام للمسابقة والفوز بجوائز شهرية!'
              : 'Record your epic goal in your next match and submit the video clip to enter the contest!'}
          </p>
        </Card>
      ) : (
        /* Submissions Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {submissions.map((g) => {
            const hasVoted = firebaseUser && g.votedUsers?.includes(firebaseUser.uid);
            return (
              <motion.div key={g.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
                <Card className="stadium-glass border-white/10 rounded-3xl p-6 shadow-xl space-y-4 bg-black">
                  <div className="relative aspect-video rounded-2xl bg-black border border-white/10 overflow-hidden">
                    {g.videoUrl ? (
                      g.videoUrl.includes('youtube.com') || g.videoUrl.includes('youtu.be') ? (
                        <iframe
                          src={`https://www.youtube.com/embed/${g.videoUrl.includes('youtu.be/') ? g.videoUrl.split('youtu.be/')[1]?.split('?')[0] : g.videoUrl.split('v=')[1]?.split('&')[0]}`}
                          title={g.title}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          className="w-full h-full"
                        />
                      ) : (
                        <video
                          src={g.videoUrl}
                          controls
                          className="w-full h-full object-cover"
                          preload="metadata"
                        />
                      )
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Video className="w-12 h-12 text-muted-foreground/40" />
                      </div>
                    )}
                    <span className="absolute bottom-3 start-3 text-xs font-black text-white bg-black/80 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 z-10">
                      ⚽ {g.title}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-black text-base text-foreground">{g.playerName}</h3>
                      <p className="text-xs text-muted-foreground font-medium">{g.pitchName}</p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-sm font-black text-primary font-mono">{g.votes} {isArabic ? 'صوت' : 'votes'}</span>
                      <Button
                        onClick={() => handleVote(g)}
                        disabled={hasVoted || votingId === g.id}
                        size="sm"
                        className={`rounded-xl font-bold cursor-pointer ${
                          hasVoted
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-white/10 text-white hover:bg-white/20'
                        }`}
                      >
                        {hasVoted ? <CheckCircle2 className="w-4 h-4 me-1" /> : <ThumbsUp className="w-4 h-4 me-1" />}
                        {hasVoted ? (isArabic ? 'تم التصويت' : 'Voted') : (isArabic ? 'صوّت' : 'Vote')}
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {isSubmitOpen && (
        <Portal>
          <div 
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setIsSubmitOpen(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              className="w-full max-w-lg stadium-glass border-white/10 rounded-3xl p-6 md:p-8 space-y-4 bg-black relative" 
              dir={isArabic ? 'rtl' : 'ltr'}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h2 className="text-2xl font-black text-foreground">{isArabic ? 'تقديم فيديو الهدف للمسابقة' : 'Submit Goal Video Clip'}</h2>
                <button onClick={() => setIsSubmitOpen(false)} className="p-2 rounded-full bg-white/5 hover:bg-white/10 cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleSubmitGoal} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">{isArabic ? 'عنوان الهدف *' : 'Goal Title *'}</label>
                  <input type="text" required value={goalTitle} onChange={(e) => setGoalTitle(e.target.value)} placeholder={isArabic ? 'مثال: تسديدة صاروخية في المقص' : 'e.g. Long-range Rocket Top Corner'} className="w-full p-3.5 rounded-2xl bg-white/5 border border-white/10 text-foreground text-sm font-medium focus:outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">{isArabic ? 'رابط الفيديو (YouTube / MP4) *' : 'Video URL (YouTube / MP4) *'}</label>
                  <input type="url" required value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="https://..." className="w-full p-3.5 rounded-2xl bg-white/5 border border-white/10 text-foreground text-sm font-medium focus:outline-none focus:border-primary font-mono text-xs" />
                </div>
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">{isArabic ? 'اسم الملعب' : 'Pitch Name'}</label>
                  <input type="text" value={pitchName} onChange={(e) => setPitchName(e.target.value)} placeholder={isArabic ? 'مثال: استاد الأهلي بالعبور' : 'e.g. Obour Eagles Arena'} className="w-full p-3.5 rounded-2xl bg-white/5 border border-white/10 text-foreground text-sm font-medium focus:outline-none focus:border-primary" />
                </div>
                <div className="flex gap-3 pt-2">
                  <Button type="button" variant="outline" onClick={() => setIsSubmitOpen(false)} className="w-1/2 rounded-2xl">{isArabic ? 'إلغاء' : 'Cancel'}</Button>
                  <Button type="submit" disabled={submitting} className="w-1/2 bg-primary text-black font-black rounded-2xl glow-primary">{submitting ? (isArabic ? 'جاري التقديم...' : 'Submitting...') : (isArabic ? 'ارفع المقطع 🚀' : 'Submit Clip 🚀')}</Button>
                </div>
              </form>
            </motion.div>
          </div>
        </Portal>
      )}
    </div>
  );
}
