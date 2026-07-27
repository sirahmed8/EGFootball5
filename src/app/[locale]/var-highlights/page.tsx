'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { Camera, Play, Share2, Sparkles, Flame, Film, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';

export default function VarHighlightsPage() {
  const [selectedClip, setSelectedClip] = React.useState<any>(null);
  const clips: any[] = [];

  return (
    <div className="min-h-screen bg-mesh py-10 px-4 md:px-8 max-w-6xl mx-auto space-y-8">
      {/* Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 stadium-glass p-8 rounded-3xl border-white/10 shadow-xl">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-black">
            <Camera className="w-4 h-4" /> Automated Pitch VAR Cameras
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-foreground">
            Pitch <span className="text-gradient-primary">VAR Highlights</span>
          </h1>
          <p className="text-sm text-muted-foreground">30-second automated video highlights recorded from partner stadium HD cameras.</p>
        </div>
      </div>

      {/* Main Video Player */}
      {selectedClip ? (
        <Card className="stadium-glass border-white/10 rounded-3xl p-6 shadow-2xl space-y-4">
          <div className="w-full h-80 md:h-[420px] rounded-2xl bg-emerald-950/80 border-2 border-emerald-500/40 flex flex-col items-center justify-center relative overflow-hidden group shadow-inner">
            <span className="text-7xl group-hover:scale-110 transition-transform">{selectedClip.videoEmoji}</span>
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Button size="lg" className="bg-primary text-black rounded-full p-6 glow-primary cursor-pointer">
                <Play className="w-8 h-8 fill-black" />
              </Button>
            </div>
            <div className="absolute bottom-4 start-4 px-3 py-1 rounded-full bg-black/80 text-xs font-bold text-emerald-400 border border-emerald-500/30">
              EGFootball5 VAR HD Recording
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
            <div>
              <h2 className="text-2xl font-black text-foreground">{selectedClip.title}</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Player: <strong className="text-foreground">{selectedClip.player}</strong> • Stadium: {selectedClip.pitch} ({selectedClip.time})
              </p>
            </div>

            <Button
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                toast.success('Clip link copied! Ready to share on TikTok & Instagram 📲');
              }}
              className="bg-primary text-black hover:bg-primary/90 font-black px-6 py-3.5 rounded-2xl glow-primary-sm cursor-pointer flex items-center gap-2"
            >
              <Share2 className="w-4 h-4" /> Share VAR Clip
            </Button>
          </div>
        </Card>
      ) : (
        <div className="stadium-glass border-white/10 rounded-3xl p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center mx-auto text-primary">
            <Film className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-black text-foreground">No VAR Highlights Recorded Yet</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Book a pitch slot with automated HD video recording to capture your goals and skills live!
          </p>
        </div>
      )}

      {/* Clips Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {clips.map((c) => (
          <motion.div key={c.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
            <Card
              onClick={() => setSelectedClip(c)}
              className={`stadium-glass border-white/10 rounded-3xl p-5 shadow-lg cursor-pointer card-lift ${
                selectedClip.id === c.id ? 'border-primary glow-primary-sm' : ''
              }`}
            >
              <div className="w-full h-36 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-4xl mb-3">
                {c.videoEmoji}
              </div>
              <h3 className="font-black text-sm text-foreground">{c.title}</h3>
              <p className="text-xs text-muted-foreground">{c.player} • {c.views} views</p>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
