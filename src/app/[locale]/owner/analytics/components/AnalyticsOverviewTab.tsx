'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { BarChart3, Activity, Award, CheckCircle, Clock, AlertCircle } from 'lucide-react';

interface DayData {
  label: string;
  count: number;
}

interface AnalyticsOverviewTabProps {
  isArabic: boolean;
  last7: DayData[];
  maxDay: number;
  confirmedCount: number;
  pendingCount: number;
  cancelledCount: number;
  totalBookings: number;
  tiers: Record<string, number>;
  totalUsers: number;
  topSlots: { slot: number; count: number }[];
  fmtSlot: (s: number) => string;
}

export function AnalyticsOverviewTab({
  isArabic,
  last7,
  maxDay,
  confirmedCount,
  pendingCount,
  cancelledCount,
  totalBookings,
  tiers,
  totalUsers,
  topSlots,
  fmtSlot,
}: AnalyticsOverviewTabProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Booking Trend — Last 7 Days */}
      <Card className="stadium-glass border-white/10 rounded-3xl p-6 bg-black space-y-4">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-primary" />
          <h3 className="font-black text-foreground">
            {isArabic ? 'الحجوزات المؤكدة — آخر 7 أيام' : 'Confirmed Bookings — Last 7 Days'}
          </h3>
        </div>
        <div className="flex items-end gap-2 h-28">
          {last7.map((d, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-[9px] font-mono text-primary font-bold">{d.count}</span>
              <div
                className="w-full rounded-t-lg bg-primary/80 transition-all"
                style={{ height: `${(d.count / maxDay) * 80}px`, minHeight: d.count ? 6 : 2 }}
              />
              <span className="text-[9px] text-muted-foreground font-bold">{d.label}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Booking Status Breakdown */}
      <Card className="stadium-glass border-white/10 rounded-3xl p-6 bg-black space-y-4">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-emerald-400" />
          <h3 className="font-black text-foreground">
            {isArabic ? 'حالة جميع الحجوزات' : 'Booking Status Breakdown'}
          </h3>
        </div>
        <div className="space-y-3">
          {[
            {
              label: isArabic ? 'مؤكدة' : 'Confirmed',
              count: confirmedCount,
              color: 'bg-emerald-500',
              icon: <CheckCircle className="w-4 h-4 text-emerald-400" />,
            },
            {
              label: isArabic ? 'معلقة / في انتظار الدفع' : 'Pending Payment',
              count: pendingCount,
              color: 'bg-amber-500',
              icon: <Clock className="w-4 h-4 text-amber-400" />,
            },
            {
              label: isArabic ? 'ملغية' : 'Cancelled',
              count: cancelledCount,
              color: 'bg-rose-500',
              icon: <AlertCircle className="w-4 h-4 text-rose-400" />,
            },
          ].map((s, i) => (
            <div key={i} className="space-y-1">
              <div className="flex justify-between text-xs font-bold">
                <span className="flex items-center gap-1.5">
                  {s.icon} {s.label}
                </span>
                <span className="font-mono text-foreground">
                  {s.count} ({totalBookings ? Math.round((s.count / totalBookings) * 100) : 0}%)
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-white/10">
                <div
                  className={`h-full rounded-full ${s.color}`}
                  style={{ width: `${totalBookings ? (s.count / totalBookings) * 100 : 0}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Player Skill Tiers */}
      <Card className="stadium-glass border-white/10 rounded-3xl p-6 bg-black space-y-4">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-primary" />
          <h3 className="font-black text-foreground">
            {isArabic ? 'توزيع مستويات اللاعبين' : 'Player Skill Tier Distribution'}
          </h3>
        </div>
        <div className="space-y-3">
          {Object.entries(tiers).map(([tier, count]) => {
            const pct = totalUsers > 0 ? Math.round((count / totalUsers) * 100) : 0;
            return (
              <div key={tier} className="space-y-1">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-foreground">{tier}</span>
                  <span className="font-mono text-primary">
                    {count} ({pct}%)
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-white/10">
                  <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Peak Booking Hours */}
      <Card className="stadium-glass border-white/10 rounded-3xl p-6 bg-black space-y-4">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-amber-400" />
          <h3 className="font-black text-foreground">
            {isArabic ? 'أوقات الذروة للحجوزات' : 'Peak Booking Time Slots'}
          </h3>
        </div>
        <div className="space-y-2.5">
          {topSlots.slice(0, 6).map(({ slot, count }) => (
            <div
              key={slot}
              className="flex justify-between items-center p-3 rounded-2xl bg-white/5 border border-white/10 text-xs"
            >
              <span className="font-bold font-mono text-foreground">{fmtSlot(slot)}</span>
              <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-400 font-black border border-amber-500/30 font-mono">
                {count} {isArabic ? 'حجز' : 'bookings'}
              </span>
            </div>
          ))}
          {topSlots.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-4">
              {isArabic ? 'لا توجد بيانات' : 'No data yet'}
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}
