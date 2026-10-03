import { doc, runTransaction, increment, collection } from 'firebase/firestore';
import { db } from './config';
import { BookingStatus } from '@/types';
import { getBlocks, freeSlots } from './booking-helpers';

export async function confirmBooking(bookingId: string) {
  const bookingRef = doc(db, 'bookings', bookingId);

  await runTransaction(db, async (transaction) => {
    const bookingSnap = await transaction.get(bookingRef);
    if (!bookingSnap.exists()) {
      throw new Error('Booking not found');
    }
    const booking = bookingSnap.data();

    transaction.update(bookingRef, { status: BookingStatus.CONFIRMED });

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

    const statsRef = doc(db, 'stats', 'global');
    transaction.set(statsRef, { bookings: increment(1) }, { merge: true });

    const notificationRef = doc(collection(db, 'notifications'));
    transaction.set(notificationRef, {
      id: notificationRef.id,
      userId: booking.userId,
      title: 'Booking Confirmed!',
      message: `Your booking for ${booking.date} has been confirmed. Enjoy your match!`,
      read: false,
      createdAt: Date.now(),
      type: 'booking_confirmed',
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

    transaction.update(bookingRef, { status: BookingStatus.REJECTED });

    const scheduleRef = doc(db, 'day_schedules', `${booking.pitchId}_${booking.date}`);
    const scheduleSnap = await transaction.get(scheduleRef);
    if (!scheduleSnap.exists()) {
      throw new Error('Schedule not found for rejection');
    }

    const slots = scheduleSnap.data().slots || {};
    const blocks = getBlocks(booking.timeSlot, booking.duration);
    freeSlots(slots, bookingId, blocks);
    transaction.update(scheduleRef, { slots });

    const notificationRef = doc(collection(db, 'notifications'));
    transaction.set(notificationRef, {
      id: notificationRef.id,
      userId: booking.userId,
      title: 'Booking Rejected',
      message: `Your booking for ${booking.date} was rejected. Please contact support.`,
      read: false,
      createdAt: Date.now(),
      type: 'booking_rejected',
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

    if (booking.userId !== userId) {
      throw new Error('ERROR_CANCEL_NOT_ALLOWED');
    }

    if (
      booking.status !== BookingStatus.LOCKED_TEMPORARY &&
      booking.status !== BookingStatus.PENDING_REVIEW &&
      booking.status !== BookingStatus.CONFIRMED
    ) {
      throw new Error('ERROR_CANCEL_NOT_ALLOWED');
    }

    transaction.update(bookingRef, { status: BookingStatus.CANCELLED });

    const scheduleRef = doc(db, 'day_schedules', `${booking.pitchId}_${booking.date}`);
    const scheduleSnap = await transaction.get(scheduleRef);
    if (scheduleSnap.exists()) {
      const slots = scheduleSnap.data().slots || {};
      const blocks = getBlocks(booking.timeSlot, booking.duration);
      freeSlots(slots, bookingId, blocks);
      transaction.update(scheduleRef, { slots });
    }

    const notificationRef = doc(collection(db, 'notifications'));
    transaction.set(notificationRef, {
      id: notificationRef.id,
      userId: booking.userId,
      title: 'Booking Cancelled',
      message: `You have successfully cancelled your booking for ${booking.date}.`,
      read: false,
      createdAt: Date.now(),
      type: 'booking_cancelled',
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

    transaction.update(bookingRef, { status: BookingStatus.COMPLETED });

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

    const notificationRef = doc(collection(db, 'notifications'));
    transaction.set(notificationRef, {
      id: notificationRef.id,
      userId: booking.userId,
      title: 'Booking Completed',
      message: `Your match on ${booking.date} has been completed! Thanks for playing with EGFootball5.`,
      read: false,
      createdAt: Date.now(),
      type: 'booking_completed',
    });
  });
}
