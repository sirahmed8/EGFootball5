import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { format } from 'date-fns';
import { useTranslations, useLocale } from 'next-intl';
import { ar, enUS } from 'date-fns/locale';

interface BookingSummaryCardProps {
  selectedRange: { start: number; end: number };
  date: Date;
  duration: number;
  totalAmount: number;
  depositAmount: number;
  bookingType: 'private' | 'public';
  numPeople: number;
  loadingLock: boolean;
  isBlacklisted: boolean;
  setBookingType: (val: 'private' | 'public') => void;
  setNumPeople: (val: number) => void;
  handleConfirmBooking: () => void;
  formatTime: (block: number) => string;
}

export function BookingSummaryCard({
  selectedRange,
  date,
  duration,
  totalAmount,
  depositAmount,
  bookingType,
  numPeople,
  loadingLock,
  isBlacklisted,
  setBookingType,
  setNumPeople,
  handleConfirmBooking,
  formatTime
}: BookingSummaryCardProps) {
  const t = useTranslations('Book');
  const locale = useLocale();

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Card className="bg-card text-card-foreground border-primary/40 shadow-[0_0_20px_rgba(57,255,20,0.15)] overflow-hidden">
        <div className="bg-primary/10 px-6 py-4 border-b border-primary/20">
          <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
            <span>⚽</span>
            {t('bookRangeSummary', {
              date: date ? format(date, 'MMM d, yyyy', { locale: locale === 'ar' ? ar : enUS }) : '',
              start: formatTime(selectedRange.start),
              end: formatTime(selectedRange.end + 0.5),
              duration
            })}
          </h3>
        </div>
        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
            <div className="p-4 rounded-xl bg-muted/20 border border-border">
              <span className="text-muted-foreground block text-xs font-semibold mb-1 uppercase tracking-wider">Duration</span>
              <span className="text-xl font-bold text-foreground">{duration} Hours</span>
            </div>
            <div className="p-4 rounded-xl bg-muted/20 border border-border">
              <span className="text-muted-foreground block text-xs font-semibold mb-1 uppercase tracking-wider">Total Price</span>
              <span className="text-xl font-bold text-foreground text-primary">{totalAmount} {t('egp')}</span>
            </div>
            <div className="p-4 rounded-xl bg-muted/20 border border-border">
              <span className="text-muted-foreground block text-xs font-semibold mb-1 uppercase tracking-wider">Required Deposit</span>
              <span className="text-xl font-bold text-foreground text-secondary">{depositAmount} {t('egp')}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-border pt-4">
            <div className="space-y-2">
              <Label>Booking Type</Label>
              <Select value={bookingType} onValueChange={(v) => setBookingType(v as 'private' | 'public')}>
                <SelectTrigger className="bg-card">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="private">Private (Only you & friends)</SelectItem>
                  <SelectItem value="public">Public (Open for anyone to join)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Number of People (Min 10)</Label>
              <Input 
                type="number" 
                min={10} 
                value={numPeople} 
                onChange={(e) => setNumPeople(Math.max(10, parseInt(e.target.value) || 10))}
                className="bg-card"
              />
            </div>
          </div>
          <div className="text-sm text-center text-muted-foreground">
            Estimated Cost per Person: <strong className="text-foreground">{(totalAmount / Math.max(10, numPeople)).toFixed(2)} EGP</strong>
          </div>

          <Button
            onClick={handleConfirmBooking}
            disabled={loadingLock || isBlacklisted}
            className="w-full py-6 text-lg font-bold bg-primary text-black hover:bg-primary/90 rounded-xl transition-all hover:scale-[1.01] active:scale-[0.99] shadow-[0_0_25px_rgba(57,255,20,0.35)] cursor-pointer"
          >
            {loadingLock ? t('locking') : t('confirmBookingBtn')}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
