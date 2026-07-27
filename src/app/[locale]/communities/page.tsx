'use client';

import * as React from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { collection, query, getDocs, addDoc, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Search, Plus, Shield, MapPin, Trophy, Sparkles, CheckCircle2, UserPlus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CommunitiesPageSkeleton } from '@/components/skeletons/PageSkeletons';

interface Community {
  id: string;
  name: string;
  description: string;
  city: string;
  membersCount: number;
  matchesPlayed: number;
  captainName: string;
  captainUid: string;
  logoEmoji: string;
  category: string;
}

export default function CommunitiesPage() {
  const firebaseUser = useAuthStore((s) => s.firebaseUser);
  const appUser = useAuthStore((s) => s.appUser);

  const [communities, setCommunities] = React.useState<Community[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState('');
  const [category, setCategory] = React.useState('All');
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  // New community form state
  const [name, setName] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [city, setCity] = React.useState('Obour');
  const [logoEmoji, setLogoEmoji] = React.useState('⚽');
  const [commCategory, setCommCategory] = React.useState('Neighborhood Teams');
  const [creating, setCreating] = React.useState(false);

  const mockCommunities: Community[] = [];

  React.useEffect(() => {
    async function fetchCommunities() {
      try {
        const q = query(collection(db, 'communities'), orderBy('membersCount', 'desc'), limit(20));
        const snap = await getDocs(q);
        if (!snap.empty) {
          const list = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Community));
          setCommunities(list);
        } else {
          setCommunities([]);
        }
      } catch (err) {
        console.error(err);
        setCommunities([]);
      } finally {
        setLoading(false);
      }
    }
    fetchCommunities();
  }, []);

  const handleCreateCommunity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firebaseUser) {
      toast.error('Please sign in to create a community');
      return;
    }
    if (!name.trim()) {
      toast.error('Community name is required');
      return;
    }
    setCreating(true);
    try {
      const newComm = {
        name,
        description,
        city,
        logoEmoji,
        category: commCategory,
        membersCount: 1,
        matchesPlayed: 0,
        captainName: appUser?.name || firebaseUser.displayName || 'Captain',
        captainUid: firebaseUser.uid,
        createdAt: Date.now(),
      };
      const docRef = await addDoc(collection(db, 'communities'), newComm);
      setCommunities((prev) => [{ id: docRef.id, ...newComm }, ...prev]);
      toast.success('Community created successfully! 🏆');
      setIsModalOpen(false);
      setName('');
      setDescription('');
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error.message || 'Failed to create community');
    } finally {
      setCreating(false);
    }
  };

  const handleJoin = (commName: string) => {
    if (!firebaseUser) {
      toast.error('Please sign in to join');
      return;
    }
    toast.success(`Join request sent to ${commName}!`);
  };

  const categories = ['All', 'Neighborhood Teams', 'Weekend Warriors', 'Competitive Clubs'];

  const filtered = communities.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.city.toLowerCase().includes(search.toLowerCase());
    const matchesCat = category === 'All' || c.category === category;
    return matchesSearch && matchesCat;
  });

  if (loading) return <CommunitiesPageSkeleton />;

  return (
    <div className="min-h-screen bg-mesh py-10 px-4 md:px-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 stadium-glass p-6 md:p-8 rounded-3xl border-white/10 shadow-xl">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-extrabold">
            <Sparkles className="w-4 h-4" /> Football Hub & Squads
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-foreground tracking-tight">
            Football <span className="text-gradient-primary">Communities</span>
          </h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Join local football squads, compete in matches, and build your team reputation.
          </p>
        </div>

        <Button
          onClick={() => setIsModalOpen(true)}
          size="lg"
          className="bg-primary text-black hover:bg-primary/90 font-black px-6 py-6 rounded-2xl shadow-xl glow-primary cursor-pointer flex items-center gap-2 self-start md:self-auto"
        >
          <Plus className="w-5 h-5" /> Create Squad
        </Button>
      </div>

      {/* Search & Category Tabs */}
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute start-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by squad name or city..."
            className="w-full ps-10 pe-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-foreground focus:outline-none focus:border-primary text-sm font-medium"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto w-full pb-2 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                category === cat ? 'bg-primary text-black font-black shadow-lg glow-primary-sm' : 'stadium-glass border-white/10 text-muted-foreground hover:text-foreground'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Communities Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 stadium-glass rounded-3xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((comm) => (
            <motion.div key={comm.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
              <Card className="stadium-glass border-white/10 hover:border-primary/40 transition-all rounded-3xl overflow-hidden card-lift h-full flex flex-col justify-between p-6">
                <CardContent className="p-0 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-2xl bg-primary/15 border border-primary/30 flex items-center justify-center text-3xl shadow-inner">
                        {comm.logoEmoji}
                      </div>
                      <div>
                        <h3 className="text-xl font-black text-foreground">{comm.name}</h3>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-primary" /> {comm.city}
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-primary">
                      {comm.category}
                    </span>
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{comm.description}</p>

                  <div className="grid grid-cols-2 gap-3 py-2 border-y border-white/10 text-center">
                    <div>
                      <div className="text-base font-black text-foreground">{comm.membersCount}</div>
                      <div className="text-[10px] text-muted-foreground uppercase font-bold">Members</div>
                    </div>
                    <div>
                      <div className="text-base font-black text-emerald-400">{comm.matchesPlayed}</div>
                      <div className="text-[10px] text-muted-foreground uppercase font-bold">Matches Played</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                    <span>Captain: <strong className="text-foreground">{comm.captainName}</strong></span>
                  </div>
                </CardContent>

                <Button
                  onClick={() => handleJoin(comm.name)}
                  className="w-full mt-4 bg-primary/20 hover:bg-primary text-primary hover:text-black font-extrabold rounded-2xl transition-all cursor-pointer flex items-center justify-center gap-2 border border-primary/30"
                >
                  <UserPlus className="w-4 h-4" /> Request to Join
                </Button>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create Community Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-lg stadium-glass border-white/10 rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h2 className="text-2xl font-black text-foreground flex items-center gap-2">
                <Shield className="text-primary" /> Create Squad
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 rounded-full hover:bg-white/10 text-muted-foreground cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCommunity} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">Squad Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Obour City FC"
                  className="w-full p-3.5 rounded-2xl bg-white/5 border border-white/10 text-foreground focus:outline-none focus:border-primary text-sm font-medium"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your squad philosophy, match times..."
                  className="w-full p-3.5 rounded-2xl bg-white/5 border border-white/10 text-foreground focus:outline-none focus:border-primary text-sm font-medium h-24 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">City</label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full p-3.5 rounded-2xl bg-white/5 border border-white/10 text-foreground focus:outline-none focus:border-primary text-sm font-medium"
                  >
                    <option value="Obour" className="bg-neutral-900">Obour</option>
                    <option value="Cairo" className="bg-neutral-900">Cairo</option>
                    <option value="Giza" className="bg-neutral-900">Giza</option>
                    <option value="Alexandria" className="bg-neutral-900">Alexandria</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">Logo Avatar</label>
                  <select
                    value={logoEmoji}
                    onChange={(e) => setLogoEmoji(e.target.value)}
                    className="w-full p-3.5 rounded-2xl bg-white/5 border border-white/10 text-foreground focus:outline-none focus:border-primary text-sm font-medium"
                  >
                    <option value="⚽" className="bg-neutral-900">⚽ Football</option>
                    <option value="🦅" className="bg-neutral-900">🦅 Eagle</option>
                    <option value="⚡" className="bg-neutral-900">⚡ Lightning</option>
                    <option value="🔥" className="bg-neutral-900">🔥 Fire</option>
                    <option value="🧤" className="bg-neutral-900">🧤 Glove</option>
                    <option value="👑" className="bg-neutral-900">👑 Crown</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} className="w-1/2 stadium-glass border-white/10 text-foreground rounded-2xl cursor-pointer">
                  Cancel
                </Button>
                <Button type="submit" disabled={creating} className="w-1/2 bg-primary text-black font-black rounded-2xl glow-primary cursor-pointer">
                  {creating ? 'Creating...' : 'Launch Squad 🚀'}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
