import { doc, runTransaction, increment, collection, query, where, getDocs, writeBatch, getDoc, DocumentReference } from 'firebase/firestore';
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
  depositAmount: number,
  bookingType: 'private' | 'public',
  numPeople: number
): Promise<string> {
  const bookingId = `bk_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  const scheduleRef = doc(db, 'day_schedules', `${pitchId}_${date}`);
  const bookingRef = doc(db, 'bookings', bookingId);

  const numBlocks = durationHours * 2; // 1 hr = 2 blocks of 30 mins
  const blocks = Array.from({ length: numBlocks }, (_, i) => startSlot + (i * 0.5));
  const endSlot = blocks[blocks.length - 1];

  await runTransaction(db, async (transaction) => {
    // Check if the user is blacklisted
    const userRef = doc(db, 'users', userId);
    const userSnap = await transaction.get(userRef);
    if (userSnap.exists() && userSnap.data()?.isBlacklisted) {
      throw new Error('ERROR_BLACKLISTED');
    }

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
        throw new Error('ERROR_SLOT_TAKEN');
      }
    }

    // 2. Anti-Gap Logic (No 30-min dead gaps)
    // Check Before Gap
    const beforeSlot = startSlot - 0.5;
    if (beforeSlot >= OPENING_HOUR && !bookedSlots[beforeSlot.toString()]) {
      const twoBeforeSlot = startSlot - 1.0;
      if (beforeSlot === OPENING_HOUR || bookedSlots[twoBeforeSlot.toString()]) {
        throw new Error('ERROR_GAP_BEFORE');
      }
    }

    // Check After Gap
    const afterSlot = endSlot + 0.5;
    if (afterSlot < CLOSING_HOUR && !bookedSlots[afterSlot.toString()]) {
      const twoAfterSlot = endSlot + 1.0;
      if (afterSlot === CLOSING_HOUR - 0.5 || bookedSlots[twoAfterSlot.toString()]) {
         throw new Error('ERROR_GAP_AFTER');
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
    const userName = userSnap.exists() ? (userSnap.data()?.name || 'Player') : 'Player';
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
      createdAt: now,
      bookingType,
      numPeople,
      joinedPlayers: bookingType === 'public' ? [userId] : [],
      joinedPlayerNames: bookingType === 'public' ? [userName] : []
    });
  });

  return bookingId;
}

export async function submitReceipt(bookingId: string, receiptUrl: string) {
  const bookingRef = doc(db, 'bookings', bookingId);
  
  await runTransaction(db, async (transaction) => {
    const bookingSnap = await transaction.get(bookingRef);
    if (!bookingSnap.exists()) {
      throw new Error('Booking not found');
    }
    const bookingData = bookingSnap.data();
    const pitchId = bookingData.pitchId;
    const date = bookingData.date;
    const startSlot = bookingData.timeSlot;
    const durationHours = bookingData.duration;

    // Check if the schedule exists
    const scheduleRef = doc(db, 'day_schedules', `${pitchId}_${date}`);
    const scheduleSnap = await transaction.get(scheduleRef);
    if (!scheduleSnap.exists()) {
      throw new Error('ERROR_LOCK_EXPIRED');
    }

    const slots = scheduleSnap.data().slots || {};
    const numBlocks = durationHours * 2;
    
    // Verify all blocks are still locked by this booking
    for (let i = 0; i < numBlocks; i++) {
      const block = startSlot + (i * 0.5);
      const slot = slots[block.toString()];
      if (!slot || slot.bookingId !== bookingId) {
        throw new Error('ERROR_LOCK_EXPIRED');
      }
    }

    // Update booking status
    transaction.update(bookingRef, {
      receiptUrl,
      status: 'pending_review'
    });

    // Update corresponding day schedule slots status
    for (let i = 0; i < numBlocks; i++) {
      const block = startSlot + (i * 0.5);
      slots[block.toString()].status = 'pending_review';
      if ('lockedUntil' in slots[block.toString()]) {
        delete slots[block.toString()].lockedUntil;
      }
    }
    transaction.update(scheduleRef, { slots });
  });
}

export async function confirmBooking(bookingId: string) {
  const bookingRef = doc(db, 'bookings', bookingId);
  
  await runTransaction(db, async (transaction) => {
    const bookingSnap = await transaction.get(bookingRef);
    if (!bookingSnap.exists()) {
      throw new Error('Booking not found');
    }
    const booking = bookingSnap.data();
    
    // Update booking status
    transaction.update(bookingRef, { status: 'confirmed' });
    
    // Update corresponding day schedule slots status
    const scheduleRef = doc(db, 'day_schedules', `${booking.pitchId}_${booking.date}`);
    const scheduleSnap = await transaction.get(scheduleRef);
    if (scheduleSnap.exists()) {
      const slots = scheduleSnap.data().slots || {};
      const numBlocks = booking.duration * 2;
      for (let i = 0; i < numBlocks; i++) {
        const block = booking.timeSlot + (i * 0.5);
        if (slots[block.toString()]) {
          slots[block.toString()].status = 'confirmed';
          if ('lockedUntil' in slots[block.toString()]) {
            delete slots[block.toString()].lockedUntil;
          }
        }
      }
      transaction.update(scheduleRef, { slots });
    }
    
    // Increment global stats
    const statsRef = doc(db, 'stats', 'global');
    transaction.set(statsRef, { bookings: increment(1) }, { merge: true });
  });
}

export async function rejectBooking(bookingId: string) {
  const bookingRef = doc(db, 'bookings', bookingId);
  
  await runTransaction(db, async (transaction) => {
    const bookingSnap = await transaction.get(bookingRef);
    if (!bookingSnap.exists()) {
      throw new Error('Booking not found');
    }
    const booking = bookingSnap.data();
    
    // Update booking status
    transaction.update(bookingRef, { status: 'rejected' });
    
    // Free slot in schedule
    const scheduleRef = doc(db, 'day_schedules', `${booking.pitchId}_${booking.date}`);
    const scheduleSnap = await transaction.get(scheduleRef);
    if (scheduleSnap.exists()) {
      const slots = scheduleSnap.data().slots || {};
      const numBlocks = booking.duration * 2;
      for (let i = 0; i < numBlocks; i++) {
        const block = booking.timeSlot + (i * 0.5);
        if (slots[block.toString()] && slots[block.toString()].bookingId === booking.id) {
          delete slots[block.toString()];
        }
      }
      transaction.update(scheduleRef, { slots });
    }
  });
}

export async function cancelBooking(bookingId: string, userId: string) {
  const bookingRef = doc(db, 'bookings', bookingId);
  
  await runTransaction(db, async (transaction) => {
    const bookingSnap = await transaction.get(bookingRef);
    if (!bookingSnap.exists()) {
      throw new Error('Booking not found');
    }
    const booking = bookingSnap.data();
    
    // Security check: ensure the booking belongs to this user
    if (booking.userId !== userId) {
      throw new Error('ERROR_CANCEL_NOT_ALLOWED');
    }
    
    // Only allow canceling if status is locked_temporary or pending_review
    if (booking.status !== 'locked_temporary' && booking.status !== 'pending_review') {
      throw new Error('ERROR_CANCEL_NOT_ALLOWED');
    }
    
    // Update booking status
    transaction.update(bookingRef, { status: 'rejected' });
    
    // Free slots in schedule
    const scheduleRef = doc(db, 'day_schedules', `${booking.pitchId}_${booking.date}`);
    const scheduleSnap = await transaction.get(scheduleRef);
    if (scheduleSnap.exists()) {
      const slots = scheduleSnap.data().slots || {};
      const numBlocks = booking.duration * 2;
      for (let i = 0; i < numBlocks; i++) {
        const block = booking.timeSlot + (i * 0.5);
        if (slots[block.toString()] && slots[block.toString()].bookingId === booking.id) {
          delete slots[block.toString()];
        }
      }
      transaction.update(scheduleRef, { slots });
    }
  });
}

export async function cleanupExpiredBookings(pitchId: string) {
  const now = Date.now();
  const bookingsRef = collection(db, 'bookings');
  const q = query(
    bookingsRef,
    where('pitchId', '==', pitchId),
    where('status', '==', 'locked_temporary')
  );
  
  try {
    const querySnapshot = await getDocs(q);
    const expiredBookings = querySnapshot.docs.filter(docSnap => {
      const data = docSnap.data();
      return data.lockedUntil && data.lockedUntil < now;
    });

    if (expiredBookings.length === 0) return;

    const batch = writeBatch(db);
    const scheduleUpdates: Record<string, { ref: DocumentReference; slots: Record<string, { bookingId: string; status: string }> }> = {};

    for (const bookingDoc of expiredBookings) {
      const booking = bookingDoc.data();
      batch.delete(bookingDoc.ref);

      const scheduleId = `${pitchId}_${booking.date}`;
      if (!scheduleUpdates[scheduleId]) {
        const scheduleRef = doc(db, 'day_schedules', scheduleId);
        const scheduleSnap = await getDoc(scheduleRef);
        if (scheduleSnap.exists()) {
          scheduleUpdates[scheduleId] = {
            ref: scheduleRef,
            slots: scheduleSnap.data().slots || {}
          };
        }
      }

      if (scheduleUpdates[scheduleId]) {
        const slots = scheduleUpdates[scheduleId].slots;
        const numBlocks = booking.duration * 2;
        for (let i = 0; i < numBlocks; i++) {
          const block = booking.timeSlot + (i * 0.5);
          const slot = slots[block.toString()];
          if (slot && slot.bookingId === booking.id) {
            delete slots[block.toString()];
          }
        }
      }
    }

    for (const scheduleId in scheduleUpdates) {
      const { ref, slots } = scheduleUpdates[scheduleId];
      batch.update(ref, { slots });
    }

    await batch.commit();
  } catch (error) {
    console.error('Error during cleanupExpiredBookings:', error);
  }
}

