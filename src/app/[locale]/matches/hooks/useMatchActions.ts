'use client';

import { useState } from 'react';
import { useRouter } from '@/i18n/routing';
import { doc, runTransaction } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { Booking, User } from '@/types';

interface UseMatchActionsProps {
  appUser: User | null;
  firebaseUser: any;
  selectedPosition: 'GK' | 'DEF' | 'MID' | 'STR';
  isArabic: boolean;
}

export function useMatchActions({
  appUser,
  firebaseUser,
  selectedPosition,
  isArabic,
}: UseMatchActionsProps) {
  const router = useRouter();
  const t = useTranslations('Matches');
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  const handleJoinMatch = async (match: Booking) => {
    if (!firebaseUser || !appUser) {
      toast.error(t('loginToJoin'));
      router.push('/login');
      return;
    }

    setLoadingAction(match.id);
    const loadingToast = toast.loading(t('joiningMatch') || 'Joining Match...');
    try {
      const bookingRef = doc(db, 'bookings', match.id);

      await runTransaction(db, async (transaction) => {
        const snap = await transaction.get(bookingRef);
        if (!snap.exists()) throw new Error('Match not found');

        const data = snap.data() as Booking;
        const joined = data.joinedPlayers || [];

        const alreadyJoined = joined.some((p) => p.uid === firebaseUser.uid);
        if (alreadyJoined) {
          throw new Error(t('alreadyJoinedErr'));
        }

        if (joined.length >= data.numPeople) {
          throw new Error(t('matchFullErr'));
        }

        const newPlayer = {
          uid: firebaseUser.uid,
          name: `${appUser.name || 'Player'} [${selectedPosition}]`,
          joinedAt: Date.now(),
        };

        transaction.update(bookingRef, {
          joinedPlayers: [...joined, newPlayer],
        });
      });

      toast.success(t('joinSuccess'), { id: loadingToast });
    } catch (error: unknown) {
      const err = error as Error;
      toast.error(err.message || t('errorGeneric'), { id: loadingToast });
    } finally {
      setLoadingAction(null);
    }
  };

  const handleLeaveMatch = async (match: Booking) => {
    if (!firebaseUser) return;
    setLoadingAction(match.id);
    const loadingToast = toast.loading(t('leavingMatch') || 'Leaving Match...');

    try {
      const bookingRef = doc(db, 'bookings', match.id);

      await runTransaction(db, async (transaction) => {
        const snap = await transaction.get(bookingRef);
        if (!snap.exists()) throw new Error('Match not found');

        const data = snap.data() as Booking;
        const joined = data.joinedPlayers || [];

        const updated = joined.filter((p) => p.uid !== firebaseUser.uid);

        transaction.update(bookingRef, {
          joinedPlayers: updated,
        });
      });

      toast.success(t('leaveSuccess'), { id: loadingToast });
    } catch (error: unknown) {
      const err = error as Error;
      toast.error(err.message || t('errorGeneric'), { id: loadingToast });
    } finally {
      setLoadingAction(null);
    }
  };

  const handleShareMatch = async (match: Booking) => {
    const link = window.location.origin + '/matches?id=' + match.id;
    try {
      await navigator.clipboard.writeText(link);
      toast.success('Match link copied! 📋');
    } catch {
      toast.error(isArabic ? 'تعذّر نسخ الرابط' : 'Could not copy link');
    }
  };

  return {
    loadingAction,
    handleJoinMatch,
    handleLeaveMatch,
    handleShareMatch,
  };
}
