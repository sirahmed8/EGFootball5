'use client';

import * as React from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { collection, query, getDocs, addDoc, orderBy, limit, doc, updateDoc, arrayUnion, increment } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Search, Plus, Shield, MapPin, Trophy, Sparkles, CheckCircle2, UserPlus, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CommunitiesPageSkeleton } from '@/components/skeletons/PageSkeletons';
import { SolidSelect } from '@/components/ui/SolidSelect';
import { Portal } from '@/components/Portal';

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
  const [joiningId, setJoiningId] = React.useState<string | null>(null);

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

  const handleJoin = async (comm: Community) => {
    if (!firebaseUser) {
      toast.error('Please sign in to join');
      return;
    }
    if (joiningId) return; // prevent double-tap

    setJoiningId(comm.id);
    try {
      await updateDoc(doc(db, 'communities', comm.id), {
        memberIds: arrayUnion(firebaseUser.uid),
        membersCount: increment(1),
      });
      // Optimistically update local count
      setCommunities((prev) =>
        prev.map((c) =>
          c.id === comm.id ? { ...c, membersCount: c.membersCount + 1 } : c
        )
      );
      toast.success(`You've joined ${comm.name}! 🏆`);
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error.message || 'Failed to join community');
    } finally {
      setJoiningId(null);
    }
  };

  const categories = ['All', 'Neighborhood Teams', 'Weekend Warriors', 'Competitive Clubs'];

  const tabsRef = React.useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const [startX, setStartX] = React.useState(0);
  const [scrollLeftState, setScrollLeftState] = React.useState(0);
  const [canScrollLeft, setCanScrollLeft] = React.useState(false);
  const [canScrollRight, setCanScrollRight] = React.useState(false);

  const checkScroll = React.useCallback(() => {
    if (tabsRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = tabsRef.current;
      setCanScrollLeft(scrollLeft > 5);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 5);
    }
  }, []);

  React.useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [checkScroll]);

  const scrollTabs = (direction: 'left' | 'right') => {
    if (tabsRef.current) {
      const amount = direction === 'left' ? -180 : 180;
      tabsRef.current.scrollBy({ left: amount, behavior: 'smooth' });
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (tabsRef.current && e.deltaY !== 0) {
      tabsRef.current.scrollLeft += e.deltaY;
      checkScroll();
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!tabsRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - tabsRef.current.offsetLeft);
    setScrollLeftState(tabsRef.current.scrollLeft);
  };

  const handleMouseLeaveOrUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !tabsRef.current) return;
    e.preventDefault();
    const x = e.pageX - tabsRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    tabsRef.current.scrollLeft = scrollLeftState - walk;
    checkScroll();
  };

  const filtered = communities.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.city.toLowerCase().includes(search.toLowerCase());
    const matchesCat = category === 'All' || c.category === category;
    return matchesSearch && matchesCat;
  });

  if (loading) return <CommunitiesPageSkeleton />;

  return (
    <div className="min-h-screen bg-black py-4 sm:py-8 px-2 sm:px-4 md:px-6 lg:px-8 max-w-7xl mx-auto space-y-6 w-full max-w-full overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 global-box p-4 sm:p-6 lg:p-8 rounded-3xl border-white/10 shadow-xl bg-black w-full overflow-hidden">
        <div className="space-y-2 min-w-0 flex-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-extrabold max-w-full truncate">
            <Sparkles className="w-4 h-4 shrink-0" />
            <span className="truncate">Football Hub & Squads</span>
          </div>
          <h1 className="text-xl sm:text-3xl xl:text-5xl font-black text-foreground tracking-tight leading-tight break-words">
            Football <span className="text-gradient-primary">Communities</span>
          </h1>
          <p className="text-xs sm:text-sm xl:text-base text-muted-foreground leading-relaxed break-words max-w-2xl">
            Join local football squads, compete in matches, and build your team reputation.
          </p>
        </div>

        <Button
          onClick={() => setIsModalOpen(true)}
          size="lg"
          className="bg-primary text-black hover:bg-primary/90 font-black px-5 py-3 rounded-2xl shadow-xl glow-primary cursor-pointer flex items-center justify-center gap-2 shrink-0 w-full sm:w-auto"
        >
          <Plus className="w-5 h-5 shrink-0" /> Create Squad
        </Button>
      </div>

      {/* Search & Category Tabs */}
      <div className="space-y-3 w-full">
        {/* Search Input */}
        <div className="relative w-full">
          <Search className="w-4 h-4 absolute start-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by squad name or city..."
            className="w-full ps-10 pe-4 py-2.5 sm:py-3 rounded-2xl bg-white/5 border border-white/10 text-foreground focus:outline-none focus:border-primary text-xs sm:text-sm font-medium transition-colors"
          />
        </div>

        {/* Category Filter Pills — Smoothly Scrollable with Controls & Drag */}
        <div className="relative w-full flex items-center group">
          {canScrollLeft && (
            <button
              onClick={() => scrollTabs('left')}
              className="absolute start-0 z-20 w-8 h-8 rounded-full bg-black/90 border border-primary/40 text-primary flex items-center justify-center shadow-[0_0_12px_rgba(57,255,20,0.3)] hover:scale-110 active:scale-95 transition-all cursor-pointer backdrop-blur-md"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}

          <div
            ref={tabsRef}
            onWheel={handleWheel}
            onScroll={checkScroll}
            onMouseDown={handleMouseDown}
            onMouseLeave={handleMouseLeaveOrUp}
            onMouseUp={handleMouseLeaveOrUp}
            onMouseMove={handleMouseMove}
            className={`flex items-center gap-2.5 overflow-x-auto w-full pb-2 pt-1 px-1 transition-all select-none overscroll-x-contain ${
              isDragging ? 'cursor-grabbing' : 'cursor-grab'
            }`}
            style={{
              WebkitOverflowScrolling: 'touch',
              scrollbarWidth: 'thin',
              scrollbarColor: 'rgba(57, 255, 20, 0.3) rgba(255, 255, 255, 0.05)',
            }}
          >
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={(e) => {
                  setCategory(cat);
                  e.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                }}
                className={`px-4 py-2.5 rounded-2xl text-xs font-black whitespace-nowrap shrink-0 transition-all cursor-pointer select-none active:scale-95 ${
                  category === cat
                    ? 'bg-primary text-black shadow-lg glow-primary-sm scale-[1.02]'
                    : 'stadium-glass border-white/10 text-muted-foreground hover:text-foreground hover:bg-white/10 hover:border-white/20'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {canScrollRight && (
            <button
              onClick={() => scrollTabs('right')}
              className="absolute end-0 z-20 w-8 h-8 rounded-full bg-black/90 border border-primary/40 text-primary flex items-center justify-center shadow-[0_0_12px_rgba(57,255,20,0.3)] hover:scale-110 active:scale-95 transition-all cursor-pointer backdrop-blur-md"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Communities Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 w-full">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 stadium-glass rounded-3xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 w-full">
          {filtered.map((comm) => (
            <motion.div key={comm.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="min-w-0 w-full">
              <Card className="stadium-glass border-white/10 hover:border-primary/40 transition-all rounded-3xl overflow-hidden card-lift h-full flex flex-col justify-between p-4 sm:p-6 w-full min-w-0">
                <CardContent className="p-0 space-y-4 min-w-0 w-full">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 min-w-0 w-full">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-primary/15 border border-primary/30 flex items-center justify-center text-2xl sm:text-3xl shadow-inner shrink-0">
                        {comm.logoEmoji}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-base sm:text-lg font-black text-foreground truncate">{comm.name}</h3>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5 truncate">
                          <MapPin className="w-3 h-3 text-primary shrink-0" /> <span className="truncate">{comm.city}</span>
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-primary shrink-0 self-start sm:self-auto">
                      {comm.category}
                    </span>
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 break-words">{comm.description}</p>

                  <div className="grid grid-cols-2 gap-2 sm:gap-3 py-2 border-y border-white/10 text-center">
                    <div>
                      <div className="text-sm sm:text-base font-black text-foreground">{comm.membersCount}</div>
                      <div className="text-[10px] text-muted-foreground uppercase font-bold">Members</div>
                    </div>
                    <div>
                      <div className="text-sm sm:text-base font-black text-emerald-400">{comm.matchesPlayed}</div>
                      <div className="text-[10px] text-muted-foreground uppercase font-bold">Matches Played</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 gap-2 flex-wrap">
                    <span className="truncate">Captain: <strong className="text-foreground">{comm.captainName}</strong></span>
                  </div>
                </CardContent>

                <Button
                  onClick={() => handleJoin(comm)}
                  disabled={joiningId === comm.id}
                  className="w-full mt-4 bg-primary/20 hover:bg-primary text-primary hover:text-black font-extrabold rounded-2xl transition-all cursor-pointer flex items-center justify-center gap-2 border border-primary/30 disabled:opacity-60 disabled:cursor-not-allowed text-xs sm:text-sm py-2.5"
                >
                  {joiningId === comm.id ? (
                    <span className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                      Joining...
                    </span>
                  ) : (
                    <><UserPlus className="w-4 h-4 shrink-0" /> Request to Join</>
                  )}
                </Button>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create Community Modal */}
      {isModalOpen && (
        <Portal>
          <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
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
                  <SolidSelect
                    value={city}
                    onChange={(val) => setCity(val)}
                    options={[
                      { value: 'Obour', label: 'Obour' },
                      { value: 'Cairo', label: 'Cairo' },
                      { value: 'Giza', label: 'Giza' },
                      { value: 'Alexandria', label: 'Alexandria' },
                    ]}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">Logo Avatar</label>
                  <SolidSelect
                    value={logoEmoji}
                    onChange={(val) => setLogoEmoji(val)}
                    options={[
                      { value: '⚽', label: '⚽ Football' },
                      { value: '🦅', label: '🦅 Eagle' },
                      { value: '⚡', label: '⚡ Lightning' },
                      { value: '🔥', label: '🔥 Fire' },
                      { value: '🧤', label: '🧤 Glove' },
                      { value: '👑', label: '👑 Crown' },
                    ]}
                    className="w-full"
                  />
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
        </Portal>
      )}
    </div>
  );
}
