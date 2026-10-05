'use client';

import * as React from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useLocale } from 'next-intl';
import { Swords, Plus, Inbox } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  updateDoc,
  deleteDoc,
  doc,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { ChallengesPageSkeleton } from '@/components/skeletons/PageSkeletons';
import { PostChallengeModal } from './components/PostChallengeModal';
import { ChallengeCard, Challenge } from './components/ChallengeCard';

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
  const [challengeToWithdraw, setChallengeToWithdraw] = React.useState<Challenge | null>(null);
  const [withdrawing, setWithdrawing] = React.useState(false);

  React.useEffect(() => {
    const q = query(collection(db, 'squad_challenges'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(
      q,
      (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Challenge));
        setChallenges(list);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching squad challenges:', err);
        setLoading(false);
      }
    );
    return () => unsub();
  }, []);

  const handleAcceptChallenge = async (id: string, squad: string) => {
    if (!firebaseUser) {
      toast.error(isArabic ? 'يرجى تسجيل الدخول لقبول التحدي' : 'Please sign in to accept challenge');
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

  const handleConfirmWithdraw = async () => {
    if (!firebaseUser || !challengeToWithdraw) return;
    setWithdrawing(true);
    try {
      await deleteDoc(doc(db, 'squad_challenges', challengeToWithdraw.id));
      setChallenges((prev) => prev.filter((c) => c.id !== challengeToWithdraw.id));
      toast.success(isArabic ? 'تم سحب التحدي بنجاح' : 'Challenge withdrawn successfully');
    } catch (err) {
      console.error(err);
      toast.error(isArabic ? 'فشل سحب التحدي' : 'Failed to withdraw challenge');
    } finally {
      setWithdrawing(false);
      setChallengeToWithdraw(null);
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
        time: data.timeStr || (isArabic ? 'موعد مرن' : 'Flexible Time'),
        wagerTerms: data.wager.trim(),
        accepted: false,
        postedBy: firebaseUser.uid,
        createdAt: serverTimestamp(),
      };
      await addDoc(collection(db, 'squad_challenges'), newC);
      toast.success(isArabic ? 'تم نشر التحدي بنجاح!' : 'Challenge posted successfully!');
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      toast.error(isArabic ? 'فشل نشر التحدي' : 'Failed to post challenge');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="min-h-screen py-10 px-4 md:px-8 max-w-6xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-500 overflow-x-clip"
      dir={isArabic ? 'rtl' : 'ltr'}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-card border border-border p-6 md:p-8 rounded-3xl shadow-xl">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 text-rose-400 text-xs font-black">
            <Swords className="w-3.5 h-3.5" />
            <span>{isArabic ? 'ساحة التحديات بين الفرق' : 'Squad vs Squad Arena'}</span>
          </div>
          <h1 className="text-3xl font-black text-foreground">
            {isArabic ? 'تحديات ' : 'Squad '}<span className="text-primary">{isArabic ? 'الفرق والمباريات' : 'Challenges'}</span>
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            {isArabic
              ? 'تحد فرق الأحياء الأخرى في مباريات خماسي قوية مع شروط ورهان الملعب.'
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
          className="bg-primary text-black font-black hover:bg-primary/90 rounded-2xl glow-primary shadow-lg cursor-pointer px-6 py-3 text-xs sm:text-sm shrink-0 self-stretch sm:self-auto"
        >
          <Plus className="w-4 h-4 me-2 shrink-0" /> {isArabic ? 'إضافة تحدي' : 'Post Challenge'}
        </Button>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="w-full">
          <ChallengesPageSkeleton />
        </div>
      ) : challenges.length === 0 ? (
        /* Empty state */
        <Card className="border-border rounded-3xl p-6 sm:p-12 text-center space-y-4 bg-card max-w-full overflow-hidden">
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
            <ChallengeCard
              key={c.id}
              challenge={c}
              currentUserId={firebaseUser?.uid}
              isArabic={isArabic}
              acceptingId={acceptingId}
              onAccept={handleAcceptChallenge}
              onWithdrawClick={(challenge) => setChallengeToWithdraw(challenge)}
            />
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

      {/* Confirmation Dialog for Challenge Withdrawal */}
      <Dialog open={!!challengeToWithdraw} onOpenChange={(open) => !open && setChallengeToWithdraw(null)}>
        <DialogContent className="rounded-3xl border-border bg-card">
          <DialogHeader>
            <DialogTitle className="text-destructive font-black flex items-center gap-2">
              <Swords className="w-5 h-5" />
              {isArabic ? 'سحب وإلغاء التحدي' : 'Withdraw Challenge'}
            </DialogTitle>
            <DialogDescription>
              {isArabic
                ? `هل أنت متأكد من رغبتك في سحب تحدي فريقك "${challengeToWithdraw?.challengerSquad}"؟ سيتم حذفه من لوحة التحديات العامة.`
                : `Are you sure you want to withdraw your challenge for "${challengeToWithdraw?.challengerSquad}"? It will be removed from the public challenges board.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setChallengeToWithdraw(null)}
              disabled={withdrawing}
              className="rounded-xl cursor-pointer"
            >
              {isArabic ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmWithdraw}
              disabled={withdrawing}
              className="rounded-xl font-bold cursor-pointer"
            >
              {withdrawing ? (isArabic ? 'جاري السحب...' : 'Withdrawing...') : (isArabic ? 'تأكيد السحب' : 'Withdraw Challenge')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
