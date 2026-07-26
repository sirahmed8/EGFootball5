'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from '@/i18n/routing';
import { doc, collection, query, where, onSnapshot, runTransaction, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useTranslations, useLocale } from 'next-intl';
import { Booking, Pitch, BookingStatus } from '@/types';

import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Trophy,
  Plus,
  MessageCircle,
  Share2,
  Target,
  Sparkles,
} from 'lucide-react';
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { MatchesPageSkeleton } from '@/components/skeletons/PageSkeletons';

const MatchChat = dynamic(() => import('@/components/MatchChat'), { ssr: false });

const SAMPLE_PUBLIC_MATCHES: Booking[] = [
  {
    id: 'sample-match-1',
    userId: 'sample-host-1',
    pitchId: 'obour-stadium-1',
    date: '2026-07-26',
    timeSlot: 20,
    duration: 1,
    status: BookingStatus.CONFIRMED,
    totalAmount: 350,
    depositAmount: 100,
    createdAt: 1700000000000,
    bookingType: 'public',
    numPeople: 10,
    joinedPlayers: [
      { uid: 'u1', name: 'كابتن محمود (Host) [MID]' },
      { uid: 'u2', name: 'أحمد علي [STR]' },
      { uid: 'u3', name: 'عمر خالد [DEF]' },
      { uid: 'u4', name: 'مصطفى حسين [GK]' },
      { uid: 'u5', name: 'إسلام طارق [MID]' },
      { uid: 'u6', name: 'كريم عادل [STR]' },
      { uid: 'u7', name: 'يوسف أيمن [DEF]' },
    ],
  },
  {
    id: 'sample-match-2',
    userId: 'sample-host-2',
    pitchId: 'elnojoom-pitch-2',
    date: '2026-07-27',
    timeSlot: 21.5,
    duration: 1.5,
    status: BookingStatus.CONFIRMED,
    totalAmount: 500,
    depositAmount: 150,
    createdAt: 1700000000000,
    bookingType: 'public',
    numPeople: 14,
    joinedPlayers: [
      { uid: 'u8', name: 'كابتن رامي (Host) [STR]' },
      { uid: 'u9', name: 'سامح حسن [MID]' },
      { uid: 'u10', name: 'طارق نبيل [DEF]' },
      { uid: 'u11', name: 'حازم ماهر [GK]' },
    ],
  },
];

