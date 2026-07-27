'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { Crown, CheckCircle2, Sparkles, Shield, Zap, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';

export default function SubscriptionPage() {
  const [subscribed, setSubscribed] = React.useState(false);

  const perks = [
    '10% Flat Discount on all Off-Peak Stadium Slot Bookings',
    'Priority Join Queue for Full Public Match Lobbies ("Hagaz")',
    'Free Tournament Entry Voucher for Monthly Cup Galas',
    'Golden VIP Crown Badge displayed on Player Profile Card',
    'Instant Rain & Weather Guarantee Slot Credit Refund',
  ];

  return (
    <div className="min-h-screen bg-mesh py-10 px-4 md:px-8 max-w-4xl mx-auto space-y-8">
      {/* Banner */}
      <div className="text-center space-y-4 stadium-glass p-8 md:p-12 rounded-3xl border-white/10 shadow-2xl relative overflow-hidden">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-black uppercase">
          <Crown className="w-4 h-4 text-amber-400" /> VIP Player Membership
        </div>
        <h1 className="text-4xl md:text-6xl font-black text-foreground tracking-tight">
          Pitch Pass <span className="text-gradient-primary">VIP Pass</span>
        </h1>
        <p className="text-sm md:text-base text-muted-foreground max-w-xl mx-auto font-medium">
          Unlock exclusive discounts, priority match queues, and VIP tournament passes across all Obour & Cairo stadiums.
        </p>
      </div>

      {/* Subscription Card */}
      <Card className="stadium-glass border-amber-500/40 rounded-3xl p-8 shadow-2xl space-y-6 relative overflow-hidden glow-primary-sm max-w-2xl mx-auto">
        <div className="flex items-center justify-between border-b border-white/10 pb-6">
          <div>
            <span className="text-xs font-black uppercase text-amber-400">Monthly Membership</span>
            <h2 className="text-3xl font-black text-foreground">Pitch Pass Premium</h2>
          </div>
          <div className="text-end">
            <span className="text-4xl font-black text-amber-400 font-mono">199 EGP</span>
            <span className="text-xs text-muted-foreground block font-bold">/ month</span>
          </div>
        </div>

        <div className="space-y-3">
          {perks.map((perk, idx) => (
            <div key={idx} className="flex items-center gap-3 text-sm font-semibold text-foreground">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              <span>{perk}</span>
            </div>
          ))}
        </div>

        <Button
          onClick={() => {
            setSubscribed(true);
            toast.success('Congratulations! You are now a Pitch Pass VIP Member 👑');
          }}
          disabled={subscribed}
          size="lg"
          className={`w-full py-6 text-lg font-black rounded-2xl cursor-pointer transition-all ${
            subscribed
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              : 'bg-gradient-to-r from-amber-400 to-amber-500 text-black hover:from-amber-500 hover:to-amber-600 shadow-xl glow-primary'
          }`}
        >
          <Crown className="w-5 h-5 me-2" />
          {subscribed ? 'VIP Membership Active ✓' : 'Upgrade to VIP (199 EGP/mo)'}
        </Button>
      </Card>
    </div>
  );
}
