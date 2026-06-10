'use client';

import { useState, useEffect } from 'react';
import { useRouter } from '@/i18n/routing';
import { doc, onSnapshot, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Pitch } from '@/types';
import { useAuthStore } from '@/store/useAuthStore';
import { Calendar } from '@/components/ui/calendar';
import { format, addDays, isBefore, startOfDay } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { lockSlot, OPENING_HOUR, CLOSING_HOUR } from '@/lib/firebase/booking';
import { useTranslations, useLocale } from 'next-intl';
import { ar, enUS } from 'date-fns/locale';

// Generate blocks from OPENING_HOUR to CLOSING_HOUR - 0.5
const BLOCKS = Array.from({ length: (CLOSING_HOUR - OPENING_HOUR) * 2 }, (_, i) => OPENING_HOUR + (i * 0.5));

export default function BookPage() {
  const router = useRouter();
  const { firebaseUser } = useAuthStore();
  const t = useTranslations('Book');
  const locale = useLocale();
  
  const [pitch, setPitch] = useState<Pitch | null>(null);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [daySchedule, setDaySchedule] = useState<Record<string, any>>({});
  const [loadingLock, setLoadingLock] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'morning' | 'afternoon' | 'evening' | 'night'>('all');
  const [selectedRange, setSelectedRange] = useState<{ start: number; end: number } | null>(null);

  useEffect(() => {
    setSelectedRange(null);
  }, [date]);

  useEffect(() => {
    const fetchPitch = async () => {
      const snap = await getDoc(doc(db, 'pitches', 'pitch_1'));
      if (snap.exists()) {
        setPitch(snap.data() as Pitch);
      }
    };
    fetchPitch();
  }, []);

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

  const getBookingDetails = () => {
    if (!selectedRange || !pitch) return { duration: 0, totalAmount: 0, depositAmount: 0 };
    const duration = (selectedRange.end - selectedRange.start) + 0.5;
    const numBlocks = duration * 2;
    let totalAmount = 0;
    
    for (let i = 0; i < numBlocks; i++) {
      const currentBlock = selectedRange.start + (i * 0.5);
      const hourFloor = Math.floor(currentBlock);
      const isPeak = pitch.peakHours.includes(hourFloor);
      totalAmount += isPeak ? (pitch.pricing.peak / 2) : (pitch.pricing.offPeak / 2);
    }
    
    return {
      duration,
      totalAmount,
      depositAmount: totalAmount / 2
    };
  };

  const handleSlotClick = (block: number) => {
    if (!selectedRange) {
      setSelectedRange({ start: block, end: block });
    } else if (selectedRange.start === selectedRange.end && block === selectedRange.start) {
      setSelectedRange(null);
    } else if (block > selectedRange.start) {
      // Check if there are booked/taken slots in the selected range
      let hasConflict = false;
      for (let b = selectedRange.start; b <= block; b += 0.5) {
        const status = getSlotStatus(b);
        if (status === 'taken' || status === 'locked_by_other') {
          hasConflict = true;
          break;
        }
      }
      if (hasConflict) {
        toast.error(locale === 'ar' ? 'يتعارض هذا النطاق مع حجز موجود.' : 'Selected range conflicts with an existing booking.');
        setSelectedRange({ start: block, end: block });
      } else {
        setSelectedRange({ start: selectedRange.start, end: block });
      }
    } else {
      setSelectedRange({ start: block, end: block });
    }
  };

  const handleConfirmBooking = async () => {
    if (!firebaseUser) {
      router.push('/login');
      return;
    }
    if (!pitch || !date || !selectedRange) return;

    const { duration, totalAmount, depositAmount } = getBookingDetails();
    const formattedDate = format(date, 'yyyy-MM-dd');

    setLoadingLock(selectedRange.start);
    try {
      const bookingId = await lockSlot(firebaseUser.uid, pitch.id, formattedDate, selectedRange.start, duration, totalAmount, depositAmount);
      router.push(`/checkout?bookingId=${bookingId}`);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoadingLock(null);
    }
  };

  const getSlotStatus = (block: number) => {
    const slotData = daySchedule[block.toString()];
    if (!slotData) return 'free';
    
    const now = Date.now();
    if (slotData.status === 'locked_temporary') {
      if (slotData.lockedUntil && slotData.lockedUntil > now) {
        return slotData.userId === firebaseUser?.uid ? 'locked_by_me' : 'locked_by_other';
      }
      return 'free'; 
    }
    return 'taken'; // 'confirmed' or 'pending_review'
  };

  const formatTime = (block: number) => {
    const hour = Math.floor(block);
    const mins = block % 1 === 0 ? '00' : '30';
    const ampm = hour >= 12 && hour < 24 ? t('pm') : t('am');
    const modHour = hour % 12 || 12;
    return `${modHour}:${mins} ${ampm}`;
  };

  return (
    <div className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-8 space-y-8 animate-in fade-in duration-700">
      <div className="space-y-2 text-center md:text-left">
        <h1 className="text-4xl md:text-5xl font-black text-foreground tracking-tight bg-gradient-to-r from-foreground to-foreground/75 bg-clip-text">
          {pitch?.name || 'Our Pitch'}
        </h1>
        <p className="text-muted-foreground text-base md:text-lg max-w-2xl">
          {pitch?.location || 'Select a date and slots to book'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Calendar */}
        <div className="lg:col-span-1">
          <Card className="bg-card text-card-foreground border-border backdrop-blur-md shadow-lg overflow-hidden transition-all duration-300 hover:border-primary/20">
            <CardHeader className="pb-4">
              <CardTitle className="text-card-foreground text-lg flex items-center gap-2">
                <span>📅</span> {t('selectDate')}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center p-2 sm:p-4">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                disabled={(d) => isBefore(d, startOfDay(new Date())) || isBefore(addDays(new Date(), 14), d)}
                className="w-full max-w-full"
                locale={locale === 'ar' ? ar : enUS}
              />
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Slots Picker */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-card text-card-foreground border-border backdrop-blur-md shadow-lg min-h-[500px] transition-all duration-300 hover:border-primary/20">
            <CardHeader className="pb-4">
              <CardTitle className="text-card-foreground text-xl md:text-2xl font-bold flex items-center justify-between">
                <span>{t('availableSlots', { date: date ? format(date, 'MMM d, yyyy', { locale: locale === 'ar' ? ar : enUS }) : '' })}</span>
              </CardTitle>
              <CardDescription className="text-muted-foreground text-sm">
                {t('peakInfo')} <span className="text-destructive font-bold">{t('peakColor')}</span>.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Tabs */}
              <div className="flex flex-wrap gap-2 border-b border-border pb-4">
                {[
                  { id: 'all', label: t('all') },
                  { id: 'morning', label: t('morning'), icon: '🌅' },
                  { id: 'afternoon', label: t('afternoon'), icon: '☀️' },
                  { id: 'evening', label: t('evening'), icon: '🌆' },
                  { id: 'night', label: t('night'), icon: '🌙' },
                ].map(tab => {
                  const active = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-full border transition-all duration-300 hover:scale-[1.03] active:scale-95 cursor-pointer ${
                        active
                          ? 'bg-primary text-black border-transparent shadow-[0_0_12px_rgba(57,255,20,0.3)] font-bold'
                          : 'bg-card text-muted-foreground border-border hover:text-foreground hover:bg-muted/50'
                      }`}
                    >
                      {tab.icon && <span className="text-[10px]">{tab.icon}</span>}
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Grid of filtered slots */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {BLOCKS.filter(block => {
                  if (activeTab === 'all') return true;
                  const hour = Math.floor(block);
                  if (activeTab === 'morning') return hour >= 8 && hour < 12;
                  if (activeTab === 'afternoon') return hour >= 12 && hour < 16;
                  if (activeTab === 'evening') return hour >= 16 && hour < 20;
                  return hour >= 20;
                }).map((block, idx) => {
                  const status = getSlotStatus(block);
                  const hourFloor = Math.floor(block);
                  const isPeak = pitch?.peakHours.includes(hourFloor);

                  let bgClass = 'bg-slate-50 dark:bg-white/5 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-white/10 hover:border-primary/50 dark:hover:border-primary/50 hover:bg-primary/5 dark:hover:bg-primary/5 hover:text-foreground hover:-translate-y-1 hover:shadow-md transition-all duration-300 rounded-xl';
                  let cursorClass = 'cursor-pointer';
                  let disabled = false;
                  let text = formatTime(block);

                  const isSelected = selectedRange && block >= selectedRange.start && block <= selectedRange.end;

                  if (status === 'taken' || status === 'locked_by_other') {
                    bgClass = 'bg-slate-200/50 dark:bg-muted/30 text-slate-400 dark:text-muted-foreground border border-dashed border-slate-300 dark:border-border opacity-50 rounded-xl';
                    cursorClass = 'cursor-not-allowed';
                    disabled = true;
                  } else if (isSelected) {
                    bgClass = 'bg-secondary text-secondary-foreground border border-transparent shadow-[0_0_15px_rgba(0,255,255,0.3)] ring-2 ring-secondary hover:-translate-y-1 transition-all duration-300 rounded-xl';
                    
                    if (selectedRange.start === selectedRange.end) {
                      text += t('selectedSuffix');
                    } else if (block === selectedRange.start) {
                      text += t('startLabel');
                    } else if (block === selectedRange.end) {
                      text += t('endLabel');
                    }
                  } else {
                    if (isPeak) {
                      bgClass = 'bg-amber-50/80 dark:bg-destructive/10 border border-amber-200 dark:border-destructive/30 text-amber-900 dark:text-foreground hover:bg-amber-100 dark:hover:bg-destructive/20 hover:border-amber-400 dark:hover:border-destructive hover:-translate-y-1 hover:shadow-md transition-all duration-300 rounded-xl';
                    }
                  }

                  // Add staggered animation delay
                  const animDelay = `${idx * 40}ms`;

                  return (
                    <div
                      key={block}
                      onClick={() => !disabled && handleSlotClick(block)}
                      style={{ animationDelay: animDelay }}
                      className={`p-4 text-center font-bold relative flex items-center justify-center animate-in fade-in slide-in-from-bottom-3 duration-300 fill-mode-both ${bgClass} ${cursorClass}`}
                    >
                      <span>{loadingLock === block ? t('locking') : text}</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Sticky Booking Range Summary Card */}
          {selectedRange && (() => {
            const { duration, totalAmount, depositAmount } = getBookingDetails();
            return (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <Card className="bg-card text-card-foreground border-primary/40 shadow-[0_0_20px_rgba(57,255,20,0.15)] overflow-hidden">
                  <div className="bg-primary/10 px-6 py-4 border-b border-primary/20">
                    <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                      <span>⚽</span>
                      {t('bookRangeSummary', {
                        date: date ? format(date, 'MMM d, yyyy', { locale: locale === 'ar' ? ar : enUS }) : '',
                        start: formatTime(selectedRange.start),
                        end: formatTime(selectedRange.end + 0.5),
                        duration
                      })}
                    </h3>
                  </div>
                  <CardContent className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                      <div className="p-4 rounded-xl bg-muted/20 border border-border">
                        <span className="text-muted-foreground block text-xs font-semibold mb-1 uppercase tracking-wider">Duration</span>
                        <span className="text-xl font-bold text-foreground">{duration} Hours</span>
                      </div>
                      <div className="p-4 rounded-xl bg-muted/20 border border-border">
                        <span className="text-muted-foreground block text-xs font-semibold mb-1 uppercase tracking-wider">Total Price</span>
                        <span className="text-xl font-bold text-foreground text-primary">{totalAmount} {t('egp')}</span>
                      </div>
                      <div className="p-4 rounded-xl bg-muted/20 border border-border">
                        <span className="text-muted-foreground block text-xs font-semibold mb-1 uppercase tracking-wider">Required Deposit</span>
                        <span className="text-xl font-bold text-foreground text-secondary">{depositAmount} {t('egp')}</span>
                      </div>
                    </div>

                    <Button
                      onClick={handleConfirmBooking}
                      disabled={loadingLock !== null}
                      className="w-full py-6 text-lg font-bold bg-primary text-black hover:bg-primary/90 rounded-xl transition-all hover:scale-[1.01] active:scale-[0.99] shadow-[0_0_25px_rgba(57,255,20,0.35)] cursor-pointer"
                    >
                      {loadingLock !== null ? t('locking') : t('confirmBookingBtn')}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