function CreateMatchModal({ pitches }: { pitches: Pitch[]; isArabic?: boolean }) {
  const router = useRouter();
  const t = useTranslations('Matches');
  const [selectedPitchId, setSelectedPitchId] = useState<string>(pitches[0]?.id || '');
  const [open, setOpen] = useState(false);

  const handleProceed = () => {
    setOpen(false);
    if (selectedPitchId) {
      router.push(`/book?pitchId=${selectedPitchId}`);
    } else {
      router.push('/home');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button className="bg-primary text-black font-black hover:bg-primary/90 rounded-2xl flex items-center justify-center gap-2 h-12 px-6 w-full md:w-auto shadow-[0_0_20px_rgba(57,255,20,0.3)] transition-transform active:scale-95 cursor-pointer">
            <Plus className="w-5 h-5" />
            <span>{t('hostMatchBtn')}</span>
          </Button>
        }
      />
      <DialogContent className="sm:max-w-lg p-6 bg-card border-border backdrop-blur-2xl rounded-3xl shadow-2xl space-y-4">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black text-foreground flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" />
            <span>{t('hostMatchTitle')}</span>
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-xs font-medium">
            {t('hostMatchDesc')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <label className="text-xs font-bold text-foreground">
              {t('selectPitch')}
            </label>
            <select
              value={selectedPitchId}
              onChange={(e) => setSelectedPitchId(e.target.value)}
              className="w-full bg-background border border-border rounded-2xl p-3 text-sm font-bold text-foreground focus:outline-none cursor-pointer"
            >
              {pitches.map((p) => (
                <option key={p.id} value={p.id} className="bg-card text-foreground">
                  {p.name} — {p.pricePerHour} EGP/hr ({p.locationName || 'Obour'})
                </option>
              ))}
            </select>
          </div>

          <Button
            onClick={handleProceed}
            className="w-full bg-primary text-black font-black hover:bg-primary/90 rounded-2xl h-12 text-base shadow-[0_0_20px_rgba(57,255,20,0.3)] cursor-pointer"
          >
            {t('proceedToSlot')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function MatchesPage() {
  const { appUser, firebaseUser, loading: authLoading } = useAuthStore();
  const router = useRouter();
  const t = useTranslations('Matches');
  const tPositions = useTranslations('Positions');
  const locale = useLocale();
  const isArabic = locale === 'ar';

  const [matches, setMatches] = useState<Booking[]>([]);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [filter, setFilter] = useState<'all' | 'joined' | 'open'>('all');
  const [selectedPosition, setSelectedPosition] = useState<'GK' | 'DEF' | 'MID' | 'STR'>('STR');

  useEffect(() => {
    const matchesQ = query(
      collection(db, 'bookings'),
      where('bookingType', '==', 'public'),
      where('status', '==', 'confirmed')
    );

    const unsubscribeMatches = onSnapshot(
      matchesQ,
      (snapshot) => {
        const todayStr = new Date().toISOString().split('T')[0];
        const fetchedMatches = snapshot.docs
          .map((doc) => doc.data() as Booking)
          .filter((match) => match.date >= todayStr);

        fetchedMatches.sort((a, b) => {
          if (a.date !== b.date) return a.date.localeCompare(b.date);
          return a.timeSlot - b.timeSlot;
        });

        setMatches(fetchedMatches);
        setLoadingData(false);
      },
      (error) => {
        console.error('Error fetching public matches: ', error);
        setMatches([]);
        setLoadingData(false);
      }
    );

    return () => unsubscribeMatches();
  }, []);

  const { data: pitchesCache = {}, isLoading: pitchesLoading } = useQuery({
    queryKey: ['pitches_dict'],
    queryFn: async () => {
      const q = query(collection(db, 'pitches'));
      const snapshot = await getDocs(q);
      const cache: Record<string, Pitch> = {};
      snapshot.docs.forEach((doc) => {
        cache[doc.id] = doc.data() as Pitch;
      });
      return cache;
    },
  });

  const availablePitchesList = Object.values(pitchesCache);

  const formatTimeSlot = (hour: number) => {
    const modHour = hour % 12 || 12;
    const ampm = hour >= 12 && hour < 24 ? 'PM' : 'AM';
    return `${modHour}:00 ${ampm}`;
  };

  const handleJoinMatch = async (match: Booking) => {
    if (!firebaseUser || !appUser) {
      toast.error(t('loginToJoin'));
      router.push('/login');
      return;
    }

    setLoadingAction(match.id);
    try {
      const bookingRef = doc(db, 'bookings', match.id);

      await runTransaction(db, async (transaction) => {
        const snap = await transaction.get(bookingRef);
        if (!snap.exists()) throw new Error('Match not found');

        const data = snap.data() as Booking;
        const joined = data.joinedPlayers || [];

        const alreadyJoined = joined.some((p) => p.uid === firebaseUser.uid);
        if (alreadyJoined) {
          throw new Error(t('alreadyJoinedErr'));
        }

        if (joined.length >= data.numPeople) {
          throw new Error(t('matchFullErr'));
        }

        const newPlayer = {
          uid: firebaseUser.uid,
          name: `${appUser.name || 'Player'} [${selectedPosition}]`,
          joinedAt: Date.now(),
        };

        transaction.update(bookingRef, {
          joinedPlayers: [...joined, newPlayer],
        });
      });

      toast.success(t('joinSuccess'));
    } catch (error: unknown) {
      const err = error as Error;
      toast.error(err.message || t('errorGeneric'));
    } finally {
      setLoadingAction(null);
    }
  };

  const handleLeaveMatch = async (match: Booking) => {
    if (!firebaseUser) return;
    setLoadingAction(match.id);

    try {
      const bookingRef = doc(db, 'bookings', match.id);

      await runTransaction(db, async (transaction) => {
        const snap = await transaction.get(bookingRef);
        if (!snap.exists()) throw new Error('Match not found');

        const data = snap.data() as Booking;
        const joined = data.joinedPlayers || [];

        const updated = joined.filter((p) => p.uid !== firebaseUser.uid);

        transaction.update(bookingRef, {
          joinedPlayers: updated,
        });
      });

      toast.success(t('leaveSuccess'));
    } catch (error: unknown) {
      const err = error as Error;
      toast.error(err.message || t('errorGeneric'));
    } finally {
      setLoadingAction(null);
    }
  };

  const shareMatchToWhatsApp = (match: Booking, pitchName?: string) => {
    const text = isArabic
      ? `⚽ انضم لمباراتنا الكروية على ملعب ${pitchName || 'Kickoff'} يوم ${match.date} الساعة ${formatTimeSlot(match.timeSlot)}!`
      : `⚽ Join our football match at ${pitchName || 'Kickoff'} on ${match.date} at ${formatTimeSlot(match.timeSlot)}!`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const filteredMatches = matches.filter((match) => {
    if (filter === 'joined') {
      return firebaseUser && match.joinedPlayers?.some((p) => p.uid === firebaseUser.uid);
    }
    if (filter === 'open') {
      const currentCount = match.joinedPlayers?.length || 1;
      return currentCount < match.numPeople;
    }
    return true;
  });

  if (loadingData || pitchesLoading || authLoading) {
    return <MatchesPageSkeleton />;
  }

  return (
    <div className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-8 space-y-8 mt-10 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border/40 pb-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Trophy className="w-8 h-8 text-primary drop-shadow-[0_0_10px_rgba(57,255,20,0.5)]" />
            <h1 className="text-4xl font-black text-foreground tracking-tight">{t('title')}</h1>
          </div>
          <p className="text-muted-foreground text-base max-w-2xl font-medium">{t('subtitle')}</p>
        </div>

        {/* Inline CreateMatchModal replaces router.push('/home') */}
        <CreateMatchModal pitches={availablePitchesList} isArabic={isArabic} />
      </div>

      {/* Position Selector Bar */}
      <div className="p-4 rounded-3xl bg-card/70 border border-border backdrop-blur-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-xl">
        <span className="font-extrabold text-foreground flex items-center gap-1.5">
          <Target className="w-4 h-4 text-emerald-400" />
          <span>{tPositions('title')}</span>
        </span>
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'GK', label: tPositions('gk') },
            { id: 'DEF', label: tPositions('def') },
            { id: 'MID', label: tPositions('mid') },
            { id: 'STR', label: tPositions('str') },
          ].map((pos) => (
            <button
              key={pos.id}
              onClick={() => setSelectedPosition(pos.id as 'GK' | 'DEF' | 'MID' | 'STR')}
              className={`px-3.5 py-2 rounded-2xl font-black border transition-all cursor-pointer ${
                selectedPosition === pos.id
                  ? 'bg-primary text-black border-primary shadow-[0_0_12px_rgba(57,255,20,0.4)]'
                  : 'bg-background/40 border-border text-muted-foreground hover:bg-muted'
              }`}
            >
              {pos.label}
            </button>
          ))}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-border pb-4 w-full overflow-x-auto scrollbar-none">
        {[
          { id: 'all', label: t('allMatchesTab') },
          { id: 'open', label: t('openMatchesTab') },
          { id: 'joined', label: t('joinedMatchesTab') },
        ].map((tab) => {
          const active = filter === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id as 'all' | 'joined' | 'open')}
              className={`px-5 py-2.5 text-xs font-black rounded-full border transition-all duration-300 hover:scale-[1.03] active:scale-95 whitespace-nowrap cursor-pointer ${
                active
                  ? 'bg-primary text-black border-transparent shadow-[0_0_15px_rgba(57,255,20,0.3)]'
                  : 'bg-card text-muted-foreground border-border hover:text-foreground hover:bg-muted/50'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Match Cards List */}
      {filteredMatches.length === 0 ? (
        <Card className="bg-card/40 border-border/60 backdrop-blur-xl py-16 text-center rounded-3xl">
          <CardContent className="space-y-4 max-w-md mx-auto pt-6">
            <span className="text-5xl block">⚽</span>
            <h3 className="text-2xl font-black text-foreground">
              {t('noMatchesAvailable')}
            </h3>
            <p className="text-muted-foreground text-sm font-medium leading-relaxed">{t('noMatches')}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMatches.map((match) => {
            const pitch = pitchesCache[match.pitchId];
            const currentPlayers = match.joinedPlayers?.length || 1;
            const spotsRemaining = match.numPeople - currentPlayers;
            const isUserJoined = firebaseUser && match.joinedPlayers?.some((p) => p.uid === firebaseUser.uid);
            const isFull = currentPlayers >= match.numPeople;

            return (
              <Card
                key={match.id}
                className="bg-card/70 border-border hover:border-primary/40 hover:shadow-[0_0_30px_rgba(57,255,20,0.1)] transition-all duration-300 backdrop-blur-xl flex flex-col justify-between overflow-hidden rounded-3xl"
              >
                <div>
                  <div className="h-44 w-full relative bg-slate-900 flex items-center justify-center overflow-hidden border-b border-border/40">
                    <Image
                      src={pitch?.imagePreviewUrl || '/stadium_hero_bg.jpg'}
                      alt={pitch?.name || 'Pitch'}
                      fill
                      unoptimized
                      className="object-cover w-full h-full transform hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-black/40" />

                    <span className="absolute top-3 end-3 px-3 py-1 rounded-full text-xs font-black bg-primary text-black shadow-md">
                      {t('spotsSummary', { joined: currentPlayers, total: match.numPeople })}
                    </span>

                    {spotsRemaining > 0 && (
                      <span className="absolute top-3 start-3 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 backdrop-blur-md">
                        🔥 {spotsRemaining} {t('spotsLeft')}
                      </span>
                    )}
                  </div>

                  <CardContent className="p-5 space-y-4">
                    <div>
                      <h3 className="font-black text-lg text-foreground line-clamp-1">
                        {pitch?.name || 'Obour Champions Stadium'}
                      </h3>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 font-medium mt-1">
                        <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                        <span>{pitch?.locationName || 'Obour City'}</span>
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs bg-muted/40 p-3 rounded-2xl border border-border/40 font-bold">
                      <div className="flex items-center gap-1.5 text-foreground">
                        <CalendarIcon className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>{match.date}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-foreground">
                        <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                        <span>{formatTimeSlot(match.timeSlot)} ({match.duration}h)</span>
                      </div>
                    </div>

                    {/* Joined Players Badges List */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold text-muted-foreground">
                        <span>{t('joinedPlayersTitle')}</span>
                        <span className="font-mono text-primary">{currentPlayers}/{match.numPeople}</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pe-1">
                        {match.joinedPlayers?.map((player, idx) => (
                          <span
                            key={idx}
                            className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                              player.uid === firebaseUser?.uid
                                ? 'bg-primary text-black border-primary font-black'
                                : 'bg-muted/80 text-foreground border-border/60'
                            }`}
                          >
                            ⚽ {player.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </div>

                <div className="p-5 pt-0 space-y-2">
                  <div className="flex items-center gap-2">
                    {isUserJoined ? (
                      <Button
                        onClick={() => handleLeaveMatch(match)}
                        disabled={loadingAction === match.id}
                        variant="destructive"
                        className="flex-1 font-extrabold rounded-2xl text-xs py-5 cursor-pointer"
                      >
                        {loadingAction === match.id ? t('processing') : t('leaveMatchBtn')}
                      </Button>
                    ) : (
                      <Button
                        onClick={() => handleJoinMatch(match)}
                        disabled={loadingAction === match.id || isFull}
                        className={`flex-1 font-black rounded-2xl text-xs py-5 transition-all cursor-pointer ${
                          isFull
                            ? 'bg-muted text-muted-foreground cursor-not-allowed'
                            : 'bg-primary text-black hover:bg-primary/90 shadow-md shadow-primary/20'
                        }`}
                      >
                        {loadingAction === match.id
                          ? t('processing')
                          : isFull
                          ? t('matchFull')
                          : t('joinMatchBtn', { position: selectedPosition })}
                      </Button>
                    )}

                    <Button
                      onClick={() => shareMatchToWhatsApp(match, pitch?.name)}
                      variant="outline"
                      size="icon"
                      className="rounded-2xl border-border text-foreground hover:bg-emerald-500/20 hover:text-emerald-400 hover:border-emerald-500/40 p-2.5 shrink-0 cursor-pointer"
                      title={t('shareWhatsApp')}
                    >
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Realtime Match Chat Dialog trigger */}
                  <Dialog>
                    <DialogTrigger
                      render={
                        <Button
                          variant="ghost"
                          className="w-full text-xs font-bold text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 rounded-xl py-2 flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <MessageCircle className="w-4 h-4" />
                          <span>{t('openMatchChat')}</span>
                        </Button>
                      }
                    />
                    <DialogContent className="sm:max-w-lg p-0 bg-card/95 border-border backdrop-blur-2xl rounded-3xl shadow-2xl overflow-hidden">
                      <DialogHeader className="p-4 pb-0">
                        <DialogTitle className="text-lg font-black text-foreground">
                          💬 {t('matchChatTitle', { pitchName: pitch?.name || 'Obour Match' })}
                        </DialogTitle>
                      </DialogHeader>
                      <div className="p-4 pt-2">
                        <MatchChat matchId={match.id} />
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
