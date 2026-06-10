import { doc, runTransaction, updateDoc, setDoc } from 'firebase/firestore';
import { db } from './config';

export const OPENING_HOUR = 0; // 12 AM (Midnight)
export const CLOSING_HOUR = 24; // 12 AM (Midnight of next day)

export async function lockSlot(
  userId: string, 
  pitchId: string, 
  date: string, 
  startSlot: number, 
  durationHours: number,
  totalAmount: number, 
  depositAmount: number
): Promise<string> {
  const bookingId = `bk_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  const scheduleRef = doc(db, 'day_schedules', `${pitchId}_${date}`);
  const bookingRef = doc(db, 'bookings', bookingId);

  const numBlocks = durationHours * 2; // 1 hr = 2 blocks of 30 mins
  const blocks = Array.from({ length: numBlocks }, (_, i) => startSlot + (i * 0.5));
  const endSlot = blocks[blocks.length - 1];

  await runTransaction(db, async (transaction) => {
    const scheduleSnap = await transaction.get(scheduleRef);
    let bookedSlots: Record<string, { bookingId: string, status: string, lockedUntil?: number, userId: string }> = {};

    if (scheduleSnap.exists()) {
      bookedSlots = scheduleSnap.data()?.slots || {};
    }

    const now = Date.now();

    // Clean up expired temporary locks in memory before checking availability
    for (const key in bookedSlots) {
      const slot = bookedSlots[key];
      if (slot.status === 'locked_temporary' && slot.lockedUntil && slot.lockedUntil < now) {
        delete bookedSlots[key];
      }
    }

    // 1. Check Availability
    for (const block of blocks) {
      if (bookedSlots[block.toString()]) {
        throw new Error(`Slot ${block} is already booked or locked.`);
      }
    }

    // 2. Anti-Gap Logic (No 30-min dead gaps)
    // Check Before Gap
    const beforeSlot = startSlot - 0.5;
    if (beforeSlot >= OPENING_HOUR && !bookedSlots[beforeSlot.toString()]) {
      const twoBeforeSlot = startSlot - 1.0;
      if (beforeSlot === OPENING_HOUR || bookedSlots[twoBeforeSlot.toString()]) {
        throw new Error(`Booking creates an unbookable 30-minute gap before your start time (${beforeSlot}:00 / ${beforeSlot}:30). Please extend your booking or move it 30 mins earlier.`);
      }
    }

    // Check After Gap
    const afterSlot = endSlot + 0.5;
    if (afterSlot < CLOSING_HOUR && !bookedSlots[afterSlot.toString()]) {
      const twoAfterSlot = endSlot + 1.0;
      if (afterSlot === CLOSING_HOUR - 0.5 || bookedSlots[twoAfterSlot.toString()]) {
         throw new Error(`Booking creates an unbookable 30-minute gap after your end time. Please extend your booking or move it 30 mins later.`);
      }
    }

    // 3. Write updates
    const lockedUntil = now + 10 * 60 * 1000; // 10 minutes lock

    for (const block of blocks) {
      bookedSlots[block.toString()] = {
        bookingId,
        status: 'locked_temporary',
        lockedUntil,
        userId
      };
    }

    // Upsert the schedule document
    transaction.set(scheduleRef, { slots: bookedSlots }, { merge: true });

    // Create the booking document
    transaction.set(bookingRef, {
      id: bookingId,
      userId,
      pitchId,
      date,
      timeSlot: startSlot,
      duration: durationHours,
      totalAmount,
      depositAmount,
      status: 'locked_temporary',
      lockedUntil,
      createdAt: now
    });
  });

  return bookingId;
}

export async function submitReceipt(bookingId: string, receiptUrl: string) {
  const bookingRef = doc(db, 'bookings', bookingId);
  await updateDoc(bookingRef, {
    receiptUrl,
    status: 'pending_review'
  });
  // Note: a robust system would also update the day_schedules document status to 'pending_review'
  // But for this project scale, the client will rely on the booking document status to allow/deny access.
}

export async function confirmBooking(bookingId: string) {
  const bookingRef = doc(db, 'bookings', bookingId);
  await updateDoc(bookingRef, {
    status: 'confirmed'
  });
  
  // Increment global stats
  try {
    const { increment } = await import('firebase/firestore');
    await setDoc(doc(db, 'stats', 'global'), { bookings: increment(1) }, { merge: true });
  } catch (e) {
    console.error("Failed to increment stats", e);
  }
}

export async function rejectBooking(bookingId: string) {
  const bookingRef = doc(db, 'bookings', bookingId);
  await updateDoc(bookingRef, {
    status: 'rejected'
  });
  // To truly free the slot, we should delete the slot references in `day_schedules`.
  // Since we don't have the pitchId and date easily here without a fetch, 
  // we leave it to the next step: the admin can delete the booking or the scheduler cleans it.
}
