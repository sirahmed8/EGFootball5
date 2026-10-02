'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import { DollarSign, CreditCard, TrendingUp, Users, CalendarCheck } from 'lucide-react';

interface AnalyticsKpiStripProps {
  isArabic: boolean;
  grossRevenue: number;
  paidMRR: number;
  netProfit: number;
  totalUsers: number;
  confirmedBookingsCount: number;
  fmt: (n: number) => string;
}

export function AnalyticsKpiStrip({
  isArabic,
  grossRevenue,
  paidMRR,
  netProfit,
  totalUsers,
  confirmedBookingsCount,
  fmt,
}: AnalyticsKpiStripProps) {
  const kpis = [
    {
      label: isArabic ? 'إجمالي الإيرادات' : 'Gross Revenue',
      value: `EGP ${fmt(grossRevenue)}`,
      icon: <DollarSign className="w-4 h-4" />,
      color: 'text-primary',
      border: 'border-primary/20',
    },
    {
      label: isArabic ? 'MRR (اشتراكات)' : 'Subscription MRR',
      value: `EGP ${fmt(paidMRR)}`,
      icon: <CreditCard className="w-4 h-4" />,
      color: 'text-amber-400',
      border: 'border-amber-500/20',
    },
    {
      label: isArabic ? 'صافي الأرباح' : 'Net Profit',
      value: `EGP ${fmt(netProfit)}`,
      icon: <TrendingUp className="w-4 h-4" />,
      color: 'text-emerald-400',
      border: 'border-emerald-500/20',
    },
    {
      label: isArabic ? 'إجمالي اللاعبين' : 'Total Players',
      value: fmt(totalUsers),
      icon: <Users className="w-4 h-4" />,
      color: 'text-blue-400',
      border: 'border-blue-500/20',
    },
    {
      label: isArabic ? 'حجوزات مؤكدة' : 'Confirmed Bookings',
      value: fmt(confirmedBookingsCount),
      icon: <CalendarCheck className="w-4 h-4" />,
      color: 'text-violet-400',
      border: 'border-violet-500/20',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
      {kpis.map((k, i) => (
        <Card key={i} className={`stadium-glass ${k.border} rounded-2xl p-4 bg-black space-y-2`}>
          <div className={`flex justify-between items-center ${k.color}`}>
            <span className="text-[10px] font-extrabold uppercase text-muted-foreground">{k.label}</span>
            {k.icon}
          </div>
          <div className={`text-xl font-black font-mono ${k.color}`}>{k.value}</div>
        </Card>
      ))}
    </div>
  );
}
