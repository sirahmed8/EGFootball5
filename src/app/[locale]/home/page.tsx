'use client';

import { useState, useMemo, Suspense } from 'react';

import { useRouter } from '@/i18n/routing';
import { useSearchParams } from 'next/navigation';
import { collection, getDocs, query } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useQuery } from '@tanstack/react-query';
import { Pitch } from '@/types';
import { Portal } from '@/components/Portal';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  MapPin,
  ArrowRight,
  Search,
  LayoutGrid,
  List,
  Phone,
  Star,
  X,
  Sparkles,
  Coffee,
  Car,
  Lightbulb,
  ArrowUpDown,
  FilterX,
  Zap,
  SlidersHorizontal,
} from 'lucide-react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { SolidSelect, SelectOption } from '@/components/ui/SolidSelect';
import { HomePageSkeleton } from '@/components/skeletons/PageSkeletons';
import { StadiumWeatherCard } from '@/components/StadiumWeatherCard';
import { MotionDiv } from '@/components/MotionWrapper';

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

  return (
    <div className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-8 space-y-8 mt-10 animate-in fade-in duration-500">
      {/* Live Stadium Weather & Conditions Card */}
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
      <div className="p-4 sm:p-5 rounded-3xl bg-card/70 border border-border backdrop-blur-xl space-y-4 shadow-xl relative z-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
          {/* Search Input */}
          <div className="sm:col-span-2 lg:col-span-4 relative">
            <Search className="w-4 h-4 absolute start-3.5 top-3.5 text-muted-foreground" />
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('searchPlaceholder')}
              className="ps-10 pe-9 bg-background/60 border-border text-xs sm:text-sm h-11 rounded-2xl focus:border-primary/50"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute end-3 top-3.5 text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Format / Pitch Capacity Selector */}
          <div className="sm:col-span-1 lg:col-span-3">
            <SolidSelect
              value={selectedFormat}
              onChange={setSelectedFormat}
              options={[
                { value: 'all', label: t('allSizes') },
                { value: '5v5', label: t('format5v5') },
                { value: '7v7', label: t('format7v7') },
                { value: '11v11', label: t('format11v11') },
              ]}
              icon={Zap}
              iconColor="text-primary"
            />
          </div>

          {/* Sort Selector */}
          <div className="sm:col-span-1 lg:col-span-3">
            <SolidSelect
              value={sortBy}
              onChange={(val) => setSortBy(val as 'recommended' | 'price-asc' | 'price-desc' | 'rating')}
              options={[
                { value: 'recommended', label: t('recommended') },
                { value: 'price-asc', label: t('priceAsc') },
                { value: 'price-desc', label: t('priceDesc') },
                { value: 'rating', label: t('topRated') },
              ]}
              icon={ArrowUpDown}
              iconColor="text-muted-foreground"
            />
          </div>

          {/* Price Range Slider */}
          <div className="sm:col-span-2 lg:col-span-2 space-y-1 bg-background/40 p-2.5 rounded-2xl border border-border">
            <div className="flex justify-between text-[11px] font-extrabold text-muted-foreground">
              <span className="text-primary font-mono">Max Price: {maxPrice} EGP</span>
            </div>
            <input
              type="range"
              min="150"
              max="1200"
              step="50"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-primary bg-muted rounded-lg h-1.5 cursor-pointer"
            />
          </div>
        </div>

        {/* Amenity Filter Pills & Reset Button */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-border/40">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-muted-foreground flex items-center gap-1 me-1">
              <SlidersHorizontal className="w-3.5 h-3.5 text-primary" />
              {t('facilities')}
            </span>
            {[
              { id: 'floodlights', label: t('floodlights'), icon: <Lightbulb className="w-3.5 h-3.5 text-amber-400" /> },
              { id: 'parking', label: t('parking'), icon: <Car className="w-3.5 h-3.5 text-blue-400" /> },
              { id: 'cafeteria', label: t('cafeteria'), icon: <Coffee className="w-3.5 h-3.5 text-emerald-400" /> },
            ].map((item) => {
              const isSelected = selectedAmenities.includes(item.id);
              return (
                <button
                  key={item.id}
                  onClick={() => toggleAmenity(item.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border cursor-pointer ${
                    isSelected
                      ? 'bg-primary/20 text-primary border-primary/50 shadow-sm'
                      : 'bg-background/40 text-muted-foreground border-border hover:bg-muted hover:text-foreground'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {(searchQuery || selectedFormat !== 'all' || selectedCity !== 'all' || maxPrice !== 1000 || selectedAmenities.length > 0) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={resetFilters}
              className="text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-xl gap-1.5 cursor-pointer"
            >
              <FilterX className="w-3.5 h-3.5" />
              {t('resetFilters')}
            </Button>
          )}
        </div>
      </div>

      {/* Empty State when no pitches found */}
      {filteredPitches.length === 0 && (
        <div className='text-center py-20 space-y-4'>
          <div className='w-20 h-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center text-4xl mx-auto'>🏟️</div>
          <h3 className='text-2xl font-black text-foreground'>
            {rawPitches.length === 0 ? 'No Pitches Available Yet' : 'No Pitches Found'}
          </h3>
          <p className='text-sm text-muted-foreground max-w-sm mx-auto'>
            {rawPitches.length === 0
              ? 'Platform owners can add new pitches from the Owner Dashboard.'
              : 'Try adjusting your filters or search for a different area.'}
          </p>
          {rawPitches.length > 0 && (
            <Button onClick={resetFilters} className="bg-primary text-black font-extrabold rounded-xl px-6 cursor-pointer">
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
            visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
          }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {filteredPitches.map((pitch) => (
            <MotionDiv
              key={pitch.id}
              variants={{
                hidden: { opacity: 0, scale: 0.95, y: 15 },
                visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
              }}
              className="h-full"
            >
              <Card className="stadium-glass border-white/10 card-lift overflow-hidden hover:border-primary/50 transition-all duration-300 group flex flex-col justify-between shadow-2xl rounded-3xl h-full">
                <div>
                  <div className="aspect-video relative w-full bg-slate-900 overflow-hidden">
                    <Image
                      src={pitch.imagePreviewUrl || '/pitch_preview.jpg'}
                      alt={pitch.name}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-black/30" />

                    {/* Price Tag */}
                    <div className="absolute top-3 end-3 bg-background/90 backdrop-blur-md px-3.5 py-1 rounded-full text-primary font-black text-sm border border-primary/30 shadow-md font-mono">
                      {pitch.pricePerHour || 350} {t('egpPerHour')}
                    </div>

                    {/* Rating Tag */}
                    {pitch.rating ? (
                      <div className="absolute top-3 start-3 bg-black/75 backdrop-blur-md px-2.5 py-1 rounded-full text-amber-400 font-bold text-xs flex items-center gap-1 border border-amber-400/30">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <span>{pitch.rating}</span>
                      </div>
                    ) : (
                      <div className="absolute top-3 start-3">
                        <span className="text-xs font-bold text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30">New</span>
                      </div>
                    )}
                  </div>

                  <CardHeader className="p-5 pb-2">
                    <CardTitle className="text-2xl font-black text-foreground group-hover:text-primary transition-colors">
                      {pitch.name}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                      <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      {pitch.mapLink ? (
                        <a
                          href={pitch.mapLink}
                          target="_blank"
                          rel="noreferrer"
                          className="hover:text-primary hover:underline truncate font-semibold"
                        >
                          {pitch.locationName || t('viewOnMap')}
                        </a>
                      ) : (
                        <span className="truncate font-semibold">{pitch.locationName || t('locationNotSpecified')}</span>
                      )}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="px-5 pt-2 pb-4 space-y-3 text-xs text-muted-foreground">
                    <div className="p-3 rounded-2xl bg-muted/40 border border-border/50 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold">{t('manager')}:</span>
                        <span className="text-foreground font-extrabold">{pitch.managerName || 'إدارة الملعب'}</span>
                      </div>
                      {pitch.adminPhone && (
                        <div className="flex justify-between items-center border-t border-border/30 pt-1.5">
                          <span className="font-semibold">{t('contact')}:</span>
                          <a
                            href={`tel:${pitch.adminPhone}`}
                            className="text-emerald-400 hover:underline flex items-center gap-1 font-mono font-black"
                          >
                            <Phone className="w-3 h-3" />
                            {pitch.adminPhone}
                          </a>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </div>

                <div className="p-5 pt-0 flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setSelectedPitchPreview(pitch)}
                    className="flex-1 border-border text-foreground hover:bg-muted font-bold text-xs py-5 rounded-2xl cursor-pointer"
                  >
                    {t('previewBtn')}
                  </Button>

                  <Button
                    className="flex-[2] bg-primary text-black font-black hover:bg-primary/90 rounded-2xl py-5 flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(57,255,20,0.25)] cursor-pointer"
                    onClick={() => router.push(`/book?pitchId=${pitch.id}`)}
                  >
                    <span>{t('bookNow')}</span>
                    <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                  </Button>
                </div>
              </Card>
            </MotionDiv>
          ))}
        </MotionDiv>
      ) : (
        <MotionDiv 
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
          }}
          className="space-y-3"
        >
          {filteredPitches.map((pitch) => (
            <MotionDiv
              key={pitch.id}
              variants={{
                hidden: { opacity: 0, scale: 0.95, y: 15 },
                visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
              }}
            >
              <Card className="bg-card/70 border-border backdrop-blur-xl p-4 rounded-3xl hover:border-primary/40 transition-all flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  <div className="w-24 h-24 relative rounded-2xl overflow-hidden bg-slate-900 shrink-0">
                    <Image
                      src={pitch.imagePreviewUrl || '/pitch_preview.jpg'}
                      alt={pitch.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="text-xl font-extrabold text-foreground">{pitch.name}</h3>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-primary" />
                      <span>{pitch.locationName || t('locationNotSpecified')}</span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {t('manager')}: <strong className="text-foreground">{pitch.managerName || 'إدارة الملعب'}</strong>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                  {/* Fixed text alignment bug: text-start */}
                  <div className="text-start">
                    <span className="text-xl font-black text-primary font-mono block">
                      {pitch.pricePerHour || 350} EGP
                    </span>
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">{t('egpPerHour')}</span>
                  </div>

                  <Button
                    className="bg-primary text-black font-extrabold hover:bg-primary/90 rounded-2xl px-6 py-5 flex items-center gap-1.5 shadow-md cursor-pointer"
                    onClick={() => router.push(`/book?pitchId=${pitch.id}`)}
                  >
                    <span>{t('bookNow')}</span>
                    <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                  </Button>
                </div>
              </Card>
            </MotionDiv>
          ))}
        </MotionDiv>
      )}

      {/* Pitch Quick Preview Drawer / Modal */}
      {selectedPitchPreview && (
        <Portal>
          <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <Card className="w-full max-w-lg bg-card/95 border-border backdrop-blur-2xl shadow-2xl p-6 rounded-3xl space-y-4 relative animate-in zoom-in-95 duration-200">
              <button
                onClick={() => setSelectedPitchPreview(null)}
                className="absolute top-4 end-4 p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-2xl font-black text-foreground">{selectedPitchPreview.name}</h3>

              <div className="aspect-video relative w-full rounded-2xl overflow-hidden border border-border bg-slate-900">
                <Image
                  src={selectedPitchPreview.imagePreviewUrl || '/pitch_preview.jpg'}
                  alt={selectedPitchPreview.name}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="space-y-3 text-sm">
                <p className="flex items-center gap-2 text-muted-foreground font-medium">
                  <MapPin className="w-4 h-4 text-primary shrink-0" />
                  <span className="text-foreground">{selectedPitchPreview.locationName}</span>
                </p>
                <div className="flex justify-between items-center p-3 rounded-2xl bg-muted/40 border border-border/50">
                  <span className="text-muted-foreground">{t('ratePerHour')}</span>
                  <span className="text-xl font-black text-primary font-mono">{selectedPitchPreview.pricePerHour || 350} EGP</span>
                </div>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  {t('pitchPreviewDesc')}
                </p>
              </div>

              <div className="pt-2 flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setSelectedPitchPreview(null)}
                  className="flex-1 rounded-2xl font-bold"
                >
                  {t('close')}
                </Button>
                <Button
                  onClick={() => {
                    const id = selectedPitchPreview.id;
                    setSelectedPitchPreview(null);
                    router.push(`/book?pitchId=${id}`);
                  }}
                  className="flex-1 bg-primary text-black font-black hover:bg-primary/90 rounded-2xl"
                >
                  {t('bookNow')}
                </Button>
              </div>
            </Card>
          </div>
        </Portal>
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
