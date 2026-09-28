import { User as AppUser } from '@/types';
import { SubscriptionTier } from '@/types/subscription';

/**
 * Determines the active subscription tier for a user.
 * Owners and Admins always enjoy highest VIP privileges.
 */
export function getUserSubscriptionTier(user: AppUser | null | undefined): SubscriptionTier {
  if (!user) return 'free';
  if (user.role === 'owner' || user.role === 'admin') return 'vip';
  
  if (!user.isVip) return 'free';
  
  // Check expiration if set
  if (user.vipExpiry != null && user.vipExpiry < Date.now()) {
    return 'free';
  }

  const rawTier = (user.vipTier || '').toLowerCase();
  if (rawTier.includes('pro')) return 'pro';
  if (rawTier.includes('vip')) return 'vip';
  
  // Default to VIP if isVip is true without specific tier
  return 'vip';
}

/**
 * Booking fee discount percentage.
 * Free: 0%, Pro: 5%, VIP: 10%
 */
export function getBookingDiscountPercentage(user: AppUser | null | undefined): number {
  const tier = getUserSubscriptionTier(user);
  if (tier === 'vip') return 10;
  if (tier === 'pro') return 5;
  return 0;
}

/**
 * Calculates final booking price and exact discount amount in EGP.
 */
export function calculateSubscriptionDiscount(
  originalPriceEgp: number,
  user: AppUser | null | undefined
): { finalPriceEgp: number; discountAmountEgp: number; discountPercent: number } {
  if (originalPriceEgp <= 0) {
    return { finalPriceEgp: 0, discountAmountEgp: 0, discountPercent: 0 };
  }

  const discountPercent = getBookingDiscountPercentage(user);
  const discountAmountEgp = Math.round((originalPriceEgp * discountPercent) / 100);
  const finalPriceEgp = Math.max(0, originalPriceEgp - discountAmountEgp);

  return {
    finalPriceEgp,
    discountAmountEgp,
    discountPercent,
  };
}

/**
 * Deposit lock buffer duration in minutes.
 * Free: 15 min, Pro: 20 min, VIP: 25 min
 */
export function getReservationLockMinutes(user: AppUser | null | undefined): number {
  const tier = getUserSubscriptionTier(user);
  if (tier === 'vip') return 25;
  if (tier === 'pro') return 20;
  return 15;
}

/**
 * Unlimited AI Coach access without hourly cooldowns.
 * Free: 1 tip per 2 hours, Pro & VIP: Unlimited
 */
export function canAccessUnlimitedAiCoach(user: AppUser | null | undefined): boolean {
  const tier = getUserSubscriptionTier(user);
  return tier === 'pro' || tier === 'vip';
}

/**
 * Capability to create private passcode-protected match lobbies.
 * Pro & VIP captains only.
 */
export function canCreatePrivateMatchLobby(user: AppUser | null | undefined): boolean {
  const tier = getUserSubscriptionTier(user);
  return tier === 'pro' || tier === 'vip';
}

/**
 * 100% Free tournament entry voucher pass.
 * VIP tier only.
 */
export function hasFreeTournamentVoucher(user: AppUser | null | undefined): boolean {
  return getUserSubscriptionTier(user) === 'vip';
}

/**
 * Priority placement and high-intent visual badges.
 */
export function getUserBadgeType(user: AppUser | null | undefined): 'none' | 'pro' | 'vip' {
  const tier = getUserSubscriptionTier(user);
  if (tier === 'vip') return 'vip';
  if (tier === 'pro') return 'pro';
  return 'none';
}
