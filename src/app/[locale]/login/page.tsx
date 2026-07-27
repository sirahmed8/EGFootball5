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

      router.push('/onboarding');
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
    <div className="relative min-h-[calc(100vh-5rem)] flex items-center justify-center p-4 md:p-8 overflow-hidden bg-mesh">
      {/* Background Glow Elements */}
      <div className="absolute top-1/4 -start-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none animate-pulse-glow" />
      <div className="absolute bottom-1/4 -end-20 w-96 h-96 bg-secondary/10 rounded-full blur-3xl pointer-events-none animate-pulse-glow" style={{ animationDelay: '2s' }} />

      <Card className="w-full max-w-lg stadium-glass border-border/40 shadow-2xl relative z-10 rounded-3xl overflow-hidden backdrop-blur-2xl">
        <CardHeader className="text-center space-y-4 pt-8 px-6 md:px-10">
          <div className="mx-auto w-20 h-20 bg-primary/15 border border-primary/30 rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20 glow-primary-sm group hover:scale-105 transition-transform duration-300">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-primary-foreground font-black text-xl shadow-inner">
              ⚽
            </div>
          </div>
          
          <div className="space-y-1">
            <CardTitle className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight">
              EGFootball5
            </CardTitle>
            <CardDescription className="text-muted-foreground text-base font-medium">
              {t('welcomeBack')}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="flex flex-col gap-6 p-6 md:p-10">
          {/* Features Pills */}
          <div className="grid grid-cols-3 gap-2 py-2">
            <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white/5 border border-white/5 text-center">
              <span className="text-lg">🏟️</span>
              <span className="text-xs font-semibold text-foreground mt-1">Top Pitches</span>
            </div>
            <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white/5 border border-white/5 text-center">
              <span className="text-lg">⚡</span>
              <span className="text-xs font-semibold text-foreground mt-1">Instant Lock</span>
            </div>
            <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white/5 border border-white/5 text-center">
              <span className="text-lg">🏆</span>
              <span className="text-xs font-semibold text-foreground mt-1">Public Matches</span>
            </div>
          </div>

          <Button
            type="button"
            size="lg"
            onClick={handleGoogleSignIn}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-bold shadow-lg glow-primary transition-all duration-200 hover:scale-[1.02] active:scale-98 text-base md:text-lg h-14 rounded-2xl flex items-center justify-center gap-3 cursor-pointer"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            {t('continueWithGoogle')}
          </Button>

          <p className="text-center text-xs text-muted-foreground leading-relaxed px-4">
            By continuing, you agree to EGFootball5 Platform Terms of Service and Privacy Policy.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
