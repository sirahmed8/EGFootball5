'use client';

import { useState, Suspense, useMemo } from 'react';
import { useRouter } from '@/i18n/routing';
import { useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { lockSlot, OPENING_HOUR, CLOSING_HOUR } from '@/lib/firebase/booking';
import { useTranslations, useLocale } from 'next-intl';
import { BookPageSkeleton } from '@/components/skeletons/PageSkeletons';
import { BookingSummaryCard } from '@/components/BookingSummaryCard';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import { isUserVip, calculateVipPrice, getReservationLockMinutes } from '@/lib/vip';
import { formatTimeSlot } from '@/lib/bookingUtils';
import { useBookingPitchSchedule } from '@/hooks/useBookingPitchSchedule';
import Link from 'next/link';
import { BookingPitchHeader } from './components/BookingPitchHeader';
import { BookingCalendarPicker } from './components/BookingCalendarPicker';
import { BookingAddons, BookingAddonsState } from './components/BookingAddons';
import { BookingPromoCode } from './components/BookingPromoCode';
import { BookingSlotGrid } from './components/BookingSlotGrid';

const BLOCKS = Array.from(
  { length: (CLOSING_HOUR - OPENING_HOUR) * 2 },
  (_, i) => OPENING_HOUR + i * 0.5
);

function BookContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pitchId = searchParams.get('pitchId');
  const t = useTranslations('Book');
  const tErrors = useTranslations('Errors');
  const locale = useLocale();
  const isArabic = locale === 'ar';

  const { firebaseUser, appUser } = useAuthStore();

  const [date, setDate] = useState<Date | undefined>(new Date());
  const { pitch, pitchLoading, pitchError, daySchedule } = useBookingPitchSchedule(
    pitchId,
    date,
    isArabic
  );

  const [selectedRange, setSelectedRange] = useState<{ start: number; end: number } | null>(null);
  const [targetDuration, setTargetDuration] = useState<number>(1);
  const [loadingLock, setLoadingLock] = useState<number | null>(null);
  const [bookingType, setBookingType] = useState<'private' | 'public'>('private');
  const [numPeople, setNumPeople] = useState<number>(10);

  const [promoInput, setPromoInput] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<number>(0);

  const [addons, setAddons] = useState<BookingAddonsState>({
    referee: false,
    bibs: false,
    drinks: false,
  });

  const addonTotal = useMemo(() => {
    let total = 0;
    if (addons.referee) total += 150;
    if (addons.bibs) total += 50;
    if (addons.drinks) total += 100;
    return total;
  }, [addons]);

  const applyPromoCode = () => {
    const code = promoInput.trim().toUpperCase();
    if (code === 'KICKOFF10' || code === 'EGYPT10') {
      setAppliedDiscount(0.1);
      toast.success(t('promoApplied'));
    } else if (code === 'VIP50') {
      setAppliedDiscount(0.2);
      toast.success(t('promoGoldenApplied'));
    } else {
      toast.error(t('invalidPromo'));
    }
  };

  const getBookingDetails = () => {
    if (!selectedRange || !pitch) return { duration: 0, totalAmount: 0, depositAmount: 0 };
    const duration = selectedRange.end - selectedRange.start + 0.5;
    const numBlocks = duration * 2;
    let baseAmount = 0;

    for (let i = 0; i < numBlocks; i++) {
      baseAmount += pitch.pricePerHour / 2;
    }

    let subtotal = baseAmount + addonTotal;
    if (appliedDiscount > 0) {
      subtotal = subtotal * (1 - appliedDiscount);
    }

    const totalAmount = Math.round(subtotal);

    return {
      duration,
      totalAmount,
      depositAmount: Math.round(totalAmount / 2),
    };
  };

  const nowTimestamp = Date.now();

  const getSlotStatus = (block: number): 'free' | 'locked_by_me' | 'locked_by_other' | 'taken' => {
    const slotData = daySchedule[block.toString()];
    if (!slotData) return 'free';

    if (slotData.status === 'locked_temporary') {
      if (slotData.lockedUntil && slotData.lockedUntil > nowTimestamp) {
        return slotData.userId === firebaseUser?.uid ? 'locked_by_me' : 'locked_by_other';
      }
      return 'free';
    }
    return 'taken';
  };

  const handleSlotClick = (block: number) => {
    const numSlotsNeeded = targetDuration * 2 - 1;
    const calculatedEnd = block + numSlotsNeeded * 0.5;

    let hasConflict = false;
    for (let b = block; b <= calculatedEnd; b += 0.5) {
      if (b >= CLOSING_HOUR) {
        hasConflict = true;
        break;
      }
      const status = getSlotStatus(b);
      if (status === 'taken' || status === 'locked_by_other') {
        hasConflict = true;
        break;
      }
    }

    if (hasConflict) {
      setSelectedRange({ start: block, end: block });
    } else {
      setSelectedRange({ start: block, end: calculatedEnd });
    }
  };

  const handleConfirmBooking = async () => {
    if (!firebaseUser) {
      router.push('/login');
      return;
    }
    if (!pitch || !date || !selectedRange) return;

    const { duration, totalAmount } = getBookingDetails();
    const isVip = isUserVip(appUser);
    const { finalPrice, discountAmount: vipDiscount } = calculateVipPrice(totalAmount, appUser);
    const effectiveTotal = isVip ? finalPrice : totalAmount;
    const effectiveDeposit = Math.round(effectiveTotal / 2);
    const lockMinutes = getReservationLockMinutes(appUser);

    const formattedDate = format(date, 'yyyy-MM-dd');

    setLoadingLock(selectedRange.start);
    try {
      const bookingId = await lockSlot(
        firebaseUser.uid,
        pitch.id,
        formattedDate,
        selectedRange.start,
        duration,
        effectiveTotal,
        effectiveDeposit,
        bookingType,
        numPeople,
        isVip ? vipDiscount : 0,
        totalAmount,
        lockMinutes
      );

      router.push(`/checkout?bookingId=${bookingId}&type=${bookingType}&people=${numPeople}`);
    } catch (error: unknown) {
      const err = error as Error;
      let errMsg = err.message;
      if (err.message && err.message.startsWith('ERROR_')) {
        try {
          errMsg = tErrors(err.message);
        } catch {}
      }
      toast.error(errMsg);
    } finally {
      setLoadingLock(null);
    }
  };

  if (pitchLoading) {
    return <BookPageSkeleton />;
  }

  if (pitchError || !pitch) {
    return (
      <div className="flex-1 max-w-2xl mx-auto w-full p-8 text-center space-y-4 my-12" dir={isArabic ? 'rtl' : 'ltr'}>
        <div className="p-8 rounded-3xl bg-card border border-destructive/30 space-y-3">
          <AlertCircle className="w-10 h-10 text-destructive mx-auto" />
          <h2 className="text-xl font-black text-foreground">{isArabic ? 'الملعب غير متاح' : 'Pitch Unavailable'}</h2>
          <p className="text-xs text-muted-foreground">{pitchError || (isArabic ? 'تعذر العثور على بيانات الملعب المطلوب' : 'Could not find the requested pitch')}</p>
          <Link href="/home">
            <Button className="mt-4 rounded-xl text-xs font-black bg-primary text-black">
              <ArrowLeft className="w-4 h-4 me-1.5" />
              {isArabic ? 'تصفح الملاعب المتاحة' : 'Browse Available Pitches'}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const { duration, totalAmount, depositAmount } = getBookingDetails();

  return (
    <div className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-8 space-y-8 animate-in fade-in zoom-in-95 duration-500 bg-black" dir={isArabic ? 'rtl' : 'ltr'}>
      {/* Stadium Header Card */}
      <BookingPitchHeader pitch={pitch} isArabic={isArabic} />

      {/* Main Booking Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Calendar & Controls */}
        <div className="lg:col-span-4 space-y-4">
          <BookingCalendarPicker
            date={date}
            onDateChange={(d) => {
              setDate(d);
              setSelectedRange(null);
            }}
          />

          <BookingPromoCode
            promoInput={promoInput}
            setPromoInput={setPromoInput}
            appliedDiscount={appliedDiscount}
            onApply={applyPromoCode}
            onRemove={() => setAppliedDiscount(0)}
            isArabic={isArabic}
          />

          <BookingAddons addons={addons} setAddons={setAddons} isArabic={isArabic} />
        </div>

        {/* Right Column: Time Slots Grid */}
        <div className="lg:col-span-8 space-y-6">
          <BookingSlotGrid
            blocks={BLOCKS}
            targetDuration={targetDuration}
            setTargetDuration={(dur) => {
              setTargetDuration(dur);
              setSelectedRange(null);
            }}
            selectedRange={selectedRange}
            onSlotClick={handleSlotClick}
            getSlotStatus={getSlotStatus}
            formatTime={formatTimeSlot}
            date={date || null}
            isArabic={isArabic}
          />

          {selectedRange && (
            <BookingSummaryCard
              selectedRange={selectedRange}
              date={date || new Date()}
              duration={duration}
              totalAmount={totalAmount}
              depositAmount={depositAmount}
              bookingType={bookingType}
              numPeople={numPeople}
              loadingLock={loadingLock !== null}
              isBlacklisted={Boolean(appUser?.isBlacklisted)}
              setBookingType={setBookingType}
              setNumPeople={setNumPeople}
              formatTime={formatTimeSlot}
              handleConfirmBooking={handleConfirmBooking}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default function BookPage() {
  return (
    <Suspense fallback={<BookPageSkeleton />}>
      <BookContent />
    </Suspense>
  );
}
