'use client';

import { useState, useEffect } from 'react';
import { useRouter } from '@/i18n/routing';
import { onSnapshot, doc, getDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useAuthStore } from '@/store/useAuthStore';
import { Booking, User as AppUser, Pitch } from '@/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { confirmBooking, rejectBooking, cleanupExpiredBookings } from '@/lib/firebase/booking';
import { toast } from 'sonner';
import { useTranslations, useLocale } from 'next-intl';
import { Button } from '@/components/ui/button';

import { AdminOverviewCards } from './components/AdminOverviewCards';
import { VerificationQueue } from './components/VerificationQueue';
import { LiveSchedule } from './components/LiveSchedule';
import { PitchSettings } from './components/PitchSettings';
import { PlayersList } from './components/PlayersList';

export default function AdminDashboard() {
  const router = useRouter();
  const { appUser, firebaseUser, loading } = useAuthStore();
  const t = useTranslations('Admin');
  const locale = useLocale();
  
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [usersCache, setUsersCache] = useState<Record<string, AppUser>>({});
  const [pitch, setPitch] = useState<Pitch | null>(null);
  const [editingPitch, setEditingPitch] = useState<Pitch | null>(null);
  const [savingPitch, setSavingPitch] = useState(false);
  const [playerSearch, setPlayerSearch] = useState('');
  const [scheduleSearch, setScheduleSearch] = useState('');
  const [scheduleFilter, setScheduleFilter] = useState<'all' | 'confirmed' | 'pending_review' | 'rejected'>('all');
  const [activeReceiptUrl, setActiveReceiptUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && appUser?.role !== 'admin' && appUser?.role !== 'owner') {
      router.push('/');
    }
  }, [appUser, loading, router]);

  useEffect(() => {
    if ((appUser?.role !== 'admin' && appUser?.role !== 'owner') || !firebaseUser?.email) return;

    const fetchPitchAndBookings = async () => {
      const pitchQ = query(collection(db, 'pitches'), where('adminEmail', '==', firebaseUser.email));
      const pitchSnap = await getDocs(pitchQ);
      
      if (pitchSnap.empty) {
        toast.error('No pitch assigned to this admin.');
        return;
      }
      
      const pitchData = pitchSnap.docs[0].data() as Pitch;
      setPitch(pitchData);
      setEditingPitch(pitchData);

      // Trigger automatic background cleanup of expired locks for this pitch
      cleanupExpiredBookings(pitchData.id);

      const q = query(collection(db, 'bookings'), where('pitchId', '==', pitchData.id));
      const unsubscribe = onSnapshot(q, async (snapshot) => {
        const bks = snapshot.docs.map(doc => doc.data() as Booking);
        setBookings(bks);
        
        // Fetch user data for new users
        const newUsers = { ...usersCache };
        let updated = false;
        for (const bk of bks) {
          if (!newUsers[bk.userId]) {
            const userSnap = await getDoc(doc(db, 'users', bk.userId));
            if (userSnap.exists()) {
              newUsers[bk.userId] = userSnap.data() as AppUser;
              updated = true;
            }
          }
        }
        if (updated) setUsersCache(newUsers);
      });

      return unsubscribe;
    };

    let unsub: (() => void) | undefined;
    fetchPitchAndBookings().then(u => unsub = u);
    
    return () => {
      if (typeof unsub === 'function') unsub();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appUser, firebaseUser]);

  if (loading || (appUser?.role !== 'admin' && appUser?.role !== 'owner')) {
    return <div className="p-8 text-center text-white">Authenticating...</div>;
  }

  const pendingReview = bookings.filter(b => b.status === 'pending_review');
  const revenue = bookings.filter(b => b.status === 'confirmed').reduce((sum, b) => sum + b.totalAmount, 0);

  const handleApprove = async (booking: Booking) => {
    try {
      await confirmBooking(booking.id);
      toast.success('Booking confirmed');
    } catch (e: unknown) {
      const err = e as Error;
      toast.error(err.message);
    }
  };

  const handleReject = async (booking: Booking) => {
    try {
      await rejectBooking(booking.id);
      toast.success('Booking rejected and slot freed');
    } catch (e: unknown) {
      const err = e as Error;
      toast.error(err.message);
    }
  };

  const getUserLoyalty = (userId: string) => {
    return bookings.filter(b => b.userId === userId && b.status === 'confirmed').length;
  };

  const handleUpdatePitch = async () => {
    if (!pitch || !editingPitch) return;
    setSavingPitch(true);
    try {
      await updateDoc(doc(db, 'pitches', pitch.id), {
        name: editingPitch.name,
        pricePerHour: Number(editingPitch.pricePerHour),
        imagePreviewUrl: editingPitch.imagePreviewUrl,
        locationName: editingPitch.locationName,
        mapLink: editingPitch.mapLink
      });
      setPitch(editingPitch);
      toast.success('Pitch details updated successfully');
    } catch (e: unknown) {
      const err = e as Error;
      toast.error('Failed to update: ' + err.message);
    } finally {
      setSavingPitch(false);
    }
  };

  const handleToggleBlacklist = async (userId: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(db, 'users', userId), {
        isBlacklisted: !currentStatus
      });
      setUsersCache(prev => ({
        ...prev,
        [userId]: {
          ...prev[userId],
          isBlacklisted: !currentStatus
        }
      }));
      toast.success(!currentStatus ? 'Player blacklisted successfully' : 'Player unblacklisted successfully');
    } catch (err: unknown) {
      const error = err as Error;
      toast.error('Failed to update player status: ' + error.message);
    }
  };

  const uniquePlayerIds = Array.from(new Set(bookings.map(b => b.userId)));
  const uniquePlayers = uniquePlayerIds.map(id => usersCache[id]).filter(Boolean);

  return (
    <div className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-8 space-y-8">
      <div>
        <h1 className="text-4xl font-black text-foreground">{t('title')}</h1>
        <p className="text-muted-foreground mt-2">{t('subtitle')}</p>
      </div>

      <AdminOverviewCards revenue={revenue} pendingCount={pendingReview.length} t={t} />

      <Tabs defaultValue="verification" className="w-full">
        <TabsList className="bg-muted/50 border border-border mb-4 p-1 rounded-xl">
          <TabsTrigger value="verification" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-semibold rounded-lg">{t('verificationQueue')}</TabsTrigger>
          <TabsTrigger value="schedule" className="data-[state=active]:bg-background data-[state=active]:text-foreground font-semibold rounded-lg">{t('liveSchedule')}</TabsTrigger>
          <TabsTrigger value="players" className="data-[state=active]:bg-background data-[state=active]:text-foreground font-semibold rounded-lg">{t('playersTab')}</TabsTrigger>
          <TabsTrigger value="settings" className="data-[state=active]:bg-background data-[state=active]:text-foreground font-semibold rounded-lg">{t('settingsTab')}</TabsTrigger>
        </TabsList>
        
        <TabsContent value="verification">
          <VerificationQueue 
            pendingReview={pendingReview}
            usersCache={usersCache}
            getUserLoyalty={getUserLoyalty}
            handleApprove={handleApprove}
            handleReject={handleReject}
            setActiveReceiptUrl={setActiveReceiptUrl}
            t={t}
          />
        </TabsContent>

        <TabsContent value="schedule">
          <LiveSchedule 
            bookings={bookings}
            usersCache={usersCache}
            scheduleSearch={scheduleSearch}
            setScheduleSearch={setScheduleSearch}
            scheduleFilter={scheduleFilter}
            setScheduleFilter={setScheduleFilter}
            t={t}
          />
        </TabsContent>

        <TabsContent value="settings">
          <PitchSettings 
            editingPitch={editingPitch}
            setEditingPitch={setEditingPitch}
            handleUpdatePitch={handleUpdatePitch}
            savingPitch={savingPitch}
            setSavingPitch={setSavingPitch}
            t={t}
          />
        </TabsContent>

        <TabsContent value="players">
          <PlayersList 
            uniquePlayers={uniquePlayers}
            playerSearch={playerSearch}
            setPlayerSearch={setPlayerSearch}
            getUserLoyalty={getUserLoyalty}
            handleToggleBlacklist={handleToggleBlacklist}
            t={t}
            locale={locale}
          />
        </TabsContent>

      </Tabs>

      {/* Receipt Lightbox Modal */}
      {activeReceiptUrl && (
        <div 
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-in fade-in duration-200 cursor-zoom-out"
          onClick={() => setActiveReceiptUrl(null)}
        >
          <div className="relative max-w-3xl max-h-[85vh] w-full flex flex-col justify-center items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={activeReceiptUrl} 
              alt="Receipt Zoom" 
              className="object-contain rounded-lg max-h-[75vh] max-w-full shadow-2xl border border-white/10" 
              onClick={(e) => e.stopPropagation()} 
            />
            <Button 
              className="mt-6 bg-primary text-black font-extrabold hover:bg-primary/90 rounded-full px-8 py-2 h-auto cursor-pointer"
              onClick={() => setActiveReceiptUrl(null)}
            >
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
