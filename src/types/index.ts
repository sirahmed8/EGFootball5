export type Role = 'player' | 'admin';

export interface User {
  uid: string;
  name: string;
  phone: string;
  role: Role;
  isBlacklisted: boolean;
  createdAt: number;
}

export interface Pricing {
  peak: number;
  offPeak: number;
}

export interface Pitch {
  id: string;
  name: string;
  location: string;
  pricing: Pricing;
  peakHours: number[]; // Array of hours (0-23)
}

export type BookingStatus = 'locked_temporary' | 'pending_review' | 'confirmed' | 'rejected';

export interface Booking {
  id: string;
  userId: string;
  pitchId: string;
  date: string; // YYYY-MM-DD
  timeSlot: number; // hour (0-23)
  status: BookingStatus;
  receiptUrl?: string;
  totalAmount: number;
  depositAmount: number;
  lockedUntil?: number | null; // timestamp in milliseconds
  createdAt: number;
}

export interface Academy {
  id: string;
  name: string;
  coachName: string;
  recurringSchedule: { day: number; timeSlot: number }[]; // day (0-6)
  monthlyFee: number;
  nextPaymentDueDate: number;
}
