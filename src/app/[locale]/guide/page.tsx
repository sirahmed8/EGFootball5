'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, ShieldCheck, Clock, CreditCard, Users, AlertOctagon, Sparkles, CheckCircle2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function GuidePage() {
  const rules = [
    {
      icon: <Clock className="w-6 h-6 text-primary" />,
      title: '1. 15-Minute Exclusive Slot Lock',
      desc: 'When you pick a pitch and time slot, our engine locks it exclusively for your account for 15 minutes. Complete your deposit payment via Vodafone Cash or InstaPay to confirm.',
    },
    {
      icon: <CreditCard className="w-6 h-6 text-emerald-400" />,
      title: '2. Deposit & Instant Verification',
      desc: 'Upload a clear screenshot of your mobile transfer receipt. Pitch administrators verify deposit receipts within minutes to grant your dynamic SVG QR Match Pass.',
    },
    {
      icon: <Users className="w-6 h-6 text-cyan-400" />,
      title: '3. Public Match Lobbies ("Hagaz")',
      desc: 'If hosting a public match, ensure open spots match required player positions (GK, DEF, MID, STR). Players who join must arrive 10 minutes before kickoff.',
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-amber-400" />,
      title: '4. Cancellation & Refund Rules',
      desc: 'Cancellations made 12+ hours prior to match start qualify for 100% deposit refund or credit towards your next booking.',
    },
    {
      icon: <AlertOctagon className="w-6 h-6 text-rose-400" />,
      title: '5. Fair Play & Anti-Blacklist Charter',
      desc: 'Unexcused no-shows or abusive behavior towards pitch admins or opponents will result in immediate player account blacklisting across all Obour stadiums.',
    },
  ];

  return (
    <div className="min-h-screen bg-mesh py-10 px-4 md:px-8 max-w-5xl mx-auto space-y-8">
      {/* Banner */}
      <div className="text-center space-y-4 stadium-glass p-8 md:p-12 rounded-3xl border-white/10 shadow-2xl relative overflow-hidden">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-black uppercase">
          <BookOpen className="w-4 h-4" /> Official EGFootball5 Charter
        </div>
        <h1 className="text-4xl md:text-6xl font-black text-foreground tracking-tight">
          Platform <span className="text-gradient-primary">Guide & Rules</span>
        </h1>
        <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto font-medium">
          Everything you need to know about booking pitches, deposit holds, match etiquette, and fair play policies.
        </p>
      </div>

      {/* Rules Cards */}
      <div className="space-y-4">
        {rules.map((rule, idx) => (
          <motion.div key={idx} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.1 }}>
            <Card className="stadium-glass border-white/10 hover:border-primary/40 rounded-3xl p-6 shadow-xl card-lift flex flex-col md:flex-row items-start gap-5">
              <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 shadow-inner">
                {rule.icon}
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-black text-foreground">{rule.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed font-medium">{rule.desc}</p>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
