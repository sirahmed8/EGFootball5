'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Pitch, Booking } from '@/types';

interface PitchesAnalyticsTabProps {
  isArabic: boolean;
  pitches: Pitch[];
  confirmed: Booking[];
  fmt: (n: number) => string;
}

export function PitchesAnalyticsTab({
  isArabic,
  pitches,
  confirmed,
  fmt,
}: PitchesAnalyticsTabProps) {
  return (
    <div className="space-y-4">
      {pitches.map((p) => {
        const pB = confirmed.filter((b) => b.pitchId === p.id);
        const pRev = pB.reduce((s, b) => s + (b.totalAmount || 0), 0);
        const pDisc = pB.reduce((s, b) => s + (b.discountAmount || 0), 0);
        return (
          <Card key={p.id} className="stadium-glass border-white/10 rounded-3xl p-6 bg-black space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-white/10 pb-4">
              <div>
                <h3 className="font-black text-foreground text-lg">{p.name}</h3>
                <p className="text-xs text-muted-foreground font-medium">
                  {p.locationName} • {p.pricePerHour} EGP/hr • {isArabic ? 'مدير:' : 'Mgr:'}{' '}
                  {p.managerName || p.adminEmail || '—'}
                </p>
              </div>
              <span className="px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary text-xs font-black">
                {pB.length} {isArabic ? 'حجوزات مؤكدة' : 'confirmed bookings'}
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div>
                <p className="text-muted-foreground font-bold mb-1">
                  {isArabic ? 'إيرادات الحجوزات' : 'Booking Revenue'}
                </p>
                <p className="font-mono font-black text-primary text-base">EGP {fmt(pRev)}</p>
              </div>
              <div>
                <p className="text-muted-foreground font-bold mb-1">
                  {isArabic ? 'خصومات VIP مستحقة' : 'VIP Discount Owed'}
                </p>
                <p className="font-mono font-black text-amber-400 text-base">EGP {fmt(pDisc)}</p>
              </div>
              <div>
                <p className="text-muted-foreground font-bold mb-1">
                  {isArabic ? 'متوسط الإيراد / حجز' : 'Avg Revenue / Booking'}
                </p>
                <p className="font-mono font-black text-foreground text-base">
                  EGP {pB.length ? fmt(Math.round(pRev / pB.length)) : 0}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground font-bold mb-1">
                  {isArabic ? 'هامش بعد الخصومات' : 'Net After Discounts'}
                </p>
                <p className="font-mono font-black text-emerald-400 text-base">EGP {fmt(pRev - pDisc)}</p>
              </div>
            </div>
          </Card>
        );
      })}
      {pitches.length === 0 && (
        <p className="text-center text-muted-foreground py-8">
          {isArabic ? 'لا توجد ملاعب مسجلة' : 'No pitches registered yet'}
        </p>
      )}
    </div>
  );
}
