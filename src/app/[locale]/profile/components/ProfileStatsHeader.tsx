'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy, Star, Shield, Award, Zap, Crown, ShieldCheck } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { User as AppUser } from '@/types';
import { isUserVip } from '@/lib/vip';

interface ProfileStatsHeaderProps {
  appUser: AppUser;
  totalBookings: number;
  confirmedMatches: number;
  preferredPitchName: string;
}

export function ProfileStatsHeader({
  appUser,
  totalBookings,
  confirmedMatches,
  preferredPitchName,
}: ProfileStatsHeaderProps) {
  const t = useTranslations('Profile');
  const tAchieve = useTranslations('Achievements');

  const getLoyaltyBadge = (count: number) => {
    if (count === 0) return t('loyaltyRookie');
    if (count <= 3) return t('loyaltyAmateur');
    if (count <= 8) return t('loyaltySemiPro');
    if (count <= 15) return t('loyaltyPro');
    return t('loyaltyVeteran');
  };

  const loyaltyBadge = getLoyaltyBadge(confirmedMatches);

  return (
    <div className="space-y-8">
      {/* Title & Tier Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-4xl font-black text-foreground tracking-tight">
              {appUser.name}
            </h1>
            {isUserVip(appUser) && (
              <span
                className={`px-3 py-1 rounded-full border text-xs font-black inline-flex items-center gap-1.5 ${
                  appUser.vipTier === 'Pro Pass'
                    ? 'bg-blue-500/20 border-blue-500/40 text-blue-400 glow-primary-sm'
                    : 'bg-amber-500/20 border-amber-500/40 text-amber-400 glow-amber'
                }`}
              >
                {appUser.vipTier === 'Pro Pass' ? (
                  <ShieldCheck className="w-4 h-4 text-blue-400" />
                ) : (
                  <Crown className="w-4 h-4 text-amber-400 animate-pulse" />
                )}
                {appUser.vipTier === 'Pro Pass' ? 'Pro Pass' : 'Pitch Pass VIP'}
              </span>
            )}
          </div>
          {appUser.username && (
            <p className="text-amber-400 font-mono font-bold text-sm">@{appUser.username}</p>
          )}
          <p className="text-muted-foreground text-sm font-medium">{t('description')}</p>
        </div>

        {appUser.username && (
          <Button
            onClick={() => {
              const url = `${window.location.origin}/profile/@${appUser.username}`;
              navigator.clipboard.writeText(url);
              toast.success('Public profile link copied to clipboard!');
            }}
            variant="outline"
            className="rounded-2xl border-white/10 hover:bg-white/10 font-bold text-xs shrink-0 cursor-pointer"
          >
            📋 Copy Profile Link (@{appUser.username})
          </Button>
        )}
      </div>

      {/* Stats Grid */}
      <motion.div
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
      >
        {[
          { label: t('totalBookings'), value: totalBookings, color: 'text-foreground' },
          { label: t('matchesPlayed'), value: confirmedMatches, color: 'text-primary' },
          {
            label: t('preferredPitch'),
            value: `⚽ ${preferredPitchName}`,
            color: 'text-foreground',
            small: true,
          },
          { label: t('loyaltyLevel'), value: loyaltyBadge, color: 'text-primary', badge: true },
        ].map((stat, i) => (
          <motion.div
            key={i}
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          >
            <Card className="stadium-glass border-white/10 card-lift rounded-3xl transition-all duration-300 shadow-md h-full">
              <CardContent className="p-5 flex flex-col justify-between h-full min-h-[100px]">
                <span className="text-xs font-extrabold text-muted-foreground uppercase tracking-wider">
                  {stat.label}
                </span>
                <div className="mt-2">
                  {stat.badge ? (
                    <span className="inline-block px-3.5 py-1 rounded-full text-xs font-black bg-primary/20 text-primary border border-primary/40">
                      {stat.value}
                    </span>
                  ) : stat.small ? (
                    <span
                      className="text-sm font-black text-foreground truncate block"
                      title={String(stat.value)}
                    >
                      {stat.value}
                    </span>
                  ) : (
                    <div className="flex items-baseline gap-2">
                      <span className={`text-4xl font-black font-mono ${stat.color}`}>
                        {stat.value}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Badges Section */}
      <Card className="stadium-glass border-white/10 p-6 space-y-4 rounded-3xl shadow-xl">
        <h3 className="text-base font-extrabold text-foreground flex items-center gap-2">
          <Award className="w-5 h-5 text-emerald-400" />
          <span>{tAchieve('title')}</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div
            className={`p-4 rounded-2xl border text-center space-y-1.5 ${
              confirmedMatches >= 1
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-muted/30 border-border text-muted-foreground opacity-40'
            }`}
          >
            <Trophy className="w-6 h-6 mx-auto" />
            <span className="text-xs font-black block">{tAchieve('firstMatch')}</span>
          </div>

          <div
            className={`p-4 rounded-2xl border text-center space-y-1.5 ${
              confirmedMatches >= 3
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-muted/30 border-border text-muted-foreground opacity-40'
            }`}
          >
            <Zap className="w-6 h-6 mx-auto" />
            <span className="text-xs font-black block">{tAchieve('hatTrick')}</span>
          </div>

          <div
            className={`p-4 rounded-2xl border text-center space-y-1.5 ${
              confirmedMatches >= 5
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                : 'bg-muted/30 border-border text-muted-foreground opacity-40'
            }`}
          >
            <Star className="w-6 h-6 mx-auto" />
            <span className="text-xs font-black block">{tAchieve('starPlayer')}</span>
          </div>

          <div
            className={`p-4 rounded-2xl border text-center space-y-1.5 ${
              confirmedMatches >= 10
                ? 'bg-purple-500/10 border-purple-500/30 text-purple-400'
                : 'bg-muted/30 border-border text-muted-foreground opacity-40'
            }`}
          >
            <Shield className="w-6 h-6 mx-auto" />
            <span className="text-xs font-black block">{tAchieve('legend')}</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
