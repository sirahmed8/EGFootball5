'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from '@/i18n/routing';
import { doc, collection, query, where, onSnapshot, runTransaction } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useTranslations, useLocale } from 'next-intl';
import { Booking, Pitch } from '@/types';
import { Users, Calendar as CalendarIcon, Clock, MapPin, Trophy, Plus, MessageCircle } from 'lucide-react';
import MatchChat from '@/components/MatchChat';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { MatchesPageSkeleton } from '@/components/skeletons/PageSkeletons';

export default function MatchesPage() {
  const { appUser, firebaseUser, loading: authLoading } = useAuthStore();
  const router = useRouter();
  const t = useTranslations('Matches');
  const locale = useLocale();

  const [matches, setMatches] = useState<Booking[]>([]);
  const [pitchesCache, setPitchesCache] = useState<Record<string, Pitch>>({});
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [filter, setFilter] = useState<'all' | 'joined' | 'open'>('all');

  useEffect(() => {
    // 1. Fetch public confirmed bookings
    const matchesQ = query(
      collection(db, 'bookings'),
      where('bookingType', '==', 'public'),
      where('status', '==', 'confirmed')
    );

    const unsubscribeMatches = onSnapshot(matchesQ, (snapshot) => {
      const todayStr = new Date().toISOString().split('T')[0];
      const fetchedMatches = snapshot.docs
        .map((doc) => doc.data() as Booking)
        .filter((match) => match.date >= todayStr);

      // Sort matches by date ascending, then timeSlot ascending
      fetchedMatches.sort((a, b) => {
        if (a.date !== b.date) return a.date.localeCompare(b.date);
        return a.timeSlot - b.timeSlot;
      });

      setMatches(fetchedMatches);
      setLoadingData(false);
    }, (error) => {
      console.error("Error fetching public matches: ", error);
      setLoadingData(false);
    });

    // 2. Fetch all pitches to cache metadata
    const pitchesQ = query(collection(db, 'pitches'));
    const unsubscribePitches = onSnapshot(pitchesQ, (snapshot) => {
      const cache: Record<string, Pitch> = {};
      snapshot.docs.forEach((doc) => {
        const pitch = doc.data() as Pitch;
        cache[pitch.id] = pitch;
      });
      setPitchesCache(cache);
    });

    return () => {
      unsubscribeMatches();
      unsubscribePitches();
    };
  }, []);

  const formatTimeSlot = (slot: number) => {
    const hour = Math.floor(slot);
    const mins = slot % 1 === 0 ? '00' : '30';
    const ampm = hour >= 12 && hour < 24 ? (locale === 'ar' ? 'م' : 'PM') : (locale === 'ar' ? 'ص' : 'AM');
    const modHour = hour % 12 || 12;
    return `${modHour}:${mins} ${ampm}`;
  };

  const handleJoinMatch = async (bookingId: string) => {
    if (!firebaseUser || !appUser) {
      toast.error(t('errorAuth'));
      router.push('/login');
      return;
    }
    if (appUser.isBlacklisted) {
      toast.error(t('errorBlacklisted'));
      return;
    }

    setLoadingAction(bookingId);
    try {
      const bookingRef = doc(db, 'bookings', bookingId);
      await runTransaction(db, async (transaction) => {
        const bookingSnap = await transaction.get(bookingRef);
        if (!bookingSnap.exists()) {
          throw new Error('Match not found');
        }
        const data = bookingSnap.data() as Booking;
        const joinedPlayers = data.joinedPlayers || [];
        const joinedPlayerNames = data.joinedPlayerNames || [];
        const numPeople = data.numPeople || 10;

        if (joinedPlayers.includes(firebaseUser.uid)) {
          throw new Error('Already joined');
        }
        if (joinedPlayers.length >= numPeople) {
          throw new Error(t('errorFull'));
        }

        const newPlayers = [...joinedPlayers, firebaseUser.uid];
        const newPlayerNames = [...joinedPlayerNames, appUser.name];

        transaction.update(bookingRef, {
          joinedPlayers: newPlayers,
          joinedPlayerNames: newPlayerNames
        });
      });
      toast.success(t('joinedSuccess'));
    } catch (error: unknown) {
      const err = error as Error;
      toast.error(err.message || t('errorGeneric'));
    } finally {
      setLoadingAction(null);
    }
  };

  const handleLeaveMatch = async (bookingId: string) => {
    if (!firebaseUser || !appUser) return;

    setLoadingAction(bookingId);
    try {
      const bookingRef = doc(db, 'bookings', bookingId);
      await runTransaction(db, async (transaction) => {
        const bookingSnap = await transaction.get(bookingRef);
        if (!bookingSnap.exists()) {
          throw new Error('Match not found');
        }
        const data = bookingSnap.data() as Booking;
        const joinedPlayers = data.joinedPlayers || [];
        const joinedPlayerNames = data.joinedPlayerNames || [];

        if (!joinedPlayers.includes(firebaseUser.uid)) {
          throw new Error('Not in this match');
        }

        if (data.userId === firebaseUser.uid) {
          throw new Error(
            locale === 'ar'
              ? 'لا يمكن لمنظم المباراة مغادرتها. إذا كنت تريد إلغاء المباراة، يرجى التواصل مع مدير الملعب.'
              : 'The match organizer cannot leave the match. Contact the manager if you want to cancel the booking.'
          );
        }

        const index = joinedPlayers.indexOf(firebaseUser.uid);
        if (index > -1) {
          const newPlayers = [...joinedPlayers];
          newPlayers.splice(index, 1);

          const newPlayerNames = [...joinedPlayerNames];
          if (index < newPlayerNames.length) {
            newPlayerNames.splice(index, 1);
          }

          transaction.update(bookingRef, {
            joinedPlayers: newPlayers,
            joinedPlayerNames: newPlayerNames
          });
        }
      });
      toast.success(t('leftSuccess'));
    } catch (error: unknown) {
      const err = error as Error;
      toast.error(err.message || t('errorGeneric'));
    } finally {
      setLoadingAction(null);
    }
  };

  const filteredMatches = matches.filter((match) => {
    if (filter === 'joined') {
      return firebaseUser && match.joinedPlayers?.includes(firebaseUser.uid);
    }
    if (filter === 'open') {
      const currentCount = match.joinedPlayers?.length || 1;
      return currentCount < match.numPeople;
    }
    return true;
  });

  if (loadingData || authLoading) {
    return <MatchesPageSkeleton />;
  }

  return (
    <div className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-8 space-y-8 mt-12 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border/40 pb-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Trophy className="w-8 h-8 text-primary drop-shadow-[0_0_8px_rgba(57,255,20,0.4)]" />
            <h1 className="text-4xl font-black text-foreground tracking-tight">{t('title')}</h1>
          </div>
          <p className="text-muted-foreground text-base max-w-2xl">{t('subtitle')}</p>
        </div>
        <Button
          onClick={() => router.push('/home')}
          className="bg-primary text-black font-bold hover:bg-primary/90 rounded-xl flex items-center gap-2 h-11 px-6 w-full md:w-auto shadow-[0_0_15px_rgba(57,255,20,0.3)] transition-transform active:scale-95 cursor-pointer"
        >
          <Plus className="w-5 h-5" />
          {locale === 'ar' ? 'تنظيم مباراة جديدة' : 'Host a Match'}
        </Button>
      </div>

      <div className="flex gap-2 border-b border-border pb-4 w-full overflow-x-auto scrollbar-none">
        {[
          { id: 'all', label: locale === 'ar' ? 'جميع المباريات' : 'All Matches' },
          { id: 'open', label: locale === 'ar' ? 'مباريات شاغرة' : 'Looking for Players' },
          { id: 'joined', label: locale === 'ar' ? 'مباريات انضممت إليها' : 'Joined Matches' },
        ].map((tab) => {
          const active = filter === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id as 'all' | 'joined' | 'open')}
              className={`px-5 py-2.5 text-sm font-semibold rounded-full border transition-all duration-300 hover:scale-[1.03] active:scale-95 whitespace-nowrap cursor-pointer ${
                active
                  ? 'bg-primary text-black border-transparent shadow-[0_0_12px_rgba(57,255,20,0.3)] font-bold'
                  : 'bg-card text-muted-foreground border-border hover:text-foreground hover:bg-muted/50'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {filteredMatches.length === 0 ? (
        <Card className="bg-card/30 border-border/60 backdrop-blur-xl py-16 text-center">
          <CardContent className="space-y-4 max-w-md mx-auto pt-6">
            <span className="text-5xl block">⚽</span>
            <h3 className="text-xl font-bold text-foreground">{locale === 'ar' ? 'لا توجد مباريات متاحة' : 'No matches available'}</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">{t('noMatches')}</p>
            <Button
              variant="outline"
              onClick={() => router.push('/home')}
              className="border-primary/40 text-primary hover:bg-primary/10 rounded-xl cursor-pointer"
            >
              {locale === 'ar' ? 'تصفح الملاعب المتاحة' : 'Browse Pitches'}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMatches.map((match) => {
            const pitch = pitchesCache[match.pitchId];
            const currentPlayers = match.joinedPlayers?.length || 1;
            const spotsRemaining = match.numPeople - currentPlayers;
            const isUserJoined = firebaseUser && match.joinedPlayers?.includes(firebaseUser.uid);
            const isFull = currentPlayers >= match.numPeople;

            return (
              <Card
                key={match.id}
                className="bg-card/40 border-border hover:border-primary/25 hover:shadow-[0_0_25px_rgba(57,255,20,0.05)] transition-all duration-300 backdrop-blur-md flex flex-col justify-between overflow-hidden"
              >
                <div>
                  <div className="h-40 w-full relative bg-slate-800 flex items-center justify-center overflow-hidden border-b border-border/40">
                    {pitch?.imagePreviewUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={pitch.imagePreviewUrl}
                        alt={pitch.name}
                        className="object-cover w-full h-full transform hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-tr from-slate-900 via-slate-800 to-slate-900 flex flex-col items-center justify-center text-muted-foreground gap-2">
                        <Trophy className="w-12 h-12 text-muted-foreground/30" />
                        <span className="text-xs uppercase tracking-widest font-mono text-muted-foreground/40">EGFootball5</span>
                      </div>
                    )}
                    <span className="absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold bg-primary/25 border border-primary/40 text-primary backdrop-blur-md">
                      {t('spotsSummary', { joined: currentPlayers, total: match.numPeople })}
                    </span>
                  </div>

                  <div className="p-5 space-y-4">
                    <div>
                      <h4 className="text-xl font-bold text-foreground leading-tight">{pitch?.name || t('pitch')}</h4>
                      {pitch?.locationName && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                          <MapPin className="w-3.5 h-3.5 text-primary" />
                          <span>{pitch.locationName}</span>
                        </p>
                      )}
                    </div>

                    <div className="space-y-2 text-sm text-muted-foreground bg-muted/10 p-3.5 rounded-xl border border-border/30">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 font-medium">
                          <CalendarIcon className="w-4 h-4 text-primary" />
                          <span>{t('date')}</span>
                        </span>
                        <span className="text-foreground font-semibold">{match.date}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 font-medium">
                          <Clock className="w-4 h-4 text-primary" />
                          <span>{t('time')}</span>
                        </span>
                        <span className="text-foreground font-semibold">
                          {formatTimeSlot(match.timeSlot)} ({match.duration} hr)
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-muted-foreground font-medium flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-primary" />
                          <span>{t('joinedPlayers')}</span>
                        </span>
                        <span className={`font-bold ${isFull ? 'text-destructive' : 'text-primary'}`}>
                          {isFull ? t('matchFull') : t('spotsLeft', { count: spotsRemaining })}
                        </span>
                      </div>
                      {/* Spots Progress Bar */}
                      <div className="w-full bg-muted h-2 rounded-full overflow-hidden border border-border/40">
                        <div
                          className={`h-full transition-all duration-500 rounded-full ${isFull ? 'bg-destructive shadow-[0_0_8px_rgba(239,68,68,0.5)]' : 'bg-primary shadow-[0_0_8px_rgba(57,255,20,0.5)]'}`}
                          style={{ width: `${(currentPlayers / match.numPeople) * 100}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Joined Player Names Bubble List */}
                    {match.joinedPlayerNames && match.joinedPlayerNames.length > 0 && (
                      <div className="space-y-1.5 pt-1">
                        <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-bold">{t('playersList')}</span>
                        <div className="flex flex-wrap gap-1.5">
                          {match.joinedPlayerNames.map((name, i) => (
                            <span
                              key={i}
                              className="px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-background border border-border text-foreground hover:border-primary/30 transition-colors"
                            >
                              {name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-5 pt-0">
                  {isUserJoined ? (
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger render={<Button className="flex-1 py-5 font-bold bg-primary text-black hover:bg-primary/90 rounded-xl cursor-pointer" />}>
                          <MessageCircle className="w-5 h-5 mr-2" />
                          {locale === 'ar' ? 'دردشة' : 'Chat'}
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md p-0 overflow-hidden border-none bg-transparent shadow-none [&>button]:hidden">
                           <MatchChat matchId={match.id} />
                        </DialogContent>
                      </Dialog>
                      <Button
                        onClick={() => handleLeaveMatch(match.id)}
                        disabled={loadingAction === match.id}
                        variant="outline"
                        className="flex-1 py-5 font-bold border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive rounded-xl cursor-pointer"
                      >
                        {loadingAction === match.id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-destructive"></div>
                        ) : (
                          t('leaveGame')
                        )}
                      </Button>
                    </div>
                  ) : (
                    <Button
                      onClick={() => handleJoinMatch(match.id)}
                      disabled={loadingAction === match.id || isFull}
                      className="w-full py-5 font-bold bg-primary text-black hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-[0_0_15px_rgba(57,255,20,0.15)] cursor-pointer"
                    >
                      {loadingAction === match.id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-black"></div>
                      ) : isFull ? (
                        t('matchFull')
                      ) : (
                        t('joinGame')
                      )}
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
