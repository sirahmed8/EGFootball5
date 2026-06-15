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
  t: (key: string) => string;
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
  t
}: LiveScheduleProps) {
  return (
    <Card className="bg-card border-border backdrop-blur-xl">
      <CardHeader>
        <CardTitle className="text-card-foreground">{t('liveSchedule')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filter controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="flex-1">
            <Input
              placeholder="Search by player name or phone..."
              value={scheduleSearch}
              onChange={(e) => setScheduleSearch(e.target.value)}
              className="bg-card text-foreground border-border"
            />
          </div>
          <div className="w-full sm:w-48">
            <Select value={scheduleFilter} onValueChange={(val) => setScheduleFilter(val as 'all' | 'confirmed' | 'pending_review' | 'rejected')}>
              <SelectTrigger className="bg-card text-foreground border-border">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="pending_review">Pending Review</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-muted/50">
              <TableHead className="text-muted-foreground">Player</TableHead>
              <TableHead className="text-muted-foreground">{t('date')}</TableHead>
              <TableHead className="text-muted-foreground">{t('time')}</TableHead>
              <TableHead className="text-muted-foreground">Type & Size</TableHead>
              <TableHead className="text-muted-foreground">{t('status')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...bookings]
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
              })
              .map((booking) => {
                const user = usersCache[booking.userId];
                return (
                <TableRow key={booking.id} className="border-border hover:bg-muted/50 text-foreground">
                  <TableCell className="font-medium">
                    {user?.name || 'Player'}
                    <div className="text-xs text-muted-foreground">{user?.phone}</div>
                  </TableCell>
                  <TableCell>{booking.date}</TableCell>
                  <TableCell>{formatTime(booking.timeSlot)} ({booking.duration}h)</TableCell>
                  <TableCell>
                    <div className="text-sm font-semibold capitalize">{booking.bookingType || 'private'}</div>
                    <div className="text-xs text-muted-foreground">{booking.numPeople || 10} players</div>
                  </TableCell>
                  <TableCell>
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
              )})}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
