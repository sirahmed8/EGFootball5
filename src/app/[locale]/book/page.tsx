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
import { useTranslations } from 'next-intl';

// Generate blocks from OPENING_HOUR to CLOSING_HOUR - 0.5
const BLOCKS = Array.from({ length: (CLOSING_HOUR - OPENING_HOUR) * 2 }, (_, i) => OPENING_HOUR + (i * 0.5));

export default function BookPage() {
  const router = useRouter();
  const { firebaseUser } = useAuthStore();
  const t = useTranslations('Book');
  
  const [pitch, setPitch] = useState<Pitch | null>(null);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [daySchedule, setDaySchedule] = useState<Record<string, any>>({});
  const [loadingLock, setLoadingLock] = useState<number | null>(null);
  const [duration, setDuration] = useState<number>(1); // default 1 hour

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
    const ampm = hour >= 12 && hour < 24 ? 'PM' : 'AM';
    const modHour = hour % 12 || 12;
    return `${modHour}:${mins} ${ampm}`;
  };

  return (
    <div className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-8 space-y-8">
      <div>
        <h1 className="text-4xl font-black text-white">{pitch?.name || 'Our Pitch'}</h1>
        <p className="text-zinc-400 mt-2">{pitch?.location || 'Select a date and duration to book'}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-8">
          <Card className="bg-zinc-900/50 border-white/10 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="text-white">Duration</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={duration.toString()} onValueChange={(v) => setDuration(v ? parseFloat(v) : 1)}>
                <SelectTrigger className="w-full bg-zinc-800 border-white/10 text-white">
                  <SelectValue placeholder="Select Duration" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-white/10 text-white">
                  <SelectItem value="1">1 Hour</SelectItem>
                  <SelectItem value="1.5">1.5 Hours</SelectItem>
                  <SelectItem value="2">2 Hours</SelectItem>
                  <SelectItem value="2.5">2.5 Hours</SelectItem>
                  <SelectItem value="3">3 Hours</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900/50 border-white/10 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="text-white">{t('selectDate')}</CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                disabled={(d) => isBefore(d, startOfDay(new Date())) || isBefore(addDays(new Date(), 14), d)}
                className="bg-zinc-900/80 text-white rounded-xl border border-white/10 p-3"
              />
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card className="bg-zinc-900/50 border-white/10 backdrop-blur-md min-h-[600px]">
            <CardHeader>
              <CardTitle className="text-white">{t('availableSlots', { date: date ? format(date, 'MMM d, yyyy') : '' })}</CardTitle>
              <CardDescription className="text-zinc-400">
                {t('peakInfo')} <span className="text-destructive font-bold">{t('peakColor')}</span>.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {BLOCKS.map(block => {
                  const status = getSlotStatus(block);
                  const hourFloor = Math.floor(block);
                  const isPeak = pitch?.peakHours.includes(hourFloor);

                  let bgClass = 'bg-zinc-800/50 text-white border-zinc-700 hover:bg-zinc-700 hover:border-zinc-600';
                  let cursorClass = 'cursor-pointer';
                  let disabled = false;
                  let text = formatTime(block);

                  if (status === 'taken' || status === 'locked_by_other') {
                    bgClass = 'bg-zinc-900/30 text-zinc-600 border-zinc-800/50';
                    cursorClass = 'cursor-not-allowed';
                    disabled = true;
                  } else if (status === 'locked_by_me') {
                    bgClass = 'bg-secondary text-black hover:bg-secondary/90 shadow-[0_0_15px_rgba(0,255,255,0.3)] border-transparent';
                    text += ` (Finish)`;
                  } else {
                    if (isPeak) {
                      bgClass = 'bg-zinc-800/50 border-s-4 border-s-destructive border-y-zinc-700 border-e-zinc-700 text-white hover:bg-zinc-700';
                    }
                  }

                  return (
                    <Button
                      key={block}
                      variant="outline"
                      className={`h-16 flex-col gap-1 text-sm font-medium transition-all ${bgClass} ${cursorClass} ${!disabled && 'hover:scale-[1.02]'}`}
                      disabled={disabled || loadingLock === block}
                      onClick={() => handleSlotClick(block)}
                    >
                      <span>{loadingLock === block ? t('locking') : text}</span>
                    </Button>
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
