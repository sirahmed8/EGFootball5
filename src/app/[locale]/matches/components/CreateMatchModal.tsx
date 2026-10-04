'use client';

import { useState } from 'react';
import { useRouter } from '@/i18n/routing';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { Pitch } from '@/types';
import { Plus, Sparkles } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

interface CreateMatchModalProps {
  pitches: Pitch[];
  isArabic?: boolean;
  firebaseUser: any;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function CreateMatchModal({
  pitches,
  isArabic,
  firebaseUser,
  isOpen: externalOpen,
  onOpenChange: externalOnOpenChange,
}: CreateMatchModalProps) {
  const router = useRouter();
  const t = useTranslations('Matches');
  const [selectedPitchId, setSelectedPitchId] = useState<string>(pitches[0]?.id || '');
  const [internalOpen, setInternalOpen] = useState(false);

  const isControlled = externalOpen !== undefined;
  const open = isControlled ? externalOpen : internalOpen;
  const setOpen = (nextOpen: boolean) => {
    if (isControlled) {
      externalOnOpenChange?.(nextOpen);
    } else {
      setInternalOpen(nextOpen);
    }
  };

  const handleOpenModal = () => {
    if (!firebaseUser) {
      toast.error(
        isArabic
          ? 'يرجى تسجيل الدخول أولاً لتنظيم مباراة جديدة'
          : 'Please sign in first to host a public match'
      );
      router.push('/login');
      return;
    }
    setOpen(true);
  };

  const handleProceed = () => {
    setOpen(false);
    if (selectedPitchId) {
      router.push(`/book?pitchId=${selectedPitchId}`);
    } else {
      router.push('/home');
    }
  };

  return (
    <>
      <Button
        onClick={handleOpenModal}
        className="bg-primary text-black font-black hover:bg-primary/90 rounded-2xl flex items-center justify-center gap-2 h-12 px-6 w-full md:w-auto shadow-[0_0_20px_rgba(57,255,20,0.3)] transition-transform active:scale-95 cursor-pointer"
      >
        <Plus className="w-5 h-5" />
        <span>{t('hostMatchBtn')}</span>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg p-6 bg-card border border-border rounded-3xl shadow-2xl space-y-5">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-foreground flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-primary shrink-0" />
              <span>{t('hostMatchTitle')}</span>
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-xs font-medium leading-relaxed">
              {t('hostMatchDesc')}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-1">
            <label className="text-xs font-extrabold text-foreground uppercase tracking-wider block">
              {t('selectPitch')}
            </label>

            {pitches.length > 0 ? (
              <div className="space-y-2.5 max-h-[260px] overflow-y-auto pe-1">
                {pitches.map((p) => {
                  const isSelected = selectedPitchId === p.id || (pitches.length === 1 && selectedPitchId === '');
                  return (
                    <div
                      key={p.id}
                      onClick={() => setSelectedPitchId(p.id)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        isSelected
                          ? 'bg-primary/15 border-primary text-foreground shadow-[0_0_15px_rgba(57,255,20,0.2)]'
                          : 'bg-background/80 border-border hover:border-primary/40 text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="font-black text-sm text-foreground truncate">{p.name}</div>
                        <div className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5 font-medium">
                          <span>📍 {p.locationName || 'Obour City'}</span>
                          {p.capacity && (
                            <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-md font-bold text-[10px]">
                              {p.capacity}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="text-end shrink-0">
                        <div className="font-black text-primary text-sm font-mono">{p.pricePerHour} EGP</div>
                        <div className="text-[10px] text-muted-foreground font-semibold">per hour</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-background/50 border border-border text-center space-y-2">
                <p className="text-xs text-muted-foreground font-medium">
                  {isArabic
                    ? 'لا توجد ملاعب متاحة حالياً على المنصة لتنظيم مباراة.'
                    : 'No pitches currently available on the platform to host a match.'}
                </p>
              </div>
            )}

            <Button
              onClick={handleProceed}
              disabled={pitches.length === 0}
              className="w-full bg-primary text-black font-black hover:bg-primary/90 rounded-2xl h-12 text-base shadow-[0_0_20px_rgba(57,255,20,0.3)] cursor-pointer mt-2"
            >
              {t('proceedToSlot')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
