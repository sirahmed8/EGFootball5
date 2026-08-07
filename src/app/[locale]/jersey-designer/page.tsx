'use client';

import * as React from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';
import { Download, Sparkle, Shield, Crown, Star, Flame } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { useLocale } from 'next-intl';

export default function JerseyDesignerPage() {
  const locale = useLocale();
  const isArabic = locale === 'ar';
  const [primaryColor, setPrimaryColor] = React.useState('#10B981');
  const [secondaryColor, setSecondaryColor] = React.useState('#06B6D4');
  const [collarStyle, setCollarStyle] = React.useState<'vneck' | 'crew'>('vneck');
  const [pattern, setPattern] = React.useState<'solid' | 'stripes' | 'hoops' | 'checkerboard' | 'halves' | 'sash'>('stripes');
  const [badgeIcon, setBadgeIcon] = React.useState<'shield' | 'crown' | 'star' | 'flame'>('shield');
  const [squadName, setSquadName] = React.useState('OBOUR EAGLES');
  const [playerName, setPlayerName] = React.useState('AHMED');
  const [number, setNumber] = React.useState('10');

  const svgRef = React.useRef<SVGSVGElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // --- Smooth spring-based 3D tilt (no glitch loop) ---
  const mouseX = useSpring(0, { stiffness: 120, damping: 20, mass: 0.5 });
  const mouseY = useSpring(0, { stiffness: 120, damping: 20, mass: 0.5 });
  const rotateX = useTransform(mouseY, [-1, 1], [15, -15]);
  const rotateY = useTransform(mouseX, [-1, 1], [-15, 15]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width * 2 - 1);
    mouseY.set((e.clientY - rect.top) / rect.height * 2 - 1);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  const colors = [
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

  const handleDownloadImage = () => {
    if (!svgRef.current) return;
    try {
      const svgData = new XMLSerializer().serializeToString(svgRef.current);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const blobURL = URL.createObjectURL(svgBlob);
      const image = new Image();
      image.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 800;
        canvas.height = 1000;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#0a0a0a';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.fillStyle = primaryColor;
          ctx.globalAlpha = 0.08;
          ctx.beginPath();
          ctx.arc(400, 500, 320, 0, 2 * Math.PI);
          ctx.fill();
          ctx.globalAlpha = 1.0;
          ctx.drawImage(image, 100, 150, 600, 700);
          ctx.fillStyle = 'rgba(255,255,255,0.5)';
          ctx.font = 'bold 18px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('EGFootball5 PRO Kit Studio', 400, 960);
          const png = canvas.toDataURL('image/png');
          const a = document.createElement('a');
          a.href = png;
          a.download = `${squadName.replace(/\s+/g, '_')}_Jersey_${number}.png`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          toast.success(isArabic ? 'تم تصدير الطقم بنجاح! 📸' : 'Jersey exported in HD! 📸');
        }
      };
      image.src = blobURL;
    } catch {
      toast.error(isArabic ? 'فشل في التصدير' : 'Export failed');
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] py-10 px-4 md:px-8 max-w-7xl mx-auto space-y-6" dir={isArabic ? 'rtl' : 'ltr'}>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 md:p-8 rounded-[2rem] border border-white/[0.06] bg-white/[0.02] shadow-2xl"
      >
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-black tracking-widest uppercase">
            <Sparkle className="w-3.5 h-3.5" />
            {isArabic ? 'استوديو التصميم الاحترافي' : 'PRO Kit Studio v3.0'}
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
            {isArabic ? 'صمم طقم ' : 'Design Your '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
              {isArabic ? 'أحلامك' : 'Dream Kit'}
            </span>
          </h1>
          <p className="text-xs text-white/40 max-w-lg leading-relaxed">
            {isArabic
              ? 'محرك تصيير ثلاثي الأبعاد. تحكم بالأنماط والألوان والشعارات.'
              : 'Advanced 3D render engine. Control patterns, colors, and crests.'}
          </p>
        </div>

        <Button
          onClick={handleDownloadImage}
          size="lg"
          className="bg-white text-black hover:bg-white/90 font-black rounded-2xl transition-all hover:scale-105 cursor-pointer flex items-center gap-2 px-6 py-6 shadow-[0_0_30px_rgba(255,255,255,0.15)]"
        >
          <Download className="w-4 h-4" />
          {isArabic ? 'تصدير PNG' : 'Export PNG'}
        </Button>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Jersey Preview */}
        <div className="lg:col-span-5 h-[600px] relative rounded-[2rem] border border-white/[0.06] bg-gradient-to-b from-white/[0.04] to-transparent flex flex-col items-center justify-center overflow-hidden shadow-2xl">
          {/* Studio spotlight */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-28 bg-white/10 blur-[80px] pointer-events-none rounded-full" />
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-40 h-6 bg-black/60 blur-xl pointer-events-none rounded-full" />

          {/* 3D tilt wrapper — perspective must be on the outer div */}
          <div
            ref={containerRef}
            className="relative w-full max-w-[320px] aspect-[4/5] cursor-crosshair"
            style={{ perspective: '900px' }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <motion.div
              style={{ rotateX, rotateY }}
              className="w-full h-full flex items-center justify-center"
            >
              <svg
                ref={svgRef}
                viewBox="0 0 400 450"
                className="w-full h-full"
                style={{ filter: 'drop-shadow(0px 20px 40px rgba(0,0,0,0.95))' }}
              >
                <defs>
                  <linearGradient id="jerseyBaseGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor={primaryColor} stopOpacity="1" />
                    <stop offset="60%" stopColor={primaryColor} stopOpacity="0.92" />
                    <stop offset="100%" stopColor="#000" stopOpacity="0.25" />
                  </linearGradient>

                  <filter id="meshTexture" x="0%" y="0%" width="100%" height="100%">
                    <feTurbulence type="fractalNoise" baseFrequency="1.8" numOctaves="4" stitchTiles="stitch" result="noise" />
                    <feColorMatrix type="matrix" values="1 0 0 0 0, 0 1 0 0 0, 0 0 1 0 0, 0 0 0 0.07 0" in="noise" result="tinted" />
                    <feBlend mode="multiply" in="SourceGraphic" in2="tinted" />
                  </filter>

                  <linearGradient id="shadowFolds" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#000" stopOpacity="0.55"/>
                    <stop offset="15%" stopColor="#000" stopOpacity="0.08"/>
                    <stop offset="30%" stopColor="#fff" stopOpacity="0.12"/>
                    <stop offset="50%" stopColor="#000" stopOpacity="0"/>
                    <stop offset="70%" stopColor="#fff" stopOpacity="0.12"/>
                    <stop offset="85%" stopColor="#000" stopOpacity="0.08"/>
                    <stop offset="100%" stopColor="#000" stopOpacity="0.6"/>
                  </linearGradient>

                  <radialGradient id="chestHighlight" cx="50%" cy="25%" r="50%">
                    <stop offset="0%" stopColor="#fff" stopOpacity="0.25"/>
                    <stop offset="100%" stopColor="#fff" stopOpacity="0"/>
                  </radialGradient>

                  {/* Jersey shape */}
                  <clipPath id="jerseyClip">
                    <path d="M 160 20
                             C 180 20, 220 20, 240 20
                             C 260 25, 290 40, 310 50
                             C 330 60, 350 75, 360 90
                             C 365 100, 370 120, 360 130
                             C 350 140, 330 135, 320 125
                             C 310 115, 300 150, 300 180
                             L 305 400
                             C 300 410, 200 420, 100 410
                             L 95 180
                             C 95 150, 90 115, 80 125
                             C 70 135, 50 140, 40 130
                             C 30 120, 35 100, 40 90
                             C 50 75, 70 60, 90 50
                             C 110 40, 140 25, 160 20 Z" />
                  </clipPath>

                  <pattern id="pat-stripes" width="55" height="55" patternUnits="userSpaceOnUse">
                    <rect width="27.5" height="55" fill={secondaryColor} opacity="0.9" />
                  </pattern>
                  <pattern id="pat-hoops" width="55" height="55" patternUnits="userSpaceOnUse">
                    <rect width="55" height="27.5" fill={secondaryColor} opacity="0.9" />
                  </pattern>
                  <pattern id="pat-checkerboard" width="55" height="55" patternUnits="userSpaceOnUse">
                    <rect width="27.5" height="27.5" fill={secondaryColor} opacity="0.9" />
                    <rect x="27.5" y="27.5" width="27.5" height="27.5" fill={secondaryColor} opacity="0.9" />
                  </pattern>
                </defs>

                {/* Base */}
                <path d="M 0 0 h 400 v 450 h -400 z" clipPath="url(#jerseyClip)" fill="url(#jerseyBaseGrad)" />

                {/* Pattern */}
                <g clipPath="url(#jerseyClip)">
                  {pattern === 'stripes' && <rect x="0" y="0" width="400" height="450" fill="url(#pat-stripes)" />}
                  {pattern === 'hoops' && <rect x="0" y="0" width="400" height="450" fill="url(#pat-hoops)" />}
                  {pattern === 'checkerboard' && <rect x="0" y="0" width="400" height="450" fill="url(#pat-checkerboard)" />}
                  {pattern === 'halves' && <rect x="200" y="0" width="200" height="450" fill={secondaryColor} opacity="0.9" />}
                  {pattern === 'sash' && <polygon points="-50,0 450,450 400,500 -100,50" fill={secondaryColor} opacity="0.9" />}
                </g>

                {/* Fabric texture */}
                <path d="M 0 0 h 400 v 450 h -400 z" clipPath="url(#jerseyClip)" fill="transparent" filter="url(#meshTexture)" />

                {/* Shading */}
                <path d="M 0 0 h 400 v 450 h -400 z" clipPath="url(#jerseyClip)" fill="url(#shadowFolds)" style={{ mixBlendMode: 'multiply' }} />
                <path d="M 0 0 h 400 v 450 h -400 z" clipPath="url(#jerseyClip)" fill="url(#chestHighlight)" style={{ mixBlendMode: 'overlay' }} />

                {/* Seams */}
                <path d="M 85 145 Q 115 80 160 20" fill="none" stroke="#000" strokeWidth="2.5" strokeOpacity="0.4" />
                <path d="M 315 145 Q 285 80 240 20" fill="none" stroke="#000" strokeWidth="2.5" strokeOpacity="0.4" />
                <path d="M 100 410 Q 200 420 300 410" fill="none" stroke="#000" strokeWidth="5" strokeOpacity="0.4" />

                {/* Cuffs */}
                <path d="M 35 110 L 40 130 L 75 125" fill="none" stroke={secondaryColor} strokeWidth="11" strokeLinecap="round" style={{ filter: 'drop-shadow(0px 4px 4px rgba(0,0,0,0.5))' }} />
                <path d="M 365 110 L 360 130 L 325 125" fill="none" stroke={secondaryColor} strokeWidth="11" strokeLinecap="round" style={{ filter: 'drop-shadow(0px 4px 4px rgba(0,0,0,0.5))' }} />

                {/* Badge */}
                <g transform="translate(240, 100) scale(1.6)" style={{ filter: 'drop-shadow(0px 4px 6px rgba(0,0,0,0.6))' }}>
                  {badgeIcon === 'shield' && (
                    <>
                      <path d="M 0 0 L 16 0 L 16 16 L 8 24 L 0 16 Z" fill={secondaryColor} stroke="#FFF" strokeWidth="1.5" />
                      <circle cx="8" cy="10" r="3" fill="#FFF" />
                    </>
                  )}
                  {badgeIcon === 'crown' && (
                    <>
                      <path d="M 0 4 L 4 16 L 8 8 L 12 16 L 16 4 L 14 20 L 2 20 Z" fill={secondaryColor} stroke="#FFF" strokeWidth="1.5" />
                      <circle cx="8" cy="23" r="1.5" fill="#FFF" />
                    </>
                  )}
                  {badgeIcon === 'star' && (
                    <path d="M 8 0 L 10 5 L 16 6 L 11 10 L 13 16 L 8 13 L 3 16 L 5 10 L 0 6 L 6 5 Z" fill={secondaryColor} stroke="#FFF" strokeWidth="1.5" />
                  )}
                  {badgeIcon === 'flame' && (
                    <path d="M 8 0 C 14 8 16 12 14 18 C 12 24 4 24 2 18 C 0 12 4 8 8 0 Z" fill={secondaryColor} stroke="#FFF" strokeWidth="1.5" />
                  )}
                </g>

                {/* Collar */}
                <g style={{ filter: 'drop-shadow(0px 6px 8px rgba(0,0,0,0.7))' }}>
                  {collarStyle === 'vneck' ? (
                    <>
                      <path d="M 160 20 L 200 90 L 240 20 Z" fill={secondaryColor} stroke="#000" strokeWidth="2" strokeOpacity="0.6" />
                      <path d="M 160 20 L 200 90 L 240 20 Z" fill="none" stroke="#FFF" strokeWidth="0.8" strokeOpacity="0.4" />
                    </>
                  ) : (
                    <>
                      <path d="M 160 20 Q 200 100 240 20 Z" fill={secondaryColor} stroke="#000" strokeWidth="2" strokeOpacity="0.6" />
                      <path d="M 160 20 Q 200 100 240 20 Z" fill="none" stroke="#FFF" strokeWidth="0.8" strokeOpacity="0.4" />
                    </>
                  )}
                </g>

                {/* Typography */}
                <text x="200" y="210" textAnchor="middle" fill="#FFFFFF" fontSize="25" fontWeight="900" letterSpacing="5" fontFamily="Arial, sans-serif" style={{ filter: 'drop-shadow(1px 3px 5px rgba(0,0,0,0.85))' }}>
                  {squadName || 'SQUAD'}
                </text>
                <text x="200" y="330" textAnchor="middle" fill="#FFFFFF" fontSize="108" fontWeight="900" fontFamily="Arial, sans-serif" style={{ filter: 'drop-shadow(3px 6px 10px rgba(0,0,0,0.9))' }}>
                  {number || '10'}
                </text>
                <text x="200" y="378" textAnchor="middle" fill="#FFFFFF" fontSize="15" fontWeight="700" letterSpacing="4" fontFamily="Arial, sans-serif" style={{ filter: 'drop-shadow(1px 2px 4px rgba(0,0,0,0.8))' }}>
                  {playerName || 'PLAYER'}
                </text>
              </svg>
            </motion.div>
          </div>
        </div>

        {/* Controls */}
        <div className="lg:col-span-7 space-y-4">
          <Card className="rounded-[2rem] border-white/[0.06] bg-white/[0.02] p-5 md:p-7 shadow-xl space-y-6">

            {/* Row 1: Pattern + Badge */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

              {/* Pattern */}
              <div className="space-y-2.5">
                <label className="text-[10px] font-black text-white/50 uppercase tracking-widest block">
                  {isArabic ? 'تصميم النسيج' : 'Fabric Pattern'}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['solid', 'stripes', 'hoops', 'checkerboard', 'halves', 'sash'] as const).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPattern(p)}
                      className={`text-[10px] h-9 rounded-xl font-black uppercase tracking-wide transition-all duration-200 border ${
                        pattern === p
                          ? 'bg-white text-black border-white shadow-[0_0_12px_rgba(255,255,255,0.3)]'
                          : 'bg-white/[0.04] text-white/60 border-white/10 hover:border-white/25 hover:bg-white/[0.07] hover:text-white/80'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Badge */}
              <div className="space-y-2.5">
                <label className="text-[10px] font-black text-white/50 uppercase tracking-widest block">
                  {isArabic ? 'شعار النادي' : 'Club Crest'}
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {([
                    { id: 'shield', icon: Shield },
                    { id: 'crown', icon: Crown },
                    { id: 'star', icon: Star },
                    { id: 'flame', icon: Flame },
                  ] as const).map((b) => {
                    const Icon = b.icon;
                    return (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => setBadgeIcon(b.id)}
                        className={`h-9 rounded-xl flex items-center justify-center transition-all duration-200 border ${
                          badgeIcon === b.id
                            ? 'bg-emerald-500 text-black border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                            : 'bg-white/[0.04] text-white/60 border-white/10 hover:border-white/25 hover:bg-white/[0.07] hover:text-white/80'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="h-px bg-white/[0.06]" />

            {/* Row 2: Colors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2.5">
                <label className="text-[10px] font-black text-white/50 uppercase tracking-widest block">
                  {isArabic ? 'اللون الأساسي' : 'Base Color'}
                </label>
                <div className="flex flex-wrap gap-2">
                  {colors.map((c) => (
                    <button
                      key={c.hex}
                      type="button"
                      onClick={() => setPrimaryColor(c.hex)}
                      title={c.name}
                      className="relative rounded-full transition-all duration-200 focus:outline-none"
                      style={{
                        width: 28,
                        height: 28,
                        backgroundColor: c.hex,
                        boxShadow: primaryColor === c.hex
                          ? `0 0 0 2px #050505, 0 0 0 4px ${c.hex}, 0 0 14px ${c.hex}80`
                          : '0 0 0 1px rgba(255,255,255,0.12)',
                        transform: primaryColor === c.hex ? 'scale(1.2)' : 'scale(1)',
                      }}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-2.5">
                <label className="text-[10px] font-black text-white/50 uppercase tracking-widest block">
                  {isArabic ? 'اللون الثانوي' : 'Accent & Trim'}
                </label>
                <div className="flex flex-wrap gap-2">
                  {colors.map((c) => (
                    <button
                      key={c.hex}
                      type="button"
                      onClick={() => setSecondaryColor(c.hex)}
                      title={c.name}
                      className="relative rounded-full transition-all duration-200 focus:outline-none"
                      style={{
                        width: 28,
                        height: 28,
                        backgroundColor: c.hex,
                        boxShadow: secondaryColor === c.hex
                          ? `0 0 0 2px #050505, 0 0 0 4px ${c.hex}, 0 0 14px ${c.hex}80`
                          : '0 0 0 1px rgba(255,255,255,0.12)',
                        transform: secondaryColor === c.hex ? 'scale(1.2)' : 'scale(1)',
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="h-px bg-white/[0.06]" />

            {/* Row 3: Collar */}
            <div className="space-y-2.5">
              <label className="text-[10px] font-black text-white/50 uppercase tracking-widest block">
                {isArabic ? 'الياقة' : 'Collar Cut'}
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setCollarStyle('vneck')}
                  className={`h-9 rounded-xl font-black text-sm tracking-wide transition-all duration-200 border ${
                    collarStyle === 'vneck'
                      ? 'bg-white text-black border-white shadow-[0_0_12px_rgba(255,255,255,0.25)]'
                      : 'bg-white/[0.04] text-white/60 border-white/10 hover:border-white/25 hover:bg-white/[0.07] hover:text-white/80'
                  }`}
                >
                  V-Neck
                </button>
                <button
                  type="button"
                  onClick={() => setCollarStyle('crew')}
                  className={`h-9 rounded-xl font-black text-sm tracking-wide transition-all duration-200 border ${
                    collarStyle === 'crew'
                      ? 'bg-white text-black border-white shadow-[0_0_12px_rgba(255,255,255,0.25)]'
                      : 'bg-white/[0.04] text-white/60 border-white/10 hover:border-white/25 hover:bg-white/[0.07] hover:text-white/80'
                  }`}
                >
                  Crew Cut
                </button>
              </div>
            </div>

            <div className="h-px bg-white/[0.06]" />

            {/* Row 4: Text inputs */}
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-white/50 uppercase tracking-widest block">
                  {isArabic ? 'اسم النادي' : 'Squad Chest'}
                </label>
                <input
                  type="text"
                  value={squadName}
                  maxLength={15}
                  onChange={(e) => setSquadName(e.target.value.toUpperCase())}
                  className="w-full p-3 rounded-xl bg-white/[0.05] border border-white/10 text-white font-black uppercase text-xs focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/30 outline-none transition-all placeholder:text-white/20"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-white/50 uppercase tracking-widest block">
                  {isArabic ? 'اسم اللاعب' : 'Player Back'}
                </label>
                <input
                  type="text"
                  value={playerName}
                  maxLength={12}
                  onChange={(e) => setPlayerName(e.target.value.toUpperCase())}
                  className="w-full p-3 rounded-xl bg-white/[0.05] border border-white/10 text-white font-black uppercase text-xs focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/30 outline-none transition-all placeholder:text-white/20"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-white/50 uppercase tracking-widest block">
                  {isArabic ? 'رقم' : 'Number'}
                </label>
                <input
                  type="text"
                  value={number}
                  maxLength={2}
                  onChange={(e) => setNumber(e.target.value.replace(/\D/g, ''))}
                  className="w-full p-3 rounded-xl bg-white/[0.05] border border-white/10 text-white font-black font-mono text-xs focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/30 outline-none transition-all placeholder:text-white/20"
                />
              </div>
            </div>

          </Card>
        </div>
      </div>
    </div>
  );
}
