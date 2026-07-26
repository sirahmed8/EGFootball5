import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Booking, User as AppUser } from '@/types';

interface LiveScheduleProps {
  bookings: Booking[];
  usersCache: Record<string, AppUser>;
  scheduleSearch: string;
  setScheduleSearch: (val: string) => void;
  scheduleFilter: 'all' | 'confirmed' | 'pending_review' | 'rejected';
  setScheduleFilter: (val: 'all' | 'confirmed' | 'pending_review' | 'rejected') => void;
  t: (key: string, values?: Record<string, string | number | Date>) => string;
}




const formatTime = (block: number) => {
  const hour = Math.floor(block);
  const mins = block % 1 === 0 ? '00' : '30';
  const ampm = hour >= 12 && hour < 24 ? 'PM' : 'AM';
  const modHour = hour % 12 || 12;
  return `${modHour}:${mins} ${ampm}`;
};

export function LiveSchedule({
  bookings,
  usersCache,
  scheduleSearch,
  setScheduleSearch,
  scheduleFilter,
  setScheduleFilter,
  t,
}: LiveScheduleProps) {
  const filteredBookings = [...bookings]
    .filter((booking) => {
      if (scheduleFilter !== 'all' && booking.status !== scheduleFilter) return false;
      if (scheduleSearch) {
        const user = usersCache[booking.userId];
        const name = user?.name?.toLowerCase() || '';
        const phone = user?.phone || '';
        const query = scheduleSearch.toLowerCase();
        return name.includes(query) || phone.includes(query);
      }
      return true;
    })
    .sort((a, b) => {
      if (a.date !== b.date) {
        return b.date.localeCompare(a.date);
      }
      return b.timeSlot - a.timeSlot;
    });

  return (
    <Card className="bg-card border border-border rounded-3xl shadow-xl">
      <CardHeader>
        <CardTitle className="text-xl font-black text-foreground">{t('liveSchedule')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filter controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="flex-1">
            <Input
              placeholder={t('searchPlayerPlaceholder')}
              value={scheduleSearch}
              onChange={(e) => setScheduleSearch(e.target.value)}
              className="bg-card text-foreground border-border text-base sm:text-sm rounded-xl"
            />
          </div>
          <div className="w-full sm:w-48">
            <Select value={scheduleFilter} onValueChange={(val) => setScheduleFilter(val as 'all' | 'confirmed' | 'pending_review' | 'rejected')}>
              <SelectTrigger className="bg-card text-foreground border-border rounded-xl">
                <SelectValue placeholder={t('filterByStatus')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('allStatuses')}</SelectItem>
                <SelectItem value="confirmed">{t('confirmedStatus')}</SelectItem>
                <SelectItem value="pending_review">{t('pendingReviewStatus')}</SelectItem>
                <SelectItem value="rejected">{t('rejectedStatus')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Desktop & Tablet Table (>=640px) */}
        <div className="hidden sm:block overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-muted/50">
                <TableHead className="text-muted-foreground text-start">{t('player')}</TableHead>
                <TableHead className="text-muted-foreground text-start">{t('date')}</TableHead>
                <TableHead className="text-muted-foreground text-start">{t('time')}</TableHead>
                <TableHead className="text-muted-foreground text-start">{t('typeAndSize')}</TableHead>
                <TableHead className="text-muted-foreground text-start">{t('status')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBookings.map((booking) => {
                const user = usersCache[booking.userId];
                return (
                  <TableRow key={booking.id} className="border-border hover:bg-muted/50 text-foreground">
                    <TableCell className="font-medium text-start">
                      {user?.name || t('player')}
                      <div className="text-xs text-muted-foreground">{user?.phone}</div>
                    </TableCell>
                    <TableCell className="text-start">{booking.date}</TableCell>
                    <TableCell className="text-start">{formatTime(booking.timeSlot)} ({booking.duration}h)</TableCell>
                    <TableCell className="text-start">
                      <div className="text-sm font-semibold capitalize">{booking.bookingType || 'private'}</div>
                      <div className="text-xs text-muted-foreground">{booking.numPeople || 10} players</div>
                    </TableCell>
                    <TableCell className="text-start">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        booking.status === 'confirmed' ? 'bg-primary/20 text-primary border border-primary/20' :
                        booking.status === 'pending_review' ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/20' :
                        booking.status === 'rejected' ? 'bg-destructive/20 text-destructive border border-destructive/20' :
                        'bg-muted text-muted-foreground border border-border'
                      }`}>
                        {booking.status}
                      </span>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {/* Mobile Stacked Cards Fallback (<640px) */}
        <div className="block sm:hidden space-y-3">
          {filteredBookings.length === 0 ? (
            <p className="text-center text-xs text-muted-foreground py-6 font-medium">{t('noBookingsFound')}</p>
          ) : (
            filteredBookings.map((booking) => {
              const user = usersCache[booking.userId];
              return (
                <div key={booking.id} className="p-4 rounded-2xl border border-border bg-background/50 space-y-2 text-start text-xs shadow-sm">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-extrabold text-foreground text-sm">{user?.name || 'Player'}</p>
                      <p className="text-[11px] text-muted-foreground font-mono">{user?.phone}</p>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      booking.status === 'confirmed' ? 'bg-primary/20 text-primary border border-primary/20' :
                      booking.status === 'pending_review' ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/20' :
                      booking.status === 'rejected' ? 'bg-destructive/20 text-destructive border border-destructive/20' :
                      'bg-muted text-muted-foreground border border-border'
                    }`}>
                      {booking.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-border/40 text-muted-foreground font-medium">
                    <div>📅 <strong className="text-foreground font-mono">{booking.date}</strong></div>
                    <div>⏰ <strong className="text-foreground">{formatTime(booking.timeSlot)} ({booking.duration}h)</strong></div>
                    <div>👥 <strong className="text-foreground capitalize">{booking.bookingType || 'private'}</strong></div>
                    <div>🏃 <strong className="text-foreground">{booking.numPeople || 10} players</strong></div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}
