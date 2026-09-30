'use client';

import { useState, useEffect } from 'react';
import { doc, onSnapshot, getDoc, collection, getDocs, limit, query } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Pitch } from '@/types';
import { format } from 'date-fns';

export interface DaySlotData {
  status: 'free' | 'locked_temporary' | 'confirmed' | 'pending_review' | 'rejected';
  userId?: string;
  bookingId?: string;
  lockedUntil?: number;
}

export function useBookingPitchSchedule(
  pitchId: string | null,
  date: Date | undefined,
  isArabic: boolean
) {
  const [pitch, setPitch] = useState<Pitch | null>(null);
  const [pitchLoading, setPitchLoading] = useState(true);
  const [pitchError, setPitchError] = useState<string | null>(null);
  const [daySchedule, setDaySchedule] = useState<Record<string, DaySlotData>>({});

  useEffect(() => {
    const fetchPitch = async () => {
      setPitchLoading(true);
      setPitchError(null);
      try {
        if (pitchId) {
          const snap = await getDoc(doc(db, 'pitches', pitchId));
          if (snap.exists()) {
            setPitch({ id: snap.id, ...snap.data() } as Pitch);
            setPitchLoading(false);
            return;
          }
        }

        // Fallback: Query first active pitch in Firestore
        const q = query(collection(db, 'pitches'), limit(1));
        const snap = await getDocs(q);
        if (!snap.empty) {
          const docData = snap.docs[0];
          setPitch({ id: docData.id, ...docData.data() } as Pitch);
        } else {
          setPitchError(isArabic ? 'لم يتم العثور على الملعب المحدد' : 'Pitch not found');
        }
      } catch (err: unknown) {
        const error = err as Error;
        setPitchError(error.message || 'Failed to load pitch');
      } finally {
        setPitchLoading(false);
      }
    };

    fetchPitch();
  }, [pitchId, isArabic]);

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

  return {
    pitch,
    pitchLoading,
    pitchError,
    daySchedule,
  };
}
