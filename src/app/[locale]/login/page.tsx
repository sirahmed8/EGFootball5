'use client';

import { useState } from 'react';
import { useRouter } from '@/i18n/routing';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase/config';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { User as AppUser } from '@/types';
import { useTranslations } from 'next-intl';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const t = useTranslations('Login');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        router.push('/book');
      } else {
        const { user } = await createUserWithEmailAndPassword(auth, email, password);
        
        const appUser: AppUser = {
          uid: user.uid,
          name,
          phone,
          role: 'player',
          isBlacklisted: false,
          createdAt: Date.now()
        };
        
        await setDoc(doc(db, 'users', user.uid), appUser);
        router.push('/book');
      }
    } catch (error: any) {
      toast.error(error.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

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
      <Card className="w-full max-w-md bg-zinc-900/80 border-white/10 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-2xl text-white">{isLogin ? t('signIn') : t('createAccount')}</CardTitle>
          <CardDescription className="text-zinc-400">
            {isLogin ? t('welcomeBack') : t('joinUs')}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {!isLogin && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-zinc-300">{t('fullName')}</Label>
                  <Input id="name" required={!isLogin} value={name} onChange={e => setName(e.target.value)} className="bg-zinc-800/50 border-white/10 text-white placeholder:text-zinc-500 focus-visible:ring-primary" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-zinc-300">{t('phone')}</Label>
                  <Input id="phone" type="tel" placeholder="010XXXXXXXX" required={!isLogin} value={phone} onChange={e => setPhone(e.target.value)} className="bg-zinc-800/50 border-white/10 text-white placeholder:text-zinc-500 focus-visible:ring-primary" />
                </div>
              </>
            )}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-zinc-300">{t('email')}</Label>
              <Input id="email" type="email" required value={email} onChange={e => setEmail(e.target.value)} className="bg-zinc-800/50 border-white/10 text-white placeholder:text-zinc-500 focus-visible:ring-primary" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-zinc-300">{t('password')}</Label>
              <Input id="password" type="password" required value={password} onChange={e => setPassword(e.target.value)} className="bg-zinc-800/50 border-white/10 text-white focus-visible:ring-primary" />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full bg-primary text-black hover:bg-primary/90 font-bold shadow-[0_0_15px_rgba(57,255,20,0.3)]" disabled={loading}>
              {loading ? t('processing') : (isLogin ? t('signIn') : t('signUp'))}
            </Button>
            
            <div className="relative w-full">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-zinc-900 px-2 text-zinc-400">Or continue with</span>
              </div>
            </div>

            <Button type="button" variant="outline" onClick={handleGoogleSignIn} className="w-full border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white">
              Google
            </Button>

            <Button type="button" variant="link" onClick={() => setIsLogin(!isLogin)} className="text-zinc-400 hover:text-white">
              {isLogin ? t('noAccount') : t('hasAccount')}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
