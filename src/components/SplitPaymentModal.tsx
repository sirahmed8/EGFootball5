'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { Share2, Copy, Check, Users, DollarSign, QrCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface SplitPaymentModalProps {
  totalAmount: number;
  numPlayers: number;
  isOpen: boolean;
  onClose: () => void;
}

export function SplitPaymentModal({ totalAmount, numPlayers, isOpen, onClose }: SplitPaymentModalProps) {
  const [copied, setCopied] = React.useState(false);
  if (!isOpen) return null;

  const costPerPerson = (totalAmount / Math.max(1, numPlayers)).toFixed(0);
  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/checkout?split=true` : '';

  const handleCopy = () => {
    navigator.clipboard.writeText(`Hey team! Here is our 5-a-side match payment link. Pay your ${costPerPerson} EGP share here: ${shareUrl}`);
    setCopied(true);
    toast.success('Split payment link copied to clipboard! 📲');
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-md stadium-glass border-white/10 rounded-3xl p-6 md:p-8 space-y-5 shadow-2xl relative">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <h2 className="text-xl font-black text-foreground flex items-center gap-2">
            <span>💸</span> Split Payment Link
          </h2>
          <button onClick={onClose} className="text-xs text-muted-foreground hover:text-foreground font-bold">✕ Close</button>
        </div>

        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center space-y-1">
          <span className="text-xs font-bold text-muted-foreground uppercase">Each Player Pays</span>
          <div className="text-3xl font-black text-primary font-mono">{costPerPerson} EGP</div>
          <span className="text-xs text-muted-foreground block">Total: {totalAmount} EGP divided by {numPlayers} players</span>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-muted-foreground uppercase block">Share Link via WhatsApp</label>
          <div className="flex gap-2">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="flex-1 p-3 rounded-xl bg-white/5 border border-white/10 text-xs font-mono text-foreground"
            />
            <Button onClick={handleCopy} className="bg-primary text-black font-black rounded-xl px-4 cursor-pointer">
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        <Button onClick={handleCopy} className="w-full py-4 bg-emerald-500 text-black hover:bg-emerald-400 font-black rounded-2xl glow-primary cursor-pointer flex items-center justify-center gap-2">
          <Share2 className="w-4 h-4" /> Share on WhatsApp
        </Button>
      </motion.div>
    </div>
  );
}
