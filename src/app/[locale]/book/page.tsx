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
  const [duration, setDuration] = useState<number>(1); // default 1 hour
  const [activeTab, setActiveTab] = useState<'all' | 'afternoon' | 'evening' | 'night'>('all');

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

  const handleSlotClick = async (startSlot: number) => {
    if (!firebaseUser) {
      router.push('/login');
      return;
    }
    if (!pitch || !date) return;

    // Verify if all required blocks are free
    const numBlocks = duration * 2;
    for (let i = 0; i < numBlocks; i++) {
      const b = startSlot + (i * 0.5);
      if (b >= CLOSING_HOUR) {
        toast.error('Booking exceeds closing time.');
        return;
      }
      if (getSlotStatus(b) !== 'free') {
        toast.error('Selected duration overlaps with a booked slot.');
        return;
      }
    }

    const formattedDate = format(date, 'yyyy-MM-dd');
    let totalAmount = 0;
    
    // Calculate price accurately handling peak and off-peak for half-hour blocks
    for (let i = 0; i < numBlocks; i++) {
      const currentBlock = startSlot + (i * 0.5);
      const hourFloor = Math.floor(currentBlock);
      const isPeak = pitch.peakHours.includes(hourFloor);
      totalAmount += isPeak ? (pitch.pricing.peak / 2) : (pitch.pricing.offPeak / 2);
    }
    
    const depositAmount = totalAmount / 2;
    
    setLoadingLock(startSlot);
    try {
      const bookingId = await lockSlot(firebaseUser.uid, pitch.id, formattedDate, startSlot, duration, totalAmount, depositAmount);
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
          {pitch?.location || 'Select a date and duration to book'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-1 space-y-6">
          <Card className="bg-card text-card-foreground border-border backdrop-blur-md shadow-lg transition-all duration-300 hover:border-primary/20">
            <CardHeader className="pb-4">
              <CardTitle className="text-card-foreground text-lg flex items-center gap-2">
                <span>⏱️</span> Duration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={duration.toString()} onValueChange={(v) => setDuration(v ? parseFloat(v) : 1)}>
                <SelectTrigger className="w-full h-11 px-3.5 border-border rounded-xl bg-muted/20 hover:bg-muted/40 transition-colors">
                  <SelectValue placeholder="Select Duration" />
                </SelectTrigger>
                <SelectContent alignItemWithTrigger={false} side="bottom">
                  <SelectItem value="1">1 Hour</SelectItem>
                  <SelectItem value="1.5">1.5 Hours</SelectItem>
                  <SelectItem value="2">2 Hours</SelectItem>
                  <SelectItem value="2.5">2.5 Hours</SelectItem>
                  <SelectItem value="3">3 Hours</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

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

        <div className="lg:col-span-2">
          <Card className="bg-card text-card-foreground border-border backdrop-blur-md shadow-lg min-h-[600px] transition-all duration-300 hover:border-primary/20">
            <CardHeader className="pb-4">
              <CardTitle className="text-card-foreground text-xl md:text-2xl font-bold flex items-center justify-between">
                <span>{t('availableSlots', { date: date ? format(date, 'MMM d, yyyy', { locale: locale === 'ar' ? ar : enUS }) : '' })}</span>
              </CardTitle>
              <CardDescription className="text-muted-foreground text-sm">
                {t('peakInfo')} <span className="text-destructive font-bold">{t('peakColor')}</span>.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Timeline */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary/40 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                    </span>
                    {t('timelineTitle')}
                  </h3>
                  <div className="flex flex-wrap gap-3 text-[11px] font-semibold">
                    <div className="flex items-center gap-1">
                      <div className="w-3.5 h-3.5 rounded-sm bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10" />
                      <span className="text-muted-foreground">{t('legendFree')}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3.5 h-3.5 rounded-sm bg-amber-50/80 dark:bg-destructive/15 border border-amber-200 dark:border-destructive/30" />
                      <span className="text-muted-foreground">{t('legendPeak')}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3.5 h-3.5 rounded-sm bg-slate-200/50 dark:bg-muted/30 border border-dashed border-slate-300 dark:border-border opacity-50" />
                      <span className="text-muted-foreground">{t('legendBooked')}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3.5 h-3.5 rounded-sm bg-secondary shadow-[0_0_6px_rgba(0,255,255,0.4)]" />
                      <span className="text-muted-foreground">{t('legendSelected')}</span>
                    </div>
                  </div>
                </div>

                <div className="relative bg-muted/20 border border-border p-3.5 rounded-xl">
                  <div className="grid h-10 gap-0.5 rounded-lg overflow-hidden border border-border bg-background" style={{ gridTemplateColumns: 'repeat(16, minmax(0, 1fr))' }}>
                    {BLOCKS.map(block => {
                      const status = getSlotStatus(block);
                      const hourFloor = Math.floor(block);
                      const isPeak = pitch?.peakHours.includes(hourFloor);

                      let bgStyle = 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10';
                      let cursor = 'cursor-pointer';
                      let hoverClass = 'hover:bg-primary/20 dark:hover:bg-primary/20 hover:scale-110';
                      let clickable = true;

                      if (status === 'taken' || status === 'locked_by_other') {
                        bgStyle = 'bg-slate-200/50 dark:bg-muted/30 opacity-40 border-dashed border-slate-300 dark:border-border';
                        cursor = 'cursor-not-allowed';
                        hoverClass = '';
                        clickable = false;
                      } else if (status === 'locked_by_me') {
                        bgStyle = 'bg-secondary text-secondary-foreground shadow-[0_0_12px_rgba(0,255,255,0.5)] scale-105 z-10 border-transparent';
                        cursor = 'cursor-pointer';
                        hoverClass = 'hover:scale-110';
                      } else {
                        if (isPeak) {
                          bgStyle = 'bg-amber-50/80 dark:bg-destructive/15 border-amber-200 dark:border-destructive/30 text-amber-900 dark:text-foreground';
                        }
                      }

                      return (
                        <div
                          key={block}
                          onClick={() => clickable && handleSlotClick(block)}
                          className={`h-full relative transition-all duration-300 border flex items-center justify-center text-[10px] font-bold ${bgStyle} ${cursor} ${hoverClass}`}
                          title={`${formatTime(block)}`}
                        >
                          <span className="hidden sm:inline opacity-70">{block % 1 === 0 ? `${block % 12 || 12}` : ''}</span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex justify-between text-[10px] font-bold text-muted-foreground px-1 pt-2" dir="ltr">
                    <span>4:00 PM</span>
                    <span>6:00 PM</span>
                    <span>8:00 PM</span>
                    <span>10:00 PM</span>
                    <span>12:00 AM</span>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex flex-wrap gap-2 border-b border-border pb-4">
                {[
                  { id: 'all', label: t('all') },
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
                  if (activeTab === 'afternoon') return hour >= 16 && hour < 17;
                  if (activeTab === 'evening') return hour >= 17 && hour < 21;
                  return hour >= 21;
                }).map((block, idx) => {
                  const status = getSlotStatus(block);
                  const hourFloor = Math.floor(block);
                  const isPeak = pitch?.peakHours.includes(hourFloor);

                  let bgClass = 'bg-slate-50 dark:bg-white/5 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-white/10 hover:border-primary/50 dark:hover:border-primary/50 hover:bg-primary/5 dark:hover:bg-primary/5 hover:text-foreground hover:-translate-y-1 hover:shadow-md transition-all duration-300 rounded-xl';
                  let cursorClass = 'cursor-pointer';
                  let disabled = false;
                  let text = formatTime(block);

                  if (status === 'taken' || status === 'locked_by_other') {
                    bgClass = 'bg-slate-200/50 dark:bg-muted/30 text-slate-400 dark:text-muted-foreground border border-dashed border-slate-300 dark:border-border opacity-50 rounded-xl';
                    cursorClass = 'cursor-not-allowed';
                    disabled = true;
                  } else if (status === 'locked_by_me') {
                    bgClass = 'bg-secondary text-secondary-foreground border border-transparent shadow-[0_0_15px_rgba(0,255,255,0.3)] ring-2 ring-secondary hover:-translate-y-1 transition-all duration-300 rounded-xl';
                    text += t('selectedSuffix');
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
        </div>
      </div>
    </div>
  );
}
