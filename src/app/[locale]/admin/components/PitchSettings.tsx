import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Pitch } from '@/types';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase/config';
import { toast } from 'sonner';

interface PitchSettingsProps {
  editingPitch: Pitch | null;
  setEditingPitch: (pitch: Pitch | null) => void;
  handleUpdatePitch: () => Promise<void>;
  savingPitch: boolean;
  setSavingPitch: (val: boolean) => void;
  t: (key: string) => string;
}

export function PitchSettings({
  editingPitch,
  setEditingPitch,
  handleUpdatePitch,
  savingPitch,
  setSavingPitch,
  t
}: PitchSettingsProps) {
  if (!editingPitch) return null;

  return (
    <Card className="bg-card/50 border-border backdrop-blur-xl">
      <CardHeader>
        <CardTitle className="text-card-foreground">{t('editPitch')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4 max-w-xl">
          <div>
            <Label>{t('pitchName')}</Label>
            <Input 
              value={editingPitch.name} 
              onChange={e => setEditingPitch({...editingPitch, name: e.target.value})} 
              className="bg-card text-foreground"
            />
          </div>
          <div>
            <Label>{t('pricePerHour')}</Label>
            <Input 
              type="number"
              value={editingPitch.pricePerHour} 
              onChange={e => setEditingPitch({...editingPitch, pricePerHour: Number(e.target.value) || 0})} 
              className="bg-card text-foreground"
            />
          </div>
          <div>
            <Label>{t('locationName')}</Label>
            <Input 
              value={editingPitch.locationName} 
              onChange={e => setEditingPitch({...editingPitch, locationName: e.target.value})} 
              className="bg-card text-foreground"
            />
          </div>
          <div>
            <Label>{t('mapLink')}</Label>
            <Input 
              value={editingPitch.mapLink} 
              onChange={e => setEditingPitch({...editingPitch, mapLink: e.target.value})} 
              className="bg-card text-foreground"
            />
          </div>
          <div>
            <Label>{t('imagePreviewUrl')}</Label>
            <div className="flex gap-4 items-center">
              <Input 
                type="file" 
                accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  
                  try {
                    setSavingPitch(true);
                    const storageRef = ref(storage, `pitches/${editingPitch.id}_${file.name}`);
                    await uploadBytes(storageRef, file);
                    const downloadUrl = await getDownloadURL(storageRef);
                    setEditingPitch({...editingPitch, imagePreviewUrl: downloadUrl});
                    toast.success('Image uploaded successfully');
                  } catch (err: unknown) {
                    const error = err as Error;
                    toast.error(error.message);
                  } finally {
                    setSavingPitch(false);
                  }
                }}
                className="bg-card text-foreground flex-1 file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/20 file:text-primary hover:file:bg-primary/30 cursor-pointer"
              />
              {editingPitch.imagePreviewUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={editingPitch.imagePreviewUrl} alt="Preview" className="w-12 h-12 rounded-lg object-cover" />
              )}
            </div>
          </div>
          <Button 
            onClick={handleUpdatePitch} 
            disabled={savingPitch}
            className="w-full font-bold bg-primary text-black"
          >
            {savingPitch ? t('saving') : t('saveChanges')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
