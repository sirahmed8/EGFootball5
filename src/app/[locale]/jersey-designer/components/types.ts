export type CollarStyle = 'vneck' | 'crew';
export type PatternType = 'solid' | 'stripes' | 'hoops' | 'checkerboard' | 'halves' | 'sash';
export type BadgeType = 'shield' | 'crown' | 'star' | 'flame';

export interface ColorOption {
  name: string;
  hex: string;
}

export const JERSEY_COLORS: ColorOption[] = [
  { name: 'Hyper Venom', hex: '#10B981' },
  { name: 'Electric Cyan', hex: '#00D4FF' },
  { name: 'Solar Flare', hex: '#FF3366' },
  { name: 'Obsidian Black', hex: '#0B0C10' },
  { name: 'Titanium White', hex: '#F0F4F8' },
  { name: 'Royal Crimson', hex: '#E63946' },
  { name: 'Deep Ultraviolet', hex: '#7209B7' },
  { name: 'Neon Volt', hex: '#CCFF00' },
  { name: 'Midnight Navy', hex: '#0A2463' },
  { name: 'Molten Gold', hex: '#FFB703' },
  { name: 'Sky Blue', hex: '#3B82F6' },
  { name: 'Sunset Orange', hex: '#F97316' },
];
