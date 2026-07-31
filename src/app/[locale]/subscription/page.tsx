'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { Crown, CheckCircle2, Sparkles, Shield, Zap, Award, Clock, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';

export default function SubscriptionPage() {
  const [subscribed, setSubscribed] = React.useState(false);

  const perks = [
    { title: '10% Off Off-Peak Slots', desc: 'Flat 10% discount on daytime & weekday bookings across all stadiums.' },
    { title: '15-Min Deposit Extension', desc: 'Extra 5 minutes reserved buffer to complete Vodafone Cash / InstaPay transfers.' },
    { title: 'Golden VIP Profile Badge', desc: 'Shiny VIP Crown badge displayed on your public player profile card.' },
    { title: 'Free Monthly Cup Pass', desc: 'Free entry voucher into monthly community knockout tournament galas.' },
    { title: 'Instant Weather Refund Guarantee', desc: 'Automatic 100% wallet credit refund if heavy rain cancels your pitch slot.' },
  ];

  return (
    <div className="min-h-screen bg-black py-10 px-4 md:px-8 max-w-5xl mx-auto space-y-10">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4 global-box p-8 md:p-12 rounded-3xl border-amber-500/20 shadow-2xl relative overflow-hidden"
      >
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-black uppercase">
          <Crown className="w-4 h-4 text-amber-400 animate-pulse" /> VIP Player Pass
        </div>
        <h1 className="text-4xl md:text-6xl font-black text-foreground tracking-tight">
          Pitch Pass <span className="text-gradient-primary">VIP Pass</span>
        </h1>
        <p className="text-sm md:text-base text-muted-foreground max-w-xl mx-auto font-medium">
          Fair, premium perks designed for dedicated 5-a-side players across Obour City, Cairo, and Giza.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        {/* 3D Animated VIP Pass Card */}
        <motion.div
          initial={{ rotateY: -10, rotateX: 5 }}
          whileHover={{ rotateY: 0, rotateX: 0, scale: 1.02 }}
          className="global-box border-2 border-amber-500/40 rounded-3xl p-6 md:p-8 shadow-2xl space-y-6 relative overflow-hidden bg-black glow-primary-sm"
        >
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-black tracking-widest text-amber-400 uppercase">EGFootball5 VIP Pass</span>
              <h3 className="text-2xl font-black text-foreground mt-1">PITCH PASS PREMIUM</h3>
            </div>
            <Sparkles className="w-8 h-8 text-amber-400 animate-spin" />
          </div>

          <div className="space-y-1">
            <div className="text-xs font-mono text-amber-400/60">CARD STATUS</div>
            <div className="text-lg md:text-xl font-black font-mono tracking-widest text-amber-400">
              COMING SOON 💳
            </div>
          </div>

          <div className="flex justify-between items-end border-t border-amber-500/20 pt-4">
            <div>
              <span className="text-[10px] text-muted-foreground uppercase font-bold block">Status</span>
              <span className="text-xs font-black text-amber-400">LAUNCHING SOON ⚡</span>
            </div>
            <div className="text-end">
              <span className="text-[10px] text-muted-foreground uppercase font-bold block">Valid Across</span>
              <span className="text-xs font-bold text-foreground">All Partner Turfs</span>
            </div>
          </div>
        </motion.div>

        {/* Subscription Plan & Perks */}
        <Card className="global-box border-amber-500/30 rounded-3xl p-6 md:p-8 shadow-2xl space-y-6 bg-black">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <span className="text-xs font-black uppercase text-amber-400">Monthly Membership</span>
              <h2 className="text-2xl font-black text-foreground">Pitch Pass Premium</h2>
            </div>
            <div className="text-end">
              <span className="text-3xl font-black text-amber-400 font-mono">199 EGP</span>
              <span className="text-xs text-muted-foreground block font-bold">/ month</span>
            </div>
          </div>

          <div className="space-y-4">
            {perks.map((perk, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-black text-foreground">{perk.title}</h4>
                  <p className="text-[11px] text-muted-foreground font-medium">{perk.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <Button
            disabled={true}
            size="lg"
            className="w-full py-6 text-base font-black rounded-2xl cursor-not-allowed bg-amber-500/20 text-amber-400 border border-amber-500/40"
          >
            <Crown className="w-5 h-5 me-2" />
            Payment Gateway Launching Soon (SOON)
          </Button>
        </Card>
      </div>
    </div>
  );
}
