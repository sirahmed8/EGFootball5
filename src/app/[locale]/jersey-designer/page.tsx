'use client';

import * as React from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { Shirt, Sparkles, Download, Palette, Sparkle } from 'lucide-react';
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

  // 3D Tilt Effect State
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-100, 100], [15, -15]);
  const rotateY = useTransform(x, [-100, 100], [-15, 15]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set(e.clientX - centerX);
    y.set(e.clientY - centerY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };


  const colors = [
    { name: 'Emerald Green', hex: '#10B981' },
    { name: 'Cyan Neon', hex: '#06B6D4' },
    { name: 'Amber Gold', hex: '#F59E0B' },
    { name: 'Crimson Red', hex: '#EF4444' },
    { name: 'Deep Purple', hex: '#8B5CF6' },
    { name: 'Hot Pink', hex: '#EC4899' },
    { name: 'Pitch Black', hex: '#171717' },
    { name: 'Pure White', hex: '#FFFFFF' },
  ];

  // Function to convert SVG element to downloadable PNG image
  const handleDownloadImage = () => {
    if (!svgRef.current) return;
    try {
      const svgData = new XMLSerializer().serializeToString(svgRef.current);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const URL = window.URL || window.webkitURL || window;
      const blobURL = URL.createObjectURL(svgBlob);

      const image = new Image();
      image.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 600;
        canvas.height = 700;
        const context = canvas.getContext('2d');
        if (context) {
          context.fillStyle = '#000000';
          context.fillRect(0, 0, canvas.width, canvas.height);
          context.drawImage(image, 50, 50, 500, 600);

          const png = canvas.toDataURL('image/png');
          const downloadLink = document.createElement('a');
          downloadLink.href = png;
          downloadLink.download = `${squadName.replace(/\s+/g, '_')}_Jersey_${number}.png`;
          document.body.appendChild(downloadLink);
          downloadLink.click();
          document.body.removeChild(downloadLink);
          toast.success(isArabic ? 'تم حفظ الطقم على جهازك! 📸👕' : 'Jersey image saved to your device! 📸👕');
        }
      };
      image.src = blobURL;
    } catch (err) {
      console.error(err);
      toast.error(isArabic ? 'فشل في تصدير الصورة' : 'Failed to export image');
    }
  };

  return (
    <div className="min-h-screen bg-black py-10 px-4 md:px-8 max-w-6xl mx-auto space-y-8" dir={isArabic ? 'rtl' : 'ltr'}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 global-box p-8 rounded-3xl border-white/10 shadow-xl"
      >
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-black">
            <Shirt className="w-4 h-4" /> {isArabic ? 'مصمم الأطقم التفاعلي 2.0' : 'Interactive Kit Creator 2.0'}
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-foreground">
            {isArabic ? 'استوديو الأطقم' : 'Custom Jersey'} <span className="text-gradient-primary">{isArabic ? 'الاحترافي' : 'Studio Pro'}</span>
          </h1>
          <p className="text-sm text-muted-foreground">{isArabic ? 'صمم أطقم الخماسي لفريقك، اختر الأنماط والشعارات، وقم بتصدير التصميم بجودة عالية!' : 'Design custom 5-a-side team kits, choose patterns & team badges, personalize player back numbers, and export HD PNG graphics!'}</p>
        </div>

        <Button
          onClick={handleDownloadImage}
          size="lg"
          className="bg-primary text-black hover:bg-primary/90 font-black rounded-2xl glow-primary cursor-pointer flex items-center gap-2"
        >
          <Download className="w-5 h-5" /> {isArabic ? 'تحميل الطقم (PNG)' : 'Download Jersey (PNG)'}
        </Button>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Live SVG Jersey Preview Canvas */}
        <Card className="global-box border-white/10 rounded-3xl p-8 shadow-2xl flex flex-col items-center justify-between space-y-6">
          <div className="flex items-center justify-between w-full border-b border-white/10 pb-4">
            <span className="text-xs font-black uppercase text-emerald-400 flex items-center gap-2">
              <Sparkles className="w-4 h-4" /> {isArabic ? 'استوديو التصميم ثلاثي الأبعاد' : '3D PRO Kit Studio'}
            </span>
            <span className="text-xs font-mono font-bold text-muted-foreground">{isArabic ? 'ياقة ' : ''}{collarStyle.toUpperCase()}{!isArabic ? ' COLLAR' : ''} • {pattern.toUpperCase()}</span>
          </div>

          {/* SVG Shirt Graphic with 3D Tilt Container */}
          <motion.div
            style={{ x, y, rotateX, rotateY, z: 100 }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="relative w-72 h-[420px] flex items-center justify-center cursor-crosshair transform-gpu perspective-1000"
          >

            <svg
              ref={svgRef}
              viewBox="0 0 240 280"
              className="w-full h-full drop-shadow-[0_25px_50px_rgba(0,0,0,0.95)]"
              style={{ filter: 'drop-shadow(0px 20px 30px rgba(0,0,0,0.8))' }}
            >
              <defs>
                {/* Base Jersey Gradient */}
                <linearGradient id="jerseyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor={primaryColor} stopOpacity="1" />
                  <stop offset="100%" stopColor={primaryColor} stopOpacity="0.8" />
                </linearGradient>

                {/* Shading/Lighting Gradient (Overlay to make it 3D) */}
                <radialGradient id="shadingGrad" cx="30%" cy="30%" r="70%">
                  <stop offset="0%" stopColor="#ffffff" stopOpacity="0.4" />
                  <stop offset="50%" stopColor="#000000" stopOpacity="0.1" />
                  <stop offset="100%" stopColor="#000000" stopOpacity="0.6" />
                </radialGradient>

                {/* Realistic Fabric Noise Texture */}
                <filter id="fabricNoise">
                  <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch" />
                  <feColorMatrix type="matrix" values="1 0 0 0 0, 0 1 0 0 0, 0 0 1 0 0, 0 0 0 0.1 0" />
                  <feBlend mode="multiply" in2="SourceGraphic" in="noise" />
                </filter>

                {/* SVG Patterns for perfect repetition */}
                <pattern id="pat-stripes" width="40" height="40" patternUnits="userSpaceOnUse">
                  <rect width="20" height="40" fill={secondaryColor} opacity="0.85" />
                </pattern>
                <pattern id="pat-hoops" width="40" height="40" patternUnits="userSpaceOnUse">
                  <rect width="40" height="20" fill={secondaryColor} opacity="0.85" />
                </pattern>
                <pattern id="pat-checkerboard" width="40" height="40" patternUnits="userSpaceOnUse">
                  <rect width="20" height="20" fill={secondaryColor} opacity="0.85" />
                  <rect x="20" y="20" width="20" height="20" fill={secondaryColor} opacity="0.85" />
                </pattern>
                
                {/* The main jersey shape path to reuse as a clip mask */}
                <clipPath id="jerseyClip">
                  <path d="M 60 45 L 90 30 L 150 30 L 180 45 L 225 80 L 195 125 L 180 110 L 180 255 L 60 255 L 60 110 L 45 125 L 15 80 Z" />
                </clipPath>
              </defs>

              {/* 1. Base Layer (Solid Color + Base Gradient) */}
              <path
                d="M 60 45 L 90 30 L 150 30 L 180 45 L 225 80 L 195 125 L 180 110 L 180 255 L 60 255 L 60 110 L 45 125 L 15 80 Z"
                fill="url(#jerseyGrad)"
              />

              {/* 2. Pattern Layer (clipped strictly to jersey shape) */}
              <g clipPath="url(#jerseyClip)">
                {pattern === 'stripes' && <rect x="0" y="0" width="240" height="280" fill="url(#pat-stripes)" />}
                {pattern === 'hoops' && <rect x="0" y="0" width="240" height="280" fill="url(#pat-hoops)" />}
                {pattern === 'checkerboard' && <rect x="0" y="0" width="240" height="280" fill="url(#pat-checkerboard)" />}
                {pattern === 'halves' && <rect x="120" y="0" width="120" height="280" fill={secondaryColor} opacity="0.85" />}
                {pattern === 'sash' && <polygon points="0,0 240,240 240,280 0,40" fill={secondaryColor} opacity="0.85" />}
              </g>

              {/* 3. 3D Shading & Lighting Overlay Layer */}
              <path
                d="M 60 45 L 90 30 L 150 30 L 180 45 L 225 80 L 195 125 L 180 110 L 180 255 L 60 255 L 60 110 L 45 125 L 15 80 Z"
                fill="url(#shadingGrad)"
                style={{ mixBlendMode: 'overlay' }}
              />

              {/* 4. Fabric Texture Overlay Layer */}
              <path
                d="M 60 45 L 90 30 L 150 30 L 180 45 L 225 80 L 195 125 L 180 110 L 180 255 L 60 255 L 60 110 L 45 125 L 15 80 Z"
                fill="transparent"
                filter="url(#fabricNoise)"
                opacity="0.3"
              />

              {/* 5. Seam Lines and Edges (Adds thickness and realism) */}
              <path
                d="M 60 45 L 90 30 L 150 30 L 180 45 L 225 80 L 195 125 L 180 110 L 180 255 L 60 255 L 60 110 L 45 125 L 15 80 Z"
                fill="none"
                stroke="#ffffff44"
                strokeWidth="1.5"
              />
              {/* Shoulder/Armpit Seam Lines */}
              <path d="M 60 45 Q 75 80 60 110" fill="none" stroke="#00000033" strokeWidth="2" />
              <path d="M 180 45 Q 165 80 180 110" fill="none" stroke="#00000033" strokeWidth="2" />
              <path d="M 60 250 L 180 250" fill="none" stroke="#00000055" strokeWidth="2" />

              {/* Sleeve Accent Trims */}
              <rect x="18" y="87" width="16" height="28" fill={secondaryColor} transform="rotate(25 22 85)" rx="3" />
              <rect x="206" y="80" width="16" height="28" fill={secondaryColor} transform="rotate(-25 204 80)" rx="3" />

              {/* Crest Badge Graphic */}
              <g transform="translate(150, 75)">
                <path d="M 0 0 L 16 0 L 16 16 L 8 22 L 0 16 Z" fill={secondaryColor} stroke="#FFF" strokeWidth="1.5" />
                <circle cx="8" cy="8" r="3.5" fill="#FFF" />
              </g>

              {/* Sponsor Logo Placeholder (Modern detail) */}
              <rect x="85" y="125" width="70" height="12" rx="4" fill="#ffffff" opacity="0.2" />

              {/* Collar Style */}
              {collarStyle === 'vneck' ? (
                <path d="M 90 30 L 120 75 L 150 30 Z" fill={secondaryColor} stroke="#00000044" strokeWidth="2" />
              ) : (
                <path d="M 90 30 Q 120 65 150 30 Z" fill={secondaryColor} stroke="#00000044" strokeWidth="2" />
              )}
            </svg>

            {/* Overlay Text (Squad Chest & Player Back) */}
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center pointer-events-none space-y-3 pt-12">
              <div
                className="px-5 py-1.5 rounded-lg text-[10px] font-black tracking-widest uppercase shadow-2xl border border-white/20 drop-shadow-md"
                style={{ backgroundColor: secondaryColor, color: primaryColor === '#FFFFFF' ? '#000' : '#FFF' }}
              >
                {squadName || (isArabic ? 'اسم الفريق' : 'SQUAD NAME')}
              </div>

              <div className="text-[5rem] font-black font-sans tracking-tighter text-white drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)]" style={{ WebkitTextStroke: '2px rgba(0,0,0,0.3)' }}>
                {number || '10'}
              </div>

              <div className="text-xs font-black tracking-widest uppercase text-white/90 drop-shadow-md bg-black/40 px-3 py-1 rounded-full backdrop-blur-sm">
                {playerName || (isArabic ? 'اللاعب' : 'PLAYER')}
              </div>
            </div>
          </motion.div>


          <div className="w-full pt-4 border-t border-white/10 flex items-center justify-between text-xs text-muted-foreground font-bold">
            <span className="flex items-center gap-1.5"><Sparkle className="w-4 h-4 text-emerald-400" /> {isArabic ? 'طقم خماسي احترافي' : 'Professional 5-a-side Kit'}</span>
            <span className="text-emerald-400 font-mono">{isArabic ? 'جاهز للحفظ والمشاركة' : 'Ready to Save & Share'}</span>
          </div>
        </Card>

        {/* Customizer Controls */}
        <Card className="global-box border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl space-y-6">
          <h3 className="text-xl font-black text-foreground flex items-center gap-2">
            <Palette className="w-5 h-5 text-primary" /> {isArabic ? 'تخصيص تصميم الطقم' : 'Personalize Kit Styling'}
          </h3>

          {/* Pattern Style Selector */}
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase mb-2 block">{isArabic ? 'نمط الطقم' : 'Kit Pattern Style'}</label>
            <div className="grid grid-cols-3 gap-2">
              {(['solid', 'stripes', 'hoops', 'checkerboard', 'halves', 'sash'] as const).map((p) => (
                <Button
                  key={p}
                  type="button"
                  size="sm"
                  variant={pattern === p ? 'default' : 'outline'}
                  onClick={() => setPattern(p)}
                  className="text-[10px] rounded-xl font-bold uppercase"
                >
                  {p}
                </Button>
              ))}
            </div>
          </div>


          {/* Primary Color */}
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase mb-2 block">{isArabic ? 'اللون الأساسي' : 'Primary Color'}</label>
            <div className="flex flex-wrap gap-2.5">
              {colors.map((c) => (
                <button
                  key={c.hex}
                  type="button"
                  onClick={() => setPrimaryColor(c.hex)}
                  className={`w-8 h-8 rounded-full border-2 transition-transform cursor-pointer ${
                    primaryColor === c.hex ? 'scale-125 border-emerald-400 shadow-xl ring-2 ring-emerald-400/50' : 'border-white/10'
                  }`}
                  style={{ backgroundColor: c.hex }}
                  title={c.name}
                />
              ))}
            </div>
          </div>

          {/* Secondary Color */}
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase mb-2 block">{isArabic ? 'اللون الثانوي (التفاصيل)' : 'Accent Trim Color'}</label>
            <div className="flex flex-wrap gap-2.5">
              {colors.map((c) => (
                <button
                  key={c.hex}
                  type="button"
                  onClick={() => setSecondaryColor(c.hex)}
                  className={`w-8 h-8 rounded-full border-2 transition-transform cursor-pointer ${
                    secondaryColor === c.hex ? 'scale-125 border-emerald-400 shadow-xl ring-2 ring-emerald-400/50' : 'border-white/10'
                  }`}
                  style={{ backgroundColor: c.hex }}
                  title={c.name}
                />
              ))}
            </div>
          </div>

          {/* Collar & Stripes Options */}
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase mb-1.5 block">{isArabic ? 'قصة الياقة' : 'Collar Cut'}</label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant={collarStyle === 'vneck' ? 'default' : 'outline'}
                  onClick={() => setCollarStyle('vneck')}
                  className="flex-1 text-xs rounded-xl font-bold"
                >
                  {isArabic ? 'ياقة V' : 'V-Neck'}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={collarStyle === 'crew' ? 'default' : 'outline'}
                  onClick={() => setCollarStyle('crew')}
                  className="flex-1 text-xs rounded-xl font-bold"
                >
                  {isArabic ? 'دائري' : 'Crew Cut'}
                </Button>
              </div>
            </div>


          </div>

          {/* Squad Name, Player Name & Number */}
          <div className="space-y-4 pt-4 border-t border-white/10">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">{isArabic ? 'اسم الفريق (على الصدر)' : 'Squad Chest Name'}</label>
                <input
                  type="text"
                  value={squadName}
                  onChange={(e) => setSquadName(e.target.value.toUpperCase())}
                  className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-foreground text-xs font-bold uppercase"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">{isArabic ? 'اسم اللاعب (على الظهر)' : 'Player Back Name'}</label>
                <input
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value.toUpperCase())}
                  className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-foreground text-xs font-bold uppercase"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">{isArabic ? 'رقم القميص (0-99)' : 'Shirt Number (0-99)'}</label>
              <input
                type="text"
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-foreground text-xs font-bold font-mono"
              />
            </div>

            <Button
              onClick={handleDownloadImage}
              size="lg"
              className="w-full py-6 bg-primary text-black hover:bg-primary/90 font-black rounded-2xl glow-primary cursor-pointer flex items-center justify-center gap-2 mt-4 text-base"
            >
              <Download className="w-5 h-5" /> {isArabic ? 'حفظ الطقم على الجهاز (PNG)' : 'Save Jersey to Device (PNG)'}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
