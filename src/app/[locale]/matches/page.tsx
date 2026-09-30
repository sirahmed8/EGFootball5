'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { collection, query, where, onSnapshot, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useQuery } from '@tanstack/react-query';
import { useTranslations, useLocale } from 'next-intl';
import { Booking, Pitch } from '@/types';
import { Trophy } from 'lucide-react';
import { MatchesPageSkeleton } from '@/components/skeletons/PageSkeletons';
import { PitchTacticalBoard } from '@/components/PitchTacticalBoard';
import { EmergencyGKModal } from '@/components/EmergencyGKModal';
import { VerifyMatchModal } from '@/components/VerifyMatchModal';
import { MotionDiv } from '@/components/MotionWrapper';
import { CreateMatchModal } from './components/CreateMatchModal';
import { MatchFilters } from './components/MatchFilters';
import { MatchCard } from './components/MatchCard';
import { EmptyMatchesState } from './components/EmptyMatchesState';
import { PastMatchesSection } from './components/PastMatchesSection';
import { useMatchActions } from './hooks/useMatchActions';

export default function MatchesPage() {
  const { appUser, firebaseUser, loading: authLoading } = useAuthStore();
  const t = useTranslations('Matches');
  const locale = useLocale();
  const isArabic = locale === 'ar';

  const [matches, setMatches] = useState<Booking[]>([]);
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

  const { loadingAction, handleJoinMatch, handleLeaveMatch, handleShareMatch } = useMatchActions({
    appUser,
    firebaseUser,
    selectedPosition,
    isArabic,
  });

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
        const all = snapshot.docs.map((d) => d.data() as Booking);

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
      snapshot.docs.forEach((d) => {
        cache[d.id] = d.data() as Pitch;
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
            <h1 className="text-xl sm:text-3xl md:text-4xl font-black text-foreground tracking-tight break-words">
              {t('title')}
            </h1>
          </div>
          <p className="text-muted-foreground text-xs sm:text-sm md:text-base max-w-2xl font-medium leading-relaxed break-words">
            {t('subtitle')}
          </p>
        </div>

        <CreateMatchModal
          pitches={availablePitchesList}
          isArabic={isArabic}
          firebaseUser={firebaseUser}
        />
      </div>

      <MatchFilters
        selectedPosition={selectedPosition}
        setSelectedPosition={setSelectedPosition}
        filter={filter}
        setFilter={setFilter}
      />

      <PitchTacticalBoard />

      {filteredMatches.length === 0 ? (
        <EmptyMatchesState
          filter={filter}
          isArabic={isArabic}
          onHostClick={() => {
            const btn = document.querySelector('button[aria-haspopup="dialog"]') as HTMLButtonElement;
            btn?.click();
          }}
        />
      ) : (
        <MotionDiv
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
          }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredMatches.map((match) => (
            <MotionDiv
              key={match.id}
              variants={{
                hidden: { opacity: 0, scale: 0.95, y: 15 },
                visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
              }}
              className="h-full"
            >
              <MatchCard
                match={match}
                pitch={pitchesCache[match.pitchId]}
                firebaseUser={firebaseUser}
                selectedPosition={selectedPosition}
                loadingAction={loadingAction}
                onJoinMatch={handleJoinMatch}
                onLeaveMatch={handleLeaveMatch}
                onShareMatch={handleShareMatch}
                onOpenGkModal={(pitchName, timeSlot) =>
                  setGkModal({ isOpen: true, pitchName, timeSlot })
                }
                formatTimeSlot={formatTimeSlot}
                isArabic={isArabic}
              />
            </MotionDiv>
          ))}
        </MotionDiv>
      )}

      <EmergencyGKModal
        isOpen={gkModal.isOpen}
        onClose={() => setGkModal({ isOpen: false, pitchName: '', timeSlot: '' })}
        pitchName={gkModal.pitchName}
        timeSlot={gkModal.timeSlot}
      />

      <PastMatchesSection
        pastMatches={pastMatches}
        pitchesCache={pitchesCache}
        appUser={appUser}
        isArabic={isArabic}
        onVerifyResult={(match) => setVerifyModalMatch(match)}
      />

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
