import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Booking, User as AppUser } from '@/types';

interface VerificationQueueProps {
  pendingReview: Booking[];
  usersCache: Record<string, AppUser>;
  getUserLoyalty: (userId: string) => number;
  handleApprove: (booking: Booking) => Promise<void>;
  handleReject: (booking: Booking) => Promise<void>;
  setActiveReceiptUrl: (url: string | null) => void;
  t: (key: string) => string;
}

const formatTime = (block: number) => {
  const hour = Math.floor(block);
  const mins = block % 1 === 0 ? '00' : '30';
  const ampm = hour >= 12 && hour < 24 ? 'PM' : 'AM';
  const modHour = hour % 12 || 12;
  return `${modHour}:${mins} ${ampm}`;
};

export function VerificationQueue({
  pendingReview,
  usersCache,
  getUserLoyalty,
  handleApprove,
  handleReject,
  setActiveReceiptUrl,
  t
}: VerificationQueueProps) {
  return (
    <Card className="bg-card/50 border-border backdrop-blur-xl">
      <CardHeader>
        <CardTitle className="text-card-foreground">{t('pendingReceipts')}</CardTitle>
      </CardHeader>
      <CardContent>
        {pendingReview.length === 0 ? (
          <p className="text-muted-foreground">{t('noPending')}</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pendingReview.map(booking => {
              const user = usersCache[booking.userId];
              const loyalty = getUserLoyalty(booking.userId);
              return (
              <div key={booking.id} className="border border-border rounded-xl p-4 bg-muted/30 flex flex-col gap-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-bold text-foreground text-lg">{booking.date}</p>
                    <p className="text-sm text-primary font-medium">{formatTime(booking.timeSlot)} ({booking.duration} hr)</p>
                    <p className="text-sm text-muted-foreground mt-1">{t('amount')} {booking.totalAmount} EGP</p>
                    <p className="text-xs text-muted-foreground mt-1.5 capitalize font-semibold bg-primary/10 px-2 py-0.5 rounded border border-primary/20 inline-block">👥 {booking.bookingType || 'private'} ({booking.numPeople || 10} players)</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-foreground">{user?.name || 'Unknown'}</p>
                    <p className="text-xs text-muted-foreground">{user?.phone || 'No phone'}</p>
                    <p className="text-xs text-secondary font-bold mt-1">Loyalty: {loyalty} bookings</p>
                  </div>
                </div>
                {booking.receiptUrl ? (
                  <div 
                    className="aspect-[3/4] w-full relative rounded-lg overflow-hidden border border-border cursor-zoom-in hover:scale-[1.01] hover:brightness-90 transition-all duration-200"
                    onClick={() => setActiveReceiptUrl(booking.receiptUrl || null)}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={booking.receiptUrl} alt="Receipt" className="object-cover w-full h-full" />
                  </div>
                ) : (
                  <div className="h-48 bg-muted flex items-center justify-center rounded-lg text-muted-foreground">{t('noImage')}</div>
                )}
                <div className="grid grid-cols-2 gap-2 mt-auto pt-4">
                  <Button className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold" onClick={() => handleApprove(booking)}>{t('approve')}</Button>
                  <Button variant="destructive" onClick={() => handleReject(booking)} className="font-bold">{t('reject')}</Button>
                </div>
              </div>
            )})}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
