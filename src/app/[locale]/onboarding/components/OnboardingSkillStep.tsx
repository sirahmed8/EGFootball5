import * as React from 'react';
import { motion, Variants } from 'framer-motion';
import { Star, Check } from 'lucide-react';

interface OnboardingSkillStepProps {
  skillLevel: number;
  setSkillLevel: (level: number) => void;
  variants: Variants;
}

const SKILL_LEVELS = [
  { level: 1, name: 'Beginner', desc: 'Just playing for fun & fitness' },
  { level: 2, name: 'Amateur', desc: 'Play weekly with friends' },
  { level: 3, name: 'Semi-Pro', desc: 'Solid technical skills & tactical awareness' },
  { level: 4, name: 'Pro', desc: 'High pace, competitive & sharp shooter' },
  { level: 5, name: 'Legend', desc: 'Turf master & match winner' },
];

export function OnboardingSkillStep({
  skillLevel,
  setSkillLevel,
  variants,
}: OnboardingSkillStepProps) {
  return (
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
        {SKILL_LEVELS.map((s, idx) => (
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
  );
}
