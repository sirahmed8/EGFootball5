'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { SolidSelect } from '@/components/ui/SolidSelect';
import {
  Search,
  X,
  Zap,
  ArrowUpDown,
  SlidersHorizontal,
  Lightbulb,
  Car,
  Coffee,
  FilterX,
} from 'lucide-react';

interface HomeFilterBarProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  selectedFormat: string;
  setSelectedFormat: (val: string) => void;
  sortBy: 'recommended' | 'price-asc' | 'price-desc' | 'rating';
  setSortBy: (val: 'recommended' | 'price-asc' | 'price-desc' | 'rating') => void;
  maxPrice: number;
  setMaxPrice: (val: number) => void;
  selectedAmenities: string[];
  toggleAmenity: (amenity: string) => void;
  resetFilters: () => void;
  isFiltered: boolean;
  t: (key: string) => string;
}

export function HomeFilterBar({
  searchQuery,
  setSearchQuery,
  selectedFormat,
  setSelectedFormat,
  sortBy,
  setSortBy,
  maxPrice,
  setMaxPrice,
  selectedAmenities,
  toggleAmenity,
  resetFilters,
  isFiltered,
  t,
}: HomeFilterBarProps) {
  return (
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
              className="absolute end-3 top-3.5 text-muted-foreground hover:text-foreground cursor-pointer"
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
            <span className="text-primary font-mono">Max: {maxPrice} EGP</span>
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

        {isFiltered && (
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
  );
}
