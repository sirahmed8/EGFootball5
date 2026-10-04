'use client';

import * as React from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import {
  collection,
  query,
  getDocs,
  addDoc,
  orderBy,
  limit,
  doc,
  updateDoc,
  arrayUnion,
  increment,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { toast } from 'sonner';
import { Users, Plus, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CommunitiesPageSkeleton } from '@/components/skeletons/PageSkeletons';
import { Community } from './components/types';
import { CommunityCard } from './components/CommunityCard';
import { CategoryFilterBar } from './components/CategoryFilterBar';
import { CreateCommunityModal } from './components/CreateCommunityModal';

const CATEGORIES = ['All', 'Neighborhood Teams', 'Weekend Warriors', 'Competitive Clubs'];

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
  const [commCategory] = React.useState('Neighborhood Teams');
  const [creating, setCreating] = React.useState(false);
  const [joiningId, setJoiningId] = React.useState<string | null>(null);

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
        memberIds: [firebaseUser.uid],
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
    if (joiningId) return;
    if (comm.memberIds?.includes(firebaseUser.uid)) {
      toast.info('You are already a member of this community!');
      return;
    }

    setJoiningId(comm.id);
    try {
      await updateDoc(doc(db, 'communities', comm.id), {
        memberIds: arrayUnion(firebaseUser.uid),
        membersCount: increment(1),
      });
      setCommunities((prev) =>
        prev.map((c) =>
          c.id === comm.id
            ? {
                ...c,
                membersCount: c.membersCount + 1,
                memberIds: [...(c.memberIds || []), firebaseUser.uid],
              }
            : c
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

  const filtered = communities.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.city.toLowerCase().includes(search.toLowerCase());
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
      <CategoryFilterBar
        search={search}
        setSearch={setSearch}
        category={category}
        setCategory={setCategory}
        categories={CATEGORIES}
      />

      {/* Communities Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 space-y-3">
          <Users className="w-12 h-12 text-muted-foreground/40 mx-auto" />
          <p className="text-muted-foreground font-bold">No communities found for your search.</p>
          <p className="text-xs text-muted-foreground">Try a different search term or category.</p>
          {(search || category !== 'All') && (
            <Button
              variant="outline"
              onClick={() => {
                setSearch('');
                setCategory('All');
              }}
              className="rounded-xl border-white/10 text-xs font-bold cursor-pointer active:scale-95 transition-transform"
            >
              Clear filters
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 w-full">
          {filtered.map((comm) => (
            <CommunityCard
              key={comm.id}
              comm={comm}
              onJoin={handleJoin}
              isJoining={joiningId === comm.id}
            />
          ))}
        </div>
      )}

      {/* Create Community Modal */}
      <CreateCommunityModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateCommunity}
        name={name}
        setName={setName}
        description={description}
        setDescription={setDescription}
        city={city}
        setCity={setCity}
        logoEmoji={logoEmoji}
        setLogoEmoji={setLogoEmoji}
        creating={creating}
      />
    </div>
  );
}
