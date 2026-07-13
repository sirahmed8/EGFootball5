'use client';

import { useState, useEffect } from 'react';
import { useRouter } from '@/i18n/routing';
import { collection, query, onSnapshot, doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useAuthStore } from '@/store/useAuthStore';
import { Pitch } from '@/types';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

import { PitchCreationForm } from './components/PitchCreationForm';
import { ExistingPitchesList } from './components/ExistingPitchesList';
import { DashboardPageSkeleton } from '@/components/skeletons/PageSkeletons';

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
    return <DashboardPageSkeleton />;
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

      <PitchCreationForm 
        newPitch={newPitch} 
        setNewPitch={setNewPitch} 
        handleCreatePitch={handleCreatePitch} 
        t={t} 
      />

      <ExistingPitchesList 
        pitches={pitches} 
        handleUpdateAdminRole={handleUpdateAdminRole} 
        t={t} 
      />
    </div>
  );
}
