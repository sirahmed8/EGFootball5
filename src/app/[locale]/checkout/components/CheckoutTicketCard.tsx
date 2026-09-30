'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Booking, Pitch } from '@/types';
import { useTranslations } from 'next-intl';
import { MapPin, Calendar, Clock, CreditCard, Users, QrCode } from 'lucide-react';

interface CheckoutTicketCardProps {
  booking: Booking;
  pitch: Pitch | null;
  bookingType: string;
  numPeople: number;
  formatTimeSlot: (slot: number) => string;
  onOpenQrModal: () => void;
}

export function CheckoutTicketCard({
  booking,
  pitch,
  bookingType,
  numPeople,
  formatTimeSlot,
  onOpenQrModal,
}: CheckoutTicketCardProps) {
  const t = useTranslations('Checkout');
  const tBook = useTranslations('Book');

  return (
    <Card className="stadium-glass border-white/10 shadow-2xl overflow-hidden rounded-3xl">
      <CardHeader className="bg-primary/10 border-b border-white/10 p-5">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-black flex items-center gap-2 text-foreground">
            <span>🏟️</span> {pitch?.name || tBook('title')}
          </CardTitle>
          <button
            onClick={onOpenQrModal}
            className="px-3.5 py-1.5 rounded-full text-[11px] font-mono font-black bg-primary text-black flex items-center gap-1.5 hover:scale-105 transition-transform cursor-pointer shadow-lg glow-primary-sm"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>QR PASS</span>
          </button>
        </div>
        {pitch?.locationName && (
          <CardDescription className="flex items-center gap-1.5 text-muted-foreground text-xs mt-1 font-medium">
            <MapPin className="w-3.5 h-3.5 text-primary" /> {pitch.locationName}
          </CardDescription>
        )}
      </CardHeader>

      <CardContent className="p-6 space-y-6 text-sm">
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
            <div className="flex items-center gap-2 text-muted-foreground text-xs font-semibold">
              <Calendar className="w-4 h-4 text-primary" />
              <span>{t('dateLabel')}</span>
            </div>
            <strong className="text-foreground font-mono">{booking.date}</strong>
          </div>

          <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
            <div className="flex items-center gap-2 text-muted-foreground text-xs font-semibold">
              <Clock className="w-4 h-4 text-primary" />
              <span>{t('timeSlotLabel')}</span>
            </div>
            <strong className="text-foreground font-bold">
              {formatTimeSlot(booking.timeSlot)} ({booking.duration} hr)
            </strong>
          </div>

          <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
            <div className="flex items-center gap-2 text-muted-foreground text-xs font-semibold">
              <Users className="w-4 h-4 text-primary" />
              <span>{t('matchTypeLabel')}</span>
            </div>
            <strong className="text-foreground capitalize font-bold">
              {bookingType} ({numPeople} {t('players')})
            </strong>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-muted-foreground text-xs font-semibold">
              <CreditCard className="w-4 h-4 text-primary" />
              <span>{t('costPerPlayerLabel')}</span>
            </div>
            <strong className="text-primary font-black font-mono text-base">
              {(booking.totalAmount / numPeople).toFixed(2)} EGP
            </strong>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
          <div className="flex justify-between items-center text-muted-foreground text-xs">
            <span>{t('totalPitchPriceLabel')}</span>
            <span className="font-bold text-foreground font-mono">{booking.totalAmount} EGP</span>
          </div>
          <div className="flex justify-between items-center text-foreground font-bold text-base pt-2 border-t border-white/10">
            <span>{t('requiredDepositLabel')}</span>
            <span className="text-primary font-black font-mono text-xl">{booking.depositAmount} EGP</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
