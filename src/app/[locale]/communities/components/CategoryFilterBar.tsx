'use client';

import * as React from 'react';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';

interface CategoryFilterBarProps {
  search: string;
  setSearch: (val: string) => void;
  category: string;
  setCategory: (val: string) => void;
  categories: string[];
}

export function CategoryFilterBar({
  search,
  setSearch,
  category,
  setCategory,
  categories,
}: CategoryFilterBarProps) {
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

  return (
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
  );
}
