'use client';

import { useEffect, useCallback } from 'react';
import { useRouter } from '@/i18n/routing';
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  User as FirebaseUser,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase/config';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { User as AppUser } from '@/types';
import { useTranslations } from 'next-intl';

export default function LoginPage() {
  const router = useRouter();
  const t = useTranslations('Login');

  const processUserSignIn = useCallback(async (user: FirebaseUser) => {
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);

    const isOwner = user.email === 'a7medorabe7@gmail.com';
    let defaultRole = isOwner ? 'owner' : 'player';

    // Check if user is an admin by querying pitches
    if (!isOwner && user.email) {
      const { collection, query, where, getDocs } = await import('firebase/firestore');
      const q = query(collection(db, 'pitches'), where('adminEmail', '==', user.email));
      const qs = await getDocs(q);
      if (!qs.empty) {
        defaultRole = 'admin';
      }
    }

    if (!userSnap.exists()) {
      const appUser: AppUser = {
        uid: user.uid,
        name: user.displayName || 'Player',
        email: user.email || '',
        phone: user.phoneNumber || '',
        photoURL: user.photoURL || undefined,
        role: defaultRole as AppUser['role'],
        isBlacklisted: false,
        createdAt: Date.now(),
      };
      await setDoc(userRef, appUser);

      // Increment global stats
      const { increment } = await import('firebase/firestore');
      await setDoc(doc(db, 'stats', 'global'), { users: increment(1) }, { merge: true });

      router.push('/profile');
    } else {
      const appUser = userSnap.data() as AppUser;
      let roleUpdated = false;
      let emailUpdated = false;
      let photoUpdated = false;

      if (!appUser.email && user.email) {
        appUser.email = user.email;
        emailUpdated = true;
      }

      if (user.photoURL && appUser.photoURL !== user.photoURL) {
        appUser.photoURL = user.photoURL;
        photoUpdated = true;
      }

      // Auto upgrade owner if not set
      if (isOwner && appUser.role !== 'owner') {
        appUser.role = 'owner';
        roleUpdated = true;
      } else if (!isOwner && defaultRole === 'admin' && appUser.role !== 'admin') {
        appUser.role = 'admin';
        roleUpdated = true;
      }

      if (roleUpdated || emailUpdated || photoUpdated) {
        await setDoc(
          userRef,
          {
            role: appUser.role,
            email: appUser.email || '',
            ...(appUser.photoURL && { photoURL: appUser.photoURL }),
          },
          { merge: true }
        );
      }

      if (appUser.role === 'owner') {
        router.push('/owner');
      } else if (appUser.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/home');
      }
    }
  }, [router]);

  useEffect(() => {
    // Check if user returned from OAuth redirect
    getRedirectResult(auth)
      .then(async (result) => {
        if (result?.user) {
          await processUserSignIn(result.user);
        }
      })
      .catch((err: unknown) => {
        console.error('Redirect sign-in error:', err);
      });
  }, [processUserSignIn]);


  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const { user } = await signInWithPopup(auth, provider);
      await processUserSignIn(user);
    } catch (error: unknown) {
      const err = error as { code?: string; message?: string };
      const code = err.code || '';

      // Gracefully ignore closed or cancelled popups
      if (
        code === 'auth/cancelled-popup-request' ||
        code === 'auth/popup-closed-by-user'
      ) {
        return;
      }

      // Fall back to redirect if popup was blocked by browser/mobile
      if (code === 'auth/popup-blocked' || code === 'auth/operation-not-supported-in-this-environment') {
        try {
          await signInWithRedirect(auth, provider);
          return;
        } catch (redirectErr) {
          console.error('Redirect sign-in failed:', redirectErr);
        }
      }

      if (code === 'auth/unauthorized-domain') {
        toast.error('Domain not authorized in Firebase Console (Authentication > Authorized domains)');
        return;
      }

      toast.error(err.message || 'Google sign-in failed');
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-card/80 border-border backdrop-blur-xl animate-in fade-in zoom-in-95 duration-500 shadow-xl">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-2">
            <div className="w-8 h-8 bg-primary rounded-full shadow-[0_0_15px_rgba(var(--primary),0.5)]" />
          </div>
          <CardTitle className="text-4xl font-black text-card-foreground tracking-tight">
            EGFootball5
          </CardTitle>
          <CardDescription className="text-muted-foreground text-lg">
            {t('welcomeBack')}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 mt-8 pb-8">
          <Button
            type="button"
            size="lg"
            onClick={handleGoogleSignIn}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-bold shadow-lg shadow-primary/30 transition-all hover:scale-[1.02] active:scale-95 text-lg h-14 rounded-xl"
          >
            {t('continueWithGoogle')}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
