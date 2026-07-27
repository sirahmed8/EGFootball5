'use client';

import * as React from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { collection, addDoc, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { HelpCircle, MessageSquare, Plus, CheckCircle2, Clock, Send, ChevronDown, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { SupportPageSkeleton } from '@/components/skeletons/PageSkeletons';

interface SupportTicket {
  id: string;
  subject: string;
  category: string;
  status: 'open' | 'in_progress' | 'closed';
  createdAt: number;
}

export default function SupportPage() {
  const firebaseUser = useAuthStore((s) => s.firebaseUser);
  const appUser = useAuthStore((s) => s.appUser);

  const [tickets, setTickets] = React.useState<SupportTicket[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [subject, setSubject] = React.useState('');
  const [category, setCategory] = React.useState('Booking Issue');
  const [message, setMessage] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);
  const [isFormOpen, setIsFormOpen] = React.useState(false);

  const mockTickets: SupportTicket[] = [];

  const faqs = [
    { q: 'How does the 15-minute slot lock work?', a: 'When you select a time slot on the booking calendar, it is locked exclusively for you for 15 minutes to complete your Vodafone Cash or InstaPay deposit.' },
    { q: 'What happens after uploading my payment receipt?', a: 'The pitch admin will review your receipt image. Once verified, your booking status changes to Confirmed and your SVG QR Match Pass is generated.' },
    { q: 'Can I cancel or reschedule a booking?', a: 'Yes! Cancellations made at least 12 hours before kickoff receive a 100% deposit refund or slot credit.' },
  ];

  React.useEffect(() => {
    async function fetchTickets() {
      if (!firebaseUser) {
        setTickets([]);
        setLoading(false);
        return;
      }
      try {
        const q = query(collection(db, 'support_tickets'), where('userId', '==', firebaseUser.uid), orderBy('createdAt', 'desc'));
        const snap = await getDocs(q);
        if (!snap.empty) {
          const list = snap.docs.map((d) => ({ id: d.id, ...d.data() } as SupportTicket));
          setTickets(list);
        } else {
          setTickets([]);
        }
      } catch (err) {
        console.error(err);
        setTickets([]);
      } finally {
        setLoading(false);
      }
    }
    fetchTickets();
  }, [firebaseUser]);

  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firebaseUser) {
      toast.error('Please sign in to submit a support ticket');
      return;
    }
    if (!subject.trim() || !message.trim()) return;
    setSubmitting(true);
    try {
      const newTicket = {
        userId: firebaseUser.uid,
        userName: appUser?.name || firebaseUser.displayName || 'Player',
        userEmail: appUser?.email || firebaseUser.email || '',
        subject,
        category,
        message,
        status: 'open',
        createdAt: Date.now(),
      };
      const docRef = await addDoc(collection(db, 'support_tickets'), newTicket);
      setTickets((prev) => [{ id: docRef.id, ...newTicket } as any, ...prev]);
      toast.success('Support ticket submitted successfully! 🎟️');
      setIsFormOpen(false);
      setSubject('');
      setMessage('');
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error.message || 'Failed to submit ticket');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <SupportPageSkeleton />;

  return (
    <div className="min-h-screen bg-mesh py-10 px-4 md:px-8 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 stadium-glass p-8 rounded-3xl border-white/10 shadow-xl">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-black">
            <HelpCircle className="w-4 h-4" /> EGFootball5 Support & Help Center
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-foreground">
            Support <span className="text-gradient-primary">Inbox</span>
          </h1>
          <p className="text-sm text-muted-foreground">We are here to assist with bookings, payments, and stadium rules.</p>
        </div>

        <Button
          onClick={() => setIsFormOpen(true)}
          size="lg"
          className="bg-primary text-black hover:bg-primary/90 font-black px-6 py-6 rounded-2xl glow-primary cursor-pointer flex items-center gap-2"
        >
          <Plus className="w-5 h-5" /> New Support Ticket
        </Button>
      </div>

      {/* FAQ Accordion */}
      <div className="stadium-glass p-6 md:p-8 rounded-3xl border-white/10 shadow-xl space-y-4">
        <h2 className="text-xl font-black text-foreground flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" /> Frequently Asked Questions
        </h2>
        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div key={idx} className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
              <h3 className="font-bold text-foreground text-sm flex items-center justify-between">
                {faq.q}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>

      {/* User Tickets List */}
      <div className="stadium-glass p-6 md:p-8 rounded-3xl border-white/10 shadow-xl space-y-4">
        <h2 className="text-xl font-black text-foreground flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-primary" /> Your Active Support Tickets
        </h2>

        <div className="space-y-3">
          {tickets.map((t) => (
            <div key={t.id} className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
              <div>
                <div className="font-bold text-foreground text-sm">{t.subject}</div>
                <div className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                  <span className="px-2 py-0.5 rounded-full bg-white/10 text-[10px] uppercase font-mono">{t.category}</span>
                  <span>Created {new Date(t.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              <span
                className={`px-3 py-1 rounded-full text-xs font-black uppercase ${
                  t.status === 'open'
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    : t.status === 'in_progress'
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                    : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                }`}
              >
                {t.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Ticket Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-lg stadium-glass border-white/10 rounded-3xl p-6 md:p-8 space-y-4 shadow-2xl relative">
            <h2 className="text-2xl font-black text-foreground">Create Support Ticket</h2>

            <form onSubmit={handleSubmitTicket} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">Subject</label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Summary of issue..."
                  className="w-full p-3.5 rounded-2xl bg-white/5 border border-white/10 text-foreground focus:outline-none focus:border-primary text-sm font-medium"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full p-3.5 rounded-2xl bg-white/5 border border-white/10 text-foreground focus:outline-none focus:border-primary text-sm font-medium"
                >
                  <option value="Booking Issue" className="bg-neutral-900">Booking Issue</option>
                  <option value="Payment Deposit" className="bg-neutral-900">Payment Deposit</option>
                  <option value="Public Match" className="bg-neutral-900">Public Match</option>
                  <option value="Blacklist Appeal" className="bg-neutral-900">Blacklist Appeal</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">Message Detail</label>
                <textarea
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Provide details about your inquiry..."
                  className="w-full p-3.5 rounded-2xl bg-white/5 border border-white/10 text-foreground focus:outline-none focus:border-primary text-sm font-medium h-28 resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)} className="w-1/2 stadium-glass border-white/10 text-foreground rounded-2xl cursor-pointer">
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting} className="w-1/2 bg-primary text-black font-black rounded-2xl glow-primary cursor-pointer">
                  {submitting ? 'Submitting...' : 'Submit Ticket 🚀'}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
