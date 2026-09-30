'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Gift, DollarSign, Crown } from 'lucide-react';
import { User as AppUser } from '@/types';

interface VipGiftsTabProps {
  isArabic: boolean;
  giftedVipUsers: AppUser[];
  giftedCostPerMonth: number;
  ownerAdminVip: AppUser[];
  fmt: (n: number) => string;
}

export function VipGiftsTab({
  isArabic,
  giftedVipUsers,
  giftedCostPerMonth,
  ownerAdminVip,
  fmt,
}: VipGiftsTabProps) {
  return (
    <div className="space-y-6">
      {/* Gift Cost Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <Card className="stadium-glass border-amber-500/30 rounded-3xl p-6 bg-black space-y-2">
          <div className="flex justify-between items-center text-muted-foreground text-xs font-extrabold uppercase">
            <span>{isArabic ? 'عدد هدايا VIP' : 'Gifted VIP Count'}</span>
            <Gift className="w-5 h-5 text-amber-400" />
          </div>
          <p className="text-3xl font-black text-amber-400 font-mono">{giftedVipUsers.length}</p>
          <p className="text-[10px] text-muted-foreground">
            {isArabic ? 'أشخاص تم منحهم VIP مجاناً' : 'Users given free VIP by owner'}
          </p>
        </Card>
        <Card className="stadium-glass border-rose-500/30 rounded-3xl p-6 bg-black space-y-2">
          <div className="flex justify-between items-center text-muted-foreground text-xs font-extrabold uppercase">
            <span>{isArabic ? 'تكلفة الفرصة الضائعة / شهر' : 'Opportunity Cost / Month'}</span>
            <DollarSign className="w-5 h-5 text-rose-400" />
          </div>
          <p className="text-3xl font-black text-rose-400 font-mono">EGP {fmt(giftedCostPerMonth)}</p>
          <p className="text-[10px] text-muted-foreground">
            {isArabic ? 'إيراد لو دفعوا بدل مجاناً' : 'Revenue foregone vs. paid plan'}
          </p>
        </Card>
        <Card className="stadium-glass border-violet-500/30 rounded-3xl p-6 bg-black space-y-2">
          <div className="flex justify-between items-center text-muted-foreground text-xs font-extrabold uppercase">
            <span>{isArabic ? 'Owner & Admin (تلقائي VIP)' : 'Owner & Admin Auto-VIP'}</span>
            <Crown className="w-5 h-5 text-violet-400" />
          </div>
          <p className="text-3xl font-black text-violet-400 font-mono">{ownerAdminVip.length}</p>
          <p className="text-[10px] text-muted-foreground">
            {isArabic ? 'مجاني دائماً حسب الصلاحية' : 'Free permanently by role'}
          </p>
        </Card>
      </div>

      {/* Gifted VIP User List */}
      <Card className="stadium-glass border-white/10 rounded-3xl p-6 bg-black space-y-4">
        <div className="flex items-center gap-2 border-b border-white/10 pb-3">
          <Gift className="w-5 h-5 text-amber-400" />
          <h3 className="font-black text-foreground">
            {isArabic ? 'قائمة من مُنحوا VIP مجاناً من المالك' : 'Users Given Free VIP by Owner'}
          </h3>
        </div>
        {giftedVipUsers.length === 0 ? (
          <p className="text-center text-xs text-muted-foreground py-8">
            {isArabic
              ? 'لم تمنح VIP مجاناً لأي شخص حتى الآن'
              : 'No gifted VIP members yet. Use Manage Players to grant free VIP to friends.'}
          </p>
        ) : (
          <div className="space-y-2">
            {giftedVipUsers.map((u) => {
              const expiry = u.vipExpiry ? new Date(u.vipExpiry) : null;
              const daysLeft = expiry ? Math.ceil((expiry.getTime() - Date.now()) / 86400000) : null;
              return (
                <div
                  key={u.uid}
                  className="flex items-center justify-between p-3 rounded-xl bg-amber-500/5 border border-amber-500/20 text-xs"
                >
                  <div>
                    <p className="font-black text-foreground flex items-center gap-1.5">
                      <Crown className="w-3 h-3 text-amber-400" /> {u.name}
                    </p>
                    <p className="text-muted-foreground font-mono">{u.email || u.phone || '—'}</p>
                  </div>
                  <div className="text-end">
                    <p className="text-amber-400 font-black">{isArabic ? 'مجاناً (هدية)' : 'Free Gift 👑'}</p>
                    <p className="text-muted-foreground">
                      {daysLeft !== null
                        ? daysLeft > 0
                          ? `${daysLeft} ${isArabic ? 'يوم متبقي' : 'days left'}`
                          : isArabic
                            ? 'منتهية'
                            : 'Expired'
                        : '—'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
