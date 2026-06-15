import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface AdminOverviewCardsProps {
  revenue: number;
  pendingCount: number;
  t: (key: string) => string;
}

export function AdminOverviewCards({ revenue, pendingCount, t }: AdminOverviewCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card className="bg-card/50 border-border backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-muted-foreground">{t('revenue')}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-bold text-primary drop-shadow-[0_0_10px_rgba(57,255,20,0.4)]">{revenue} EGP</p>
        </CardContent>
      </Card>
      <Card className="bg-card/50 border-border backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-muted-foreground">{t('pending')}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-bold text-yellow-500 drop-shadow-[0_0_10px_rgba(234,179,8,0.4)]">{pendingCount}</p>
        </CardContent>
      </Card>
    </div>
  );
}
