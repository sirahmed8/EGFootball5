'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { Shirt, ShoppingBag, Sparkles, Check, Truck, Palette, User, Hash, PackageCheck, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { SolidSelect } from '@/components/ui/SolidSelect';

export default function JerseyDesignerPage() {
  const [primaryColor, setPrimaryColor] = React.useState('#10B981');
  const [secondaryColor, setSecondaryColor] = React.useState('#06B6D4');
  const [collarStyle, setCollarStyle] = React.useState<'vneck' | 'crew'>('vneck');
  const [hasStripes, setHasStripes] = React.useState(true);
  const [squadName, setSquadName] = React.useState('OBOUR EAGLES');
  const [playerName, setPlayerName] = React.useState('AHMED');
  const [number, setNumber] = React.useState('10');
  const [quantity, setQuantity] = React.useState(10);
  const [selectedSize, setSelectedSize] = React.useState('L');
  const [address, setAddress] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [isOrdering, setIsOrdering] = React.useState(false);

  const colors = [
    { name: 'Emerald', hex: '#10B981' },
    { name: 'Cyan', hex: '#06B6D4' },
    { name: 'Amber', hex: '#F59E0B' },
    { name: 'Crimson', hex: '#EF4444' },
    { name: 'Purple', hex: '#8B5CF6' },
    { name: 'Pink', hex: '#EC4899' },
    { name: 'Pitch Black', hex: '#171717' },
    { name: 'Pure White', hex: '#FFFFFF' },
  ];

  const handleOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) {
      toast.error('Please enter a contact phone number');
      return;
    }
    setIsOrdering(true);
    setTimeout(() => {
      toast.success(`Custom Kit Order placed! 👕 ${quantity} ${selectedSize} jerseys for ${squadName}. Delivery team will call ${phone}.`);
      setIsOrdering(false);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-black py-10 px-4 md:px-8 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 global-box p-8 rounded-3xl border-white/10 shadow-xl"
      >
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-black">
            <Shirt className="w-4 h-4" /> 3D Custom Kit Studio
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-foreground">
            Custom Team <span className="text-gradient-primary">Jersey Studio</span>
          </h1>
          <p className="text-sm text-muted-foreground">Design 5-a-side team kits with dynamic patterns, printed numbers, and doorstep delivery across Egypt.</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Live SVG Jersey Visualizer */}
        <Card className="global-box border-white/10 rounded-3xl p-8 shadow-2xl flex flex-col items-center justify-between space-y-6">
          <div className="flex items-center justify-between w-full border-b border-white/10 pb-4">
            <span className="text-xs font-black uppercase text-emerald-400 flex items-center gap-2">
              <Sparkles className="w-4 h-4" /> Real-time 2D/3D Kit Preview
            </span>
            <span className="text-xs font-mono font-bold text-muted-foreground">{collarStyle.toUpperCase()} COLLAR</span>
          </div>

          {/* SVG Shirt Graphic */}
          <div className="relative w-64 h-80 flex flex-col items-center justify-center">
            <svg viewBox="0 0 200 240" className="w-full h-full drop-shadow-[0_20px_40px_rgba(0,0,0,0.8)]">
              {/* Main Jersey Body */}
              <path
                d="M 50 40 L 75 25 L 125 25 L 150 40 L 190 70 L 165 110 L 150 95 L 150 220 L 50 220 L 50 95 L 35 110 L 10 70 Z"
                fill={primaryColor}
                stroke="#ffffff22"
                strokeWidth="2"
              />

              {/* Sleeve Stripes */}
              {hasStripes && (
                <>
                  <rect x="18" y="75" width="12" height="25" fill={secondaryColor} transform="rotate(25 18 75)" opacity="0.9" />
                  <rect x="170" y="70" width="12" height="25" fill={secondaryColor} transform="rotate(-25 170 70)" opacity="0.9" />
                  <rect x="50" y="100" width="100" height="12" fill={secondaryColor} opacity="0.3" />
                  <rect x="50" y="140" width="100" height="12" fill={secondaryColor} opacity="0.3" />
                </>
              )}

              {/* Collar */}
              {collarStyle === 'vneck' ? (
                <path d="M 75 25 L 100 65 L 125 25 Z" fill={secondaryColor} />
              ) : (
                <path d="M 75 25 Q 100 55 125 25 Z" fill={secondaryColor} />
              )}
            </svg>

            {/* Overlay Text (Squad Chest & Player Back) */}
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center pointer-events-none space-y-2">
              <div
                className="px-3 py-1 rounded-md text-[11px] font-black tracking-widest uppercase shadow-md"
                style={{ backgroundColor: secondaryColor, color: primaryColor === '#FFFFFF' ? '#000' : '#FFF' }}
              >
                {squadName || 'TEAM NAME'}
              </div>

              <div className="text-5xl font-black font-mono tracking-tighter text-white drop-shadow-[0_4px_8px_rgba(0,0,0,0.9)]">
                {number || '10'}
              </div>

              <div className="text-xs font-black tracking-widest uppercase text-white/90 drop-shadow">
                {playerName || 'PLAYER'}
              </div>
            </div>
          </div>

          <div className="w-full pt-4 border-t border-white/10 flex items-center justify-between text-xs text-muted-foreground font-bold">
            <span className="flex items-center gap-1.5"><Truck className="w-4 h-4 text-emerald-400" /> Delivery: 3-5 Days</span>
            <span className="text-emerald-400 font-mono">100% Breathable Mesh</span>
          </div>
        </Card>

        {/* Customization Controls Form */}
        <Card className="global-box border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl space-y-5">
          <h3 className="text-xl font-black text-foreground flex items-center gap-2">
            <Palette className="w-5 h-5 text-primary" /> Customize Kit Specs
          </h3>

          {/* Color Palettes */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase mb-2 block">Primary Color</label>
              <div className="flex flex-wrap gap-2">
                {colors.map((c) => (
                  <button
                    key={c.hex}
                    type="button"
                    onClick={() => setPrimaryColor(c.hex)}
                    className={`w-7 h-7 rounded-full border-2 transition-transform cursor-pointer ${
                      primaryColor === c.hex ? 'scale-125 border-emerald-400 shadow-lg' : 'border-white/10'
                    }`}
                    style={{ backgroundColor: c.hex }}
                    title={c.name}
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase mb-2 block">Accent Color</label>
              <div className="flex flex-wrap gap-2">
                {colors.map((c) => (
                  <button
                    key={c.hex}
                    type="button"
                    onClick={() => setSecondaryColor(c.hex)}
                    className={`w-7 h-7 rounded-full border-2 transition-transform cursor-pointer ${
                      secondaryColor === c.hex ? 'scale-125 border-emerald-400 shadow-lg' : 'border-white/10'
                    }`}
                    style={{ backgroundColor: c.hex }}
                    title={c.name}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Collar & Pattern Toggles */}
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">Collar Cut</label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant={collarStyle === 'vneck' ? 'default' : 'outline'}
                  onClick={() => setCollarStyle('vneck')}
                  className="flex-1 text-xs rounded-xl font-bold"
                >
                  V-Neck
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={collarStyle === 'crew' ? 'default' : 'outline'}
                  onClick={() => setCollarStyle('crew')}
                  className="flex-1 text-xs rounded-xl font-bold"
                >
                  Crew Neck
                </Button>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">Stripes Pattern</label>
              <Button
                type="button"
                size="sm"
                variant={hasStripes ? 'default' : 'outline'}
                onClick={() => setHasStripes(!hasStripes)}
                className="w-full text-xs rounded-xl font-bold"
              >
                {hasStripes ? 'Stripes Enabled ✓' : 'Solid Plain'}
              </Button>
            </div>
          </div>

          {/* Name & Number */}
          <form onSubmit={handleOrder} className="space-y-4 pt-2 border-t border-white/10">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">Squad Chest Name</label>
                <input
                  type="text"
                  value={squadName}
                  onChange={(e) => setSquadName(e.target.value)}
                  className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-foreground text-xs font-bold uppercase"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">Player Back Name</label>
                <input
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-foreground text-xs font-bold uppercase"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">Number</label>
                <input
                  type="text"
                  value={number}
                  onChange={(e) => setNumber(e.target.value)}
                  className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-foreground text-xs font-bold font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">Fit Size</label>
                <SolidSelect
                  value={selectedSize}
                  onChange={(val) => setSelectedSize(val)}
                  options={[
                    { value: 'M', label: 'Medium (M)' },
                    { value: 'L', label: 'Large (L)' },
                    { value: 'XL', label: 'X-Large (XL)' },
                    { value: 'XXL', label: 'XX-Large' },
                  ]}
                />
              </div>

              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">Pack Quantity</label>
                <SolidSelect
                  value={String(quantity)}
                  onChange={(val) => setQuantity(Number(val))}
                  options={[
                    { value: '5', label: '5 Jerseys' },
                    { value: '10', label: '10 Jerseys' },
                    { value: '15', label: '15 Jerseys' },
                  ]}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Phone Number for Delivery"
                className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-foreground text-xs font-medium"
              />
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="City & District Address"
                className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-foreground text-xs font-medium"
              />
            </div>

            <Button
              type="submit"
              disabled={isOrdering}
              size="lg"
              className="w-full py-6 bg-primary text-black hover:bg-primary/90 font-black rounded-2xl glow-primary cursor-pointer flex items-center justify-center gap-2 mt-4 text-base"
            >
              <ShoppingBag className="w-5 h-5" /> {isOrdering ? 'Processing...' : `Place Custom Kit Order (${quantity} Shirts)`}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
