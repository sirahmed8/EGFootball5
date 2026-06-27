export type Role = 'player' | 'admin' | 'owner';

export interface User {
  uid: string;
  name: string;
  email?: string;
  phone: string;
  photoURL?: string;
  role: Role;
  isBlacklisted: boolean;
  createdAt: number;
}

export interface Pitch {
  id: string;
  name: string;
  locationName: string;
  mapLink: string;
  imagePreviewUrl: string;
  pricePerHour: number;
  recipient: string;
  managerName: string;
  adminEmail: string;
  adminPhone: string;
  createdAt: number;
}

export type BookingStatus = 'locked_temporary' | 'pending_review' | 'confirmed' | 'rejected';

export interface Booking {
  id: string;
  userId: string;
  pitchId: string;
  date: string; // YYYY-MM-DD
  timeSlot: number; // hour (0-23.5, supporting 30-min intervals)
  duration: number; // hours
  status: BookingStatus;
  receiptUrl?: string;
  totalAmount: number;
  depositAmount: number;
  lockedUntil?: number | null; // timestamp in milliseconds
  createdAt: number;
  bookingType: 'private' | 'public';
  numPeople: number;
  joinedPlayers?: string[]; // Array of UIDs who joined the public match
  joinedPlayerNames?: string[]; // Array of display names who joined
}

