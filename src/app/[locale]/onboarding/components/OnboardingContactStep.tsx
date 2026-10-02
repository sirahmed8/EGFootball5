import * as React from 'react';
import { motion, Variants } from 'framer-motion';
import { MapPin } from 'lucide-react';

interface OnboardingContactStepProps {
  city: string;
  setCity: (city: string) => void;
  phone: string;
  setPhone: (phone: string) => void;
  variants: Variants;
}

const CITIES = ['Obour', 'Cairo', 'Giza', 'Alexandria'];

export function OnboardingContactStep({
  city,
  setCity,
  phone,
  setPhone,
  variants,
}: OnboardingContactStepProps) {
  return (
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
            {CITIES.map((c, idx) => (
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
  );
}
