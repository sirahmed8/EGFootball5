'use client';

import React, { useState } from 'react';
import { CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { doc, updateDoc, deleteDoc, addDoc, collection } from 'firebase/firestore';
import { updateProfile, deleteUser, signOut } from 'firebase/auth';
import { auth, db } from '@/lib/firebase/config';
import { User as AppUser } from '@/types';
import { ShieldAlert, Trash2, AlertTriangle } from 'lucide-react';
import { useRouter } from '@/i18n/routing';

interface ProfileFormProps {
  appUser: AppUser;
  firebaseUid: string;
}

export function ProfileForm({ appUser, firebaseUid }: ProfileFormProps) {
  const router = useRouter();
  const t = useTranslations('Profile');
  const [name, setName] = useState(appUser.name);
  const [phone, setPhone] = useState(appUser.phone || '');
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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

  const handlePermanentDataDeletion = async () => {
    setIsDeleting(true);
    const deleteToastId = toast.loading(t('deletingAccount') || 'Erasing account data...');

    try {
      // 1. Log GDPR Art. 17 / Law 151 erasure request to audit collection
      await addDoc(collection(db, 'data_deletion_requests'), {
        userId: firebaseUid,
        userEmail: appUser.email || '',
        userName: appUser.name || '',
        requestedAt: Date.now(),
        reason: 'GDPR_ART_17_SELF_SERVICE',
        status: 'completed',
      });

      // 2. Erase Firestore user profile document
      await deleteDoc(doc(db, 'users', firebaseUid));

      // 3. Delete Firebase Auth credentials or sign out
      if (auth.currentUser) {
        try {
          await deleteUser(auth.currentUser);
        } catch {
          // If token requires re-authentication, gracefully sign out
          await signOut(auth);
        }
      }

      toast.success(t('dataDeletionSuccess'), { id: deleteToastId });
      setShowDeleteModal(false);
      router.push('/login');
    } catch (error: unknown) {
      const err = error as Error;
      toast.error(err.message || 'Failed to erase account data', { id: deleteToastId });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
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

      {/* GDPR Article 17 & Law 151/2020 Data Erasure Rights */}
      <div className="mx-6 mb-6 p-4 rounded-xl bg-destructive/5 border border-destructive/20 space-y-3">
        <div className="flex items-center gap-2 text-destructive font-bold text-xs uppercase tracking-wider">
          <ShieldAlert className="w-4 h-4 shrink-0" />
          <span>{t('privacyAndGdpr')}</span>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          {t('gdprNotice')}
        </p>
        <Button
          type="button"
          variant="outline"
          onClick={() => setShowDeleteModal(true)}
          className="w-full border-destructive/40 text-destructive hover:bg-destructive hover:text-white rounded-xl text-xs font-bold transition-all h-9"
        >
          <Trash2 className="w-3.5 h-3.5 me-2" />
          {t('requestDataDeletion')}
        </Button>
      </div>

      {/* Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in-0 duration-200">
          <div className="w-full max-w-md p-6 rounded-2xl bg-card border border-destructive/40 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-destructive">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="font-extrabold text-base text-foreground">
                {t('dataDeletionModalTitle')}
              </h3>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {t('dataDeletionModalDesc')}
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
                className="rounded-xl text-xs"
              >
                {t('close')}
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={handlePermanentDataDeletion}
                disabled={isDeleting}
                className="rounded-xl text-xs font-bold bg-destructive text-white hover:bg-destructive/90"
              >
                {isDeleting ? t('deletingAccount') : t('confirmDeleteData')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
