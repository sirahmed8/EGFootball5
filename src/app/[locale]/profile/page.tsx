'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from '@/i18n/routing';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function ProfilePage() {
  const { appUser, firebaseUser, loading } = useAuthStore();
  const router = useRouter();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!loading && !firebaseUser) {
      router.push('/login');
    }
  }, [loading, firebaseUser, router]);

  useEffect(() => {
    if (appUser) {
      setName(appUser.name);
      setPhone(appUser.phone || '');
    }
  }, [appUser]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firebaseUser) return;
    setIsSaving(true);
    try {
      await updateDoc(doc(db, 'users', firebaseUser.uid), {
        name,
        phone
      });
      toast.success('Profile updated successfully');
      router.push('/book');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading || !appUser) return <div className="p-8 text-center text-white">Loading...</div>;

  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-zinc-900/80 border-white/10 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-2xl text-white">Your Profile</CardTitle>
          <CardDescription className="text-zinc-400">Manage your details</CardDescription>
        </CardHeader>
        <form onSubmit={handleSave}>
          <CardContent className="space-y-4">
             <div className="space-y-2">
               <Label htmlFor="name" className="text-zinc-300">Full Name</Label>
               <Input id="name" required value={name} onChange={e => setName(e.target.value)} className="bg-zinc-800/50 border-white/10 text-white focus-visible:ring-primary" />
             </div>
             <div className="space-y-2">
               <Label htmlFor="phone" className="text-zinc-300">Phone Number</Label>
               <Input id="phone" type="tel" required placeholder="010XXXXXXXX" value={phone} onChange={e => setPhone(e.target.value)} className="bg-zinc-800/50 border-white/10 text-white focus-visible:ring-primary" />
             </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full bg-primary text-black font-bold hover:bg-primary/90 shadow-[0_0_15px_rgba(57,255,20,0.3)]" disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save & Continue'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
