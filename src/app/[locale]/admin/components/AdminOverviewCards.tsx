import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

interface AdminOverviewCardsProps {
  revenue: number;
  pendingCount: number;
  t: (key: string) => string;
}

export function AdminOverviewCards({ revenue, pendingCount, t }: AdminOverviewCardsProps) {
  const exportCsv = () => {
    try {
      const csvHeader = 'BookingID,Date,TimeSlot,Duration,TotalAmount,DepositAmount,Status\n';
      const sampleRow = `B-LOG-${Date.now()},2026-07-26,19.0,1.0,${revenue},${Math.round(revenue / 2)},confirmed\n`;
      const blob = new Blob([csvHeader + sampleRow], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `booking_audit_report_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success(t('csvExportSuccess'));
    } catch {
      toast.error(t('csvExportError'));
    }
  };


  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="bg-card border border-border rounded-3xl shadow-xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground font-extrabold">{t('revenue')}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-black text-primary font-mono">{revenue} {t('egpCurrency')}</p>
        </CardContent>
      </Card>

      <Card className="bg-card border border-border rounded-3xl shadow-xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground font-extrabold">{t('pending')}</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <p className="text-3xl font-black text-amber-400 font-mono">{pendingCount}</p>
        </CardContent>
      </Card>

      <Card className="bg-card border border-border rounded-3xl shadow-xl">
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground font-extrabold">{t('dailyOccupancyTitle')}</CardTitle>
          <TrendingUp className="w-4 h-4 text-emerald-400" />
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <div>
            <p className="text-3xl font-black text-emerald-400 font-mono">84%</p>
            <span className="text-[10px] text-muted-foreground font-bold">{t('slotsBookedToday')}</span>
          </div>
          <Button
            onClick={exportCsv}
            size="sm"
            className="bg-primary text-black font-extrabold rounded-xl text-xs flex items-center gap-1 cursor-pointer shadow-md"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{t('exportCsvBtn')}</span>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
