'use client';

import * as React from 'react';
import { useLocale } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Crown, Sparkles, Inbox, Users } from 'lucide-react';
import { staggerContainer, cardItemVariant } from '@/lib/animations';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Portal } from '@/components/Portal';
import { toast } from 'sonner';
import { TournamentsPageSkeleton } from '@/components/skeletons/PageSkeletons';
import {
  collection,
  getDocs,
  query,
  orderBy,
  where,
  limit,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useAuthStore } from '@/store/useAuthStore';
import { isUserVip } from '@/lib/vip';

interface TournamentMatch {
  team1: string;
  score1: string | number;
  team2: string;
  score2: string | number;
  winner?: string;
}

interface TournamentRound {
  name: string;
  matches: TournamentMatch[];
}

interface Tournament {
  id: string;
  name: string;
  subtitle?: string;
  squadCount?: number;
  status?: 'upcoming' | 'live' | 'completed';
  rounds?: TournamentRound[];
  createdAt?: number;
}

export default function TournamentsPage() {
  const locale = useLocale();
  const isArabic = locale === 'ar';
  const firebaseUser = useAuthStore((s) => s.firebaseUser);
  const appUser = useAuthStore((s) => s.appUser);
  const [tournaments, setTournaments] = React.useState<Tournament[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [selectedTournament, setSelectedTournament] = React.useState<Tournament | null>(null);
  const [registering, setRegistering] = React.useState(false);

  // Fix #24: Close bracket modal on Escape key
  React.useEffect(() => {
    if (!selectedTournament) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedTournament(null);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [selectedTournament]);

  // Load real tournaments from Firestore
  React.useEffect(() => {
    async function fetchTournaments() {
      setLoading(true);
      try {
        const snap = await getDocs(
          query(collection(db, 'tournaments'), orderBy('createdAt', 'desc'))
        );
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Tournament));
        setTournaments(list);
      } catch (err) {
        console.error(err);
        setTournaments([]);
        toast.error(isArabic ? 'فشل تحميل البطولات. يرجى المحاولة مجدداً.' : 'Failed to load tournaments. Please try again.');
      } finally {
        setLoading(false);
      }
    }
    fetchTournaments();
  }, []);

  const handleRegister = async (tournament: Tournament) => {
    if (!firebaseUser) {
      toast.error(isArabic ? 'يرجى تسجيل الدخول لتسجيل فريقك' : 'Please sign in to register your squad');
      return;
    }
    setRegistering(true);
    const isVip = isUserVip(appUser);
    const isEliteVip = isVip && appUser?.vipTier === 'Pitch Pass VIP';
    try {
      // Prevent duplicate registrations
      const existing = await getDocs(
        query(
          collection(db, 'tournament_registrations'),
          where('tournamentId', '==', tournament.id),
          where('userId', '==', firebaseUser.uid),
          limit(1)
        )
      );
      if (!existing.empty) {
        toast.info(isArabic ? 'أنت مسجل بالفعل في هذه البطولة!' : 'You are already registered for this tournament!');
        setRegistering(false);
        return;
      }
      await addDoc(collection(db, 'tournament_registrations'), {
        tournamentId: tournament.id,
        tournamentName: tournament.name,
        userId: firebaseUser.uid,
        playerName: appUser?.name || firebaseUser.displayName || (isArabic ? 'لاعب' : 'Player'),
        isVipPass: isEliteVip,
        registeredAt: serverTimestamp(),
      });
      if (isEliteVip) {
        toast.success(isArabic ? `تم تفعيل قسيمة VIP المجانية وتسجيل فريقك في ${tournament.name}! 👑🏆` : `Free VIP Cup Voucher applied! Squad registered for ${tournament.name}! 👑🏆`);
      } else {
        toast.success(isArabic ? `تم تسجيل فريقك في ${tournament.name}! 🏆` : `Squad registered for ${tournament.name}! 🏆`);
      }
    } catch (err) {
      console.error(err);
      toast.error(isArabic ? 'فشل التسجيل. يرجى المحاولة مرة أخرى.' : 'Registration failed. Please try again.');
    } finally {
      setRegistering(false);
    }
  };

  const statusColor: Record<string, string> = {
    upcoming: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    live: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    completed: 'bg-white/10 text-muted-foreground border-white/10',
  };

  const statusLabel: Record<string, string> = {
    upcoming: isArabic ? 'قادمة قريباً' : 'upcoming',
    live: isArabic ? 'مباشر الآن' : 'live',
    completed: isArabic ? 'مكتملة' : 'completed',
  };

  return (
    <div className="min-h-screen bg-mesh py-4 sm:py-8 px-2 sm:px-4 md:px-8 max-w-6xl mx-auto space-y-6 w-full max-w-full overflow-x-hidden" dir={isArabic ? 'rtl' : 'ltr'}>
      {/* Header Banner */}
      <div className="stadium-glass p-4 sm:p-8 md:p-12 rounded-3xl border-white/10 shadow-2xl space-y-3 sm:space-y-4 text-center relative overflow-hidden w-full">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-black uppercase max-w-full truncate">
          <Trophy className="w-4 h-4 text-amber-400 shrink-0" /> <span className="truncate">{isArabic ? 'بطولات ودوريات EGFootball5' : 'EGFootball5 Tournament Gala'}</span>
        </div>
        <h1 className="text-xl sm:text-3xl md:text-5xl font-black text-foreground tracking-tight leading-tight break-words">
          {isArabic ? 'البطولات' : 'Amateur'} <span className="text-gradient-primary">{isArabic ? 'والدوريات الرياضية' : 'Tournaments & Cups'}</span>
        </h1>
        <p className="text-xs sm:text-sm md:text-base text-muted-foreground max-w-xl mx-auto font-medium leading-relaxed break-words">
          {isArabic
            ? 'تنافس في أقوى بطولات الخماسي بالعبور والقاهرة. شجرة مواجهات مباشرة، إحصائيات حية، وجوائز مالية!'
            : 'Compete in Egypt\'s premier 5-a-side knockout cups. Real-time bracket trees, live stats, and cash prizes!'}
        </p>
      </div>

      {/* Loading */}
      {loading ? (
        <TournamentsPageSkeleton />
      ) : tournaments.length === 0 ? (
        /* Empty state — no tournaments created yet */
        <Card className="stadium-glass border-white/10 rounded-3xl p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-3xl mx-auto">
            <Inbox className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-black text-foreground">{isArabic ? 'لا توجد بطولات معلنة حالياً' : 'No Tournaments Announced Yet'}</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            {isArabic
              ? 'ستقوم إدارة الملاعب بالإعلان عن البطولات والدوريات القادمة هنا. انتظر بطولة العبور الصيفية!'
              : 'The stadium management will announce upcoming tournaments and cups here. Stay tuned for the next Obour Cup!'}
          </p>
        </Card>
      ) : (
        <div className="space-y-8">
          {/* Tournament Cards */}
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {tournaments.map((t) => (
              <motion.div
                key={t.id}
                variants={cardItemVariant}
              >
                <Card className="stadium-glass border-white/10 rounded-3xl p-6 shadow-xl card-lift space-y-4 bg-black">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <h2 className="text-xl font-black text-foreground">{t.name}</h2>
                      {t.subtitle && (
                        <p className="text-xs text-muted-foreground font-medium">{t.subtitle}</p>
                      )}
                    </div>
                    {t.status && (
                      <span className={`px-2.5 py-1 rounded-full border text-[10px] font-black uppercase ${statusColor[t.status] || statusColor.upcoming}`}>
                        {statusLabel[t.status] || t.status}
                      </span>
                    )}
                  </div>

                  {t.squadCount != null && (
                    <div className="flex items-center gap-3 text-xs font-bold text-muted-foreground">
                      <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5 text-primary" /> {t.squadCount} {isArabic ? 'فرق' : 'Squads'}</span>
                    </div>
                  )}

                  <div className="flex gap-2">
                    {t.rounds && t.rounds.length > 0 && (
                      <Button
                        variant="outline"
                        onClick={() => setSelectedTournament(t)}
                        className="flex-1 rounded-2xl border-white/10 text-xs font-black"
                      >
                        <Sparkles className="w-4 h-4 me-1" /> {isArabic ? 'عرض المواجهات' : 'View Bracket'}
                      </Button>
                    )}
                    {t.status === 'upcoming' && (
                      <Button
                        onClick={() => handleRegister(t)}
                        disabled={registering}
                        className="flex-1 bg-primary text-black font-black rounded-2xl glow-primary cursor-pointer"
                      >
                        <Crown className="w-4 h-4 me-1" /> {registering ? (isArabic ? 'جاري التسجيل...' : 'Registering...') : (isArabic ? 'تسجيل الفريق' : 'Register Squad')}
                      </Button>
                    )}
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      )}

      {/* Bracket Viewer Modal */}
      <AnimatePresence>
        {selectedTournament && selectedTournament.rounds && (
          <Portal>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
              onClick={() => setSelectedTournament(null)}
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
                <Sparkles className="text-primary" /> {isArabic ? 'شجرة مواجهات' : ''} {selectedTournament.name}
              </h2>
              <button
                onClick={() => setSelectedTournament(null)}
                className="p-2 rounded-full bg-white/5 hover:bg-white/10 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
              {selectedTournament.rounds.map((round, rIdx) => (
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
          </motion.div>
        </motion.div>
        </Portal>
      )}
      </AnimatePresence>
    </div>
  );
}
