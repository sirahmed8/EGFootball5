import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { format } from 'date-fns';
import { useTranslations, useLocale } from 'next-intl';
import { ar, enUS } from 'date-fns/locale';
import { Crown, Sparkles, ShieldCheck } from 'lucide-react';
import { isUserVip, calculateVipPrice } from '@/lib/vip';
import { useAuthStore } from '@/store/useAuthStore';

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
  formatTime,
}: BookingSummaryCardProps) {
  const tBook = useTranslations('Book');
  const tSummary = useTranslations('BookingSummary');
  const locale = useLocale();
  const isArabic = locale === 'ar';
  const appUser = useAuthStore((s) => s.appUser);
  const isVip = isUserVip(appUser);

  const { finalPrice, discountAmount } = calculateVipPrice(totalAmount, isVip);
  const effectiveTotal = isVip ? finalPrice : totalAmount;
  const costPerPerson = (effectiveTotal / Math.max(10, numPeople)).toFixed(2);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Card className={`stadium-glass shadow-2xl overflow-hidden rounded-3xl ${isVip ? 'border-amber-400 glow-amber' : 'border-primary/40 glow-primary-sm'}`}>
        <div className={`px-6 py-4 border-b backdrop-blur-md flex items-center justify-between ${isVip ? 'bg-amber-500/10 border-amber-500/30' : 'bg-primary/10 border-primary/20'}`}>
          <h3 className="text-lg font-black text-foreground flex items-center gap-2">
            <span>⚽</span>
            {tBook('bookRangeSummary', {
              date: date ? format(date, 'MMM d, yyyy', { locale: isArabic ? ar : enUS }) : '',
              start: formatTime(selectedRange.start),
              end: formatTime(selectedRange.end + 0.5),
              duration,
            })}
          </h3>

          {isVip && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 text-xs font-black">
              <Crown className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              {isArabic ? 'عضوية VIP 👑' : 'VIP Pass 👑'}
            </span>
          )}
        </div>

        <CardContent className="p-6 space-y-6">
          {isVip && (
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-xs font-bold text-amber-400">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{isArabic ? `تم تطبيق خصم VIP 10% (-${discountAmount} ج.م) + مهلة قفل 20 دقيقة!` : `10% VIP Discount Applied (-${discountAmount} EGP) + 20-Min Lock Buffer!`}</span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 shadow-xs hover:scale-[1.03] transition-all duration-200 cursor-default">
              <span className="text-muted-foreground block text-xs font-bold mb-1 uppercase tracking-wider">
                {tSummary('durationLabel')}
              </span>
              <span className="text-xl font-black text-foreground">
                {duration} {tSummary('hours')}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 shadow-xs hover:scale-[1.03] transition-all duration-200 cursor-default">
              <span className="text-muted-foreground block text-xs font-bold mb-1 uppercase tracking-wider">
                {tSummary('totalPrice')}
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-black text-primary font-mono">
                  {effectiveTotal} {tBook('egp')}
                </span>
                {isVip && discountAmount > 0 && (
                  <span className="text-xs text-muted-foreground line-through font-mono">
                    {totalAmount}
                  </span>
                )}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 shadow-xs hover:scale-[1.03] transition-all duration-200 cursor-default">
              <span className="text-muted-foreground block text-xs font-bold mb-1 uppercase tracking-wider flex items-center justify-between">
                {tSummary('requiredDeposit')}
                <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
              </span>
              <span className="text-xl font-black text-secondary font-mono">
                {depositAmount} {tBook('egp')}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-white/10 pt-4">
            <div className="space-y-2">
              <Label className="font-bold">{tSummary('bookingType')}</Label>
              <Select value={bookingType} onValueChange={(v) => setBookingType(v as 'private' | 'public')}>
                <SelectTrigger className="bg-background/80 rounded-xl border-white/10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="private">{tSummary('privateOption')}</SelectItem>
                  <SelectItem value="public">{tSummary('publicOption')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="font-bold">{tSummary('numPeople')}</Label>
              <Input
                type="number"
                min={10}
                value={numPeople}
                onChange={(e) => setNumPeople(Math.max(10, parseInt(e.target.value) || 10))}
                className="bg-background/80 text-base sm:text-sm rounded-xl border-white/10"
              />
            </div>
          </div>

          <div className="text-sm text-center text-muted-foreground">
            {tSummary('costPerPerson')} <strong className="text-foreground font-mono">{costPerPerson} {tBook('egp')}</strong>
          </div>

          <Button
            onClick={handleConfirmBooking}
            disabled={loadingLock || isBlacklisted}
            className={`w-full py-6 text-lg font-black text-black rounded-2xl transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] shadow-xl cursor-pointer ${
              isVip ? 'bg-amber-400 hover:bg-amber-300 glow-amber' : 'bg-primary hover:bg-primary/90 glow-primary'
            }`}
          >
            {loadingLock ? tBook('locking') : (isVip ? (isArabic ? 'تأكيد وقفل الموعد (VIP 👑)' : 'Lock Pitch Slot (VIP 👑)') : tBook('confirmBookingBtn'))}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
