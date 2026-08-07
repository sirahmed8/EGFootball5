'use client';

import { useState, useEffect, Suspense, useMemo } from 'react';
import { useRouter } from '@/i18n/routing';
import { doc, onSnapshot, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useSearchParams } from 'next/navigation';
import { Pitch } from '@/types';
import { useAuthStore } from '@/store/useAuthStore';
import { Calendar } from '@/components/ui/calendar';
import { format, addDays, isBefore, startOfDay } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';
import { lockSlot, OPENING_HOUR, CLOSING_HOUR } from '@/lib/firebase/booking';
import { useTranslations, useLocale } from 'next-intl';
import { ar, enUS } from 'date-fns/locale';
import { BookPageSkeleton } from '@/components/skeletons/PageSkeletons';
import { BookingSummaryCard } from '@/components/BookingSummaryCard';
import {
  Sparkles,
  Trophy,
  Shirt,
  Tag,
  Percent,
  MapPin,
  Phone,
  Clock,
  Coffee,
  Crown,
} from 'lucide-react';
import { isUserVip, calculateVipPrice } from '@/lib/vip';
import Image from 'next/image';
import { MotionDiv } from '@/components/MotionWrapper';

const BLOCKS = Array.from({ length: (CLOSING_HOUR - OPENING_HOUR) * 2 }, (_, i) => OPENING_HOUR + i * 0.5);

interface SlotData {
  status: 'free' | 'locked_temporary' | 'confirmed' | 'pending_review' | 'rejected';
  userId?: string;
  bookingId?: string;
  lockedUntil?: number;
}

const SAMPLE_PITCHES: Record<string, Pitch> = {
  'obour-stadium-1': {
    id: 'obour-stadium-1',
    name: 'ملعب أبطال العبور (El Obour Champions Field)',
    locationName: 'مدينة العبور - الحي التاسع',
    mapLink: 'https://maps.google.com',
    imagePreviewUrl: '/pitch_preview.jpg',
    pricePerHour: 350,
    recipient: '01012345678',
    managerName: 'الكابتن محمد علي',
    adminEmail: 'manager@obourstadium.com',
    adminPhone: '01012345678',
    createdAt: 1700000000000,
    capacity: '5v5',
    surfaceType: 'نجيل صناعي ممتاز',
    hasFloodlights: true,
    hasParking: true,
    hasCafeteria: true,
    rating: 4.9,
    reviewsCount: 142,
    city: 'obour',
  },
  'elnojoom-pitch-2': {
    id: 'elnojoom-pitch-2',
    name: 'استاد النجوم (El-Nojoom Stadium)',
    locationName: 'مدينة العبور - حي الشباب',
    mapLink: 'https://maps.google.com',
    imagePreviewUrl: '/stadium_hero_bg.jpg',
    pricePerHour: 400,
    recipient: '01098765432',
    managerName: 'الكابتن أحمد حسن',
    adminEmail: 'nojoom@football.com',
    adminPhone: '01098765432',
    createdAt: 1700000000000,
    capacity: '7v7',
    surfaceType: 'نجيل هجين',
    hasFloodlights: true,
    hasParking: true,
    hasCafeteria: true,
    rating: 4.85,
    reviewsCount: 98,
    city: 'obour',
  },
  'al-shabab-arena-3': {
    id: 'al-shabab-arena-3',
    name: 'ملعب نادي الشباب الرياضي',
    locationName: 'مدينة العبور - المنطقة المركزية',
    mapLink: 'https://maps.google.com',
    imagePreviewUrl: '/pitch_preview.jpg',
    pricePerHour: 300,
    recipient: '01122334455',
    managerName: 'الكابتن محمود السيد',
    adminEmail: 'shabab@football.com',
    adminPhone: '01122334455',
    createdAt: 1700000000000,
    capacity: '5v5',
    surfaceType: 'نجيل صناعي مواصفات دولية',
    hasFloodlights: true,
    hasParking: true,
    hasCafeteria: false,
    rating: 4.95,
    reviewsCount: 215,
    city: 'obour',
  },
};

function BookContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pitchId = searchParams.get('pitchId');
  const { firebaseUser, appUser } = useAuthStore();
  const t = useTranslations('Book');
  const tAddons = useTranslations('Addons');
  const tErrors = useTranslations('Errors');
  const locale = useLocale();
  const isArabic = locale === 'ar';

  const [pitch, setPitch] = useState<Pitch | null>(null);
  const [date, setDate] = useState<Date | undefined>(() => new Date());
  const [daySchedule, setDaySchedule] = useState<Record<string, SlotData>>({});
  const [loadingLock, setLoadingLock] = useState<number | null>(null);
  const [targetDuration, setTargetDuration] = useState<number>(1);
  const [selectedRange, setSelectedRange] = useState<{ start: number; end: number } | null>(null);
  const [bookingType, setBookingType] = useState<'private' | 'public'>('private');
  const [numPeople, setNumPeople] = useState<number>(10);

  const [promoInput, setPromoInput] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<number>(0);

  const [addons, setAddons] = useState<{ referee: boolean; bibs: boolean; drinks: boolean }>({
    referee: false,
    bibs: false,
    drinks: false,
  });

  useEffect(() => {
    if (!pitchId) {
      toast.error(t('selectPitchFirst'));
      router.push('/home');
    }
  }, [pitchId, router, t]);

  useEffect(() => {
    const fetchPitch = async () => {
      if (!pitchId) return;
      try {
        const snap = await getDoc(doc(db, 'pitches', pitchId));
        if (snap.exists()) {
          setPitch({ id: snap.id, ...snap.data() } as Pitch);
        } else if (SAMPLE_PITCHES[pitchId]) {
          setPitch(SAMPLE_PITCHES[pitchId]);
        } else {
          setPitch(SAMPLE_PITCHES['obour-stadium-1']);
        }
      } catch {
        if (SAMPLE_PITCHES[pitchId]) {
          setPitch(SAMPLE_PITCHES[pitchId]);
        } else {
          setPitch(SAMPLE_PITCHES['obour-stadium-1']);
        }
      }
    };
    fetchPitch();
  }, [pitchId]);

  useEffect(() => {
    if (!pitch || !date) return;
    const formattedDate = format(date, 'yyyy-MM-dd');

    const scheduleRef = doc(db, 'day_schedules', `${pitch.id}_${formattedDate}`);
    const unsubscribe = onSnapshot(scheduleRef, (snapshot) => {
      if (snapshot.exists()) {
        setDaySchedule(snapshot.data().slots || {});
      } else {
        setDaySchedule({});
      }
    });

    return () => unsubscribe();
  }, [pitch, date]);


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

  const [nowTimestamp] = useState(() => Date.now());

  const getSlotStatus = (block: number) => {

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
    const appUser = useAuthStore.getState().appUser;
    const isVip = isUserVip(appUser);
    const { finalPrice, discountAmount: vipDiscount } = calculateVipPrice(totalAmount, appUser);
    const effectiveTotal = isVip ? finalPrice : totalAmount;
    const effectiveDeposit = Math.round(effectiveTotal / 2);

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
        totalAmount
      );

      router.push(`/checkout?bookingId=${bookingId}&type=${bookingType}&people=${numPeople}`);
    } catch (error: unknown) {
      const err = error as Error;
      let errMsg = err.message;
      if (err.message && err.message.startsWith('ERROR_')) {
        try {
          errMsg = tErrors(err.message);
        } catch {
          // fallback
        }
      }
      toast.error(errMsg);
    } finally {
      setLoadingLock(null);
    }
  };

  const formatTime = (block: number) => {
    const hour = Math.floor(block);
    const mins = block % 1 === 0 ? '00' : '30';
    const ampm = hour >= 12 && hour < 24 ? (isArabic ? 'مساءً' : 'PM') : (isArabic ? 'صباحاً' : 'AM');
    const modHour = hour % 12 || 12;
    return `${modHour}:${mins} ${ampm}`;
  };

  if (!pitch || !date) {
    return <BookPageSkeleton />;
  }

  const { duration, totalAmount, depositAmount } = getBookingDetails();

  return (
    <div className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-8 space-y-8 mt-6 animate-in fade-in zoom-in-95 duration-500 bg-mesh">
      {/* Stadium Banner Header */}
      <div className="relative rounded-3xl overflow-hidden stadium-glass border-white/10 p-6 md:p-8 shadow-2xl space-y-6">
        <div className="absolute inset-0 z-0 opacity-25">
          <Image
            src={pitch.imagePreviewUrl || '/stadium_hero_bg.jpg'}
            alt={pitch.name}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-transparent" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3.5 py-1 rounded-full text-xs font-black bg-primary/10 text-primary border border-primary/30 shadow-xs">
                ⚽ {pitch.capacity || '5v5 Premium Turf'}
              </span>
              <span className="px-3.5 py-1 rounded-full text-xs font-extrabold bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center gap-1 shadow-xs">
                ⭐ {pitch.rating || 4.9} ({pitch.reviewsCount || 120} {isArabic ? 'تقييم' : 'reviews'})
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl font-black text-foreground tracking-tight">
              {pitch.name}
            </h1>

            <p className="text-muted-foreground text-sm md:text-base flex items-center gap-2 font-medium">
              <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{pitch.locationName || t('defaultLocation')}</span>
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="stadium-glass p-4 rounded-2xl border-white/10 text-center shadow-lg">
              <span className="text-2xl font-black text-primary font-mono block tracking-tight">
                {pitch.pricePerHour} EGP
              </span>
              <span className="text-[10px] text-muted-foreground uppercase font-extrabold tracking-wider">
                {t('ratePerHour')}
              </span>
            </div>

            {pitch.adminPhone && (
              <a
                href={`tel:${pitch.adminPhone}`}
                className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 p-4 rounded-2xl flex items-center justify-center gap-2 font-black text-xs transition-all hover:scale-105 shadow-sm"
              >
                <Phone className="w-4 h-4" />
                <span>{t('callManager')}</span>
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column - Date & Add-ons */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="bg-card text-card-foreground border-border backdrop-blur-md shadow-xl overflow-hidden rounded-3xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-extrabold flex items-center gap-2">
                <span>📅</span> {t('selectDate')}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center p-2 sm:p-4">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(d) => {
                  setDate(d);
                  setSelectedRange(null);
                }}
                disabled={(d) => isBefore(d, startOfDay(new Date())) || isBefore(addDays(new Date(), 14), d)}
                className="w-full max-w-full"
                locale={locale === 'ar' ? ar : enUS}
              />
            </CardContent>
          </Card>

          {/* Duration Selector */}
          <Card className="bg-card/70 border-border p-5 rounded-3xl space-y-3 shadow-md">
            <h4 className="text-xs font-extrabold text-foreground flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-primary" />
              <span>{t('matchDuration')}</span>
            </h4>
            <div className="grid grid-cols-3 gap-2">
              {[
                { val: 1, label: t('oneHour') },
                { val: 1.5, label: t('oneHalfHours') },
                { val: 2, label: t('twoHours') },
              ].map((item) => (
                <button
                  key={item.val}
                  onClick={() => {
                    setTargetDuration(item.val);
                    setSelectedRange(null);
                  }}
                  className={`py-2 px-1 rounded-xl text-xs font-black border transition-all cursor-pointer ${
                    targetDuration === item.val
                      ? 'bg-primary text-black border-primary shadow-md'
                      : 'bg-background/40 border-border text-muted-foreground hover:bg-muted'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </Card>

          {/* Promo Code Box */}
          <Card className="bg-card/70 border-border p-5 rounded-3xl space-y-3 shadow-md">
            <h4 className="text-xs font-extrabold text-foreground flex items-center gap-1.5">
              <Tag className="w-4 h-4 text-emerald-400" />
              <span>{t('promoCodeTitle')}</span>
            </h4>
            <div className="flex gap-2">
              <input
                type="text"
                value={promoInput}
                onChange={(e) => setPromoInput(e.target.value)}
                placeholder="KICKOFF10"
                className="flex-1 bg-background border border-border rounded-xl text-xs px-3 py-2 text-foreground font-mono uppercase font-bold"
              />
              <Button onClick={applyPromoCode} size="sm" className="bg-primary text-black font-extrabold rounded-xl text-xs px-4">
                {t('apply')}
              </Button>
            </div>
            {appliedDiscount > 0 && (
              <span className="text-[11px] text-emerald-400 font-extrabold flex items-center gap-1">
                <Percent className="w-3.5 h-3.5" />
                {t('discountAppliedTag', { percent: appliedDiscount * 100 })}
              </span>
            )}
          </Card>

          {/* Enhanced Add-ons Toggle Cards with Interactive Border Highlight & Subtotal Indicators */}
          <Card className="bg-card/70 border-border backdrop-blur-md shadow-xl p-5 space-y-4 rounded-3xl">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-foreground text-sm flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>{tAddons('title')}</span>
              </h3>
              {addonTotal > 0 && (
                <span className="text-xs font-mono font-black text-primary bg-primary/10 px-2.5 py-1 rounded-full border border-primary/20">
                  +{addonTotal} EGP
                </span>
              )}
            </div>

            <div className="space-y-2.5 text-xs">
              {/* Referee Add-on */}
              <label
                className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition-all ${
                  addons.referee
                    ? 'border-primary bg-primary/10 shadow-[0_0_15px_rgba(57,255,20,0.15)] font-bold text-foreground'
                    : 'border-border/50 bg-muted/40 text-muted-foreground hover:bg-muted/70'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Trophy className={`w-4 h-4 ${addons.referee ? 'text-primary' : 'text-amber-400'}`} />
                  <span className="font-bold">{tAddons('referee')}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="font-mono font-extrabold text-primary">+150 EGP</span>
                  <input
                    type="checkbox"
                    checked={addons.referee}
                    onChange={(e) => setAddons({ ...addons, referee: e.target.checked })}
                    className="accent-primary w-4 h-4 cursor-pointer"
                  />
                </div>
              </label>

              {/* Bibs Add-on */}
              <label
                className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition-all ${
                  addons.bibs
                    ? 'border-primary bg-primary/10 shadow-[0_0_15px_rgba(57,255,20,0.15)] font-bold text-foreground'
                    : 'border-border/50 bg-muted/40 text-muted-foreground hover:bg-muted/70'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Shirt className={`w-4 h-4 ${addons.bibs ? 'text-primary' : 'text-blue-400'}`} />
                  <span className="font-bold">{tAddons('bibs')}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="font-mono font-extrabold text-primary">+50 EGP</span>
                  <input
                    type="checkbox"
                    checked={addons.bibs}
                    onChange={(e) => setAddons({ ...addons, bibs: e.target.checked })}
                    className="accent-primary w-4 h-4 cursor-pointer"
                  />
                </div>
              </label>

              {/* Drinks Add-on */}
              <label
                className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition-all ${
                  addons.drinks
                    ? 'border-primary bg-primary/10 shadow-[0_0_15px_rgba(57,255,20,0.15)] font-bold text-foreground'
                    : 'border-border/50 bg-muted/40 text-muted-foreground hover:bg-muted/70'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Coffee className={`w-4 h-4 ${addons.drinks ? 'text-primary' : 'text-emerald-400'}`} />
                  <span className="font-bold">{tAddons('drinks')}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="font-mono font-extrabold text-primary">+100 EGP</span>
                  <input
                    type="checkbox"
                    checked={addons.drinks}
                    onChange={(e) => setAddons({ ...addons, drinks: e.target.checked })}
                    className="accent-primary w-4 h-4 cursor-pointer"
                  />
                </div>
              </label>
            </div>
          </Card>
        </div>

        {/* Right Column - Interactive Time Grid */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="bg-card text-card-foreground border-border backdrop-blur-md shadow-xl min-h-[500px] rounded-3xl overflow-hidden">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl md:text-2xl font-black flex items-center justify-between">
                <span>
                  {t('availableSlots', {
                    date: date ? format(date, 'MMM d, yyyy', { locale: locale === 'ar' ? ar : enUS }) : '',
                  })}
                </span>
              </CardTitle>
              <CardDescription className="text-xs">
                {t('slotInstruction')}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <MotionDiv 
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: { opacity: 0 },
                  visible: { opacity: 1, transition: { staggerChildren: 0.03 } }
                }}
                className="grid grid-cols-2 sm:grid-cols-4 gap-3"
              >
                {BLOCKS.map((block) => {
                  const status = getSlotStatus(block);
                  const isSelected = selectedRange && block >= selectedRange.start && block <= selectedRange.end;

                  let styleClass =
                    'bg-muted/40 text-foreground border-border hover:border-primary/50 hover:bg-primary/10';
                  let cursorClass = 'cursor-pointer';
                  let disabled = false;

                  if (status === 'taken' || status === 'locked_by_other') {
                    styleClass = 'bg-muted/20 text-muted-foreground border-dashed opacity-40';
                    cursorClass = 'cursor-not-allowed';
                    disabled = true;
                  } else if (isSelected) {
                    styleClass =
                      'bg-primary text-black border-primary shadow-[0_0_20px_rgba(57,255,20,0.5)] font-black text-sm scale-105';
                  }

                  return (
                    <MotionDiv
                      key={block}
                      variants={{
                        hidden: { opacity: 0, scale: 0.8 },
                        visible: { opacity: 1, scale: 1, transition: { duration: 0.2 } }
                      }}
                    >
                      <button
                        disabled={disabled}
                        onClick={() => handleSlotClick(block)}
                        className={`w-full p-4 rounded-2xl text-center text-xs font-bold border transition-all duration-200 ease-out active:scale-95 ${styleClass} ${cursorClass}`}
                      >
                        {formatTime(block)}
                      </button>
                    </MotionDiv>
                  );
                })}
              </MotionDiv>
            </CardContent>
          </Card>

          {selectedRange && (
            <BookingSummaryCard
              selectedRange={selectedRange}
              date={date}
              duration={duration}
              totalAmount={totalAmount}
              depositAmount={depositAmount}
              bookingType={bookingType}
              numPeople={numPeople}
              loadingLock={loadingLock !== null}
              isBlacklisted={appUser?.isBlacklisted || false}
              setBookingType={setBookingType}
              setNumPeople={setNumPeople}
              handleConfirmBooking={handleConfirmBooking}
              formatTime={formatTime}
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
