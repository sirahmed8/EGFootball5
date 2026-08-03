'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { Camera, Play, Share2, Film, Upload, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/useAuthStore';
import { collection, getDocs, addDoc, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

interface VarClip {
  id: string;
  title: string;
  player: string;
  pitch: string;
  time: string;
  videoUrl?: string;
  category?: string;
}

export default function VarHighlightsPage() {
  const appUser = useAuthStore((s) => s.appUser);
  const isOwnerOrAdmin = appUser?.role === 'admin' || appUser?.role === 'owner';

  const [clips, setClips] = React.useState<VarClip[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [selectedClip, setSelectedClip] = React.useState<VarClip | null>(null);

  // Upload modal state
  const [isUploadOpen, setIsUploadOpen] = React.useState(false);
  const [newTitle, setNewTitle] = React.useState('');
  const [newPlayer, setNewPlayer] = React.useState('');
  const [newPitch, setNewPitch] = React.useState((appUser as any)?.pitchName || appUser?.city || 'Obour Main Stadium');
  const [newVideoUrl, setNewVideoUrl] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    async function fetchClips() {
      setLoading(true);
      try {
        const snap = await getDocs(query(collection(db, 'var_highlights'), orderBy('timestamp', 'desc')));
        if (!snap.empty) {
          const list = snap.docs.map((d) => ({ id: d.id, ...d.data() } as VarClip));
          setClips(list);
          setSelectedClip(list[0]);
        } else {
          setClips([]);
        }
      } catch (err) {
        console.error(err);
        setClips([]);
      } finally {
        setLoading(false);
      }
    }
    fetchClips();
  }, []);

  const handleUploadClip = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      toast.error('Please enter a clip title');
      return;
    }
    setSubmitting(true);
    try {
      const clipDoc = {
        title: newTitle.trim(),
        player: newPlayer.trim() || appUser?.name || 'Featured Player',
        pitch: newPitch.trim() || 'Obour Stadium',
        time: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        videoUrl: newVideoUrl.trim() || '',
        timestamp: Date.now(),
      };
      const docRef = await addDoc(collection(db, 'var_highlights'), clipDoc);
      const added = { id: docRef.id, ...clipDoc };
      setClips((prev) => [added, ...prev]);
      setSelectedClip(added);
      toast.success('VAR Highlight clip published live! 🎥');
      setIsUploadOpen(false);
      setNewTitle('');
      setNewPlayer('');
      setNewVideoUrl('');
    } catch (err) {
      console.error(err);
      toast.error('Failed to publish VAR clip');
    } finally {
      setSubmitting(false);
    }
  };

  const [isSlowMo, setIsSlowMo] = React.useState(false);
  const [upvotes, setUpvotes] = React.useState<Record<string, number>>({});

  const handleUpvote = (id: string) => {
    setUpvotes((prev) => ({ ...prev, [id]: (prev[id] || 12) + 1 }));
    toast.success('Vote submitted for VAR Goal of the Week! 🗳️⚽');
  };

  return (
    <div className="min-h-screen bg-black py-10 px-4 md:px-8 max-w-6xl mx-auto space-y-8">
      {/* Banner */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 global-box p-8 rounded-3xl border-white/10 shadow-xl"
      >
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-black">
            <Camera className="w-4 h-4" /> Stadium Pitch VAR Highlights 2.0
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-foreground">
            Pitch <span className="text-gradient-primary">VAR Studio</span>
          </h1>
          <p className="text-sm text-muted-foreground">30-second automated video highlights, 0.25x slow-mo VAR review, and community goal voting.</p>
        </div>

        {isOwnerOrAdmin && (
          <Button
            onClick={() => setIsUploadOpen(true)}
            size="lg"
            className="bg-primary text-black hover:bg-primary/90 font-black rounded-2xl glow-primary cursor-pointer flex items-center gap-2"
          >
            <Plus className="w-5 h-5" /> Upload VAR Highlight
          </Button>
        )}
      </motion.div>

      {/* Main Video Player */}
      {selectedClip ? (
        <Card className="global-box border-white/10 rounded-3xl p-6 shadow-2xl space-y-4">
          <div className="w-full h-80 md:h-[420px] rounded-2xl bg-black border-2 border-emerald-500/40 flex flex-col items-center justify-center relative overflow-hidden group shadow-inner">
            <span className={`text-7xl group-hover:scale-110 transition-transform ${isSlowMo ? 'animate-pulse' : ''}`}>⚽</span>
            
            <div className="absolute top-4 start-4 flex items-center gap-2 z-20">
              <Button
                size="sm"
                variant={isSlowMo ? 'default' : 'outline'}
                onClick={() => setIsSlowMo(!isSlowMo)}
                className="text-xs font-black rounded-xl bg-black/80 backdrop-blur border border-cyan-500/40 text-cyan-400"
              >
                {isSlowMo ? '🔍 VAR 0.25x SLOW-MO ACTIVE' : '▶ 1.0x NORMAL SPEED'}
              </Button>
            </div>

            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Button size="lg" className="bg-primary text-black rounded-full p-6 glow-primary cursor-pointer">
                <Play className="w-8 h-8 fill-black" />
              </Button>
            </div>
            <div className="absolute bottom-4 start-4 px-3 py-1 rounded-full bg-black/90 text-xs font-bold text-emerald-400 border border-emerald-500/30">
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

            <div className="flex items-center gap-2">
              <Button
                onClick={() => handleUpvote(selectedClip.id)}
                variant="outline"
                className="font-black px-4 py-3 rounded-2xl border-white/10 text-xs flex items-center gap-2 cursor-pointer"
              >
                👍 Vote Clip ({upvotes[selectedClip.id] || 12})
              </Button>

              <Button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  toast.success('Clip link copied!');
                }}
                className="bg-primary text-black hover:bg-primary/90 font-black px-6 py-3.5 rounded-2xl glow-primary-sm cursor-pointer flex items-center gap-2"
              >
                <Share2 className="w-4 h-4" /> Share VAR Clip
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <Card className="global-box border-white/10 rounded-3xl p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center mx-auto text-primary">
            <Film className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-black text-foreground">No VAR Highlights Uploaded Yet</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            {isOwnerOrAdmin
              ? 'Click the button above to upload VAR video clips from your pitch matches!'
              : 'Pitch owners and stadium referees upload VAR match highlights after games. Check back soon!'}
          </p>
        </Card>
      )}

      {/* Upload Modal */}
      {isUploadOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="global-box border-white/10 rounded-3xl p-6 max-w-md w-full space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-lg font-black text-foreground flex items-center gap-2">
                <Upload className="w-5 h-5 text-primary" /> Upload Pitch VAR Clip
              </h3>
              <button onClick={() => setIsUploadOpen(false)} className="text-muted-foreground hover:text-foreground cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadClip} className="space-y-4 text-xs font-bold">
              <div>
                <label className="text-muted-foreground uppercase block mb-1">Highlight Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Insane Bicycle Kick Goal in 90'"
                  className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-foreground"
                />
              </div>

              <div>
                <label className="text-muted-foreground uppercase block mb-1">Player Name</label>
                <input
                  type="text"
                  value={newPlayer}
                  onChange={(e) => setNewPlayer(e.target.value)}
                  placeholder="Player Name"
                  className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-foreground"
                />
              </div>

              <div>
                <label className="text-muted-foreground uppercase block mb-1">Stadium / Pitch Name</label>
                <input
                  type="text"
                  value={newPitch}
                  onChange={(e) => setNewPitch(e.target.value)}
                  className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-foreground"
                />
              </div>

              <div>
                <label className="text-muted-foreground uppercase block mb-1">Video Link (MP4 or Social Video URL)</label>
                <input
                  type="text"
                  value={newVideoUrl}
                  onChange={(e) => setNewVideoUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-foreground"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setIsUploadOpen(false)} className="flex-1 rounded-xl">
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting} className="flex-1 bg-primary text-black font-black rounded-xl">
                  {submitting ? 'Publishing...' : 'Publish Clip'}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
