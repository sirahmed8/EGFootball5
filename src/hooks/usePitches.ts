'use client';

import { useQuery } from '@tanstack/react-query';
import { collection, doc, getDoc, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Pitch } from '@/types';
import { queryKeys } from '@/lib/queryKeys';
import { DOMAIN_STALE_TIMES } from '@/lib/queryClient';

export function usePitches() {
  return useQuery({
    queryKey: queryKeys.pitches.all,
    queryFn: async (): Promise<Pitch[]> => {
      const pitchesCol = collection(db, 'pitches');
      const snap = await getDocs(pitchesCol);
      return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Pitch));
    },
    staleTime: DOMAIN_STALE_TIMES.pitches,
    gcTime: 1000 * 60 * 60, // 1 hour retention
    networkMode: 'offlineFirst',
  });
}

export function usePitch(pitchId?: string) {
  return useQuery({
    queryKey: queryKeys.pitches.detail(pitchId),
    queryFn: async (): Promise<Pitch | null> => {
      if (!pitchId) return null;
      const ref = doc(db, 'pitches', pitchId);
      const snap = await getDoc(ref);
      if (!snap.exists()) return null;
      return { id: snap.id, ...snap.data() } as Pitch;
    },
    enabled: !!pitchId,
    staleTime: DOMAIN_STALE_TIMES.pitches,
    gcTime: 1000 * 60 * 60,
    networkMode: 'offlineFirst',
  });
}
