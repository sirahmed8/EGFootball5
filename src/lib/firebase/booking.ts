import { doc, runTransaction, collection } from 'firebase/firestore';
import { db } from './config';
import { BookingStatus } from '@/types';
import {
  OPENING_HOUR,
  CLOSING_HOUR,
  getBlocks,
  freeSlots,
  cleanupExpiredBookings,
  settlePitchReimbursements,
} from './booking-helpers';
import {
  confirmBooking,
  rejectBooking,
  cancelBooking,
  completeBooking,
} from './booking-status';

export {
  OPENING_HOUR,
  CLOSING_HOUR,
  getBlocks,
  freeSlots,
  cleanupExpiredBookings,
  settlePitchReimbursements,
  confirmBooking,
  rejectBooking,
  cancelBooking,
  completeBooking,
};

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
  originalPrice: number = totalAmount,
  lockDurationMinutes: number = 15
): Promise<string> {
  const scheduleId = `${pitchId}_${date}`;
  const scheduleRef = doc(db, 'day_schedules', scheduleId);
  const bookingRef = doc(collection(db, 'bookings'));
  const bookingId = bookingRef.id;

  await runTransaction(db, async (transaction) => {
    const scheduleDoc = await transaction.get(scheduleRef);
    const slots = scheduleDoc.exists() ? scheduleDoc.data().slots || {} : {};

    // Check if slots are available
    const blocks = getBlocks(startSlot, durationHours);
    for (const block of blocks) {
      const slotStr = block.toString();
      if (slots[slotStr] && slots[slotStr].status !== BookingStatus.CANCELLED) {
        throw new Error('ERROR_SLOT_UNAVAILABLE');
      }
    }

    const now = Date.now();
    const lockedUntil = now + Math.max(5, lockDurationMinutes) * 60 * 1000;

    // Lock the slots in schedule
    for (const block of blocks) {
      slots[block.toString()] = {
        bookingId,
        status: BookingStatus.LOCKED_TEMPORARY,
        lockedUntil,
      };
    }

    if (scheduleDoc.exists()) {
      transaction.update(scheduleRef, { slots });
    } else {
      transaction.set(scheduleRef, { id: scheduleId, pitchId, date, slots });
    }

    // Fetch user for name (needed for public matches)
    const userDoc = await transaction.get(doc(db, 'users', userId));
    const userName = userDoc.exists() ? userDoc.data().name || 'Unknown Player' : 'Unknown Player';

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
      type: 'booking_created',
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

    if (bookingData.userId !== currentUserId) {
      throw new Error('Unauthorized to submit receipt for this booking');
    }

    const pitchId = bookingData.pitchId;
    const date = bookingData.date;
    const startSlot = bookingData.timeSlot;
    const durationHours = bookingData.duration;

    const scheduleRef = doc(db, 'day_schedules', `${pitchId}_${date}`);
    const scheduleSnap = await transaction.get(scheduleRef);
    if (!scheduleSnap.exists()) {
      throw new Error('ERROR_LOCK_EXPIRED');
    }

    const slots = scheduleSnap.data().slots || {};
    const blocks = getBlocks(startSlot, durationHours);

    for (const block of blocks) {
      const slot = slots[block.toString()];
      if (!slot || slot.bookingId !== bookingId) {
        throw new Error('ERROR_LOCK_EXPIRED');
      }
    }

    transaction.update(bookingRef, {
      receiptUrl,
      status: BookingStatus.PENDING_REVIEW,
    });

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

