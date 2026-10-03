'use client';

import * as React from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  User as FirebaseUser,
} from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Eye, EyeOff, Mail, Lock, User, LogIn, UserPlus } from 'lucide-react';

interface EmailPasswordFormProps {
  onSuccess: (user: FirebaseUser) => Promise<void>;
  agreedToLegal: boolean;
  t: (key: string) => string;
  tForm: (key: string) => string;
}

export function EmailPasswordForm({
  onSuccess,
  agreedToLegal,
  t,
  tForm,
}: EmailPasswordFormProps) {
  const [isSignUp, setIsSignUp] = React.useState(false);
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreedToLegal) {
      toast.error(tForm('agreeRequired'));
      return;
    }

    if (!email || !password) {
      toast.error(isSignUp ? 'Please enter name, email, and password.' : 'Please enter email and password.');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters.');
      return;
    }

    setSubmitting(true);
    try {
      if (isSignUp) {
        const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
        if (name.trim()) {
          await updateProfile(cred.user, { displayName: name.trim() });
        }
        await onSuccess(cred.user);
      } else {
        const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
        await onSuccess(cred.user);
      }
    } catch (err: unknown) {
      const error = err as { code?: string; message?: string };
      const code = error.code || '';

      if (code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/user-not-found') {
        toast.error('Invalid email or password. Please verify your credentials.');
      } else if (code === 'auth/email-already-in-use') {
        toast.error('This email is already registered. Please sign in instead.');
      } else if (code === 'auth/weak-password') {
        toast.error('Password is too weak. Please use a stronger combination.');
      } else if (code === 'auth/invalid-email') {
        toast.error('Please enter a valid email address.');
      } else {
        toast.error(error.message || 'Authentication failed. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-1">
      {isSignUp && (
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
            {t('fullName')}
          </label>
          <div className="relative">
            <User className="absolute start-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Omar Tarek"
              className="w-full ps-10 pe-4 py-3 rounded-xl bg-white/5 border border-white/10 text-foreground text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium"
            />
          </div>
        </div>
      )}

      <div className="space-y-1.5">
        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
          {t('email')}
        </label>
        <div className="relative">
          <Mail className="absolute start-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="player@example.com"
            className="w-full ps-10 pe-4 py-3 rounded-xl bg-white/5 border border-white/10 text-foreground text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
          {t('password')}
        </label>
        <div className="relative">
          <Lock className="absolute start-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input
            type={showPassword ? 'text' : 'password'}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full ps-10 pe-11 py-3 rounded-xl bg-white/5 border border-white/10 text-foreground text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium"
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute end-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            title={showPassword ? 'Hide password' : 'Show password'}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <Button
        type="submit"
        disabled={submitting}
        className="w-full bg-white/10 hover:bg-white/15 text-foreground border border-white/15 font-bold h-12 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
      >
        {isSignUp ? (
          <>
            <UserPlus className="w-4 h-4 text-primary" />
            <span>{submitting ? t('processing') : t('signUp')}</span>
          </>
        ) : (
          <>
            <LogIn className="w-4 h-4 text-primary" />
            <span>{submitting ? t('processing') : t('signIn')}</span>
          </>
        )}
      </Button>

      <div className="text-center pt-1">
        <button
          type="button"
          onClick={() => setIsSignUp((prev) => !prev)}
          className="text-xs text-muted-foreground hover:text-primary transition-colors cursor-pointer font-medium"
        >
          {isSignUp ? t('hasAccount') : t('noAccount')}
        </button>
      </div>
    </form>
  );
}
