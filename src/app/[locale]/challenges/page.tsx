'use client';

import * as React from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useLocale } from 'next-intl';
import { motion } from 'framer-motion';
import { Swords, MapPin, Clock, Plus, CheckCircle2, X, Inbox } from 'lucide-react';
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
  const [squadName, setSquadName] = React.useState(appUser?.name || '');
  const [pitchName, setPitchName] = React.useState('');
  const [wager, setWager] = React.useState('');
  const [dateStr, setDateStr] = React.useState('');
  const [timeStr, setTimeStr] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);

  // Fix #23 & #24: Close modal on Escape key
  React.useEffect(() => {
    if (!isModalOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsModalOpen(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isModalOpen]);

  // Load real challenges from Firestore
  React.useEffect(() => {
    async function fetchChallenges() {
      setLoading(true);
      try {
        const snap = await getDocs(
          query(collection(db, 'squad_challenges'), orderBy('createdAt', 'desc'))
        );
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Challenge));
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

  const handleCreateChallenge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firebaseUser) {
      toast.error(isArabic ? 'يرجى تسجيل الدخول لنشر التحدي' : 'Please sign in to post a challenge');
      return;
    }
    if (!squadName.trim() || !pitchName.trim() || !wager.trim()) {
      toast.error(isArabic ? 'يرجى ملء جميع الحقول المطلوبة' : 'Please fill in all required fields');
      return;
    }
    setSubmitting(true);
    try {
      const newC = {
        challengerSquad: squadName.trim(),
        squadLogo: '🔥',
        pitchName: pitchName.trim(),
        city: appUser?.city || (isArabic ? 'العبور' : 'Obour'),
        date: dateStr || (isArabic ? 'غير محدد' : 'TBD'),
        time: timeStr || (isArabic ? 'غير محدد' : 'TBD'),
        wagerTerms: wager.trim(),
        accepted: false,
        postedBy: firebaseUser.uid,
        createdAt: serverTimestamp(),
      };
      const ref = await addDoc(collection(db, 'squad_challenges'), newC);
      setChallenges((prev) => [{ id: ref.id, ...newC } as Challenge, ...prev]);
      toast.success(isArabic ? 'تم نشر التحدي في ساحة المواجهات! ⚔️' : 'Squad Challenge posted to Arena! ⚔️');
      setIsModalOpen(false);
      setSquadName('');
      setPitchName('');
      setWager('');
      setDateStr('');
      setTimeStr('');
    } catch (err) {
      console.error(err);
      toast.error(isArabic ? 'فشل نشر التحدي. يرجى المحاولة مرة أخرى.' : 'Failed to post challenge. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black py-10 px-4 md:px-8 max-w-6xl mx-auto space-y-8" dir={isArabic ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 stadium-glass p-8 rounded-3xl border-white/10 shadow-xl bg-black">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-black">
            <Swords className="w-4 h-4" /> {isArabic ? 'ساحة تحديات الفرق' : 'Squad vs Squad Arena'}
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-foreground">
            {isArabic ? 'تحديات' : 'Squad'} <span className="text-gradient-primary">{isArabic ? 'الفرق' : 'Challenges'}</span>
          </h1>
          <p className="text-sm text-muted-foreground">
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
          className="bg-primary text-black hover:bg-primary/90 font-black px-6 py-6 rounded-2xl glow-primary cursor-pointer flex items-center gap-2"
        >
          <Plus className="w-5 h-5" /> {isArabic ? 'إضافة تحدي جديد' : 'Post Challenge'}
        </Button>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="text-center py-20 space-y-3">
          <div className="w-10 h-10 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
          <p className="text-xs text-muted-foreground font-medium">{isArabic ? 'جاري تحميل التحديات...' : 'Loading challenges...'}</p>
        </div>
      ) : challenges.length === 0 ? (
        /* Empty state */
        <Card className="global-box border-white/10 rounded-3xl p-12 text-center space-y-4 bg-black">
          <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-3xl mx-auto">
            <Inbox className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-black text-foreground">{isArabic ? 'لا توجد تحديات نشطة حالياً' : 'No Active Challenges Yet'}</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
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
            className="bg-primary text-black font-black rounded-2xl glow-primary mx-auto"
          >
            <Plus className="w-4 h-4 me-2" /> {isArabic ? 'نشر أول تحدي' : 'Post the First Challenge'}
          </Button>
        </Card>
      ) : (
        /* Challenges Grid */
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
                    {isArabic ? 'مباراة 5v5' : '5v5 Challenge'}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-black border border-white/10 space-y-1">
                  <div className="text-xs font-bold text-muted-foreground">{isArabic ? 'شروط ورهان المباراة' : 'Match Terms & Stakes'}</div>
                  <div className="text-sm font-black text-amber-400">{c.wagerTerms}</div>
                  <div className="text-xs text-muted-foreground flex items-center gap-2 pt-1">
                    <Clock className="w-3.5 h-3.5 text-primary" /> {c.date} - {c.time}
                  </div>
                </div>

                <Button
                  onClick={() => handleAcceptChallenge(c.id, c.challengerSquad)}
                  disabled={c.accepted || acceptingId === c.id}
                  className={`w-full py-3.5 rounded-2xl font-black transition-all cursor-pointer flex items-center justify-center gap-2 ${
                    c.accepted
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-primary text-black hover:bg-primary/90 glow-primary-sm'
                  }`}
                >
                  {c.accepted ? <CheckCircle2 className="w-4 h-4" /> : <Swords className="w-4 h-4" />}
                  {c.accepted ? (isArabic ? 'تم تأكيد المباراة وموعد الملعب!' : 'Match Locked & Confirmed!') : acceptingId === c.id ? (isArabic ? 'جاري القبول...' : 'Accepting...') : (isArabic ? 'قبول التحدي ⚔️' : 'Accept Challenge ⚔️')}
                </Button>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Post Challenge Modal */}
      {isModalOpen && (
        <Portal>
          <div
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setIsModalOpen(false)}
          >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-lg stadium-glass border-white/10 rounded-3xl p-6 md:p-8 space-y-4 shadow-2xl relative"
            dir={isArabic ? 'rtl' : 'ltr'}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h2 className="text-2xl font-black text-foreground">{isArabic ? 'إضافة تحدي بين الفرق' : 'Post Squad Challenge'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 rounded-full bg-white/5 hover:bg-white/10 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateChallenge} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">{isArabic ? 'اسم فريقك *' : 'Your Squad Name *'}</label>
                <input
                  type="text"
                  required
                  value={squadName}
                  onChange={(e) => setSquadName(e.target.value)}
                  placeholder={isArabic ? 'مثال: صقور العبور' : 'e.g. Obour Warriors'}
                  className="w-full p-3.5 rounded-2xl bg-white/5 border border-white/10 text-foreground text-sm font-medium focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">{isArabic ? 'عنوان أو اسم الملعب *' : 'Pitch Location *'}</label>
                <input
                  type="text"
                  required
                  value={pitchName}
                  onChange={(e) => setPitchName(e.target.value)}
                  placeholder={isArabic ? 'مثال: استاد الأهلي بالعبور - ملعب 2' : 'e.g. Al Ahly Obour Stadium Pitch 2'}
                  className="w-full p-3.5 rounded-2xl bg-white/5 border border-white/10 text-foreground text-sm font-medium focus:outline-none focus:border-primary"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">{isArabic ? 'اليوم' : 'Date'}</label>
                  <input
                    type="date"
                    value={dateStr}
                    onChange={(e) => setDateStr(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full p-3.5 rounded-2xl bg-white/5 border border-white/10 text-foreground text-sm font-medium focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">{isArabic ? 'الوقت' : 'Time'}</label>
                  <input
                    type="time"
                    value={timeStr}
                    onChange={(e) => setTimeStr(e.target.value)}
                    className="w-full p-3.5 rounded-2xl bg-white/5 border border-white/10 text-foreground text-sm font-medium focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">{isArabic ? 'شرط التحدي والرهان *' : 'Wager Terms *'}</label>
                <input
                  type="text"
                  required
                  value={wager}
                  onChange={(e) => setWager(e.target.value)}
                  placeholder={isArabic ? 'مثال: الخاسر يدفع حجز الملعب كاملاً' : 'e.g. Loser Pays Pitch Fee'}
                  className="w-full p-3.5 rounded-2xl bg-white/5 border border-white/10 text-foreground text-sm font-medium focus:outline-none focus:border-primary"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                  className="w-1/2 stadium-glass border-white/10 text-foreground rounded-2xl"
                >
                  {isArabic ? 'إلغاء' : 'Cancel'}
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-1/2 bg-primary text-black font-black rounded-2xl glow-primary"
                >
                  {submitting ? (isArabic ? 'جاري النشر...' : 'Posting...') : (isArabic ? 'نشر التحدي 🚀' : 'Post Challenge 🚀')}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
        </Portal>
      )}
    </div>
  );
}
