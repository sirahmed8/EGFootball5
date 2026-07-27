'use client';

import * as React from 'react';
import { useRouter } from '@/i18n/routing';
import { useAuthStore } from '@/store/useAuthStore';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Star, Award, MapPin, ArrowRight, Check, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function OnboardingPage() {
  const router = useRouter();
  const firebaseUser = useAuthStore((s) => s.firebaseUser);
  const appUser = useAuthStore((s) => s.appUser);

  const [step, setStep] = React.useState(1);
  const [position, setPosition] = React.useState<'GK' | 'DEF' | 'MID' | 'STR'>('MID');
  const [skillLevel, setSkillLevel] = React.useState<number>(3);
  const [favoriteTeam, setFavoriteTeam] = React.useState('Al Ahly');
  const [preferredSize, setPreferredSize] = React.useState('5v5');
  const [city, setCity] = React.useState('Obour');
  const [phone, setPhone] = React.useState(appUser?.phone || '');
  const [saving, setSaving] = React.useState(false);

  const positions = [
    { id: 'GK', label: 'Goalkeeper', icon: '🧤', desc: 'Shot stopper & defense commander' },
    { id: 'DEF', label: 'Defender', icon: '🛡️', desc: 'Solid rock & tackler' },
    { id: 'MID', label: 'Midfielder', icon: '🎯', desc: 'Playmaker & engine' },
    { id: 'STR', label: 'Striker', icon: '⚡', desc: 'Goalscorer & finisher' },
  ];

  const teams = ['Al Ahly', 'Zamalek', 'Real Madrid', 'Barcelona', 'Liverpool', 'Man City', 'Other'];
  const pitchSizes = ['5v5', '7v7', '11v11'];
  const cities = ['Obour', 'Cairo', 'Giza', 'Alexandria'];

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

  return (
    <div className="min-h-screen bg-mesh flex items-center justify-center p-4 py-12 relative overflow-hidden">
      {/* Glow ambient */}
      <div className="absolute top-1/4 start-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-primary/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-2xl stadium-glass border-white/10 rounded-3xl p-6 md:p-10 shadow-2xl relative z-10">
        {/* Step Stepper Header */}
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-black text-lg">
              {step}/4
            </div>
            <div>
              <h1 className="text-xl font-black text-foreground">Player Setup</h1>
              <p className="text-xs text-muted-foreground">Customize your EGFootball5 player card</p>
            </div>
          </div>
          <div className="flex gap-1.5">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === step ? 'w-8 bg-primary glow-primary-sm' : i < step ? 'w-4 bg-primary/50' : 'w-4 bg-white/10'
                }`}
              />
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              <div>
                <h2 className="text-2xl font-black text-foreground flex items-center gap-2">
                  <Shield className="text-primary w-6 h-6" /> Select Your Preferred Position
                </h2>
                <p className="text-sm text-muted-foreground">Which role do you dominate on the turf?</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {positions.map((pos) => (
                  <button
                    key={pos.id}
                    onClick={() => setPosition(pos.id as any)}
                    className={`p-5 rounded-2xl border text-start transition-all cursor-pointer flex items-start gap-4 ${
                      position === pos.id
                        ? 'bg-primary/20 border-primary shadow-lg scale-[1.02]'
                        : 'bg-white/5 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    <span className="text-3xl">{pos.icon}</span>
                    <div>
                      <div className="font-bold text-foreground flex items-center justify-between">
                        {pos.label} <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary font-mono">{pos.id}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{pos.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              <div>
                <h2 className="text-2xl font-black text-foreground flex items-center gap-2">
                  <Star className="text-amber-400 w-6 h-6" /> Rate Your Skill Level
                </h2>
                <p className="text-sm text-muted-foreground">Helps match you with fair lobby games</p>
              </div>

              <div className="space-y-4">
                {[
                  { level: 1, name: 'Beginner', desc: 'Just playing for fun & fitness' },
                  { level: 2, name: 'Amateur', desc: 'Play weekly with friends' },
                  { level: 3, name: 'Semi-Pro', desc: 'Solid technical skills & tactical awareness' },
                  { level: 4, name: 'Pro', desc: 'High pace, competitive & sharp shooter' },
                  { level: 5, name: 'Legend', desc: 'Turf master & match winner' },
                ].map((s) => (
                  <button
                    key={s.level}
                    onClick={() => setSkillLevel(s.level)}
                    className={`w-full p-4 rounded-2xl border flex items-center justify-between transition-all cursor-pointer ${
                      skillLevel === s.level
                        ? 'bg-primary/20 border-primary shadow-lg scale-[1.01]'
                        : 'bg-white/5 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    <div className="text-start">
                      <div className="font-bold text-foreground flex items-center gap-2">
                        {s.name}
                        <div className="flex gap-0.5">
                          {Array.from({ length: s.level }).map((_, idx) => (
                            <Star key={idx} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">{s.desc}</p>
                    </div>
                    {skillLevel === s.level && <Check className="text-primary w-5 h-5" />}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              <div>
                <h2 className="text-2xl font-black text-foreground flex items-center gap-2">
                  <Award className="text-emerald-400 w-6 h-6" /> Club & Pitch Preferences
                </h2>
                <p className="text-sm text-muted-foreground">Select your favorite team and match format</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">
                    Favorite Team
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {teams.map((t) => (
                      <button
                        key={t}
                        onClick={() => setFavoriteTeam(t)}
                        className={`px-4 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                          favoriteTeam === t ? 'bg-primary text-black border-primary font-black shadow-md' : 'bg-white/5 border-white/10 hover:bg-white/10 text-foreground'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">
                    Preferred Field Size
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {pitchSizes.map((sz) => (
                      <button
                        key={sz}
                        onClick={() => setPreferredSize(sz)}
                        className={`p-3 rounded-2xl border text-center font-black transition-all cursor-pointer ${
                          preferredSize === sz ? 'bg-primary text-black border-primary shadow-lg' : 'bg-white/5 border-white/10 hover:bg-white/10 text-foreground'
                        }`}
                      >
                        {sz}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              <div>
                <h2 className="text-2xl font-black text-foreground flex items-center gap-2">
                  <MapPin className="text-cyan-400 w-6 h-6" /> Location & Contact
                </h2>
                <p className="text-sm text-muted-foreground">Final step to unlock your player profile</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">
                    Your City
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {cities.map((c) => (
                      <button
                        key={c}
                        onClick={() => setCity(c)}
                        className={`p-3.5 rounded-2xl border text-start font-bold transition-all cursor-pointer ${
                          city === c ? 'bg-primary text-black border-primary shadow-lg' : 'bg-white/5 border-white/10 hover:bg-white/10 text-foreground'
                        }`}
                      >
                        📍 {c}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">
                    Phone Number (WhatsApp)
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="010XXXXXXXX"
                    className="w-full p-3.5 rounded-2xl bg-white/5 border border-white/10 text-foreground focus:outline-none focus:border-primary text-sm font-medium"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer Navigation Controls */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/10">
          {step > 1 ? (
            <Button variant="outline" onClick={() => setStep((s) => s - 1)} className="stadium-glass border-white/10 text-foreground rounded-2xl cursor-pointer">
              Back
            </Button>
          ) : (
            <div />
          )}

          {step < 4 ? (
            <Button onClick={() => setStep((s) => s + 1)} className="bg-primary text-black hover:bg-primary/90 font-bold px-6 py-3 rounded-2xl glow-primary-sm cursor-pointer">
              Next Step <ArrowRight className="w-4 h-4 ms-2" />
            </Button>
          ) : (
            <Button onClick={handleComplete} disabled={saving} className="bg-primary text-black hover:bg-primary/90 font-black px-8 py-3 rounded-2xl glow-primary cursor-pointer">
              {saving ? 'Saving...' : 'Complete & Enter Kickoff 🚀'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
