'use client';

import * as React from 'react';
import { Crown, Zap } from 'lucide-react';
import { SubscriptionTier } from '@/types/subscription';

interface SubscriptionBadgeProps {
  tier: SubscriptionTier | 'none';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
  isArabic?: boolean;
}

export function SubscriptionBadge({
  tier,
  size = 'md',
  showLabel = true,
  className = '',
  isArabic = false,
}: SubscriptionBadgeProps) {
  if (tier === 'free' || tier === 'none') {
    return null;
  }

  const isVip = tier === 'vip';

  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3.5 py-1.5 gap-2',
  }[size];

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
  }[size];

  if (isVip) {
    return (
      <span
        title={isArabic ? 'لاعب VIP متميز' : 'VIP Pass Member'}
        className={`inline-flex items-center rounded-full font-black border transition-all select-none bg-amber-500/10 border-amber-500/30 text-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.15)] ${sizeClasses} ${className}`}
      >
        <Crown className={`${iconSizes} text-amber-400 shrink-0`} />
        {showLabel && <span>{isArabic ? 'VIP' : 'VIP'}</span>}
      </span>
    );
  }

  return (
    <span
      title={isArabic ? 'لاعب Pro محترف' : 'Pro Pass Member'}
      className={`inline-flex items-center rounded-full font-black border transition-all select-none bg-sky-500/10 border-sky-500/30 text-sky-400 shadow-[0_0_12px_rgba(14,165,233,0.15)] ${sizeClasses} ${className}`}
    >
      <Zap className={`${iconSizes} text-sky-400 shrink-0`} />
      {showLabel && <span>{isArabic ? 'Pro' : 'Pro'}</span>}
    </span>
  );
}
