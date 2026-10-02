import * as React from 'react';
import { motion, Variants } from 'framer-motion';
import { Shield } from 'lucide-react';

export type PositionType = 'GK' | 'DEF' | 'MID' | 'STR';

interface OnboardingPositionStepProps {
  position: PositionType;
  setPosition: (pos: PositionType) => void;
  variants: Variants;
}

const POSITIONS: { id: PositionType; label: string; icon: string; desc: string }[] = [
  { id: 'GK', label: 'Goalkeeper', icon: '🧤', desc: 'Shot stopper & defense commander' },
  { id: 'DEF', label: 'Defender', icon: '🛡️', desc: 'Solid rock & tackler' },
  { id: 'MID', label: 'Midfielder', icon: '🎯', desc: 'Playmaker & engine' },
  { id: 'STR', label: 'Striker', icon: '⚡', desc: 'Goalscorer & finisher' },
];

export function OnboardingPositionStep({
  position,
  setPosition,
  variants,
}: OnboardingPositionStepProps) {
  return (
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
        {POSITIONS.map((pos, idx) => (
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            key={pos.id}
            onClick={() => setPosition(pos.id)}
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
  );
}
