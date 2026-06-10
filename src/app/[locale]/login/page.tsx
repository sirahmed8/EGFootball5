'use client';

import { useRouter } from '@/i18n/routing';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
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

  const handleGoogleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const { user } = await signInWithPopup(auth, provider);
      
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) {
        const appUser: AppUser = {
          uid: user.uid,
          name: user.displayName || 'Player',
          phone: user.phoneNumber || '',
          role: 'player',
          isBlacklisted: false,
          createdAt: Date.now()
        };
        await setDoc(userRef, appUser);
        router.push('/profile');
      } else {
        router.push('/book');
      }
    } catch (error: any) {
      toast.error(error.message || 'Google sign-in failed');
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-card/80 border-border backdrop-blur-xl animate-in fade-in zoom-in-95 duration-500 shadow-xl">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-2">
            <div className="w-8 h-8 bg-primary rounded-full shadow-[0_0_15px_rgba(var(--primary),0.5)]" />
          </div>
          <CardTitle className="text-4xl font-black text-card-foreground tracking-tight">EGFootball5</CardTitle>
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
