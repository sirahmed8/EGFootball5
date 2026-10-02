import * as React from 'react';
import { motion, Variants } from 'framer-motion';
import { Award } from 'lucide-react';

interface OnboardingClubStepProps {
  favoriteTeam: string;
  setFavoriteTeam: (team: string) => void;
  preferredSize: string;
  setPreferredSize: (size: string) => void;
  variants: Variants;
}

const TEAMS = ['Al Ahly', 'Zamalek', 'Real Madrid', 'Barcelona', 'Liverpool', 'Man City', 'Other'];
const PITCH_SIZES = ['5v5', '7v7', '11v11'];

export function OnboardingClubStep({
  favoriteTeam,
  setFavoriteTeam,
  preferredSize,
  setPreferredSize,
  variants,
}: OnboardingClubStepProps) {
  return (
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
            {TEAMS.map((t, idx) => (
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
            {PITCH_SIZES.map((sz, idx) => (
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
  );
}
