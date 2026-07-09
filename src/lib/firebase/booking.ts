import { auth } from './config';
import { 
  lockSlotAction, 
  submitReceiptAction, 
  confirmBookingAction, 
  rejectBookingAction, 
  cancelBookingAction 
} from '@/app/actions/booking';

export const OPENING_HOUR = 0; // 12 AM (Midnight)
export const CLOSING_HOUR = 24; // 12 AM (Midnight of next day)

async function getIdToken(): Promise<string> {
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');
  return await user.getIdToken();
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
  numPeople: number
): Promise<string> {
  const idToken = await getIdToken();
  return lockSlotAction(idToken, pitchId, date, startSlot, durationHours, totalAmount, depositAmount, bookingType, numPeople);
}

export async function submitReceipt(bookingId: string, receiptUrl: string, _currentUserId?: string) {
  const idToken = await getIdToken();
  return submitReceiptAction(idToken, bookingId, receiptUrl);
}

export async function confirmBooking(bookingId: string) {
  const idToken = await getIdToken();
  return confirmBookingAction(idToken, bookingId);
}

export async function rejectBooking(bookingId: string) {
  const idToken = await getIdToken();
  return rejectBookingAction(idToken, bookingId);
}

export async function cancelBooking(bookingId: string, _userId?: string) {
  const idToken = await getIdToken();
  return cancelBookingAction(idToken, bookingId);
}

import { cleanupExpiredBookingsAction } from '@/app/actions/booking';

export async function cleanupExpiredBookings(pitchId: string) {
  return cleanupExpiredBookingsAction(pitchId);
}
