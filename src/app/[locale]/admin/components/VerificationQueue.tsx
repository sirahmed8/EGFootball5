import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Booking, User as AppUser } from '@/types';
import React from 'react';
import Image from 'next/image';

interface VerificationQueueProps {
  pendingReview: Booking[];
  usersCache: Record<string, AppUser>;
  getUserLoyalty: (userId: string) => number;
  handleApprove: (booking: Booking) => Promise<void>;
  handleReject: (booking: Booking) => Promise<void>;
  setActiveReceiptUrl: (url: string | null) => void;
  t: (key: string, values?: Record<string, string | number | Date>) => string;
}



const formatTime = (block: number) => {
  const hour = Math.floor(block);
  const mins = block % 1 === 0 ? '00' : '30';
  const ampm = hour >= 12 && hour < 24 ? 'PM' : 'AM';
  const modHour = hour % 12 || 12;
  return `${modHour}:${mins} ${ampm}`;
};

const formatWhatsAppPhone = (phone: string) => {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('20')) return digits;
  if (digits.startsWith('0')) return `20${digits.slice(1)}`;
  return `20${digits}`;
};

export const VerificationQueue = React.memo(function VerificationQueue({
  pendingReview,
  usersCache,
  getUserLoyalty,
  handleApprove,
  handleReject,
  setActiveReceiptUrl,
  t,
}: VerificationQueueProps) {
  return (
    <Card className="bg-card border border-border rounded-3xl shadow-xl">
      <CardHeader>
        <CardTitle className="text-foreground font-black text-2xl">{t('pendingReceipts')}</CardTitle>
      </CardHeader>
      <CardContent>
        {pendingReview.length === 0 ? (
          <p className="text-muted-foreground font-medium py-8 text-center">{t('noPending')}</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pendingReview.map((booking) => {
              const user = usersCache[booking.userId];
              const loyalty = getUserLoyalty(booking.userId);
              const cleanPhone = user?.phone ? formatWhatsAppPhone(user.phone) : '';

              return (
                <div key={booking.id} className="border border-border rounded-3xl p-5 bg-muted/20 flex flex-col gap-4 shadow-md">
                  <div className="flex justify-between items-start">
                    <div className="text-start">
                      <p className="font-black text-foreground text-lg">{booking.date}</p>
                      <p className="text-xs text-primary font-bold">{formatTime(booking.timeSlot)} ({booking.duration} hr)</p>
                      <p className="text-xs text-muted-foreground font-extrabold mt-1">{t('amount')} {booking.totalAmount} EGP</p>
                      <p className="text-[11px] text-muted-foreground mt-1.5 capitalize font-black bg-primary/10 px-2.5 py-1 rounded-xl border border-primary/20 inline-block">
                        👥 {booking.bookingType || 'private'} ({booking.numPeople || 10} players)
                      </p>
                    </div>
                    <div className="text-end">
                      <p className="text-sm font-extrabold text-foreground">{user?.name || t('player')}</p>
                      <p className="text-xs text-muted-foreground font-mono">{user?.phone || ''}</p>
                      <p className="text-xs text-secondary font-black mt-1">{t('loyaltyGames', { count: loyalty })}</p>
                    </div>
                  </div>

                  {booking.receiptUrl ? (
                    <div
                      className="aspect-[4/3] sm:aspect-[3/4] h-40 sm:h-52 max-h-52 w-full relative rounded-2xl overflow-hidden border border-border cursor-zoom-in hover:scale-[1.01] hover:brightness-90 transition-all duration-200"
                      onClick={() => setActiveReceiptUrl(booking.receiptUrl || null)}
                    >
                      <Image src={booking.receiptUrl} alt="Receipt" fill unoptimized className="object-cover w-full h-full" />
                    </div>
                  ) : (
                    <div className="h-40 sm:h-48 bg-muted/40 flex items-center justify-center rounded-2xl text-muted-foreground font-bold">{t('noImage')}</div>
                  )}

                  <div className="grid grid-cols-2 gap-2 mt-auto pt-2">
                    <Button className="bg-primary text-black font-black hover:bg-primary/90 rounded-xl" onClick={() => handleApprove(booking)}>{t('approve')}</Button>
                    <Button variant="destructive" onClick={() => handleReject(booking)} className="font-bold rounded-xl">{t('reject')}</Button>
                  </div>

                  {cleanPhone && (
                    <a
                      href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(`مرحباً ${user?.name || ''}، بخصوص حجز ملعبك بتاريخ ${booking.date}...`)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full text-center text-xs font-black py-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition-colors flex items-center justify-center gap-1 mt-1"
                    >
                      {t('whatsAppCustomer')}
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
});

