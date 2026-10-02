'use client';

import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from '@/i18n/routing';
import { onSnapshot, doc, getDoc, updateDoc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useAuthStore } from '@/store/useAuthStore';
import { Booking, User as AppUser, Pitch } from '@/types';
import { DashboardPageSkeleton } from '@/components/skeletons/PageSkeletons';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { confirmBooking, rejectBooking, cleanupExpiredBookings } from '@/lib/firebase/booking';
import { toast } from 'sonner';
import { useTranslations, useLocale } from 'next-intl';
import { useToggleBlacklist } from '@/hooks/useUserRoles';
import { AdminOverviewCards } from '../components/AdminOverviewCards';
import { ReceiptLightboxModal } from '../components/ReceiptLightboxModal';
import { createDefaultPitchData } from '../components/adminHelpers';


const VerificationQueue = dynamic(() => import('../components/VerificationQueue').then(m => m.VerificationQueue), { ssr: false });
const SubscriptionApprovals = dynamic(() => import('../components/SubscriptionApprovals').then(m => m.SubscriptionApprovals), { ssr: false });
const LiveSchedule = dynamic(() => import('../components/LiveSchedule').then(m => m.LiveSchedule), { ssr: false });
const PitchSettings = dynamic(() => import('../components/PitchSettings').then(m => m.PitchSettings), { ssr: false });
const PlayersList = dynamic(() => import('../components/PlayersList').then(m => m.PlayersList), { ssr: false });


export default function AdminDashboard() {
  const router = useRouter();
  const locale = useLocale();
  const { appUser, firebaseUser, loading } = useAuthStore();
  const t = useTranslations('Admin');
  const toggleBlacklistMutation = useToggleBlacklist();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [usersCache, setUsersCache] = useState<Record<string, AppUser>>({});
  const usersCacheRef = useRef<Record<string, AppUser>>({});
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
    const adminEmail = firebaseUser?.email;
    if ((appUser?.role !== 'admin' && appUser?.role !== 'owner') || !adminEmail) return;

    const fetchPitchAndBookings = async () => {
      let pitchData: Pitch;
      const pitchQ = query(collection(db, 'pitches'), where('adminEmail', '==', adminEmail));
      const pitchSnap = await getDocs(pitchQ);
      
      if (pitchSnap.empty) {
        pitchData = createDefaultPitchData(
          adminEmail,
          appUser?.name,
          appUser?.phone
        );
        try {
          await setDoc(doc(db, 'pitches', pitchData.id), pitchData);
          toast.success(t('defaultAdminNotice'));
        } catch {
          // fallback in-memory pitch
        }

      } else {
        pitchData = pitchSnap.docs[0].data() as Pitch;
      }

      setPitch(pitchData);
      setEditingPitch(pitchData);

      // Trigger automatic background cleanup of expired locks for this pitch
      cleanupExpiredBookings(pitchData.id);

      const q = query(collection(db, 'bookings'), where('pitchId', '==', pitchData.id));
      const unsubscribe = onSnapshot(q, async (snapshot) => {
        const bks = snapshot.docs.map(doc => doc.data() as Booking);
        setBookings(bks);
        
        // Fetch user data for new users using current ref
        const newUsers = { ...usersCacheRef.current };
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
        if (updated) {
          usersCacheRef.current = newUsers;
          setUsersCache(newUsers);
        }
      });

      return unsubscribe;
    };

    let isMounted = true;
    let unsub: (() => void) | undefined;
    fetchPitchAndBookings().then(u => {
      if (!isMounted && u) u();
      else unsub = u;
    });
    
    return () => {
      isMounted = false;
      if (typeof unsub === 'function') unsub();
    };
  }, [appUser, firebaseUser, t]);

  if (loading || (appUser?.role !== 'admin' && appUser?.role !== 'owner')) {
    return <DashboardPageSkeleton />;
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
      await toggleBlacklistMutation.mutateAsync({ userId, isBlacklisted: !currentStatus });
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

  // Strict route protection: never render admin UI if unauthenticated or unauthorized
  if (loading || !appUser || (appUser.role !== 'admin' && appUser.role !== 'owner')) {
    return <DashboardPageSkeleton />;
  }

  return (
    <div className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-8 space-y-8 mt-6 animate-in fade-in zoom-in-95 duration-500 bg-mesh">
      <div>
        <h1 className="text-4xl font-black text-foreground tracking-tight">{t('title')}</h1>
        <p className="text-muted-foreground mt-2 font-medium">{t('subtitle')}</p>
      </div>

      <AdminOverviewCards revenue={revenue} pendingCount={pendingReview.length} t={t} />

      <Tabs defaultValue="verification" className="w-full">
        <TabsList className="stadium-glass border-white/10 mb-6 p-1.5 rounded-2xl w-full grid grid-cols-2 md:grid-cols-5 max-w-3xl">
          <TabsTrigger value="verification" className="data-[state=active]:bg-primary data-[state=active]:text-black font-black rounded-xl cursor-pointer transition-all">
            {t('verificationQueue')}
          </TabsTrigger>
          <TabsTrigger value="subscriptions" className="data-[state=active]:bg-amber-500 data-[state=active]:text-black font-black rounded-xl cursor-pointer transition-all">
            {t('subscriptionsTab')}
          </TabsTrigger>
          <TabsTrigger value="schedule" className="data-[state=active]:bg-white/10 data-[state=active]:text-foreground font-bold rounded-xl cursor-pointer transition-all">
            {t('liveSchedule')}
          </TabsTrigger>
          <TabsTrigger value="players" className="data-[state=active]:bg-white/10 data-[state=active]:text-foreground font-bold rounded-xl cursor-pointer transition-all">
            {t('playersTab')}
          </TabsTrigger>
          <TabsTrigger value="settings" className="data-[state=active]:bg-white/10 data-[state=active]:text-foreground font-bold rounded-xl cursor-pointer transition-all">
            {t('settingsTab')}
          </TabsTrigger>
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

        <TabsContent value="subscriptions">
          <SubscriptionApprovals
            setActiveReceiptUrl={setActiveReceiptUrl}
            isArabic={locale === 'ar'}
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
          />
        </TabsContent>

      </Tabs>

      {/* Receipt Lightbox Modal */}
      <ReceiptLightboxModal
        receiptUrl={activeReceiptUrl}
        onClose={() => setActiveReceiptUrl(null)}
      />
    </div>
  );

}
