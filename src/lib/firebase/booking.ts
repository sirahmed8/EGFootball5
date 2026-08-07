import { doc, runTransaction, increment, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from './config';
import { BookingStatus } from '@/types';

export const OPENING_HOUR = 0; // 12 AM (Midnight)
export const CLOSING_HOUR = 24; // 12 AM (Midnight of next day)

// Helper: generate blocks for a given start slot and duration
function getBlocks(startSlot: number, durationHours: number): number[] {
  const numBlocks = durationHours * 2;
  return Array.from({ length: numBlocks }, (_, i) => startSlot + (i * 0.5));
}

// Helper: Free up slots in the day schedule
function freeSlots(slots: Record<string, { bookingId: string; status: string }>, bookingId: string, blocks: number[]) {
  for (const block of blocks) {
    const slotStr = block.toString();
    if (slots[slotStr] && slots[slotStr].bookingId === bookingId) {
      delete slots[slotStr];
    }
  }
}

export async function lockSlot(
  userId: string, 
  pitchId: string, 
  date: string, 
  startSlot: number, 
  durationHours: number,
  totalAmount: number, 
  depositAmount: number,
  bookingType: 'private' | 'public',
  numPeople: number,
  discountAmount: number = 0,
  originalPrice: number = totalAmount
): Promise<string> {
  const scheduleId = `${pitchId}_${date}`;
  const scheduleRef = doc(db, 'day_schedules', scheduleId);
  const bookingRef = doc(collection(db, 'bookings'));
  const bookingId = bookingRef.id;

  await runTransaction(db, async (transaction) => {
    const scheduleDoc = await transaction.get(scheduleRef);
    let slots = scheduleDoc.exists() ? scheduleDoc.data().slots || {} : {};
    
    // Check if slots are available
    const blocks = getBlocks(startSlot, durationHours);
    for (const block of blocks) {
      const slotStr = block.toString();
      if (slots[slotStr] && slots[slotStr].status !== BookingStatus.CANCELLED) {
        throw new Error('ERROR_SLOT_UNAVAILABLE');
      }
    }

    const now = Date.now();
    const lockedUntil = now + 10 * 60 * 1000; // 10 minutes lock

    // Lock the slots in schedule
    for (const block of blocks) {
      slots[block.toString()] = {
        bookingId,
        status: BookingStatus.LOCKED_TEMPORARY,
        lockedUntil
      };
    }
    
    // Ensure to either update or set the schedule
    if (scheduleDoc.exists()) {
      transaction.update(scheduleRef, { slots });
    } else {
      transaction.set(scheduleRef, { id: scheduleId, pitchId, date, slots });
    }

    // Fetch user for name (needed for public matches)
    const userDoc = await transaction.get(doc(db, 'users', userId));
    const userName = userDoc.exists() ? (userDoc.data().name || 'Unknown Player') : 'Unknown Player';

    // Create Booking Document
    transaction.set(bookingRef, {
      id: bookingId,
      userId,
      pitchId,
      date,
      timeSlot: startSlot,
      duration: durationHours,
      totalAmount,
      depositAmount,
      discountAmount,
      originalPrice,
      reimbursementStatus: discountAmount > 0 ? 'pending' : 'settled',
      status: BookingStatus.LOCKED_TEMPORARY,
      lockedUntil,
      createdAt: now,
      bookingType,
      numPeople,
      joinedPlayers: bookingType === 'public' ? [{ uid: userId, name: userName }] : [],
    });

    // Create Booking Notification
    const notificationRef = doc(collection(db, 'notifications'));
    transaction.set(notificationRef, {
      id: notificationRef.id,
      userId,
      title: 'Booking Slot Reserved',
      message: `Your slot for ${date} has been temporarily reserved. Please submit your deposit within 10 minutes.`,
      read: false,
      createdAt: now,
      type: 'booking_created'
    });
  });

  return bookingId;
}

export async function submitReceipt(bookingId: string, receiptUrl: string, currentUserId: string) {
  const bookingRef = doc(db, 'bookings', bookingId);
  
  await runTransaction(db, async (transaction) => {
    const bookingSnap = await transaction.get(bookingRef);
    if (!bookingSnap.exists()) {
      throw new Error('Booking not found');
    }
    const bookingData = bookingSnap.data();
    
    // Authorization check
    if (bookingData.userId !== currentUserId) {
      throw new Error('Unauthorized to submit receipt for this booking');
    }

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
    const blocks = getBlocks(startSlot, durationHours);
    
    // Verify all blocks are still locked by this booking
    for (const block of blocks) {
      const slot = slots[block.toString()];
      if (!slot || slot.bookingId !== bookingId) {
        throw new Error('ERROR_LOCK_EXPIRED');
      }
    }

    // Update booking status
    transaction.update(bookingRef, {
      receiptUrl,
      status: BookingStatus.PENDING_REVIEW
    });

    // Update corresponding day schedule slots status
    for (const block of blocks) {
      const slotStr = block.toString();
      if (slots[slotStr]) {
        slots[slotStr].status = BookingStatus.PENDING_REVIEW;
        delete slots[slotStr].lockedUntil;
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
    transaction.update(bookingRef, { status: BookingStatus.CONFIRMED });
    
    // Update corresponding day schedule slots status
    const scheduleRef = doc(db, 'day_schedules', `${booking.pitchId}_${booking.date}`);
    const scheduleSnap = await transaction.get(scheduleRef);
    if (!scheduleSnap.exists()) {
      throw new Error('Schedule not found for confirmation');
    }
    
    const slots = scheduleSnap.data().slots || {};
    const blocks = getBlocks(booking.timeSlot, booking.duration);
    
    for (const block of blocks) {
      const slotStr = block.toString();
      if (slots[slotStr]) {
        slots[slotStr].status = BookingStatus.CONFIRMED;
        delete slots[slotStr].lockedUntil;
      }
    }
    transaction.update(scheduleRef, { slots });
    
    // Increment global stats
    const statsRef = doc(db, 'stats', 'global');
    transaction.set(statsRef, { bookings: increment(1) }, { merge: true });

    // Create Notification
    const notificationRef = doc(collection(db, 'notifications'));
    transaction.set(notificationRef, {
      id: notificationRef.id,
      userId: booking.userId,
      title: 'Booking Confirmed!',
      message: `Your booking for ${booking.date} has been confirmed. Enjoy your match!`,
      read: false,
      createdAt: Date.now(),
      type: 'booking_confirmed'
    });
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
    transaction.update(bookingRef, { status: BookingStatus.REJECTED });
    
    // Free slot in schedule
    const scheduleRef = doc(db, 'day_schedules', `${booking.pitchId}_${booking.date}`);
    const scheduleSnap = await transaction.get(scheduleRef);
    if (!scheduleSnap.exists()) {
       throw new Error('Schedule not found for rejection');
    }
    
    const slots = scheduleSnap.data().slots || {};
    const blocks = getBlocks(booking.timeSlot, booking.duration);
    freeSlots(slots, bookingId, blocks);
    transaction.update(scheduleRef, { slots });

    // Create Notification
    const notificationRef = doc(collection(db, 'notifications'));
    transaction.set(notificationRef, {
      id: notificationRef.id,
      userId: booking.userId,
      title: 'Booking Rejected',
      message: `Your booking for ${booking.date} was rejected. Please contact support.`,
      read: false,
      createdAt: Date.now(),
      type: 'booking_rejected'
    });
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
    
    // Only allow canceling if status is locked_temporary, pending_review, or confirmed
    if (
      booking.status !== BookingStatus.LOCKED_TEMPORARY && 
      booking.status !== BookingStatus.PENDING_REVIEW &&
      booking.status !== BookingStatus.CONFIRMED
    ) {
      throw new Error('ERROR_CANCEL_NOT_ALLOWED');
    }
    
    // Update booking status
    transaction.update(bookingRef, { status: BookingStatus.CANCELLED });
    
    // Free slots in schedule
    const scheduleRef = doc(db, 'day_schedules', `${booking.pitchId}_${booking.date}`);
    const scheduleSnap = await transaction.get(scheduleRef);
    if (scheduleSnap.exists()) {
      const slots = scheduleSnap.data().slots || {};
      const blocks = getBlocks(booking.timeSlot, booking.duration);
      freeSlots(slots, bookingId, blocks);
      transaction.update(scheduleRef, { slots });
    }

    // Create Notification
    const notificationRef = doc(collection(db, 'notifications'));
    transaction.set(notificationRef, {
      id: notificationRef.id,
      userId: booking.userId,
      title: 'Booking Cancelled',
      message: `You have successfully cancelled your booking for ${booking.date}.`,
      read: false,
      createdAt: Date.now(),
      type: 'booking_cancelled'
    });
  });
}

export async function completeBooking(bookingId: string) {
  const bookingRef = doc(db, 'bookings', bookingId);

  await runTransaction(db, async (transaction) => {
    const bookingSnap = await transaction.get(bookingRef);
    if (!bookingSnap.exists()) {
      throw new Error('Booking not found');
    }
    const booking = bookingSnap.data();

    if (booking.status !== BookingStatus.CONFIRMED) {
      throw new Error('Only confirmed bookings can be marked as completed');
    }

    // Update booking status
    transaction.update(bookingRef, { status: BookingStatus.COMPLETED });

    // Update schedule slots status
    const scheduleRef = doc(db, 'day_schedules', `${booking.pitchId}_${booking.date}`);
    const scheduleSnap = await transaction.get(scheduleRef);
    if (scheduleSnap.exists()) {
      const slots = scheduleSnap.data().slots || {};
      const blocks = getBlocks(booking.timeSlot, booking.duration);

      for (const block of blocks) {
        const slotStr = block.toString();
        if (slots[slotStr]) {
          slots[slotStr].status = BookingStatus.COMPLETED;
          delete slots[slotStr].lockedUntil;
        }
      }
      transaction.update(scheduleRef, { slots });
    }

    // Create Notification
    const notificationRef = doc(collection(db, 'notifications'));
    transaction.set(notificationRef, {
      id: notificationRef.id,
      userId: booking.userId,
      title: 'Booking Completed',
      message: `Your match on ${booking.date} has been completed! Thanks for playing with EGFootball5.`,
      read: false,
      createdAt: Date.now(),
      type: 'booking_completed'
    });
  });
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

    if (expiredBookings.length === 0) return;

    // Use transactions to safely clean up each expired booking
    await Promise.all(expiredBookings.map(async (bookingDoc) => {
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
    }));

    return expiredBookings.length;
  } catch (error) {
    console.error('Error during cleanup of expired bookings:', error);
    return 0;
  }
}

export async function settlePitchReimbursements(bookingIds: string[], adminUid: string) {
  const { updateDoc, doc } = await import('firebase/firestore');
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
