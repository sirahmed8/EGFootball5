'use client';

import * as React from 'react';
import { useRouter } from '@/i18n/routing';
import { useAuthStore } from '@/store/useAuthStore';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { OnboardingPositionStep, PositionType } from './components/OnboardingPositionStep';
import { OnboardingSkillStep } from './components/OnboardingSkillStep';
import { OnboardingClubStep } from './components/OnboardingClubStep';
import { OnboardingContactStep } from './components/OnboardingContactStep';

export default function OnboardingPage() {
  const router = useRouter();
  const firebaseUser = useAuthStore((s) => s.firebaseUser);
  const appUser = useAuthStore((s) => s.appUser);

  const [step, setStep] = React.useState(1);
  const [position, setPosition] = React.useState<PositionType>('MID');
  const [skillLevel, setSkillLevel] = React.useState<number>(3);
  const [favoriteTeam, setFavoriteTeam] = React.useState('Al Ahly');
  const [preferredSize, setPreferredSize] = React.useState('5v5');
  const [city, setCity] = React.useState('Obour');
  const [phone, setPhone] = React.useState(appUser?.phone || '');
  const [saving, setSaving] = React.useState(false);

  const handleComplete = async () => {
    if (!firebaseUser) {
      toast.error('User not authenticated');
      return;
    }
    setSaving(true);
    try {
      await setDoc(
        doc(db, 'users', firebaseUser.uid),
        {
          position,
          skillLevel,
          favoriteTeam,
          preferredSize,
          city,
          phone,
          onboarded: true,
          updatedAt: Date.now(),
        },
        { merge: true }
      );
      toast.success('Player setup completed! Welcome to Kickoff ⚽');
      router.push('/home');
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error.message || 'Failed to save setup');
    } finally {
      setSaving(false);
    }
  };

  const variants = {
    initial: { opacity: 0, x: 40, filter: 'blur(10px)' },
    animate: { opacity: 1, x: 0, filter: 'blur(0px)' },
    exit: { opacity: 0, x: -40, filter: 'blur(10px)' }
  };

  return (
    <div className="min-h-screen bg-mesh flex items-center justify-center p-4 py-12 relative overflow-hidden font-sans text-foreground">
      {/* Glow ambient */}
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-1/4 start-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-primary/20 rounded-full blur-[120px] pointer-events-none"
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl stadium-glass border-white/10 rounded-[2rem] p-6 md:p-10 shadow-2xl relative z-10 bg-black/40 backdrop-blur-3xl"
      >
        {/* Step Stepper Header */}
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/10">
          <div className="flex items-center gap-4">
            <motion.div
              key={step}
              initial={{ scale: 0.5, rotate: -90 }}
              animate={{ scale: 1, rotate: 0 }}
              className="w-12 h-12 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-black text-xl shadow-lg glow-primary-sm"
            >
              {step}/4
            </motion.div>
            <div>
              <h1 className="text-2xl font-black text-foreground tracking-tight">Player Setup</h1>
              <p className="text-sm text-muted-foreground font-medium">Customize your EGFootball5 player card</p>
            </div>
          </div>
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="relative h-2.5 rounded-full bg-white/10 w-4 md:w-8 overflow-hidden">
                {i <= step && (
                  <motion.div
                    layoutId="progress"
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 0.5, ease: 'easeInOut' }}
                    className={`absolute inset-0 rounded-full ${i === step ? 'bg-primary glow-primary' : 'bg-primary/50'}`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <OnboardingPositionStep
              position={position}
              setPosition={setPosition}
              variants={variants}
            />
          )}

          {step === 2 && (
            <OnboardingSkillStep
              skillLevel={skillLevel}
              setSkillLevel={setSkillLevel}
              variants={variants}
            />
          )}

          {step === 3 && (
            <OnboardingClubStep
              favoriteTeam={favoriteTeam}
              setFavoriteTeam={setFavoriteTeam}
              preferredSize={preferredSize}
              setPreferredSize={setPreferredSize}
              variants={variants}
            />
          )}

          {step === 4 && (
            <OnboardingContactStep
              city={city}
              setCity={setCity}
              phone={phone}
              setPhone={setPhone}
              variants={variants}
            />
          )}
        </AnimatePresence>

        {/* Footer Navigation Controls */}
        <div className="flex items-center justify-between mt-10 pt-8 border-t border-white/10">
          {step > 1 ? (
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button variant="outline" size="lg" onClick={() => setStep((s) => s - 1)} className="stadium-glass border-white/10 text-foreground rounded-2xl cursor-pointer text-lg px-8">
                Back
              </Button>
            </motion.div>
          ) : (
            <div />
          )}

          {step < 4 ? (
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button size="lg" onClick={() => setStep((s) => s + 1)} className="bg-primary text-black hover:bg-primary/90 font-black px-10 py-6 rounded-2xl glow-primary cursor-pointer text-lg h-auto">
                Next Step <ArrowRight className="w-5 h-5 ms-2" />
              </Button>
            </motion.div>
          ) : (
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button size="lg" onClick={handleComplete} disabled={saving} className="bg-primary text-black hover:bg-primary/90 font-black px-10 py-6 rounded-2xl glow-primary cursor-pointer text-lg h-auto w-full sm:w-auto">
                {saving ? 'Saving...' : (
                  <>Complete & Enter Kickoff <Sparkles className="w-5 h-5 ms-2 inline" /></>
                )}
              </Button>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
