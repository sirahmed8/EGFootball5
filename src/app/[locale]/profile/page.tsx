'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from '@/i18n/routing';
import { doc, updateDoc, collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { useTranslations, useLocale } from 'next-intl';
import { User as AppUser, Booking, Pitch } from '@/types';

function BookingCountdown({ lockedUntil }: { lockedUntil: number }) {
  const [timeLeft, setTimeLeft] = useState(0);
  const t = useTranslations('Profile');

  useEffect(() => {
    const update = () => {
      const diff = Math.floor((lockedUntil - Date.now()) / 1000);
      setTimeLeft(diff > 0 ? diff : 0);
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [lockedUntil]);

  if (timeLeft <= 0) return <span className="text-destructive font-bold">{t('rejected')} (Expired)</span>;
  const m = Math.floor(timeLeft / 60);
  const s = timeLeft % 60;
  return (
    <span className="text-yellow-500 font-bold">
      {t('timerLeft', { time: `${m}:${s.toString().padStart(2, '0')}` })}
    </span>
  );
}

function BookingCard({ booking, pitch }: { booking: Booking; pitch?: Pitch }) {
  const t = useTranslations('Profile');
  const locale = useLocale();
  const router = useRouter();

  const getStatusBadge = () => {
    switch (booking.status) {
      case 'locked_temporary':
        return (
          <div className="flex flex-col items-end gap-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-yellow-500/20 text-yellow-500 border border-yellow-500/30">
              {t('locked_temporary')}
            </span>
            {booking.lockedUntil && <BookingCountdown lockedUntil={booking.lockedUntil} />}
          </div>
        );
      case 'pending_review':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-500 border border-amber-500/30">
            {t('pending_review')}
          </span>
        );
      case 'confirmed':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary/20 text-primary border border-primary/30">
            {t('confirmed')}
          </span>
        );
      case 'rejected':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-destructive/20 text-destructive border border-destructive/30">
            {t('rejected')}
          </span>
        );
      default:
        return null;
    }
  };

  const formatTimeSlot = (slot: number) => {
    const hour = Math.floor(slot);
    const mins = slot % 1 === 0 ? '00' : '30';
    const ampm = hour >= 12 && hour < 24 ? (locale === 'ar' ? 'م' : 'PM') : (locale === 'ar' ? 'ص' : 'AM');
    const modHour = hour % 12 || 12;
    return `${modHour}:${mins} ${ampm}`;
  };

  return (
    <Card className="bg-card/40 border-border hover:border-primary/25 transition-all duration-300 backdrop-blur-md">
      <CardContent className="p-5 flex flex-col sm:flex-row justify-between gap-4">
        <div className="space-y-2.5 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="text-lg font-bold text-foreground">{pitch?.name || t('pitch')}</h4>
            <span className="text-xs text-muted-foreground font-mono">({booking.id})</span>
          </div>
          
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
            <p className="text-muted-foreground font-medium">
              📅 <span className="text-foreground">{booking.date}</span>
            </p>
            <p className="text-muted-foreground font-medium">
              ⏰ <span className="text-foreground">{formatTimeSlot(booking.timeSlot)} ({booking.duration} hr)</span>
            </p>
            <p className="text-muted-foreground font-medium col-span-2 mt-1">
              💸 {t('amount')}: <strong className="text-primary">{booking.totalAmount} EGP</strong> (Deposit: {booking.depositAmount} EGP)
            </p>
          </div>

          {pitch && booking.status === 'confirmed' && (
            <div className="pt-2 text-xs text-muted-foreground flex flex-col gap-1.5 border-t border-border/30 mt-2">
              {pitch.locationName && <p>📍 {pitch.locationName}</p>}
              {pitch.adminPhone && <p>📞 {t('contactManager', { phone: pitch.adminPhone })}</p>}
            </div>
          )}
        </div>

        <div className="flex flex-col justify-between items-end gap-3 text-right">
          {getStatusBadge()}

          <div className="flex gap-2 w-full sm:w-auto">
            {booking.status === 'locked_temporary' && (
              <Button 
                onClick={() => router.push(`/checkout?bookingId=${booking.id}`)}
                size="sm"
                className="bg-primary text-black font-bold hover:bg-primary/90 text-xs py-2 h-auto"
              >
                {t('completePayment')}
              </Button>
            )}
            {pitch?.mapLink && booking.status === 'confirmed' && (
              <a 
                href={pitch.mapLink}
                target="_blank"
                rel="noreferrer"
                className="text-xs bg-secondary hover:bg-secondary/80 text-secondary-foreground font-bold px-3 py-1.5 rounded-lg border border-transparent transition-all flex items-center gap-1"
              >
                🗺️ {t('viewLocation')}
              </a>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ProfileForm({ appUser, firebaseUid }: { appUser: AppUser; firebaseUid: string }) {
  const router = useRouter();
  const t = useTranslations('Profile');
  const [name, setName] = useState(appUser.name);
  const [phone, setPhone] = useState(appUser.phone || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateDoc(doc(db, 'users', firebaseUid), {
        name,
        phone
      });
      toast.success(t('saving') || 'Saving updates...');
      router.push('/home');
    } catch (error: unknown) {
      const err = error as Error;
      toast.error(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave}>
      <CardContent className="space-y-4 pt-4">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-foreground">{t('fullName')}</Label>
          <Input id="name" required value={name} onChange={e => setName(e.target.value)} className="bg-background border-border text-foreground focus-visible:ring-primary" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone" className="text-foreground">{t('phone')}</Label>
          <Input id="phone" type="tel" required placeholder="01XXXXXXXXX" value={phone} onChange={e => setPhone(e.target.value)} className="bg-background border-border text-foreground focus-visible:ring-primary" />
        </div>
      </CardContent>
      <CardFooter className="pt-2">
        <Button type="submit" className="w-full bg-primary text-black font-bold hover:bg-primary/90 shadow-[0_0_15px_rgba(57,255,20,0.3)]" disabled={isSaving}>
          {isSaving ? t('saving') : t('saveBtn')}
        </Button>
      </CardFooter>
    </form>
  );
}

export default function ProfilePage() {
  const { appUser, firebaseUser, loading } = useAuthStore();
  const router = useRouter();
  const t = useTranslations('Profile');

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [pitchesCache, setPitchesCache] = useState<Record<string, Pitch>>({});

  useEffect(() => {
    if (!loading && !firebaseUser) {
      router.push('/login');
    }
  }, [loading, firebaseUser, router]);

  useEffect(() => {
    if (!firebaseUser) return;

    // Listen to user bookings
    const bookingsQ = query(
      collection(db, 'bookings'),
      where('userId', '==', firebaseUser.uid)
    );
    const unsubscribeBookings = onSnapshot(bookingsQ, (snapshot) => {
      const bks = snapshot.docs.map(doc => doc.data() as Booking);
      // Sort bookings: active first, then by date descending
      bks.sort((a, b) => b.createdAt - a.createdAt);
      setBookings(bks);
    });

    // Fetch all pitches to cache metadata
    const pitchesQ = query(collection(db, 'pitches'));
    const unsubscribePitches = onSnapshot(pitchesQ, (snapshot) => {
      const cache: Record<string, Pitch> = {};
      snapshot.docs.forEach(doc => {
        const pitch = doc.data() as Pitch;
        cache[pitch.id] = pitch;
      });
      setPitchesCache(cache);
    });

    return () => {
      unsubscribeBookings();
      unsubscribePitches();
    };
  }, [firebaseUser]);

  if (loading || !appUser || !firebaseUser) return <div className="p-8 text-center text-foreground">{t('saving') || 'Loading...'}</div>;

  return (
    <div className="flex-1 max-w-4xl mx-auto w-full p-4 md:p-8 space-y-8 mt-12">
      <div>
        <h1 className="text-4xl font-black text-foreground">{t('title')}</h1>
        <p className="text-muted-foreground mt-2">{t('description')}</p>
      </div>

      <Tabs defaultValue="bookings" className="w-full">
        <TabsList className="bg-muted/50 border border-border mb-6 p-1 rounded-xl w-full grid grid-cols-2 max-w-md">
          <TabsTrigger value="bookings" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-semibold rounded-lg">
            {t('myBookings')}
          </TabsTrigger>
          <TabsTrigger value="details" className="data-[state=active]:bg-background data-[state=active]:text-foreground font-semibold rounded-lg">
            {t('profileDetails')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="bookings" className="space-y-4">
          {bookings.length === 0 ? (
            <Card className="bg-card/50 border-border backdrop-blur-xl">
              <CardContent className="py-12 text-center text-muted-foreground">
                <p className="text-lg font-medium">{t('noBookings')}</p>
              </CardContent>
            </Card>
          ) : (
            <div className="flex flex-col gap-4">
              {bookings.map((booking) => (
                <BookingCard 
                  key={booking.id} 
                  booking={booking} 
                  pitch={pitchesCache[booking.pitchId]} 
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="details">
          <Card className="w-full max-w-md bg-card/80 border-border backdrop-blur-xl">
            <ProfileForm appUser={appUser} firebaseUid={firebaseUser.uid} />
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
