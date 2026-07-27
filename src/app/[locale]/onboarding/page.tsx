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
            <motion.div
              key="step1"
              variants={variants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.4 }}
              className="space-y-8"
            >
              <div>
                <h2 className="text-3xl font-black text-foreground flex items-center gap-3">
                  <Shield className="text-primary w-8 h-8" /> Select Your Preferred Position
                </h2>
                <p className="text-base text-muted-foreground mt-2">Which role do you dominate on the turf?</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {positions.map((pos, idx) => (
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    key={pos.id}
                    onClick={() => setPosition(pos.id as any)}
                    className={`p-6 rounded-2xl border text-start transition-all cursor-pointer flex items-start gap-4 relative overflow-hidden group ${
                      position === pos.id
                        ? 'bg-primary/20 border-primary shadow-xl glow-primary-sm'
                        : 'bg-white/5 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    {position === pos.id && (
                      <motion.div layoutId="pos-outline" className="absolute inset-0 border-2 border-primary rounded-2xl pointer-events-none glow-primary" />
                    )}
                    <span className="text-4xl group-hover:scale-110 transition-transform">{pos.icon}</span>
                    <div className="flex-1">
                      <div className="font-bold text-lg text-foreground flex items-center justify-between">
                        {pos.label} <span className="text-xs px-2.5 py-1 rounded-full bg-primary/20 text-primary font-mono tracking-wider">{pos.id}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1.5 font-medium">{pos.desc}</p>
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              variants={variants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.4 }}
              className="space-y-8"
            >
              <div>
                <h2 className="text-3xl font-black text-foreground flex items-center gap-3">
                  <Star className="text-amber-400 w-8 h-8" /> Rate Your Skill Level
                </h2>
                <p className="text-base text-muted-foreground mt-2">Helps match you with fair lobby games</p>
              </div>

              <div className="space-y-4">
                {[
                  { level: 1, name: 'Beginner', desc: 'Just playing for fun & fitness' },
                  { level: 2, name: 'Amateur', desc: 'Play weekly with friends' },
                  { level: 3, name: 'Semi-Pro', desc: 'Solid technical skills & tactical awareness' },
                  { level: 4, name: 'Pro', desc: 'High pace, competitive & sharp shooter' },
                  { level: 5, name: 'Legend', desc: 'Turf master & match winner' },
                ].map((s, idx) => (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.99 }}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    key={s.level}
                    onClick={() => setSkillLevel(s.level)}
                    className={`w-full p-5 rounded-2xl border flex items-center justify-between transition-all cursor-pointer relative ${
                      skillLevel === s.level
                        ? 'bg-primary/10 border-primary shadow-lg'
                        : 'bg-white/5 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    {skillLevel === s.level && (
                      <motion.div layoutId="skill-outline" className="absolute inset-0 border-2 border-primary rounded-2xl pointer-events-none glow-primary-sm" />
                    )}
                    <div className="text-start">
                      <div className="font-bold text-lg text-foreground flex items-center gap-3">
                        {s.name}
                        <div className="flex gap-1">
                          {Array.from({ length: 5 }).map((_, starIdx) => (
                            <motion.div
                              key={starIdx}
                              initial={skillLevel === s.level ? { opacity: 0, scale: 0, rotate: -45 } : false}
                              animate={{ opacity: 1, scale: 1, rotate: 0 }}
                              transition={{ delay: skillLevel === s.level ? starIdx * 0.1 : 0 }}
                            >
                              <Star
                                className={`w-4 h-4 ${
                                  starIdx < s.level ? 'fill-amber-400 text-amber-400 filter drop-shadow-[0_0_5px_rgba(251,191,36,0.5)]' : 'fill-white/10 text-white/20'
                                }`}
                              />
                            </motion.div>
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{s.desc}</p>
                    </div>
                    {skillLevel === s.level && (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                        <Check className="text-primary w-6 h-6" />
                      </motion.div>
                    )}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              variants={variants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.4 }}
              className="space-y-8"
            >
              <div>
                <h2 className="text-3xl font-black text-foreground flex items-center gap-3">
                  <Award className="text-emerald-400 w-8 h-8" /> Club & Pitch Preferences
                </h2>
                <p className="text-base text-muted-foreground mt-2">Select your favorite team and match format</p>
              </div>

              <div className="space-y-8">
                <div>
                  <label className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-4 block">
                    Favorite Team
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {teams.map((t, idx) => (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.05 }}
                        key={t}
                        onClick={() => setFavoriteTeam(t)}
                        className={`px-5 py-2.5 rounded-xl border text-sm font-bold transition-all cursor-pointer relative ${
                          favoriteTeam === t ? 'bg-primary text-black border-primary font-black shadow-lg glow-primary-sm' : 'bg-white/5 border-white/10 hover:bg-white/10 text-foreground'
                        }`}
                      >
                        {favoriteTeam === t && <motion.div layoutId="team-bg" className="absolute inset-0 bg-primary rounded-xl -z-10" />}
                        <span className="relative z-10">{t}</span>
                      </motion.button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-4 block">
                    Preferred Field Size
                  </label>
                  <div className="grid grid-cols-3 gap-4">
                    {pitchSizes.map((sz, idx) => (
                      <motion.button
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        key={sz}
                        onClick={() => setPreferredSize(sz)}
                        className={`p-4 rounded-2xl border text-center font-black text-lg transition-all cursor-pointer relative overflow-hidden ${
                          preferredSize === sz ? 'bg-primary text-black border-primary shadow-lg' : 'bg-white/5 border-white/10 hover:bg-white/10 text-foreground'
                        }`}
                      >
                        {preferredSize === sz && <motion.div layoutId="pitch-bg" className="absolute inset-0 bg-primary rounded-2xl -z-10 glow-primary-sm" />}
                        <span className="relative z-10">{sz}</span>
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="step4"
              variants={variants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.4 }}
              className="space-y-8"
            >
              <div>
                <h2 className="text-3xl font-black text-foreground flex items-center gap-3">
                  <MapPin className="text-cyan-400 w-8 h-8" /> Location & Contact
                </h2>
                <p className="text-base text-muted-foreground mt-2">Final step to unlock your player profile</p>
              </div>

              <div className="space-y-8">
                <div>
                  <label className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-4 block">
                    Your City
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    {cities.map((c, idx) => (
                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        initial={{ opacity: 0, x: idx % 2 === 0 ? -20 : 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        key={c}
                        onClick={() => setCity(c)}
                        className={`p-4 rounded-2xl border text-start font-bold text-lg transition-all cursor-pointer relative overflow-hidden ${
                          city === c ? 'bg-primary text-black border-primary shadow-lg' : 'bg-white/5 border-white/10 hover:bg-white/10 text-foreground'
                        }`}
                      >
                        {city === c && <motion.div layoutId="city-bg" className="absolute inset-0 bg-primary rounded-2xl -z-10 glow-primary-sm" />}
                        <span className="relative z-10 flex items-center gap-2">📍 {c}</span>
                      </motion.button>
                    ))}
                  </div>
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <label className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-4 block">
                    Phone Number (WhatsApp)
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="010XXXXXXXX"
                    className="w-full p-4 rounded-2xl bg-white/5 border border-white/10 text-foreground text-lg focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all font-medium"
                  />
                </motion.div>
              </div>
            </motion.div>
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
