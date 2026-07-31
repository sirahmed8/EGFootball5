'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from '@/i18n/routing';
import { doc, updateDoc, collection, query, where, onSnapshot, getDocs } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { auth, db } from '@/lib/firebase/config';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { useTranslations, useLocale } from 'next-intl';
import { User as AppUser, Booking, Pitch } from '@/types';
import { cancelBooking } from '@/lib/firebase/booking';
import { ProfilePageSkeleton } from '@/components/skeletons/PageSkeletons';
import { DailyAIAdviceCard } from '@/components/DailyAIAdviceCard';
import { Trophy, Star, Shield, Award, Zap, Heart, MapPin, ArrowRight } from 'lucide-react';

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

  if (timeLeft <= 0) return <span className="text-destructive font-bold">{t('rejected')} {t('expired')}</span>;
  const m = Math.floor(timeLeft / 60);
  const s = timeLeft % 60;
  return (
    <span className="text-amber-400 font-bold font-mono">
      {t('timerLeft', { time: `${m}:${s.toString().padStart(2, '0')}` })}
    </span>
  );
}

function BookingCard({ booking, pitch }: { booking: Booking; pitch?: Pitch }) {
  const t = useTranslations('Profile');
  const tErrors = useTranslations('Errors');
  const locale = useLocale();
  const router = useRouter();
  const { firebaseUser } = useAuthStore();
  const [canceling, setCanceling] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  const handleCancel = async () => {
    if (!firebaseUser) return;
    setCanceling(true);
    try {
      await cancelBooking(booking.id, firebaseUser.uid);
      toast.success(t('cancelledSuccess'));
      setShowCancelDialog(false);
    } catch (error: unknown) {
      const err = error as Error;
      let errMsg = err.message;
      if (errMsg && errMsg.startsWith('ERROR_')) {
        try {
          errMsg = tErrors(errMsg);
        } catch {
          // fallback
        }
      } else {
        errMsg = errMsg || t('cancelError');
      }
      toast.error(errMsg);
    } finally {
      setCanceling(false);
    }
  };

  const getStatusBadge = () => {
    switch (booking.status) {
      case 'locked_temporary':
        return (
          <div className="flex flex-col items-end gap-1">
            <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-500/20 text-amber-400 border border-amber-500/30">
              {t('locked_temporary')}
            </span>
            {booking.lockedUntil && <BookingCountdown lockedUntil={booking.lockedUntil} />}
          </div>
        );
      case 'pending_review':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-500/20 text-amber-400 border border-amber-500/30">
            {t('pending_review')}
          </span>
        );
      case 'confirmed':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-black bg-primary/20 text-primary border border-primary/30">
            {t('confirmed')}
          </span>
        );
      case 'rejected':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-black bg-destructive/20 text-destructive border border-destructive/30">
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
    <Card className="bg-card/70 border-border hover:border-primary/40 transition-all duration-300 backdrop-blur-xl rounded-3xl shadow-lg">
      <CardContent className="p-6 flex flex-col sm:flex-row justify-between gap-4">
        <div className="space-y-3 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="text-xl font-black text-foreground">{pitch?.name || t('pitch')}</h4>
            <span className="text-xs text-muted-foreground font-mono bg-muted/60 px-2.5 py-0.5 rounded-lg border border-border">
              #{booking.id.slice(0, 8)}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs sm:text-sm">
            <p className="text-muted-foreground font-medium">
              📅 <span className="text-foreground font-bold font-mono">{booking.date}</span>
            </p>
            <p className="text-muted-foreground font-medium">
              ⏰ <span className="text-foreground font-bold">{formatTimeSlot(booking.timeSlot)} ({booking.duration} hr)</span>
            </p>
            <p className="text-muted-foreground font-medium">
              👥 {t('bookingType')}: <span className="text-foreground font-bold capitalize">{booking.bookingType ? t(booking.bookingType) : t('private')}</span>
            </p>
            <p className="text-muted-foreground font-medium">
              🏃 {t('playersCount', { count: booking.numPeople || 10 })}
            </p>
            <p className="text-muted-foreground font-medium col-span-2 pt-1 border-t border-border/30">
              💸 {t('amount')}: <strong className="text-primary font-black font-mono text-base">{booking.totalAmount} EGP</strong> ({t('depositLabel')}: {booking.depositAmount} EGP)
            </p>
          </div>

          {pitch && booking.status === 'confirmed' && (
            <div className="pt-2 text-xs text-muted-foreground flex flex-col gap-1 border-t border-border/30 mt-2 font-medium">
              {pitch.locationName && <p>📍 {pitch.locationName}</p>}
              {pitch.adminPhone && <p>📞 {t('contactManager', { phone: pitch.adminPhone })}</p>}
            </div>
          )}
        </div>

        <div className="flex flex-col justify-between items-end gap-4 text-end">
          {getStatusBadge()}

          <div className="flex flex-wrap gap-2 w-full sm:w-auto justify-end">
            {(booking.status === 'locked_temporary' || booking.status === 'pending_review') && (
              <Button
                onClick={() => setShowCancelDialog(true)}
                disabled={canceling}
                variant="destructive"
                size="sm"
                className="text-xs py-2 font-bold border-destructive/40 hover:bg-destructive/10 rounded-xl cursor-pointer"
              >
                {t('cancelBookingBtn')}
              </Button>
            )}
            {booking.status === 'locked_temporary' && (
              <Button
                onClick={() => router.push(`/checkout?bookingId=${booking.id}`)}
                size="sm"
                className="bg-primary text-black font-black hover:bg-primary/90 text-xs py-2 rounded-xl cursor-pointer shadow-md"
              >
                {t('completePayment')}
              </Button>
            )}
            {pitch?.mapLink && booking.status === 'confirmed' && (
              <a
                href={pitch.mapLink}
                target="_blank"
                rel="noreferrer"
                className="text-xs bg-secondary hover:bg-secondary/80 text-secondary-foreground font-bold px-3 py-2 rounded-xl transition-all flex items-center gap-1"
              >
                🗺️ {t('viewLocation')}
              </a>
            )}
          </div>
        </div>
      </CardContent>

      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent className="rounded-3xl border-border bg-card">
          <DialogHeader>
            <DialogTitle>{t('cancelBookingHeader')}</DialogTitle>
            <DialogDescription>
              {t('confirmCancelPrompt')}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setShowCancelDialog(false)} disabled={canceling} className="rounded-xl cursor-pointer">
              {t('close')}
            </Button>
            <Button variant="destructive" onClick={handleCancel} disabled={canceling} className="rounded-xl font-bold cursor-pointer">
              {canceling ? t('canceling') : t('confirmCancel')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
        phone,
      });

      if (auth.currentUser) {
        await updateProfile(auth.currentUser, { displayName: name });
      }

      toast.success(t('profileSaved'));
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
          <Label htmlFor="name" className="text-foreground font-bold">{t('fullName')}</Label>
          <Input id="name" required value={name} onChange={(e) => setName(e.target.value)} className="bg-background/60 border-border text-foreground focus-visible:ring-primary rounded-xl" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone" className="text-foreground font-bold">{t('phone')}</Label>
          <Input id="phone" type="tel" required placeholder="01XXXXXXXXX" value={phone} onChange={(e) => setPhone(e.target.value)} className="bg-background/60 border-border text-foreground focus-visible:ring-primary rounded-xl" />
        </div>
      </CardContent>
      <CardFooter className="pt-2">
        <Button type="submit" className="w-full bg-primary text-black font-black hover:bg-primary/90 rounded-2xl shadow-[0_0_15px_rgba(57,255,20,0.3)] h-12" disabled={isSaving}>
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
  const tAchieve = useTranslations('Achievements');

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
    const unsubscribeBookings = onSnapshot(bookingsQ, (snapshot) => {
      const bks = snapshot.docs.map((doc) => doc.data() as Booking);
      bks.sort((a, b) => b.createdAt - a.createdAt);
      setBookings(bks);
    });

    return () => unsubscribeBookings();
  }, [firebaseUser]);

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
  const preferredPitchName = preferredPitchId ? pitchesCache[preferredPitchId]?.name || 'N/A' : 'N/A';

  const getLoyaltyBadge = (count: number) => {
    if (count === 0) return t('loyaltyRookie');
    if (count <= 3) return t('loyaltyAmateur');
    if (count <= 8) return t('loyaltySemiPro');
    if (count <= 15) return t('loyaltyPro');
    return t('loyaltyVeteran');
  };

  const loyaltyBadge = getLoyaltyBadge(confirmedMatches);

  return (
    <div className="flex-1 max-w-4xl mx-auto w-full p-4 md:p-8 space-y-8 mt-6 animate-in fade-in zoom-in-95 duration-500 bg-black">
      <div>
        <h1 className="text-4xl font-black text-foreground tracking-tight">{t('title')}</h1>
        <p className="text-muted-foreground mt-2 font-medium">{t('description')}</p>
      </div>

      <DailyAIAdviceCard />

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="stadium-glass border-white/10 card-lift rounded-3xl transition-all duration-300 shadow-md">
          <CardContent className="p-5 flex flex-col justify-between h-full min-h-[100px]">
            <span className="text-xs font-extrabold text-muted-foreground uppercase tracking-wider">{t('totalBookings')}</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-4xl font-black text-foreground font-mono">{totalBookings}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="stadium-glass border-white/10 card-lift rounded-3xl transition-all duration-300 shadow-md">
          <CardContent className="p-5 flex flex-col justify-between h-full min-h-[100px]">
            <span className="text-xs font-extrabold text-muted-foreground uppercase tracking-wider">{t('matchesPlayed')}</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-4xl font-black text-primary font-mono">{confirmedMatches}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="stadium-glass border-white/10 card-lift rounded-3xl transition-all duration-300 shadow-md">
          <CardContent className="p-5 flex flex-col justify-between h-full min-h-[100px]">
            <span className="text-xs font-extrabold text-muted-foreground uppercase tracking-wider">{t('preferredPitch')}</span>
            <span className="text-sm font-black text-foreground mt-2 truncate block" title={preferredPitchName}>
              ⚽ {preferredPitchName}
            </span>
          </CardContent>
        </Card>

        <Card className="stadium-glass border-white/10 card-lift rounded-3xl transition-all duration-300 shadow-md">
          <CardContent className="p-5 flex flex-col justify-between h-full min-h-[100px]">
            <span className="text-xs font-extrabold text-muted-foreground uppercase tracking-wider">{t('loyaltyLevel')}</span>
            <div className="mt-2">
              <span className="inline-block px-3.5 py-1 rounded-full text-xs font-black bg-primary/20 text-primary border border-primary/40 shadow-xs">
                {loyaltyBadge}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Badges Section */}
      <Card className="stadium-glass border-white/10 p-6 space-y-4 rounded-3xl shadow-xl">
        <h3 className="text-base font-extrabold text-foreground flex items-center gap-2">
          <Award className="w-5 h-5 text-emerald-400" />
          <span>{tAchieve('title')}</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className={`p-4 rounded-2xl border text-center space-y-1.5 ${confirmedMatches >= 1 ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-muted/30 border-border text-muted-foreground opacity-40'}`}>
            <Trophy className="w-6 h-6 mx-auto" />
            <span className="text-xs font-black block">{tAchieve('firstMatch')}</span>
          </div>

          <div className={`p-4 rounded-2xl border text-center space-y-1.5 ${confirmedMatches >= 3 ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-muted/30 border-border text-muted-foreground opacity-40'}`}>
            <Zap className="w-6 h-6 mx-auto" />
            <span className="text-xs font-black block">{tAchieve('hatTrick')}</span>
          </div>

          <div className={`p-4 rounded-2xl border text-center space-y-1.5 ${confirmedMatches >= 5 ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' : 'bg-muted/30 border-border text-muted-foreground opacity-40'}`}>
            <Star className="w-6 h-6 mx-auto" />
            <span className="text-xs font-black block">{tAchieve('starPlayer')}</span>
          </div>

          <div className={`p-4 rounded-2xl border text-center space-y-1.5 ${confirmedMatches >= 10 ? 'bg-purple-500/10 border-purple-500/30 text-purple-400' : 'bg-muted/30 border-border text-muted-foreground opacity-40'}`}>
            <Shield className="w-6 h-6 mx-auto" />
            <span className="text-xs font-black block">{tAchieve('legend')}</span>
          </div>
        </div>
      </Card>

      <Tabs defaultValue="bookings" className="w-full">
        <TabsList className="bg-muted/50 border border-border mb-6 p-1 rounded-2xl w-full grid grid-cols-3 max-w-md">
          <TabsTrigger value="bookings" className="data-[state=active]:bg-primary data-[state=active]:text-black font-black rounded-xl cursor-pointer">
            {t('myBookings')}
          </TabsTrigger>
          <TabsTrigger value="favorites" className="data-[state=active]:bg-background data-[state=active]:text-foreground font-bold rounded-xl cursor-pointer">
            {t('favorites')}
          </TabsTrigger>
          <TabsTrigger value="details" className="data-[state=active]:bg-background data-[state=active]:text-foreground font-bold rounded-xl cursor-pointer">
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

        <TabsContent value="favorites">
          <Card className="bg-card/70 border-border p-6 rounded-3xl space-y-4 shadow-lg">
            <h3 className="font-extrabold text-foreground text-sm flex items-center gap-2">
              <Heart className="w-4 h-4 text-red-500 fill-red-500" />
              <span>{t('favPitchesTitle')}</span>
            </h3>

            {preferredPitchId && pitchesCache[preferredPitchId] ? (
              <div className="p-5 rounded-2xl border border-border bg-background/50 flex items-center justify-between">
                <div>
                  <h4 className="font-extrabold text-foreground text-lg">{pitchesCache[preferredPitchId].name}</h4>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-primary" />
                    <span>{pitchesCache[preferredPitchId].locationName}</span>
                  </p>
                </div>

                <Button
                  onClick={() => router.push(`/book?pitchId=${preferredPitchId}`)}
                  className="bg-primary text-black font-black text-xs rounded-xl px-5 py-5"
                >
                  <span>{t('quickBook')}</span>
                  <ArrowRight className="w-3.5 h-3.5 ms-1 rtl:rotate-180" />
                </Button>
              </div>
            ) : (
              <div className="p-8 text-center border border-dashed border-border rounded-2xl bg-background/40 space-y-3">
                <p className="text-xs text-muted-foreground font-medium">{t('noFavText')}</p>
                <Button
                  onClick={() => router.push('/home')}
                  variant="outline"
                  className="border-primary/40 text-primary hover:bg-primary/10 font-black rounded-xl text-xs px-5 py-4 cursor-pointer"
                >
                  <span>{t('exploreStadiumsCta')}</span>
                  <ArrowRight className="w-3.5 h-3.5 ms-1 rtl:rotate-180" />
                </Button>
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="details">
          <Card className="w-full max-w-md bg-card/80 border-border backdrop-blur-xl rounded-3xl">
            <ProfileForm appUser={appUser} firebaseUid={firebaseUser.uid} />
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
