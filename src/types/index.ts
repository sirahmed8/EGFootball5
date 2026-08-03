export type Role = 'player' | 'admin' | 'owner';

export interface JoinedPlayer {
  uid: string;
  name: string;
  position?: 'GK' | 'DEF' | 'MID' | 'STR';
  phone?: string;
  joinedAt?: number;
}

export interface User {
  uid: string;
  name: string;
  email?: string;
  phone: string;
  photoURL?: string;
  role: Role;
  isBlacklisted: boolean;
  createdAt: number;
  playerLevel?: 'Rookie' | 'Amateur' | 'Semi-Pro' | 'Pro' | 'Legend';
  preferredPosition?: 'GK' | 'DEF' | 'MID' | 'STR';
  position?: 'GK' | 'DEF' | 'MID' | 'STR';
  skillLevel?: number;
  favoriteTeam?: string;
  preferredSize?: string;
  city?: string;
  onboarded?: boolean;
  goalsCount?: number;
  matchesPlayed?: number;
  mvpBadges?: number;
  // VIP Subscription
  isVip?: boolean;
  vipExpiry?: number;
  vipTier?: 'monthly' | 'quarterly' | 'yearly';
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
  capacity?: string;
  surfaceType?: string;
  amenities?: string[];
  hasFloodlights?: boolean;
  hasParking?: boolean;
  hasCafeteria?: boolean;
  rating?: number;
  reviewsCount?: number;
  city?: string;
}

export enum BookingStatus {
  LOCKED_TEMPORARY = 'locked_temporary',
  PENDING_REVIEW = 'pending_review',
  CONFIRMED = 'confirmed',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
}

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
  joinedPlayers?: (JoinedPlayer | { uid: string; name: string })[];
  promoCode?: string;
  discountAmount?: number;
  originalPrice?: number;
  reimbursementStatus?: 'pending' | 'settled';
  settledAt?: number;
  settledBy?: string;
}
