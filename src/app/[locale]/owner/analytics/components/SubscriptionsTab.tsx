'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { MapPin, CreditCard } from 'lucide-react';
import { Pitch, Booking, User as AppUser } from '@/types';

interface SubscriptionsTabProps {
  isArabic: boolean;
  paidMRR: number;
  grossRevenue: number;
  totalVipDiscounts: number;
  netProfit: number;
  paidVipUsers: AppUser[];
  confirmed: Booking[];
  pendingReimbursements: number;
  settledReimbursements: number;
  pitches: Pitch[];
  fmt: (n: number) => string;
}

export function SubscriptionsTab({
  isArabic,
  paidMRR,
  grossRevenue,
  totalVipDiscounts,
  netProfit,
  paidVipUsers,
  confirmed,
  pendingReimbursements,
  settledReimbursements,
  pitches,
  fmt,
}: SubscriptionsTabProps) {
  return (
    <div className="space-y-6">
      {/* Revenue Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: isArabic ? 'اشتراكات مدفوعة (MRR)' : 'Paid VIP Subscriptions (MRR)',
            value: `EGP ${fmt(paidMRR)}`,
            sub: `${paidVipUsers.length} ${isArabic ? 'مشترك' : 'subscribers'}`,
            color: 'text-emerald-400',
            border: 'border-emerald-500/30',
          },
          {
            label: isArabic ? 'إجمالي إيرادات الحجوزات' : 'Total Booking Revenue',
            value: `EGP ${fmt(grossRevenue)}`,
            sub: `${confirmed.length} ${isArabic ? 'مباراة مؤكدة' : 'confirmed games'}`,
            color: 'text-primary',
            border: 'border-primary/30',
          },
          {
            label: isArabic ? 'خصومات VIP المدفوعة للملاعب' : 'VIP Discounts Paid to Pitches',
            value: `EGP ${fmt(totalVipDiscounts)}`,
            sub: isArabic ? 'يُدفع من المنصة' : 'Platform subsidy cost',
            color: 'text-rose-400',
            border: 'border-rose-500/30',
          },
          {
            label: isArabic ? 'صافي أرباح المنصة' : 'Net Platform Profit',
            value: `EGP ${fmt(netProfit)}`,
            sub: isArabic ? 'بعد سداد خصومات الملاعب' : 'After reimbursements',
            color: 'text-amber-400',
            border: 'border-amber-500/30',
          },
        ].map((k, i) => (
          <Card key={i} className={`stadium-glass ${k.border} rounded-2xl p-5 bg-black space-y-2`}>
            <p className="text-[10px] font-extrabold uppercase text-muted-foreground">{k.label}</p>
            <p className={`text-2xl font-black font-mono ${k.color}`}>{k.value}</p>
            <p className="text-[10px] text-muted-foreground font-medium">{k.sub}</p>
          </Card>
        ))}
      </div>

      {/* Pitch Reimbursement Ledger */}
      <Card className="stadium-glass border-white/10 rounded-3xl p-6 bg-black space-y-5">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-emerald-400" />
            <h3 className="font-black text-foreground">
              {isArabic ? 'مستحقات الملاعب من خصومات VIP' : 'Pitch VIP Discount Reimbursement Ledger'}
            </h3>
          </div>
          <div className="flex gap-3 text-xs font-bold">
            <span className="text-amber-400">
              {isArabic ? 'معلق:' : 'Pending:'} EGP {fmt(pendingReimbursements)}
            </span>
            <span className="text-emerald-400">
              {isArabic ? 'تم تسوية:' : 'Settled:'} EGP {fmt(settledReimbursements)}
            </span>
          </div>
        </div>
        <div className="space-y-3">
          {pitches.map((p) => {
            const pB = confirmed.filter((b) => b.pitchId === p.id);
            const pRev = pB.reduce((s, b) => s + (b.totalAmount || 0), 0);
            const pDisc = pB.reduce((s, b) => s + (b.discountAmount || 0), 0);
            const pPend = pB
              .filter((b) => b.reimbursementStatus === 'pending')
              .reduce((s, b) => s + (b.discountAmount || 0), 0);
            return (
              <div
                key={p.id}
                className="p-4 rounded-2xl bg-white/5 border border-white/10 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs"
              >
                <div>
                  <p className="text-muted-foreground font-bold mb-1">{isArabic ? 'الملعب' : 'Pitch'}</p>
                  <p className="font-black text-foreground">{p.name}</p>
                </div>
                <div>
                  <p className="text-muted-foreground font-bold mb-1">{isArabic ? 'إجمالي الإيرادات' : 'Revenue'}</p>
                  <p className="font-mono font-black text-primary">EGP {fmt(pRev)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground font-bold mb-1">{isArabic ? 'خصومات VIP' : 'VIP Discounts'}</p>
                  <p className="font-mono font-black text-amber-400">EGP {fmt(pDisc)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground font-bold mb-1">{isArabic ? 'معلق للتسوية' : 'Pending Payout'}</p>
                  <p className="font-mono font-black text-rose-400">EGP {fmt(pPend)}</p>
                </div>
              </div>
            );
          })}
          {pitches.length === 0 && (
            <p className="text-center text-xs text-muted-foreground py-4">
              {isArabic ? 'لا توجد ملاعب مسجلة' : 'No pitches registered'}
            </p>
          )}
        </div>
      </Card>

      {/* Paid Subscriber List */}
      <Card className="stadium-glass border-white/10 rounded-3xl p-6 bg-black space-y-4">
        <div className="flex items-center gap-2 border-b border-white/10 pb-3">
          <CreditCard className="w-5 h-5 text-primary" />
          <h3 className="font-black text-foreground">
            {isArabic ? 'قائمة المشتركين المدفوعين' : 'Paid VIP Subscriber List'}
          </h3>
          <span className="ms-auto px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-black">
            {paidVipUsers.length}
          </span>
        </div>
        {paidVipUsers.length === 0 ? (
          <p className="text-center text-xs text-muted-foreground py-6">
            {isArabic ? 'لا يوجد مشتركون مدفوعون حتى الآن' : 'No paid subscribers yet'}
          </p>
        ) : (
          <div className="space-y-2">
            {paidVipUsers.map((u) => (
              <div
                key={u.uid}
                className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 text-xs"
              >
                <div>
                  <p className="font-black text-foreground">{u.name}</p>
                  <p className="text-muted-foreground font-mono">{u.email || u.phone || '—'}</p>
                </div>
                <div className="text-end">
                  <p className="font-black text-emerald-400">EGP 399 / mo</p>
                  {u.vipExpiry && (
                    <p className="text-muted-foreground">
                      {isArabic ? 'تنتهي:' : 'Expires:'} {new Date(u.vipExpiry).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
