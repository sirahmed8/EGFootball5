import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Pitch } from '@/types';
import { storage } from '@/lib/firebase/config';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { toast } from 'sonner';

interface PitchCreationFormProps {
  newPitch: Partial<Pitch>;
  setNewPitch: (pitch: Partial<Pitch>) => void;
  handleCreatePitch: (e: React.FormEvent) => Promise<void>;
  t: (key: string) => string;
}

export function PitchCreationForm({ newPitch, setNewPitch, handleCreatePitch, t }: PitchCreationFormProps) {
  return (
    <Card className="bg-card/50 border-border backdrop-blur-xl">
      <CardHeader>
        <CardTitle className="text-card-foreground">{t('createNewPitch')}</CardTitle>
        <CardDescription>{t('createPitchDesc')}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleCreatePitch} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input placeholder={t('pitchName')} value={newPitch.name || ''} onChange={e => setNewPitch({...newPitch, name: e.target.value})} required className="bg-background border-border text-foreground" />
          <Input placeholder={t('adminEmail')} value={newPitch.adminEmail || ''} onChange={e => setNewPitch({...newPitch, adminEmail: e.target.value})} required type="email" className="bg-background border-border text-foreground" />
          <Input placeholder={t('adminPhone')} value={newPitch.adminPhone || ''} onChange={e => setNewPitch({...newPitch, adminPhone: e.target.value})} className="bg-background border-border text-foreground" />
          <Input placeholder={t('locationName')} value={newPitch.locationName || ''} onChange={e => setNewPitch({...newPitch, locationName: e.target.value})} className="bg-background border-border text-foreground" />
          <Input placeholder={t('mapLink')} value={newPitch.mapLink || ''} onChange={e => setNewPitch({...newPitch, mapLink: e.target.value})} className="bg-background border-border text-foreground" />
          
          <div className="flex flex-col gap-2 p-3 rounded-lg border border-border bg-muted/10 md:col-span-2">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{t('pitchImage')}</label>
            <div className="flex flex-col sm:flex-row gap-3 items-center">
              <Input 
                placeholder={t('imagePlaceholder')} 
                value={newPitch.imagePreviewUrl || ''} 
                onChange={e => setNewPitch({...newPitch, imagePreviewUrl: e.target.value})}
                className="bg-background border-border text-foreground flex-1"
              />
              <Input 
                type="file" 
                accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  try {
                    const storageRef = ref(storage, `pitches/new_${Date.now()}_${file.name}`);
                    await uploadBytes(storageRef, file);
                    const downloadUrl = await getDownloadURL(storageRef);
                    setNewPitch({...newPitch, imagePreviewUrl: downloadUrl});
                    toast.success('Image uploaded successfully');
                  } catch (err: unknown) {
                    const error = err as Error;
                    toast.error(error.message);
                  }
                }}
                className="bg-card border-border text-foreground flex-1 file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/20 file:text-primary hover:file:bg-primary/30 cursor-pointer"
              />
              {newPitch.imagePreviewUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={newPitch.imagePreviewUrl} alt="Preview" className="w-10 h-10 rounded-lg object-cover border border-border" />
              )}
            </div>
          </div>
          
          <Input placeholder={t('priceLabel')} type="number" value={newPitch.pricePerHour || ''} onChange={e => setNewPitch({...newPitch, pricePerHour: Number(e.target.value)})} required className="bg-background border-border text-foreground" />
          <Input placeholder={t('recipientLabel')} value={newPitch.recipient || ''} onChange={e => setNewPitch({...newPitch, recipient: e.target.value})} className="bg-background border-border text-foreground" />
          <Input placeholder={t('managerName')} value={newPitch.managerName || ''} onChange={e => setNewPitch({...newPitch, managerName: e.target.value})} className="bg-background border-border text-foreground" />
          
          <div className="md:col-span-2 mt-4">
            <Button type="submit" className="w-full bg-primary text-black hover:bg-primary/90 font-bold shadow-[0_0_15px_rgba(57,255,20,0.3)]">{t('createBtn')}</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
