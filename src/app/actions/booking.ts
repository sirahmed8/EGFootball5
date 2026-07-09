'use server';

import { adminDb, adminAuth } from '@/lib/firebase/admin';

const OPENING_HOUR = 0; // 12 AM (Midnight)
const CLOSING_HOUR = 24; // 12 AM (Midnight of next day)

function getBlocks(startSlot: number, durationHours: number): number[] {
  const numBlocks = durationHours * 2;
  return Array.from({ length: numBlocks }, (_, i) => startSlot + (i * 0.5));
}

function freeSlots(slots: Record<string, { bookingId: string; status: string }>, bookingId: string, blocks: number[]) {
  for (const block of blocks) {
    const slotStr = block.toString();
    if (slots[slotStr] && slots[slotStr].bookingId === bookingId) {
      delete slots[slotStr];
    }
  }
}

async function verifyAuth(idToken: string) {
  try {
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    return decodedToken.uid;
  } catch {
    throw new Error('Unauthorized: Invalid token');
  }
}

import { Transaction, DocumentReference } from 'firebase-admin/firestore';

export async function lockSlotAction(
  idToken: string,
  pitchId: string, 
  date: string, 
  startSlot: number, 
  durationHours: number,
  totalAmount: number, 
  depositAmount: number,
  bookingType: 'private' | 'public',
  numPeople: number
): Promise<string> {
  const userId = await verifyAuth(idToken);

  if (startSlot < OPENING_HOUR || startSlot >= CLOSING_HOUR || durationHours <= 0) {
    throw new Error('Invalid start slot or duration');
  }

  const bookingId = crypto.randomUUID();
  const scheduleRef = adminDb.collection('day_schedules').doc(`${pitchId}_${date}`);
  const bookingRef = adminDb.collection('bookings').doc(bookingId);

  const blocks = getBlocks(startSlot, durationHours);
  const endSlot = blocks[blocks.length - 1];

  if (endSlot >= CLOSING_HOUR) {
    throw new Error('Booking exceeds closing hour');
  }

  await adminDb.runTransaction(async (transaction: Transaction) => {
    const userRef = adminDb.collection('users').doc(userId);
    const userSnap = await transaction.get(userRef);
    if (userSnap.exists && userSnap.data()?.isBlacklisted) {
      throw new Error('ERROR_BLACKLISTED');
    }

    const scheduleSnap = await transaction.get(scheduleRef);
    let bookedSlots: Record<string, { bookingId: string; status: string; lockedUntil?: number; userId?: string }> = {};

    if (scheduleSnap.exists) {
      bookedSlots = scheduleSnap.data()?.slots || {};
    }

    const now = Date.now();

    for (const key in bookedSlots) {
      const slot = bookedSlots[key];
      if (slot.status === 'locked_temporary' && slot.lockedUntil && slot.lockedUntil < now) {
        delete bookedSlots[key];
      }
    }

    for (const block of blocks) {
      if (bookedSlots[block.toString()]) {
        throw new Error('ERROR_SLOT_TAKEN');
      }
    }

    const beforeSlot = startSlot - 0.5;
    if (beforeSlot >= OPENING_HOUR && !bookedSlots[beforeSlot.toString()]) {
      const twoBeforeSlot = startSlot - 1.0;
      if (beforeSlot === OPENING_HOUR || bookedSlots[twoBeforeSlot.toString()]) {
        throw new Error('ERROR_GAP_BEFORE');
      }
    }

    const afterSlot = endSlot + 0.5;
    if (afterSlot < CLOSING_HOUR && !bookedSlots[afterSlot.toString()]) {
      const twoAfterSlot = endSlot + 1.0;
      if (afterSlot === CLOSING_HOUR - 0.5 || bookedSlots[twoAfterSlot.toString()]) {
         throw new Error('ERROR_GAP_AFTER');
      }
    }

    const lockedUntil = now + 10 * 60 * 1000;

    for (const block of blocks) {
      bookedSlots[block.toString()] = {
        bookingId,
        status: 'locked_temporary',
        lockedUntil,
        userId
      };
    }

    transaction.set(scheduleRef, { slots: bookedSlots }, { merge: true });

    const userName = userSnap.exists ? (userSnap.data()?.name || 'Player') : 'Player';
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

export async function submitReceiptAction(idToken: string, bookingId: string, receiptUrl: string) {
  const currentUserId = await verifyAuth(idToken);
  const bookingRef = adminDb.collection('bookings').doc(bookingId);
  
  await adminDb.runTransaction(async (transaction: Transaction) => {
    const bookingSnap = await transaction.get(bookingRef);
    if (!bookingSnap.exists) {
      throw new Error('Booking not found');
    }
    const bookingData = bookingSnap.data()!;
    
    if (bookingData.userId !== currentUserId) {
      throw new Error('Unauthorized to submit receipt for this booking');
    }

    const pitchId = bookingData.pitchId;
    const date = bookingData.date;
    const startSlot = bookingData.timeSlot;
    const durationHours = bookingData.duration;

    const scheduleRef = adminDb.collection('day_schedules').doc(`${pitchId}_${date}`);
    const scheduleSnap = await transaction.get(scheduleRef);
    if (!scheduleSnap.exists) {
      throw new Error('ERROR_LOCK_EXPIRED');
    }

    const slots = scheduleSnap.data()!.slots || {};
    const blocks = getBlocks(startSlot, durationHours);
    
    for (const block of blocks) {
      const slot = slots[block.toString()];
      if (!slot || slot.bookingId !== bookingId) {
        throw new Error('ERROR_LOCK_EXPIRED');
      }
    }

    transaction.update(bookingRef, {
      receiptUrl,
      status: 'pending_review'
    });

    for (const block of blocks) {
      const slotStr = block.toString();
      slots[slotStr].status = 'pending_review';
      if ('lockedUntil' in slots[slotStr]) {
        delete slots[slotStr].lockedUntil;
      }
    }
    transaction.update(scheduleRef, { slots });
  });
}

async function verifyAdminAuth(idToken: string) {
  const uid = await verifyAuth(idToken);
  const userSnap = await adminDb.collection('users').doc(uid).get();
  if (!userSnap.exists) throw new Error('User not found');
  const role = userSnap.data()?.role;
  if (role !== 'admin' && role !== 'owner') {
    throw new Error('Unauthorized: Admin only');
  }
}

export async function confirmBookingAction(idToken: string, bookingId: string) {
  await verifyAdminAuth(idToken);
  const bookingRef = adminDb.collection('bookings').doc(bookingId);
  
  await adminDb.runTransaction(async (transaction: Transaction) => {
    const bookingSnap = await transaction.get(bookingRef);
    if (!bookingSnap.exists) {
      throw new Error('Booking not found');
    }
    const booking = bookingSnap.data()!;
    
    transaction.update(bookingRef, { status: 'confirmed' });
    
    const scheduleRef = adminDb.collection('day_schedules').doc(`${booking.pitchId}_${booking.date}`);
    const scheduleSnap = await transaction.get(scheduleRef);
    if (scheduleSnap.exists) {
      const slots = scheduleSnap.data()!.slots || {};
      const blocks = getBlocks(booking.timeSlot, booking.duration);
      
      for (const block of blocks) {
        const slotStr = block.toString();
        if (slots[slotStr]) {
          slots[slotStr].status = 'confirmed';
          if ('lockedUntil' in slots[slotStr]) {
            delete slots[slotStr].lockedUntil;
          }
        }
      }
      transaction.update(scheduleRef, { slots });
    }
    
    const statsRef = adminDb.collection('stats').doc('global');
    // Using admin.firestore.FieldValue.increment instead of client increment
    const { FieldValue } = await import('firebase-admin/firestore');
    transaction.set(statsRef, { bookings: FieldValue.increment(1) }, { merge: true });
  });
}

export async function rejectBookingAction(idToken: string, bookingId: string) {
  await verifyAdminAuth(idToken);
  const bookingRef = adminDb.collection('bookings').doc(bookingId);
  
  await adminDb.runTransaction(async (transaction: Transaction) => {
    const bookingSnap = await transaction.get(bookingRef);
    if (!bookingSnap.exists) {
      throw new Error('Booking not found');
    }
    const booking = bookingSnap.data()!;
    
    transaction.update(bookingRef, { status: 'rejected' });
    
    const scheduleRef = adminDb.collection('day_schedules').doc(`${booking.pitchId}_${booking.date}`);
    const scheduleSnap = await transaction.get(scheduleRef);
    if (scheduleSnap.exists) {
      const slots = scheduleSnap.data()!.slots || {};
      const blocks = getBlocks(booking.timeSlot, booking.duration);
      freeSlots(slots, bookingId, blocks);
      transaction.update(scheduleRef, { slots });
    }
  });
}

export async function cancelBookingAction(idToken: string, bookingId: string) {
  const userId = await verifyAuth(idToken);
  const bookingRef = adminDb.collection('bookings').doc(bookingId);
  
  await adminDb.runTransaction(async (transaction: Transaction) => {
    const bookingSnap = await transaction.get(bookingRef);
    if (!bookingSnap.exists) {
      throw new Error('Booking not found');
    }
    const booking = bookingSnap.data()!;
    
    if (booking.userId !== userId) {
      throw new Error('ERROR_CANCEL_NOT_ALLOWED');
    }
    
    if (booking.status !== 'locked_temporary' && booking.status !== 'pending_review') {
      throw new Error('ERROR_CANCEL_NOT_ALLOWED');
    }
    
    transaction.update(bookingRef, { status: 'rejected' });
    
    const scheduleRef = adminDb.collection('day_schedules').doc(`${booking.pitchId}_${booking.date}`);
    const scheduleSnap = await transaction.get(scheduleRef);
    if (scheduleSnap.exists) {
      const slots = scheduleSnap.data()!.slots || {};
      const blocks = getBlocks(booking.timeSlot, booking.duration);
      freeSlots(slots, bookingId, blocks);
      transaction.update(scheduleRef, { slots });
    }
  });
}

export async function cleanupExpiredBookingsAction(pitchId: string) {
  // Doesn't need auth verification as it's just a cleanup job, but you could add it if desired.
  const now = Date.now();
  const bookingsRef = adminDb.collection('bookings');
  
  try {
    const expiredBookings = await bookingsRef
      .where('pitchId', '==', pitchId)
      .where('status', '==', 'locked_temporary')
      .where('lockedUntil', '<', now)
      .get();

    if (expiredBookings.empty) return;

    const batch = adminDb.batch();
    const scheduleUpdates: Record<string, { ref: DocumentReference; slots: Record<string, { bookingId: string; status: string }> }> = {};

    for (const bookingDoc of expiredBookings.docs) {
      const booking = bookingDoc.data();
      const bookingId = bookingDoc.id;
      batch.delete(bookingDoc.ref);

      const scheduleId = `${pitchId}_${booking.date}`;
      if (!scheduleUpdates[scheduleId]) {
        const scheduleRef = adminDb.collection('day_schedules').doc(scheduleId);
        const scheduleSnap = await scheduleRef.get();
        if (scheduleSnap.exists) {
          scheduleUpdates[scheduleId] = {
            ref: scheduleRef,
            slots: scheduleSnap.data()!.slots || {}
          };
        }
      }

      if (scheduleUpdates[scheduleId]) {
        const slots = scheduleUpdates[scheduleId].slots;
        const blocks = getBlocks(booking.timeSlot, booking.duration);
        freeSlots(slots, bookingId, blocks);
      }
    }

    for (const scheduleId in scheduleUpdates) {
      const { ref, slots } = scheduleUpdates[scheduleId];
      batch.update(ref, { slots });
    }

    await batch.commit();
  } catch (error) {
    console.error('Error during cleanupExpiredBookingsAction:', error);
  }
}
