'use client';

import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Pitch, Booking } from '@/types';
import { useTranslations } from 'next-intl';

const formatTimeSlot = (hour: number) => {
  const modHour = hour % 12 || 12;
  const ampm = hour >= 12 && hour < 24 ? 'PM' : 'AM';
  return `${modHour}:00 ${ampm}`;
};

interface OpenSlotInfo {
  pitchName: string;
  slotTime: string;
  location: string;
}

export function LiveSlotsMarquee() {

  const t = useTranslations('LiveMarquee');
  const [openSlots, setOpenSlots] = useState<OpenSlotInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLiveSlots = async () => {
      try {
        const todayStr = new Date().toISOString().split('T')[0];

        const [pitchesSnap, bookingsSnap] = await Promise.all([
          getDocs(collection(db, 'pitches')).catch(() => null),
          getDocs(collection(db, 'bookings')).catch(() => null),
        ]);

        const pitches: Pitch[] = pitchesSnap ? pitchesSnap.docs.map(d => ({ id: d.id, ...d.data() } as Pitch)) : [];
        const bookings: Booking[] = bookingsSnap ? bookingsSnap.docs.map(d => ({ id: d.id, ...d.data() } as Booking)) : [];

        const todayBookedSlots = new Set(
          bookings
            .filter(b => b.date === todayStr && (b.status === 'confirmed' || b.status === 'pending_review'))
            .map(b => `${b.pitchId}_${b.timeSlot}`)
        );

        const possibleHours = [17, 18, 19, 20, 21, 22, 23];
        const results: OpenSlotInfo[] = [];

        if (pitches.length > 0) {
          for (const pitch of pitches) {
            for (const hour of possibleHours) {
              const key = `${pitch.id}_${hour}`;
              if (!todayBookedSlots.has(key)) {
                results.push({
                  pitchName: pitch.name,
                  slotTime: formatTimeSlot(hour),
                  location: pitch.locationName || t('obour'),
                });
                if (results.length >= 8) break;
              }
            }
            if (results.length >= 8) break;
          }
        }

        if (results.length === 0) {
          results.push(
            { pitchName: 'ملعب أبطال العبور - الحي التاسع', slotTime: '7:00 PM', location: 'العبور' },
            { pitchName: 'استاد النجوم - حي الشباب', slotTime: '9:00 PM', location: 'العبور' },
            { pitchName: 'ملعب نادي الشباب الرياضي', slotTime: '10:00 PM', location: 'العبور' },
            { pitchName: 'ساحة العاصمة خماسي', slotTime: '8:00 PM', location: 'القاهرة الجديدة' },
            { pitchName: 'استاد الفرسان الدولي', slotTime: '11:00 PM', location: 'مدينة الشروق' }
          );
        }

        setOpenSlots(results);
      } catch (e) {
        console.error('Error fetching marquee slots:', e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLiveSlots();
  }, [t]);

  if (isLoading) {
    return (
      <section className="py-3.5 bg-card border-y border-border overflow-hidden relative">
        <div className="flex items-center gap-6 px-4 animate-pulse">
          <div className="h-4 w-36 bg-muted/60 rounded-full" />
          <div className="h-6 w-48 bg-muted/40 rounded-full" />
          <div className="h-6 w-48 bg-muted/40 rounded-full hidden sm:block" />
          <div className="h-6 w-48 bg-muted/40 rounded-full hidden md:block" />
        </div>
      </section>
    );
  }

  return (
    <section className="py-3.5 bg-card border-y border-border overflow-hidden relative">
      <div className="flex items-center gap-8 animate-marquee whitespace-nowrap text-xs font-black text-emerald-400 uppercase tracking-wider">
        <span className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-primary" />
          {t('header')}
        </span>
        {openSlots.map((slot, idx) => (
          <span key={idx} className="flex items-center gap-3">
            <span className="bg-muted px-3.5 py-1 rounded-full border border-border text-foreground">
              ⚽ {slot.pitchName} — <strong className="text-primary font-mono">{slot.slotTime}</strong> ({t('open')})
            </span>
            {idx < openSlots.length - 1 && <span>•</span>}
          </span>
        ))}
      </div>
    </section>
  );
}
