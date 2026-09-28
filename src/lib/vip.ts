import { User as AppUser } from '@/types';
import {
  getUserSubscriptionTier,
  calculateSubscriptionDiscount,
  getReservationLockMinutes,
  canAccessUnlimitedAiCoach,
  canCreatePrivateMatchLobby,
  hasFreeTournamentVoucher,
  getUserBadgeType,
} from '@/lib/subscription/featureGating';

export {
  getUserSubscriptionTier,
  calculateSubscriptionDiscount,
  getReservationLockMinutes,
  canAccessUnlimitedAiCoach,
  canCreatePrivateMatchLobby,
  hasFreeTournamentVoucher,
  getUserBadgeType,
};

/**
 * Checks if a user has active VIP access (Pro or VIP tier, or Owner/Admin).
 */
export function isUserVip(appUser: AppUser | null | undefined): boolean {
  if (!appUser) return false;
  if (appUser.role === 'owner' || appUser.role === 'admin') return true;
  if (appUser.isVip && appUser.vipExpiry != null && appUser.vipExpiry < Date.now()) return false;
  return Boolean(appUser.isVip);
}

/**
 * Calculate VIP discounted booking price based on tier (10% for VIP, 5% for Pro).
 */
export function calculateVipPrice(
  originalPrice: number,
  appUser: AppUser | null | undefined
): { finalPrice: number; discountAmount: number } {
  const result = calculateSubscriptionDiscount(originalPrice, appUser);
  return {
    finalPrice: result.finalPriceEgp,
    discountAmount: result.discountAmountEgp,
  };
}

/**
 * Get VIP lock buffer duration in minutes (25 min for VIP/Owner, 20 min for Pro, 15 min for regular).
 */
export function getVipLockMinutes(isVip: boolean, appUser?: AppUser | null): number {
  if (appUser) {
    return getReservationLockMinutes(appUser);
  }
  return isVip ? 25 : 15;
}
