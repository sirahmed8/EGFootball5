import { doc, runTransaction, collection, query, where, getDocs, updateDoc } from 'firebase/firestore';
import { db } from './config';
import { BookingStatus } from '@/types';

export const OPENING_HOUR = 0; // 12 AM (Midnight)
export const CLOSING_HOUR = 24; // 12 AM (Midnight of next day)

// Helper: generate blocks for a given start slot and duration
export function getBlocks(startSlot: number, durationHours: number): number[] {
  const numBlocks = durationHours * 2;
  return Array.from({ length: numBlocks }, (_, i) => startSlot + i * 0.5);
}

// Helper: Free up slots in the day schedule
export function freeSlots(
  slots: Record<string, { bookingId: string; status: string }>,
  bookingId: string,
  blocks: number[]
) {
  for (const block of blocks) {
    const slotStr = block.toString();
    if (slots[slotStr] && slots[slotStr].bookingId === bookingId) {
      delete slots[slotStr];
    }
  }
}

export async function cleanupExpiredBookings(pitchId: string) {
  const now = Date.now();
  const bookingsRef = collection(db, 'bookings');
  const q = query(
    bookingsRef,
    where('pitchId', '==', pitchId),
    where('status', '==', BookingStatus.LOCKED_TEMPORARY),
    where('lockedUntil', '<', now)
  );

  try {
    const querySnapshot = await getDocs(q);
    const expiredBookings = querySnapshot.docs;

    if (expiredBookings.length === 0) return 0;

    await Promise.all(
      expiredBookings.map(async (bookingDoc) => {
        const booking = bookingDoc.data();
        const bookingId = bookingDoc.id;
        const scheduleId = `${pitchId}_${booking.date}`;
        const scheduleRef = doc(db, 'day_schedules', scheduleId);

        await runTransaction(db, async (transaction) => {
          const scheduleSnap = await transaction.get(scheduleRef);

          // Delete the booking
          transaction.delete(bookingDoc.ref);

          if (scheduleSnap.exists()) {
            const slots = scheduleSnap.data().slots || {};
            const blocks = getBlocks(booking.timeSlot, booking.duration);
            let modified = false;

            for (const block of blocks) {
              const slotStr = block.toString();
              if (slots[slotStr] && slots[slotStr].bookingId === bookingId) {
                delete slots[slotStr];
                modified = true;
              }
            }

            if (modified) {
              transaction.update(scheduleRef, { slots });
            }
          }
        });
      })
    );

    return expiredBookings.length;
  } catch (error) {
    console.error('Error during cleanup of expired bookings:', error);
    return 0;
  }
}

export async function settlePitchReimbursements(bookingIds: string[], adminUid: string) {
  const now = Date.now();
  await Promise.all(
    bookingIds.map((id) =>
      updateDoc(doc(db, 'bookings', id), {
        reimbursementStatus: 'settled',
        settledAt: now,
        settledBy: adminUid,
      })
    )
  );
}
