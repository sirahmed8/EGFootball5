import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Pitch } from '@/types';

interface ExistingPitchesListProps {
  pitches: Pitch[];
  handleUpdateAdminRole: (email: string) => Promise<void>;
  t: (key: string, values?: Record<string, string | number>) => string;
}

export function ExistingPitchesList({ pitches, handleUpdateAdminRole, t }: ExistingPitchesListProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-foreground">{t('existingPitches')}</h2>
      {pitches.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground border border-dashed border-border rounded-xl">
          <p className="text-lg">{t('noPitchesFound')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pitches.map(pitch => (
            <Card key={pitch.id} className="bg-card border-border hover:border-primary/25 transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-primary font-bold">{pitch.name}</CardTitle>
                <CardDescription className="text-muted-foreground">{pitch.locationName}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p><strong className="text-foreground">{t('adminEmailLabel')}</strong> {pitch.adminEmail}</p>
                <p><strong className="text-foreground">{t('priceValue', { price: pitch.pricePerHour })}</strong></p>
                <p><strong className="text-foreground">{t('recipientValue', { recipient: pitch.recipient })}</strong></p>
                <Button variant="outline" size="sm" className="mt-4 w-full bg-secondary hover:bg-secondary/80 text-secondary-foreground border-border" onClick={() => handleUpdateAdminRole(pitch.adminEmail)}>
                  {t('verifyRoleBtn')}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
