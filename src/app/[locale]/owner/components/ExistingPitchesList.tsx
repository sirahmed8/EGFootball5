import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Pitch } from '@/types';
import { MapPin, ShieldCheck, Mail, Phone, ExternalLink } from 'lucide-react';
import { Link } from '@/i18n/routing';

interface ExistingPitchesListProps {
  pitches: Pitch[];
  handleUpdateAdminRole: (email: string) => Promise<void>;
  t: (key: string, values?: Record<string, string | number>) => string;
}

export function ExistingPitchesList({ pitches, handleUpdateAdminRole, t }: ExistingPitchesListProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-black text-foreground tracking-tight">{t('existingPitches')}</h2>
      {pitches.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground border border-dashed border-border rounded-3xl bg-card">
          <p className="text-lg font-bold">{t('noPitchesFound')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pitches.map((pitch) => (
            <Card key={pitch.id} className="bg-card border border-border hover:border-primary/50 transition-all duration-300 rounded-3xl overflow-hidden shadow-lg flex flex-col justify-between">
              {/* Card Image Header */}
              <div className="relative h-44 w-full bg-muted overflow-hidden">
                <Image
                  src={pitch.imagePreviewUrl || '/pitch_preview.jpg'}
                  alt={pitch.name}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-card via-card/20 to-black/30" />
                <div className="absolute top-3 end-3 bg-background/90 text-primary font-mono font-black text-xs px-3 py-1 rounded-full border border-border">
                  {pitch.pricePerHour || 350} EGP/hr
                </div>
              </div>

              <CardHeader className="pb-2">
                <CardTitle className="text-xl font-black text-foreground">{pitch.name}</CardTitle>
                <CardDescription className="text-xs text-muted-foreground font-semibold flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>{pitch.locationName || 'Obour City'}</span>
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-3 text-xs text-muted-foreground flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-foreground font-medium">
                    <Mail className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span className="truncate">{pitch.adminEmail}</span>
                  </div>
                  {pitch.adminPhone && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{pitch.adminPhone}</span>
                    </div>
                  )}
                  {pitch.recipient && (
                    <p className="text-[11px] font-semibold text-muted-foreground">
                      Vodafone Cash: <span className="font-mono text-foreground">{pitch.recipient}</span>
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-border flex items-center justify-between gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 bg-muted hover:bg-muted/80 text-foreground border-border font-bold text-xs rounded-xl"
                    onClick={() => handleUpdateAdminRole(pitch.adminEmail)}
                  >
                    <ShieldCheck className="w-3.5 h-3.5 me-1 text-primary" />
                    {t('verifyRoleBtn')}
                  </Button>
                  <Link href={`/book?pitchId=${pitch.id}`}>
                    <Button size="sm" className="bg-primary text-black font-bold text-xs rounded-xl px-3">
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
