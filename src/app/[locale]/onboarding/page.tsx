'use client';

import * as React from 'react';
import { useRouter } from '@/i18n/routing';
import { useAuthStore } from '@/store/useAuthStore';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, Sparkles, Check, Lock, User, Award, Shield, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { OnboardingPositionStep, PositionType } from './components/OnboardingPositionStep';
import { OnboardingSkillStep } from './components/OnboardingSkillStep';
import { OnboardingClubStep } from './components/OnboardingClubStep';
import { OnboardingContactStep } from './components/OnboardingContactStep';

const STEPS = [
  { id: 1, label: 'Position', icon: User },
  { id: 2, label: 'Skill', icon: Award },
  { id: 3, label: 'Squad & Size', icon: Shield },
  { id: 4, label: 'Location & Phone', icon: MapPin },
];

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

  const isPhoneValid = phone.trim().replace(/\D/g, '').length >= 10;

  const handleStepClick = (targetStep: number) => {
    if (targetStep < step) {
      // Completed steps are revisitable
      setStep(targetStep);
    } else if (targetStep > step) {
      toast.info('Please complete current step before proceeding');
    }
  };

  const handleNext = () => {
    if (step < 4) {
      setStep((s) => s + 1);
    }
  };

  const handleComplete = async () => {
    if (!firebaseUser) {
      toast.error('User not authenticated');
      return;
    }
    if (!isPhoneValid) {
      toast.error('Please enter a valid phone number (minimum 10 digits)');
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
          phone: phone.trim(),
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
    initial: { opacity: 0, x: 30, filter: 'blur(8px)' },
    animate: { opacity: 1, x: 0, filter: 'blur(0px)' },
    exit: { opacity: 0, x: -30, filter: 'blur(8px)' },
  };

  return (
    <div className="min-h-screen bg-mesh flex items-center justify-center p-4 py-12 relative overflow-hidden font-sans text-foreground">
      {/* Ambient lighting */}
      <div className="absolute top-1/4 start-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-primary/15 rounded-full blur-[140px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-2xl bg-card/80 border border-border rounded-[2rem] p-6 md:p-10 shadow-2xl relative z-10 backdrop-blur-2xl"
      >
        {/* Step Stepper Header with Strict Causality & Locked Future States */}
        <div className="mb-8 pb-6 border-b border-border space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-black text-base shadow-sm">
                {step}/4
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-black text-foreground tracking-tight">
                  Player Setup: <span className="text-primary">{STEPS[step - 1].label}</span>
                </h1>
                <p className="text-xs text-muted-foreground font-medium">Step-by-step player profile initialization</p>
              </div>
            </div>
          </div>

          {/* Stepper Milestones */}
          <div className="grid grid-cols-4 gap-2 pt-2">
            {STEPS.map((s) => {
              const isCompleted = s.id < step;
              const isActive = s.id === step;
              const isLocked = s.id > step;

              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => handleStepClick(s.id)}
                  disabled={isLocked}
                  className={`p-2 rounded-2xl border text-start transition-all flex flex-col gap-1 select-none ${
                    isCompleted
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 cursor-pointer hover:bg-emerald-500/20'
                      : isActive
                      ? 'bg-primary/20 border-primary text-foreground shadow-md ring-1 ring-primary/40'
                      : 'bg-muted/40 border-border/50 text-muted-foreground opacity-60 cursor-not-allowed'
                  }`}
                  title={isCompleted ? `Revisit ${s.label}` : isActive ? `Active: ${s.label}` : `Locked: Complete prior steps first`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold">Step {s.id}</span>
                    {isCompleted ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : isLocked ? (
                      <Lock className="w-3 h-3 text-muted-foreground" />
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    )}
                  </div>
                  <span className="text-[11px] font-bold truncate hidden sm:block">
                    {s.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step Body */}
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
        <div className="flex items-center justify-between mt-10 pt-8 border-t border-border">
          {step > 1 ? (
            <Button
              variant="outline"
              size="lg"
              onClick={() => setStep((s) => s - 1)}
              className="border-border text-foreground hover:bg-muted rounded-2xl cursor-pointer text-sm px-6 h-12"
            >
              <ArrowLeft className="w-4 h-4 me-2" /> Back
            </Button>
          ) : (
            <div />
          )}

          {step < 4 ? (
            <Button
              size="lg"
              onClick={handleNext}
              className="bg-primary text-black hover:bg-primary/90 font-black px-8 py-3 rounded-2xl glow-primary cursor-pointer text-sm h-12 shadow-md"
            >
              Next Step <ArrowRight className="w-4 h-4 ms-2" />
            </Button>
          ) : (
            <Button
              size="lg"
              onClick={handleComplete}
              disabled={saving || !isPhoneValid}
              className="bg-primary text-black hover:bg-primary/90 font-black px-8 py-3 rounded-2xl glow-primary cursor-pointer text-sm h-12 shadow-md disabled:opacity-50"
            >
              {saving ? 'Saving...' : (
                <>Complete Setup <Sparkles className="w-4 h-4 ms-2 inline" /></>
              )}
            </Button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
