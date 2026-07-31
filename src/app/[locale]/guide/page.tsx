'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, ShieldCheck, Clock, CreditCard, Users, AlertOctagon, Sparkles, CheckCircle2, Search, ChevronDown, HelpCircle, FileText } from 'lucide-react';
import { Card } from '@/components/ui/card';

export default function GuidePage() {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [expandedIdx, setExpandedIdx] = React.useState<number | null>(0);

  const rules = [
    {
      category: 'Booking Engine',
      badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      icon: <Clock className="w-6 h-6 text-emerald-400" />,
      title: '1. 15-Minute Exclusive Slot Lock',
      shortDesc: 'Instant 15-minute lock on your selected pitch slot to complete mobile deposit.',
      fullDetails:
        'When you select a stadium pitch slot, our real-time engine locks it exclusively for your account for 15 minutes. During this period, no other player can book the same slot. Complete your deposit payment via Vodafone Cash or InstaPay and upload the transfer receipt to finalize your reservation.',
    },
    {
      category: 'Payments & Passes',
      badgeColor: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
      icon: <CreditCard className="w-6 h-6 text-cyan-400" />,
      title: '2. Deposit & Instant Verification',
      shortDesc: 'Upload transfer screenshot for dynamic SVG QR Match Pass verification.',
      fullDetails:
        'Upload a clear screenshot of your mobile transfer receipt. Pitch administrators verify deposit receipts within minutes. Once approved, a unique dynamic SVG QR Match Pass is issued to your mobile profile, which is scanned at the pitch entrance by the stadium referee.',
    },
    {
      category: 'Match Lobbies',
      badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
      icon: <Users className="w-6 h-6 text-amber-400" />,
      title: '3. Public Match Lobbies ("Hagaz")',
      shortDesc: 'Organize or join public 5-a-side matches with specific tactical position slots.',
      fullDetails:
        'When hosting a public match lobby, set open slots for missing player positions (Goalkeeper [GK], Defender [DEF], Midfielder [MID], Striker [STR]). Joined players receive automated match notifications and must arrive at the pitch 10 minutes prior to kickoff.',
    },
    {
      category: 'Refund Policy',
      badgeColor: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
      icon: <ShieldCheck className="w-6 h-6 text-purple-400" />,
      title: '4. Cancellation & Refund Rules',
      shortDesc: '100% refund guarantee for cancellations made 12+ hours before kickoff.',
      fullDetails:
        'Cancellations requested 12+ hours prior to the match start time qualify for a 100% deposit refund or instant credit transfer to your platform wallet. Cancellations within 12 hours are subject to pitch manager discretion or slot resale.',
    },
    {
      category: 'Fair Play',
      badgeColor: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
      icon: <AlertOctagon className="w-6 h-6 text-rose-400" />,
      title: '5. Fair Play & Anti-Blacklist Charter',
      shortDesc: 'Zero tolerance policy for unexcused no-shows and unsportsmanlike behavior.',
      fullDetails:
        'Unexcused match no-shows, foul language, or abusive behavior toward pitch referees or opposing players result in immediate player account blacklisting across all Obour, Cairo, and Giza partner stadiums.',
    },
  ];

  const filteredRules = rules.filter(
    (r) =>
      r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.shortDesc.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-black py-10 px-4 md:px-8 max-w-5xl mx-auto space-y-8">
      {/* Banner */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4 global-box p-8 md:p-12 rounded-3xl border-white/10 shadow-2xl relative overflow-hidden"
      >
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-black uppercase">
          <BookOpen className="w-4 h-4" /> Official EGFootball5 Charter
        </div>
        <h1 className="text-4xl md:text-6xl font-black text-foreground tracking-tight">
          Platform <span className="text-gradient-primary">Guide & Rules</span>
        </h1>
        <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto font-medium">
          Everything you need to know about booking pitches, deposit holds, match etiquette, and fair play policies.
        </p>

        {/* Search Bar */}
        <div className="max-w-md mx-auto relative pt-2">
          <Search className="w-4 h-4 text-muted-foreground absolute start-4 top-6" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search charter rules, refunds, or slot policies..."
            className="w-full ps-10 pe-4 py-3.5 rounded-2xl bg-white/5 border border-white/10 text-foreground text-xs font-bold focus:outline-none focus:border-primary"
          />
        </div>
      </motion.div>

      {/* Interactive Rules Feed */}
      <div className="space-y-4">
        {filteredRules.map((rule, idx) => {
          const isExpanded = expandedIdx === idx;
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Card
                onClick={() => setExpandedIdx(isExpanded ? null : idx)}
                className="global-box border-white/10 hover:border-primary/40 rounded-3xl p-6 shadow-xl cursor-pointer transition-colors space-y-3 bg-black"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                      {rule.icon}
                    </div>
                    <div>
                      <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${rule.badgeColor}`}>
                        {rule.category}
                      </span>
                      <h3 className="text-lg font-black text-foreground mt-1">{rule.title}</h3>
                    </div>
                  </div>

                  <button className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-foreground transition-transform">
                    <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${isExpanded ? 'rotate-180 text-primary' : ''}`} />
                  </button>
                </div>

                <p className="text-xs text-muted-foreground font-medium leading-relaxed sm:ps-16">
                  {rule.shortDesc}
                </p>

                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      key="details"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                      className="pt-3 border-t border-white/10 sm:ps-16 space-y-2 overflow-hidden"
                    >
                      <p className="text-xs text-foreground/90 font-normal leading-relaxed bg-white/5 p-4 rounded-2xl border border-white/5">
                        {rule.fullDetails}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
