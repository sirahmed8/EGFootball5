'use client';

import { useState, useEffect } from 'react';
import { useRouter } from '@/i18n/routing';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { useTranslations, useLocale } from 'next-intl';
import { Booking, Pitch } from '@/types';
import { cancelBooking } from '@/lib/firebase/booking';
import { useAuthStore } from '@/store/useAuthStore';

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

  if (timeLeft <= 0)
    return (
      <span className="text-destructive font-bold">
        {t('rejected')} {t('expired')}
      </span>
    );
  const m = Math.floor(timeLeft / 60);
  const s = timeLeft % 60;
  return (
    <span className="text-amber-400 font-bold font-mono">
      {t('timerLeft', { time: `${m}:${s.toString().padStart(2, '0')}` })}
    </span>
  );
}

interface BookingCardProps {
  booking: Booking;
  pitch?: Pitch;
}

export function BookingCard({ booking, pitch }: BookingCardProps) {
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
    const ampm =
      hour >= 12 && hour < 24 ? (locale === 'ar' ? 'م' : 'PM') : locale === 'ar' ? 'ص' : 'AM';
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
              ⏰{' '}
              <span className="text-foreground font-bold">
                {formatTimeSlot(booking.timeSlot)} ({booking.duration} hr)
              </span>
            </p>
            <p className="text-muted-foreground font-medium">
              👥 {t('bookingType')}:{' '}
              <span className="text-foreground font-bold capitalize">
                {booking.bookingType ? t(booking.bookingType) : t('private')}
              </span>
            </p>
            <p className="text-muted-foreground font-medium">
              🏃 {t('playersCount', { count: booking.numPeople || 10 })}
            </p>
            <p className="text-muted-foreground font-medium col-span-2 pt-1 border-t border-border/30">
              💸 {t('amount')}:{' '}
              <strong className="text-primary font-black font-mono text-base">
                {booking.totalAmount} EGP
              </strong>{' '}
              ({t('depositLabel')}: {booking.depositAmount} EGP)
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
            <DialogDescription>{t('confirmCancelPrompt')}</DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setShowCancelDialog(false)}
              disabled={canceling}
              className="rounded-xl cursor-pointer"
            >
              {t('close')}
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancel}
              disabled={canceling}
              className="rounded-xl font-bold cursor-pointer"
            >
              {canceling ? t('canceling') : t('confirmCancel')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
