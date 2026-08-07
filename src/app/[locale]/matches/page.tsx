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
  ShieldCheck,
} from 'lucide-react';
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { MatchesPageSkeleton } from '@/components/skeletons/PageSkeletons';
import { PitchTacticalBoard } from '@/components/PitchTacticalBoard';
import { EmergencyGKModal } from '@/components/EmergencyGKModal';
import { VerifyMatchModal } from '@/components/VerifyMatchModal';
import { MotionDiv } from '@/components/MotionWrapper';


const MatchChat = dynamic(() => import('@/components/MatchChat'), { ssr: false });

const SAMPLE_PUBLIC_MATCHES: Booking[] = [];

function CreateMatchModal({
  pitches,
  isArabic,
  firebaseUser,
}: {
  pitches: Pitch[];
  isArabic?: boolean;
  firebaseUser: any;
}) {
  const router = useRouter();
  const t = useTranslations('Matches');
  const [selectedPitchId, setSelectedPitchId] = useState<string>(pitches[0]?.id || '');
  const [open, setOpen] = useState(false);

  const handleOpenModal = () => {
    if (!firebaseUser) {
      toast.error(
        isArabic ? 'يرجى تسجيل الدخول أولاً لتنظيم مباراة جديدة' : 'Please sign in first to host a public match'
      );
      router.push('/login');
      return;
    }
    setOpen(true);
  };

  const handleProceed = () => {
    setOpen(false);
    if (selectedPitchId) {
      router.push(`/book?pitchId=${selectedPitchId}`);
    } else {
      router.push('/home');
    }
  };

  return (
    <>
      {/* Trigger Button */}
      <Button
        onClick={handleOpenModal}
        className="bg-primary text-black font-black hover:bg-primary/90 rounded-2xl flex items-center justify-center gap-2 h-12 px-6 w-full md:w-auto shadow-[0_0_20px_rgba(57,255,20,0.3)] transition-transform active:scale-95 cursor-pointer"
      >
        <Plus className="w-5 h-5" />
        <span>{t('hostMatchBtn')}</span>
      </Button>

      {/* Modern Host Match Modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg p-6 bg-[#0c1219] dark:bg-[#070b10] border border-border/80 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.9)] space-y-5 opacity-100">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-foreground flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-primary shrink-0" />
              <span>{t('hostMatchTitle')}</span>
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-xs font-medium leading-relaxed">
              {t('hostMatchDesc')}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-1">
            <label className="text-xs font-extrabold text-foreground uppercase tracking-wider block">
              {t('selectPitch')}
            </label>

            {pitches.length > 0 ? (
              <div className="space-y-2.5 max-h-[260px] overflow-y-auto pe-1">
                {pitches.map((p) => {
                  const isSelected = selectedPitchId === p.id || (pitches.length === 1 && selectedPitchId === '');
                  return (
                    <div
                      key={p.id}
                      onClick={() => setSelectedPitchId(p.id)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        isSelected
                          ? 'bg-primary/15 border-primary text-foreground shadow-[0_0_15px_rgba(57,255,20,0.2)]'
                          : 'bg-background/80 border-border hover:border-primary/40 text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="font-black text-sm text-foreground truncate">{p.name}</div>
                        <div className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5 font-medium">
                          <span>📍 {p.locationName || 'Obour City'}</span>
                          {p.capacity && (
                            <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-md font-bold text-[10px]">
                              {p.capacity}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="text-end shrink-0">
                        <div className="font-black text-primary text-sm font-mono">{p.pricePerHour} EGP</div>
                        <div className="text-[10px] text-muted-foreground font-semibold">per hour</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-background/50 border border-border text-center space-y-2">
                <p className="text-xs text-muted-foreground font-medium">
                  {isArabic ? 'لا توجد ملاعب متاحة حالياً على المنصة لتنظيم مباراة.' : 'No pitches currently available on the platform to host a match.'}
                </p>
              </div>
            )}

            <Button
              onClick={handleProceed}
              disabled={pitches.length === 0}
              className="w-full bg-primary text-black font-black hover:bg-primary/90 rounded-2xl h-12 text-base shadow-[0_0_20px_rgba(57,255,20,0.3)] cursor-pointer mt-2"
            >
              {t('proceedToSlot')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
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

  const [pastMatches, setPastMatches] = useState<Booking[]>([]);
  const [gkModal, setGkModal] = useState<{ isOpen: boolean; pitchName: string; timeSlot: string }>({
    isOpen: false,
    pitchName: '',
    timeSlot: '',
  });
  const [verifyModalMatch, setVerifyModalMatch] = useState<Booking | null>(null);


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
        const all = snapshot.docs.map((doc) => doc.data() as Booking);

        const upcoming = all.filter((m) => m.date >= todayStr);
        const past = all.filter((m) => m.date < todayStr);

        upcoming.sort((a, b) => {
          if (a.date !== b.date) return a.date.localeCompare(b.date);
          return a.timeSlot - b.timeSlot;
        });
        past.sort((a, b) => b.date.localeCompare(a.date));

        setMatches(upcoming);
        setPastMatches(past);
        setLoadingData(false);
      },
      (error) => {
        console.error('Error fetching public matches: ', error);
        setMatches([]);
        setPastMatches([]);
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

  const handleShareMatch = async (match: Booking) => {
    const link = window.location.origin + '/matches?id=' + match.id;
    try {
      await navigator.clipboard.writeText(link);
      toast.success('Match link copied! 📋');
    } catch {
      toast.error(isArabic ? 'تعذّر نسخ الرابط' : 'Could not copy link');
    }
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
    <div className="flex-1 max-w-7xl mx-auto w-full py-4 sm:py-6 px-2 sm:px-4 md:px-8 space-y-6 animate-in fade-in duration-500 bg-black max-w-full overflow-x-hidden">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border/40 pb-6 w-full">
        <div className="space-y-2 min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <Trophy className="w-6 h-6 sm:w-8 sm:h-8 text-primary drop-shadow-[0_0_10px_rgba(57,255,20,0.5)] shrink-0" />
            <h1 className="text-xl sm:text-3xl md:text-4xl font-black text-foreground tracking-tight break-words">{t('title')}</h1>
          </div>
          <p className="text-muted-foreground text-xs sm:text-sm md:text-base max-w-2xl font-medium leading-relaxed break-words">{t('subtitle')}</p>
        </div>

        <CreateMatchModal pitches={availablePitchesList} isArabic={isArabic} firebaseUser={firebaseUser} />
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

      {/* Tactical Lineup Visualizer */}
      <PitchTacticalBoard />

      {/* Match Cards List */}
      {filteredMatches.length === 0 ? (
        <div className="text-center py-12 px-4 space-y-4 max-w-full overflow-hidden">
          <div className="text-4xl sm:text-5xl">⚽</div>
          <h3 className="text-xl sm:text-2xl font-black text-foreground break-words leading-tight">No Open Matches Right Now</h3>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">Be the first to host a public match and invite players to join!</p>
        </div>
      ) : (
        <MotionDiv 
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: { 
              opacity: 1, 
              transition: { staggerChildren: 0.1 } 
            }
          }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredMatches.map((match) => {
            const pitch = pitchesCache[match.pitchId];
            const currentPlayers = match.joinedPlayers?.length || 1;
            const spotsRemaining = match.numPeople - currentPlayers;
            const isUserJoined = firebaseUser && match.joinedPlayers?.some((p) => p.uid === firebaseUser.uid);
            const isFull = currentPlayers >= match.numPeople;

            return (
              <MotionDiv
                key={match.id}
                variants={{
                  hidden: { opacity: 0, scale: 0.95, y: 15 },
                  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
                }}
                className="h-full"
              >
                <Card
                  className="stadium-glass border-white/10 card-lift transition-all duration-300 backdrop-blur-xl flex flex-col justify-between overflow-hidden rounded-3xl shadow-xl h-full"
                >
                  <div>
                    <div className="h-48 w-full relative bg-slate-900 flex items-center justify-center overflow-hidden border-b border-white/10">
                      <Image
                        src={pitch?.imagePreviewUrl || '/stadium_hero_bg.jpg'}
                        alt={pitch?.name || 'Pitch'}
                        fill
                        unoptimized
                        className="object-cover w-full h-full transform hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-black/40" />

                      <span className="absolute top-3 end-3 px-3.5 py-1 rounded-full text-xs font-black bg-primary text-black shadow-md">
                        {t('spotsSummary', { joined: currentPlayers, total: match.numPeople })}
                      </span>

                      {spotsRemaining > 0 && (
                        <span className="absolute top-3 start-3 px-3 py-1 rounded-full text-[11px] font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 backdrop-blur-md shadow-xs">
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
                          <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
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

                      {/* Capacity Progress Bar */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs font-bold text-muted-foreground">
                          <span>{t('joinedPlayersTitle')}</span>
                          <span className="font-mono text-primary">{currentPlayers}/{match.numPeople} Players</span>
                        </div>
                        {(() => {
                          const pct = Math.min((currentPlayers / match.numPeople) * 100, 100);
                          const barColor =
                            pct > 80
                              ? 'bg-rose-500'
                              : pct >= 50
                              ? 'bg-amber-400'
                              : 'bg-emerald-500';
                          return (
                            <div className="w-full h-2 rounded-full bg-muted/60 overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          );
                        })()}
                      </div>

                      {/* Joined Players Badges List */}
                      <div className="space-y-2">
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
                        onClick={() => handleShareMatch(match)}
                        variant="outline"
                        size="icon"
                        className="rounded-2xl border-border text-foreground hover:bg-emerald-500/20 hover:text-emerald-400 hover:border-emerald-500/40 p-2.5 shrink-0 cursor-pointer"
                        title={isArabic ? 'نسخ رابط المباراة' : 'Copy match link'}
                      >
                        <Share2 className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* Realtime Match Chat Dialog & Emergency GK Call triggers */}
                    <div className="flex gap-2 pt-1">
                      <Dialog>
                        <DialogTrigger
                          render={
                            <Button
                              variant="ghost"
                              className="flex-1 text-xs font-bold text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 rounded-xl py-2 flex items-center justify-center gap-1.5 cursor-pointer"
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

                      <Button
                        onClick={() =>
                          setGkModal({
                            isOpen: true,
                            pitchName: pitch?.name || 'Stadium',
                            timeSlot: formatTimeSlot(match.timeSlot),
                          })
                        }
                        variant="ghost"
                        className="text-xs font-black text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl py-2 px-3 flex items-center justify-center gap-1 cursor-pointer"
                        title={isArabic ? 'استدعاء حارس مرمى طارئ' : 'Emergency GK Call'}
                      >
                        🧤 {isArabic ? 'حارس طارئ' : 'Need GK'}
                      </Button>
                    </div>
                  </div>
                </Card>
              </MotionDiv>
            );
          })}
        </MotionDiv>
      )}

      {/* Emergency GK Modal render */}
      <EmergencyGKModal
        isOpen={gkModal.isOpen}
        onClose={() => setGkModal({ isOpen: false, pitchName: '', timeSlot: '' })}
        pitchName={gkModal.pitchName}
        timeSlot={gkModal.timeSlot}
      />

      {/* Past Matches — collapsed summary */}
      {pastMatches.length > 0 && (
        <details className="group rounded-2xl border border-border/40 bg-card/40 overflow-hidden mt-8">
          <summary className="flex items-center justify-between px-5 py-3.5 cursor-pointer select-none list-none">
            <span className="text-sm font-extrabold text-muted-foreground">
              🕐 {isArabic ? 'مباريات سابقة' : 'Past Matches'}
            </span>
            <span className="text-xs font-black px-3 py-1 rounded-full bg-muted text-muted-foreground">
              {pastMatches.length} {isArabic ? 'مباراة' : 'matches'}
            </span>
          </summary>
          <div className="p-5 border-t border-border/40 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pastMatches.map((match) => {
              const pitch = pitchesCache[match.pitchId];
              const isOwnerOrAdmin = appUser?.role === 'admin' || appUser?.role === 'owner';
              const isVerified = match.matchResult?.isVerified;

              return (
                <div key={match.id} className="bg-background/60 border border-border/40 rounded-2xl p-4 space-y-3 shadow-inner">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-black text-sm text-foreground">{pitch?.name || 'Pitch'}</h4>
                      <div className="text-xs text-muted-foreground font-bold flex items-center gap-1.5 mt-1">
                        <CalendarIcon className="w-3 h-3" /> {match.date}
                      </div>
                    </div>
                    {isVerified ? (
                      <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-md text-[10px] font-black uppercase flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" /> Verified
                      </span>
                    ) : (
                      <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-md text-[10px] font-black uppercase">
                        Unverified
                      </span>
                    )}
                  </div>

                  {isVerified && match.matchResult ? (
                    <div className="bg-muted/40 p-3 rounded-xl border border-border/40 space-y-2">
                      <div className="flex justify-between items-center font-black text-lg">
                        <span>Team A <span className="text-primary">{match.matchResult.teamAScore}</span></span>
                        <span className="text-muted-foreground text-sm">-</span>
                        <span><span className="text-primary">{match.matchResult.teamBScore}</span> Team B</span>
                      </div>
                      {match.matchResult.mvpUid && (
                        <div className="text-[11px] text-amber-400 flex items-center gap-1 font-bold">
                          <Trophy className="w-3 h-3" /> MVP Selected
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-xs text-muted-foreground italic font-medium">
                      Awaiting score verification...
                    </div>
                  )}

                  {!isVerified && isOwnerOrAdmin && (
                    <Button
                      onClick={() => setVerifyModalMatch(match)}
                      variant="outline"
                      className="w-full h-8 text-xs font-bold rounded-xl border-primary/30 text-primary hover:bg-primary/10"
                    >
                      Verify Result
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        </details>
      )}

      {verifyModalMatch && (
        <VerifyMatchModal
          isOpen={!!verifyModalMatch}
          onClose={() => setVerifyModalMatch(null)}
          match={verifyModalMatch}
        />
      )}
    </div>
  );
}

