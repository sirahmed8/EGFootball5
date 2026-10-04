'use client';

import * as React from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useLocale } from 'next-intl';
import { motion } from 'framer-motion';
import { Swords, MapPin, Clock, Plus, CheckCircle2, Inbox, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { ChallengesPageSkeleton } from '@/components/skeletons/PageSkeletons';
import { PostChallengeModal } from './components/PostChallengeModal';

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
  postedBy?: string;
}

export default function SquadChallengesPage() {
  const locale = useLocale();
  const isArabic = locale === 'ar';
  const firebaseUser = useAuthStore((s) => s.firebaseUser);
  const appUser = useAuthStore((s) => s.appUser);

  const [challenges, setChallenges] = React.useState<Challenge[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [acceptingId, setAcceptingId] = React.useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);


  // Load real challenges from Firestore
  React.useEffect(() => {
    async function fetchChallenges() {
      setLoading(true);
      try {
        const snap = await getDocs(
          query(collection(db, 'squad_challenges'), orderBy('createdAt', 'desc'))
        );
        const list = snap.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            challengerSquad: data.challengerSquad || 'Unknown',
            squadLogo: data.squadLogo || '⚽',
            pitchName: data.pitchName || 'TBD',
            city: data.city || 'TBD',
            date: data.date || '',
            time: data.time || '',
            wagerTerms: data.wagerTerms || '',
            accepted: !!data.accepted,
            postedBy: data.postedBy || '',
          } as Challenge;
        });
        setChallenges(list);
      } catch (err) {
        console.error(err);
        setChallenges([]);
      } finally {
        setLoading(false);
      }
    }
    fetchChallenges();
  }, []);

  const handleAcceptChallenge = async (id: string, squad: string) => {
    if (!firebaseUser) {
      toast.error(isArabic ? 'يرجى تسجيل الدخول لقبول التحدي' : 'Please sign in to accept squad challenges');
      return;
    }
    setAcceptingId(id);
    try {
      await updateDoc(doc(db, 'squad_challenges', id), { accepted: true });
      setChallenges((prev) =>
        prev.map((c) => (c.id === id ? { ...c, accepted: true } : c))
      );
      toast.success(isArabic ? `تم قبول التحدي ضد فريق ${squad}! تم قفل الموعد ⚽` : `Challenge accepted against ${squad}! Pitch slot locked ⚽`);
    } catch (err) {
      console.error(err);
      toast.error(isArabic ? 'فشل قبول التحدي. يرجى المحاولة مرة أخرى.' : 'Failed to accept challenge. Please try again.');
    } finally {
      setAcceptingId(null);
    }
  };

  const handleDeleteChallenge = async (id: string) => {
    if (!firebaseUser) return;
    try {
      await deleteDoc(doc(db, 'squad_challenges', id));
      setChallenges((prev) => prev.filter((c) => c.id !== id));
      toast.success(isArabic ? 'تم سحب التحدي بنجاح' : 'Challenge withdrawn successfully');
    } catch (err) {
      console.error(err);
      toast.error(isArabic ? 'فشل سحب التحدي' : 'Failed to withdraw challenge');
    }
  };

  const handleCreateChallenge = async (data: {
    squadName: string;
    pitchName: string;
    dateStr: string;
    timeStr: string;
    wager: string;
  }) => {
    if (!firebaseUser) {
      toast.error(isArabic ? 'يرجى تسجيل الدخول لنشر التحدي' : 'Please sign in to post a challenge');
      return;
    }
    if (!data.squadName.trim() || !data.pitchName.trim() || !data.wager.trim()) {
      toast.error(isArabic ? 'يرجى ملء جميع الحقول المطلوبة' : 'Please fill in all required fields');
      return;
    }
    setSubmitting(true);
    try {
      const newC = {
        challengerSquad: data.squadName.trim(),
        squadLogo: '🔥',
        pitchName: data.pitchName.trim(),
        city: appUser?.city || (isArabic ? 'العبور' : 'Obour'),
        date: data.dateStr || (isArabic ? 'غير محدد' : 'TBD'),
        time: data.timeStr || (isArabic ? 'غير محدد' : 'TBD'),
        wagerTerms: data.wager.trim(),
        accepted: false,
        postedBy: firebaseUser.uid,
        createdAt: serverTimestamp(),
      };
      const ref = await addDoc(collection(db, 'squad_challenges'), newC);
      setChallenges((prev) => [{ id: ref.id, ...newC } as Challenge, ...prev]);
      toast.success(isArabic ? 'تم نشر التحدي في ساحة المواجهات! ⚔️' : 'Squad Challenge posted to Arena! ⚔️');
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      toast.error(isArabic ? 'فشل نشر التحدي. يرجى المحاولة مرة أخرى.' : 'Failed to post challenge. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };


  return (
    <div className="min-h-screen bg-black py-4 sm:py-8 px-2 sm:px-4 md:px-6 lg:px-8 max-w-6xl mx-auto space-y-6 w-full max-w-full overflow-x-hidden" dir={isArabic ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 stadium-glass p-4 sm:p-6 lg:p-8 rounded-3xl border-white/10 shadow-xl bg-black w-full overflow-hidden">
        <div className="space-y-1 min-w-0 flex-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-black max-w-full truncate">
            <Swords className="w-4 h-4 shrink-0" /> <span className="truncate">{isArabic ? 'ساحة تحديات الفرق' : 'Squad vs Squad Arena'}</span>
          </div>
          <h1 className="text-xl sm:text-3xl xl:text-5xl font-black text-foreground leading-tight break-words">
            {isArabic ? 'تحديات' : 'Squad'} <span className="text-gradient-primary">{isArabic ? 'الفرق' : 'Challenges'}</span>
          </h1>
          <p className="text-xs sm:text-sm xl:text-base text-muted-foreground leading-relaxed break-words max-w-2xl">
            {isArabic
              ? 'تحدَّ الفرق المنافسة في مباريات خماسي قوية مع تحديد شرط الخاسر أو الجائزة.'
              : 'Challenge rival neighborhood teams for 5-a-side matches with pitch stakes.'}
          </p>
        </div>

        <Button
          onClick={() => {
            if (!firebaseUser) {
              toast.error(isArabic ? 'يرجى تسجيل الدخول لنشر التحدي' : 'Please sign in to post a challenge');
              return;
            }
            setIsModalOpen(true);
          }}
          size="lg"
          className="bg-primary text-black hover:bg-primary/90 font-black px-5 py-3 rounded-2xl glow-primary cursor-pointer flex items-center justify-center gap-2 shrink-0 w-full sm:w-auto self-start xl:self-auto"
        >
          <Plus className="w-5 h-5 shrink-0" /> {isArabic ? 'إضافة تحدي جديد' : 'Post Challenge'}
        </Button>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="w-full">
          <ChallengesPageSkeleton />
        </div>
      ) : challenges.length === 0 ? (
        /* Empty state */
        <Card className="global-box border-border rounded-3xl p-6 sm:p-12 text-center space-y-4 bg-card max-w-full overflow-hidden">
          <div className="w-16 h-16 rounded-full bg-muted border border-border flex items-center justify-center text-3xl mx-auto">
            <Inbox className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg sm:text-xl font-black text-foreground">{isArabic ? 'لا توجد تحديات نشطة حالياً' : 'No Active Challenges Yet'}</h3>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto leading-relaxed break-words px-2">
            {isArabic
              ? 'كن أول فريق ينشر تحدياً. اختر الملعب، الموعد، وحدد شرط التحدي!'
              : 'Be the first squad to post a challenge. Challenge a rival team, set the pitch, and define the stakes!'}
          </p>
          <Button
            onClick={() => {
              if (!firebaseUser) {
                toast.error(isArabic ? 'يرجى تسجيل الدخول لنشر التحدي' : 'Please sign in to post a challenge');
                return;
              }
              setIsModalOpen(true);
            }}
            className="bg-primary text-black font-black rounded-2xl glow-primary mx-auto cursor-pointer text-xs sm:text-sm"
          >
            <Plus className="w-4 h-4 me-2 shrink-0" /> {isArabic ? 'نشر أول تحدي' : 'Post the First Challenge'}
          </Button>
        </Card>
      ) : (
        /* Challenges Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 w-full">
          {challenges.map((c) => (
            <motion.div key={c.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="min-w-0 w-full">
              <Card className="stadium-glass border-white/10 rounded-3xl p-4 sm:p-6 shadow-xl space-y-4 card-lift bg-black w-full min-w-0 overflow-hidden">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 min-w-0 w-full">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-black border border-white/10 flex items-center justify-center text-2xl sm:text-3xl shadow-inner shrink-0">
                      {c.squadLogo}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-black text-base sm:text-lg text-foreground truncate">{c.challengerSquad}</h3>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 truncate">
                        <MapPin className="w-3 h-3 text-primary shrink-0" /> <span className="truncate">{c.city} • {c.pitchName}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {c.postedBy === firebaseUser?.uid && !c.accepted && (
                      <button
                        onClick={() => handleDeleteChallenge(c.id)}
                        className="p-1 rounded-full bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-colors cursor-pointer shrink-0"
                        title={isArabic ? 'سحب التحدي' : 'Withdraw Challenge'}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                    <span className="px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[10px] font-black uppercase shrink-0 self-start sm:self-auto">
                      {isArabic ? 'مباراة 5v5' : '5v5 Challenge'}
                    </span>
                  </div>
                </div>

                <div className="p-3 sm:p-4 rounded-2xl bg-black border border-white/10 space-y-1">
                  <div className="text-xs font-bold text-muted-foreground">{isArabic ? 'شروط ورهان المباراة' : 'Match Terms & Stakes'}</div>
                  <div className="text-xs sm:text-sm font-black text-amber-400 break-words">{c.wagerTerms}</div>
                  <div className="text-xs text-muted-foreground flex items-center gap-2 pt-1 flex-wrap">
                    <Clock className="w-3.5 h-3.5 text-primary shrink-0" /> <span>{c.date} - {c.time}</span>
                  </div>
                </div>

                <Button
                  onClick={() => handleAcceptChallenge(c.id, c.challengerSquad)}
                  disabled={c.accepted || acceptingId === c.id}
                  className={`w-full py-3 sm:py-3.5 rounded-2xl font-black transition-all cursor-pointer flex items-center justify-center gap-2 text-xs sm:text-sm ${
                    c.accepted
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-primary text-black hover:bg-primary/90 glow-primary-sm'
                  }`}
                >
                  {c.accepted ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <Swords className="w-4 h-4 shrink-0" />}
                  {c.accepted ? (isArabic ? 'تم تأكيد المباراة وموعد الملعب!' : 'Match Locked & Confirmed!') : acceptingId === c.id ? (isArabic ? 'جاري القبول...' : 'Accepting...') : (isArabic ? 'قبول التحدي ⚔️' : 'Accept Challenge ⚔️')}
                </Button>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Post Challenge Modal */}
      <PostChallengeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        defaultSquadName={appUser?.name || ''}
        onSubmit={handleCreateChallenge}
        submitting={submitting}
        isArabic={isArabic}
      />
    </div>
  );
}

