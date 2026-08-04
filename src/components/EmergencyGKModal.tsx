'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { Radio, AlertTriangle, Shield, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

import { Portal } from '@/components/Portal';

interface EmergencyGKModalProps {
  isOpen: boolean;
  onClose: () => void;
  pitchName: string;
  timeSlot: string;
}

export function EmergencyGKModal({ isOpen, onClose, pitchName, timeSlot }: EmergencyGKModalProps) {
  const [broadcasted, setBroadcasted] = React.useState(false);
  if (!isOpen) return null;

  const handleBroadcast = () => {
    setBroadcasted(true);
    toast.success('Emergency Goalkeeper broadcast sent to 24 nearby GKs in Obour! 🧤');
  };

  return (
    <Portal>
      <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-md global-box global-outline-glow rounded-3xl p-6 md:p-8 space-y-5 shadow-2xl relative">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <h2 className="text-xl font-black text-rose-400 flex items-center gap-2">
            <Radio className="w-5 h-5 animate-pulse" /> Emergency GK Call
          </h2>
          <button onClick={onClose} className="text-xs text-muted-foreground hover:text-foreground font-bold">✕ Close</button>
        </div>

        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 space-y-2">
          <p className="text-xs font-semibold text-rose-200">
            Missing a Goalkeeper? Tapping broadcast alerts all registered GKs within a 5 km radius.
          </p>
          <div className="text-xs text-muted-foreground">
            Incentive: The Goalkeeper plays for <strong>FREE</strong> + earns 50 EGP wallet credit.
          </div>
        </div>

        <Button
          onClick={handleBroadcast}
          disabled={broadcasted}
          className={`w-full py-4 font-black rounded-2xl global-btn transition-all ${
            broadcasted
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              : 'bg-rose-500 text-white hover:bg-rose-600 shadow-xl glow-primary'
          }`}
        >
          {broadcasted ? 'Broadcast Active! Waiting for GK...' : 'Broadcast Emergency Alert 🚨'}
        </Button>
      </motion.div>
    </div>
    </Portal>
  );
}
