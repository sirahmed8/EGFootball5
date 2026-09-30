'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from '@/i18n/routing';
import { collection, query, where, onSnapshot, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTranslations, useLocale } from 'next-intl';
import { Booking, Pitch } from '@/types';
import { ProfilePageSkeleton } from '@/components/skeletons/PageSkeletons';
import { DailyAIAdviceCard } from '@/components/DailyAIAdviceCard';
import { Trophy, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

import { BookingCard } from './components/BookingCard';
import { ProfileStatsHeader } from './components/ProfileStatsHeader';
import { ProfileForm } from './components/ProfileForm';
import { ProfileFavoritesTab } from './components/ProfileFavoritesTab';

export default function ProfilePage() {
  const locale = useLocale();
  const { appUser, firebaseUser, loading } = useAuthStore();
  const router = useRouter();
  const t = useTranslations('Profile');

  const [bookings, setBookings] = useState<Booking[]>([]);

  useEffect(() => {
    if (!loading && !firebaseUser) {
      router.push('/login');
    }
  }, [loading, firebaseUser, router]);

  useEffect(() => {
    if (!firebaseUser) return;

    const bookingsQ = query(
      collection(db, 'bookings'),
      where('userId', '==', firebaseUser.uid)
    );
    const unsubscribeBookings = onSnapshot(
      bookingsQ,
      (snapshot) => {
        const bks = snapshot.docs.map((docSnap) => docSnap.data() as Booking);
        bks.sort((a, b) => b.createdAt - a.createdAt);
        setBookings(bks);
      },
      (error) => {
        console.warn('Bookings snapshot listener permissions error:', error);
      }
    );

    return () => unsubscribeBookings();
  }, [firebaseUser]);

  const { data: pitchesCache = {}, isLoading: pitchesLoading } = useQuery({
    queryKey: ['pitches_dict'],
    queryFn: async () => {
      const q = query(collection(db, 'pitches'));
      const snapshot = await getDocs(q);
      const cache: Record<string, Pitch> = {};
      snapshot.docs.forEach((docSnap) => {
        cache[docSnap.id] = docSnap.data() as Pitch;
      });
      return cache;
    },
  });

  if (loading || pitchesLoading || !appUser || !firebaseUser) return <ProfilePageSkeleton />;

  const totalBookings = bookings.length;
  const confirmedMatches = bookings.filter((b) => b.status === 'confirmed').length;

  const pitchCounts: Record<string, number> = {};
  bookings.forEach((b) => {
    pitchCounts[b.pitchId] = (pitchCounts[b.pitchId] || 0) + 1;
  });
  let maxCount = 0;
  let preferredPitchId = '';
  for (const id in pitchCounts) {
    if (pitchCounts[id] > maxCount) {
      maxCount = pitchCounts[id];
      preferredPitchId = id;
    }
  }
  const preferredPitchName = preferredPitchId
    ? pitchesCache[preferredPitchId]?.name || 'N/A'
    : 'N/A';

  return (
    <div className="flex-1 max-w-4xl mx-auto w-full p-4 md:p-8 space-y-8 mt-6 animate-in fade-in zoom-in-95 duration-500 bg-black">
      <ProfileStatsHeader
        appUser={appUser}
        totalBookings={totalBookings}
        confirmedMatches={confirmedMatches}
        preferredPitchName={preferredPitchName}
      />

      <DailyAIAdviceCard />

      <Tabs defaultValue="bookings" className="w-full">
        <TabsList className="bg-muted/50 border border-border mb-6 p-1.5 rounded-2xl w-full grid grid-cols-3 gap-2">
          <TabsTrigger
            value="bookings"
            className="data-[state=active]:bg-primary data-[state=active]:text-black font-black rounded-xl cursor-pointer py-3 text-xs sm:text-sm text-center"
          >
            {t('myBookings')}
          </TabsTrigger>
          <TabsTrigger
            value="favorites"
            className="data-[state=active]:bg-background data-[state=active]:text-foreground font-bold rounded-xl cursor-pointer py-3 text-xs sm:text-sm text-center"
          >
            {locale === 'ar' ? 'الملعب المفضل' : 'Preferred Pitch'}
          </TabsTrigger>
          <TabsTrigger
            value="details"
            className="data-[state=active]:bg-background data-[state=active]:text-foreground font-bold rounded-xl cursor-pointer py-3 text-xs sm:text-sm text-center"
          >
            {t('profileDetails')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="bookings" className="space-y-4">
          {bookings.length === 0 ? (
            <Card className="bg-card/50 border-border backdrop-blur-xl rounded-3xl p-8 text-center space-y-4 shadow-xl">
              <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center text-primary mx-auto">
                <Trophy className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-black text-foreground">{t('noBookings')}</h3>
              <p className="text-muted-foreground text-xs font-medium max-w-sm mx-auto">
                {t('noBookingsDesc')}
              </p>
              <Button
                onClick={() => router.push('/home')}
                className="bg-primary text-black font-black hover:bg-primary/90 rounded-2xl px-6 py-6 text-sm cursor-pointer shadow-lg hover:scale-105 transition-transform"
              >
                <span>{t('browseBookCta')}</span>
                <ArrowRight className="w-4 h-4 rtl:rotate-180 ms-1" />
              </Button>
            </Card>
          ) : (
            <motion.div
              className="flex flex-col gap-4"
              initial="hidden"
              animate="visible"
              variants={{ visible: { transition: { staggerChildren: 0.07 } } }}
            >
              {bookings.map((booking) => (
                <motion.div
                  key={booking.id}
                  variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }}
                  transition={{ type: 'spring', stiffness: 200, damping: 22 }}
                >
                  <BookingCard
                    booking={booking}
                    pitch={pitchesCache[booking.pitchId]}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </TabsContent>

        <TabsContent value="favorites">
          <ProfileFavoritesTab
            preferredPitchId={preferredPitchId}
            pitchesCache={pitchesCache}
          />
        </TabsContent>

        <TabsContent value="details">
          <Card className="w-full bg-card/80 border-border backdrop-blur-xl rounded-3xl p-2 sm:p-4 shadow-xl">
            <ProfileForm appUser={appUser} firebaseUid={firebaseUser.uid} />
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
