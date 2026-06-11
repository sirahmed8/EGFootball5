'use client';

import { useState, useEffect } from 'react';
import { useRouter } from '@/i18n/routing';
import { collection, query, onSnapshot, doc, setDoc } from 'firebase/firestore';
import { db, storage } from '@/lib/firebase/config';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useAuthStore } from '@/store/useAuthStore';
import { Pitch } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

export default function OwnerDashboard() {
  const router = useRouter();
  const { appUser, loading } = useAuthStore();
  const t = useTranslations('Owner');
  const tProfile = useTranslations('Profile');
  
  const [pitches, setPitches] = useState<Pitch[]>([]);
  const [newPitch, setNewPitch] = useState<Partial<Pitch>>({});
  
  useEffect(() => {
    if (!loading && appUser?.role !== 'owner') {
      router.push('/');
    }
  }, [appUser, loading, router]);

  useEffect(() => {
    if (appUser?.role !== 'owner') return;

    const q = query(collection(db, 'pitches'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const pts = snapshot.docs.map(doc => doc.data() as Pitch);
      setPitches(pts);
    });

    return () => unsubscribe();
  }, [appUser]);

  if (loading || appUser?.role !== 'owner') {
    return <div className="p-8 text-center text-foreground">{tProfile('saving')}</div>;
  }

  const handleCreatePitch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPitch.name || !newPitch.adminEmail) {
      toast.error('Name and Admin Email are required');
      return;
    }
    
    try {
      const pitchId = `pitch_${Date.now()}`;
      const pitchData: Pitch = {
        id: pitchId,
        name: newPitch.name,
        locationName: newPitch.locationName || '',
        mapLink: newPitch.mapLink || '',
        imagePreviewUrl: newPitch.imagePreviewUrl || '',
        pricePerHour: Number(newPitch.pricePerHour) || 0,
        recipient: newPitch.recipient || '',
        managerName: newPitch.managerName || '',
        adminEmail: newPitch.adminEmail,
        adminPhone: newPitch.adminPhone || '',
        createdAt: Date.now()
      };
      
      await setDoc(doc(db, 'pitches', pitchId), pitchData);
      toast.success('Pitch created successfully');
      setNewPitch({});
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error.message);
    }
  };

  const handleUpdateAdminRole = async (email: string) => {
    try {
      const { collection, query, where, getDocs, doc, updateDoc } = await import('firebase/firestore');
      const q = query(collection(db, 'users'), where('email', '==', email));
      const qs = await getDocs(q);
      if (qs.empty) {
        toast.info(`No user found with email ${email}. Instruct the user to sign in once so they can be assigned.`);
        return;
      }
      
      const userDoc = qs.docs[0];
      const userRef = doc(db, 'users', userDoc.id);
      await updateDoc(userRef, { role: 'admin' });
      toast.success(`User role updated to admin for ${email}`);
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(`Failed to update admin role: ${error.message}`);
    }
  };

  return (
    <div className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-8 space-y-8 mt-12">
      <div>
        <h1 className="text-4xl font-black text-foreground">{t('title')}</h1>
        <p className="text-muted-foreground mt-2">{t('subtitle')}</p>
      </div>

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

      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-foreground">{t('existingPitches')}</h2>
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
      </div>
    </div>
  );
}
