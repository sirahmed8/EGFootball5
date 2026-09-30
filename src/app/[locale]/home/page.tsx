'use client';

import { useState, useMemo, Suspense } from 'react';
import { useRouter } from '@/i18n/routing';
import { useSearchParams } from 'next/navigation';
import { collection, getDocs, query } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useQuery } from '@tanstack/react-query';
import { Pitch } from '@/types';
import { Button } from '@/components/ui/button';
import { LayoutGrid, List, Sparkles } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { HomePageSkeleton } from '@/components/skeletons/PageSkeletons';
import { StadiumWeatherCard } from '@/components/StadiumWeatherCard';
import { MotionDiv } from '@/components/MotionWrapper';
import { HomeFilterBar } from './components/HomeFilterBar';
import { PitchGridCard } from './components/PitchGridCard';
import { PitchListCard } from './components/PitchListCard';
import { PitchPreviewModal } from './components/PitchPreviewModal';

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations('Home');

  const [searchQuery, setSearchQuery] = useState(() => searchParams.get('q') || '');
  const [selectedFormat, setSelectedFormat] = useState<string>(() => searchParams.get('size') || 'all');
  const [selectedCity, setSelectedCity] = useState<string>(() => searchParams.get('city') || 'all');
  const [maxPrice, setMaxPrice] = useState<number>(1000);
  const [sortBy, setSortBy] = useState<'recommended' | 'price-asc' | 'price-desc' | 'rating'>('recommended');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedPitchPreview, setSelectedPitchPreview] = useState<Pitch | null>(null);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity]
    );
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedFormat('all');
    setSelectedCity('all');
    setMaxPrice(1000);
    setSortBy('recommended');
    setSelectedAmenities([]);
  };

  const isFiltered = Boolean(
    searchQuery ||
      selectedFormat !== 'all' ||
      selectedCity !== 'all' ||
      maxPrice !== 1000 ||
      selectedAmenities.length > 0
  );

  const { data: rawPitches = [], isLoading: loading } = useQuery({
    queryKey: ['pitches'],
    queryFn: async () => {
      const q = query(collection(db, 'pitches'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Pitch[];
    },
  });

  const filteredPitches = useMemo(() => {
    const list = rawPitches.filter((pitch) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        pitch.name.toLowerCase().includes(q) ||
        (pitch.locationName && pitch.locationName.toLowerCase().includes(q)) ||
        (pitch.managerName && pitch.managerName.toLowerCase().includes(q));

      const matchesPrice = !pitch.pricePerHour || pitch.pricePerHour <= maxPrice;

      const matchesFormat =
        selectedFormat === 'all' ||
        (pitch.capacity && pitch.capacity.toLowerCase().includes(selectedFormat)) ||
        (pitch.surfaceType && pitch.surfaceType.toLowerCase().includes(selectedFormat));

      const matchesCity =
        selectedCity === 'all' ||
        (pitch.locationName && pitch.locationName.toLowerCase().includes(selectedCity.toLowerCase()));

      const matchesAmenities = selectedAmenities.every((amenity) => {
        if (pitch.amenities && Array.isArray(pitch.amenities)) {
          return pitch.amenities.includes(amenity);
        }
        if (amenity === 'floodlights') return pitch.hasFloodlights !== false;
        if (amenity === 'parking') return pitch.hasParking !== false;
        if (amenity === 'cafeteria') return pitch.hasCafeteria !== false;
        return true;
      });

      return matchesSearch && matchesPrice && matchesFormat && matchesCity && matchesAmenities;
    });

    if (sortBy === 'price-asc') {
      list.sort((a, b) => (a.pricePerHour || 0) - (b.pricePerHour || 0));
    } else if (sortBy === 'price-desc') {
      list.sort((a, b) => (b.pricePerHour || 0) - (a.pricePerHour || 0));
    } else if (sortBy === 'rating') {
      list.sort((a, b) => (b.rating || 4.8) - (a.rating || 4.8));
    }

    return list;
  }, [rawPitches, searchQuery, maxPrice, selectedFormat, selectedCity, selectedAmenities, sortBy]);

  if (loading) {
    return <HomePageSkeleton />;
  }

  const handleBook = (pitchId: string) => {
    router.push(`/book?pitchId=${pitchId}`);
  };

  return (
    <div className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-8 space-y-8 mt-10 animate-in fade-in duration-500">
      <StadiumWeatherCard />

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border/40 pb-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t('discoverTurfs')}</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-foreground tracking-tight">
            {t('title')}
          </h1>
          <p className="text-muted-foreground text-base max-w-xl font-medium">{t('subtitle')}</p>
        </div>

        <div className="flex flex-wrap items-center justify-between sm:justify-start gap-3 w-full sm:w-auto">
          <span className="text-xs text-foreground font-mono font-black bg-emerald-500/10 px-3.5 py-2 rounded-xl border border-emerald-500/30 shrink-0">
            🟢 {t('pitchesAvailable', { count: filteredPitches.length })}
          </span>

          <div className="flex items-center bg-muted/60 p-1 rounded-xl border border-border shrink-0">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'grid' ? 'bg-primary text-black font-bold shadow' : 'text-muted-foreground'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'list' ? 'bg-primary text-black font-bold shadow' : 'text-muted-foreground'
              }`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <HomeFilterBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedFormat={selectedFormat}
        setSelectedFormat={setSelectedFormat}
        sortBy={sortBy}
        setSortBy={setSortBy}
        maxPrice={maxPrice}
        setMaxPrice={setMaxPrice}
        selectedAmenities={selectedAmenities}
        toggleAmenity={toggleAmenity}
        resetFilters={resetFilters}
        isFiltered={isFiltered}
        t={t}
      />

      {/* Empty State */}
      {filteredPitches.length === 0 && (
        <div className="text-center py-20 space-y-4">
          <div className="w-20 h-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center text-4xl mx-auto">
            🏟️
          </div>
          <h3 className="text-2xl font-black text-foreground">
            {rawPitches.length === 0 ? 'No Pitches Available Yet' : 'No Pitches Found'}
          </h3>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            {rawPitches.length === 0
              ? 'Platform owners can add new pitches from the Owner Dashboard.'
              : 'Try adjusting your filters or search for a different area.'}
          </p>
          {rawPitches.length > 0 && (
            <Button
              onClick={resetFilters}
              className="bg-primary text-black font-extrabold rounded-xl px-6 cursor-pointer"
            >
              {t('showAllPitches')}
            </Button>
          )}
        </div>
      )}

      {/* Pitch Grid / List Render */}
      {viewMode === 'grid' ? (
        <MotionDiv
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
          }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {filteredPitches.map((pitch) => (
            <MotionDiv
              key={pitch.id}
              variants={{
                hidden: { opacity: 0, scale: 0.95, y: 15 },
                visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
              }}
              className="h-full"
            >
              <PitchGridCard
                pitch={pitch}
                onPreview={setSelectedPitchPreview}
                onBook={handleBook}
                t={t}
              />
            </MotionDiv>
          ))}
        </MotionDiv>
      ) : (
        <MotionDiv
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
          }}
          className="space-y-3"
        >
          {filteredPitches.map((pitch) => (
            <MotionDiv
              key={pitch.id}
              variants={{
                hidden: { opacity: 0, scale: 0.95, y: 15 },
                visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
              }}
            >
              <PitchListCard pitch={pitch} onBook={handleBook} t={t} />
            </MotionDiv>
          ))}
        </MotionDiv>
      )}

      {/* Pitch Quick Preview Drawer / Modal */}
      {selectedPitchPreview && (
        <PitchPreviewModal
          pitch={selectedPitchPreview}
          onClose={() => setSelectedPitchPreview(null)}
          onBook={handleBook}
          t={t}
        />
      )}
    </div>
  );
}

export default function PlayerHome() {
  return (
    <Suspense fallback={<HomePageSkeleton />}>
      <HomeContent />
    </Suspense>
  );
}
