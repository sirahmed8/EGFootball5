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

        setOpenSlots(results);
      } catch (e) {
        console.error('Error fetching marquee slots:', e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLiveSlots();
  }, [t]);

  if (isLoading || openSlots.length === 0) {
    return null;
  }

  return (
    <section className="py-3.5 stadium-glass border-y border-white/10 overflow-hidden relative backdrop-blur-xl">
      <div className="flex items-center gap-8 animate-marquee whitespace-nowrap text-xs font-black text-emerald-400 uppercase tracking-wider">
        <span className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <Clock className="w-4 h-4 text-primary" />
          {t('header')}
        </span>
        {openSlots.map((slot, idx) => (
          <span key={idx} className="flex items-center gap-3">
            <span className="bg-white/5 hover:bg-white/10 px-3.5 py-1 rounded-full border border-white/10 hover:border-primary/40 text-foreground shadow-sm transition-all duration-200 hover:scale-[1.03] cursor-pointer">
              ⚽ {slot.pitchName} — <strong className="text-primary font-mono">{slot.slotTime}</strong> ({t('open')})
            </span>
            {idx < openSlots.length - 1 && <span className="opacity-30">•</span>}
          </span>
        ))}
      </div>
    </section>
  );
}
