'use client';

import React, { useState } from 'react';
import { CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { doc, updateDoc } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { auth, db } from '@/lib/firebase/config';
import { User as AppUser } from '@/types';

interface ProfileFormProps {
  appUser: AppUser;
  firebaseUid: string;
}

export function ProfileForm({ appUser, firebaseUid }: ProfileFormProps) {
  const t = useTranslations('Profile');
  const [name, setName] = useState(appUser.name);
  const [phone, setPhone] = useState(appUser.phone || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const loadingToastId = toast.loading(t('saving') || 'Saving profile...');

    try {
      await updateDoc(doc(db, 'users', firebaseUid), {
        name,
        phone,
      });

      if (auth.currentUser) {
        await updateProfile(auth.currentUser, { displayName: name });
      }

      toast.success(t('profileSaved'), { id: loadingToastId });
    } catch (error: unknown) {
      const err = error as Error;
      toast.error(err.message, { id: loadingToastId });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave}>
      <CardContent className="space-y-4 pt-4">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-foreground font-bold">
            {t('fullName')}
          </Label>
          <Input
            id="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-background/60 border-border text-foreground focus-visible:ring-primary rounded-xl"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone" className="text-foreground font-bold">
            {t('phone')}
          </Label>
          <Input
            id="phone"
            type="tel"
            required
            placeholder="01XXXXXXXXX"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="bg-background/60 border-border text-foreground focus-visible:ring-primary rounded-xl"
          />
        </div>
      </CardContent>
      <CardFooter className="pt-2">
        <Button
          type="submit"
          className="w-full bg-primary text-black font-black hover:bg-primary/90 rounded-2xl shadow-[0_0_15px_rgba(57,255,20,0.3)] h-12"
          disabled={isSaving}
        >
          {isSaving ? t('saving') : t('saveBtn')}
        </Button>
      </CardFooter>
    </form>
  );
}
