import { User as AppUser } from '@/types';

/**
 * Checks if a user has active VIP access.
 * Owner and Admin roles AUTOMATICALLY have full VIP access.
 * Regular users must have isVip: true (and not expired if vipExpiry is set).
 */
export function isUserVip(appUser: AppUser | null | undefined): boolean {
  if (!appUser) return false;
  if (appUser.role === 'owner' || appUser.role === 'admin') return true;
  if (appUser.isVip && appUser.vipExpiry != null && appUser.vipExpiry < Date.now()) return false;
  return Boolean(appUser.isVip);
}

/**
 * Calculate VIP discounted booking price based on VIP tier (10% for VIP, 5% for Pro).
 */
export function calculateVipPrice(originalPrice: number, appUser: AppUser | null | undefined): { finalPrice: number; discountAmount: number } {
  if (!isUserVip(appUser) || originalPrice <= 0) {
    return { finalPrice: originalPrice, discountAmount: 0 };
  }
  
  // Default to 10% for owner/admin/VIP, 5% for Pro Pass
  const discountRate = appUser?.vipTier === 'Pro Pass' ? 0.05 : 0.10;
  
  const discountAmount = Math.round(originalPrice * discountRate);
  const finalPrice = Math.max(0, originalPrice - discountAmount);
  return { finalPrice, discountAmount };
}

/**
 * Get VIP lock buffer duration in minutes (20 min for VIP/Owner, 15 min for regular).
 */
export function getVipLockMinutes(isVip: boolean): number {
  return isVip ? 20 : 15;
}
