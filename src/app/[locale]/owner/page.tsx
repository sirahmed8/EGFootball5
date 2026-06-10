'use client';

import { useState, useEffect } from 'react';
import { useRouter } from '@/i18n/routing';
import { collection, query, onSnapshot, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useAuthStore } from '@/store/useAuthStore';
import { Pitch, User as AppUser } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export default function OwnerDashboard() {
  const router = useRouter();
  const { appUser, loading } = useAuthStore();
  
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
    return <div className="p-8 text-center text-white">Authenticating...</div>;
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
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleUpdateAdminRole = async (email: string) => {
    // This is a naive approach. In reality, you'd need a Cloud Function or query by email.
    // Firestore doesn't let you update by email easily without querying first.
    toast.info(`Please ensure the user with email ${email} has logged in once so their role can be upgraded by the system, or implement an Admin query by Email.`);
  };

  return (
    <div className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-8 space-y-8">
      <div>
        <h1 className="text-4xl font-black text-foreground">Owner Dashboard</h1>
        <p className="text-muted-foreground mt-2">Manage all pitches and assign admins.</p>
      </div>

      <Card className="bg-card/50 border-border backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-card-foreground">Create New Pitch</CardTitle>
          <CardDescription>Fill out the details to add a new pitch to the platform.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreatePitch} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input placeholder="Pitch Name" value={newPitch.name || ''} onChange={e => setNewPitch({...newPitch, name: e.target.value})} required />
            <Input placeholder="Admin Email (e.g. admin@pitch.com)" value={newPitch.adminEmail || ''} onChange={e => setNewPitch({...newPitch, adminEmail: e.target.value})} required type="email" />
            <Input placeholder="Admin Phone" value={newPitch.adminPhone || ''} onChange={e => setNewPitch({...newPitch, adminPhone: e.target.value})} />
            <Input placeholder="Location Name" value={newPitch.locationName || ''} onChange={e => setNewPitch({...newPitch, locationName: e.target.value})} />
            <Input placeholder="Map Link (Google Maps)" value={newPitch.mapLink || ''} onChange={e => setNewPitch({...newPitch, mapLink: e.target.value})} />
            <div className="flex gap-2">
              <Input 
                type="file" 
                accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  try {
                    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
                    if (!cloudName) throw new Error("Cloudinary not configured");
                    
                    const formData = new FormData();
                    formData.append('file', file);
                    formData.append('upload_preset', 'kickoff_preset');
                    formData.append('folder', 'pitches');

                    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
                      method: 'POST',
                      body: formData
                    });
                    
                    if (!res.ok) throw new Error("Upload failed");
                    const data = await res.json();
                    setNewPitch({...newPitch, imagePreviewUrl: data.secure_url});
                    toast.success('Image uploaded successfully');
                  } catch (err: any) {
                    toast.error(err.message);
                  }
                }}
                className="bg-card text-foreground flex-1 file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/20 file:text-primary hover:file:bg-primary/30 cursor-pointer"
              />
              {newPitch.imagePreviewUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={newPitch.imagePreviewUrl} alt="Preview" className="w-10 h-10 rounded-lg object-cover" />
              )}
            </div>
            <Input placeholder="Price Per Hour (EGP)" type="number" value={newPitch.pricePerHour || ''} onChange={e => setNewPitch({...newPitch, pricePerHour: Number(e.target.value)})} required />
            <Input placeholder="Payment Recipient Number (e.g. Vodafone Cash)" value={newPitch.recipient || ''} onChange={e => setNewPitch({...newPitch, recipient: e.target.value})} />
            <Input placeholder="Manager Name" value={newPitch.managerName || ''} onChange={e => setNewPitch({...newPitch, managerName: e.target.value})} />
            
            <div className="md:col-span-2 mt-4">
              <Button type="submit" className="w-full bg-primary text-primary-foreground font-bold">Create Pitch</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-foreground">Existing Pitches</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pitches.map(pitch => (
            <Card key={pitch.id} className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-primary">{pitch.name}</CardTitle>
                <CardDescription>{pitch.locationName}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p><strong>Admin Email:</strong> {pitch.adminEmail}</p>
                <p><strong>Price:</strong> {pitch.pricePerHour} EGP/hr</p>
                <p><strong>Recipient:</strong> {pitch.recipient}</p>
                <Button variant="outline" size="sm" className="mt-4 w-full" onClick={() => handleUpdateAdminRole(pitch.adminEmail)}>
                  Verify Admin Role
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
