'use client';

import * as React from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
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

  // 3D Tilt Effect State
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-150, 150], [25, -25]);
  const rotateY = useTransform(x, [-150, 150], [-25, 25]);

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
    { name: 'Royal Blue', hex: '#2563EB' },
    { name: 'Pitch Black', hex: '#171717' },
    { name: 'Pure White', hex: '#FFFFFF' },
    { name: 'Neon Yellow', hex: '#EAB308' },
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
        canvas.width = 800;
        canvas.height = 1000;
        const context = canvas.getContext('2d');
        if (context) {
          // HD Background
          context.fillStyle = '#0a0a0a';
          context.fillRect(0, 0, canvas.width, canvas.height);
          
          // Add some flair to the exported PNG
          context.fillStyle = primaryColor;
          context.globalAlpha = 0.1;
          context.beginPath();
          context.arc(400, 500, 300, 0, 2 * Math.PI);
          context.fill();
          context.globalAlpha = 1.0;

          // Draw the jersey
          context.drawImage(image, 100, 150, 600, 700);

          // Add branding watermark
          context.fillStyle = '#ffffff';
          context.font = 'bold 24px sans-serif';
          context.textAlign = 'center';
          context.fillText('EGFootball5 PRO Kit Studio', 400, 950);

          const png = canvas.toDataURL('image/png');
          const downloadLink = document.createElement('a');
          downloadLink.href = png;
          downloadLink.download = `${squadName.replace(/\s+/g, '_')}_Jersey_${number}.png`;
          document.body.appendChild(downloadLink);
          downloadLink.click();
          document.body.removeChild(downloadLink);
          toast.success(isArabic ? 'تم تصدير الطقم بنجاح! 📸👕' : 'Pro Jersey exported in HD! 📸👕');
        }
      };
      image.src = blobURL;
    } catch (err) {
      console.error(err);
      toast.error(isArabic ? 'فشل في تصدير الصورة' : 'Failed to export HD image');
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] py-10 px-4 md:px-8 max-w-7xl mx-auto space-y-8" dir={isArabic ? 'rtl' : 'ltr'}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-8 rounded-[2rem] border border-white/5 bg-white/[0.02] shadow-2xl backdrop-blur-xl"
      >
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-black tracking-wider uppercase">
            <Sparkle className="w-4 h-4" /> {isArabic ? 'استوديو التصميم الاحترافي v3.0' : 'PRO Kit Studio v3.0'}
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">
            {isArabic ? 'صمم طقم' : 'Design Your'} <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-cyan-400">{isArabic ? 'أحلامك' : 'Dream Kit'}</span>
          </h1>
          <p className="text-sm text-white/50 max-w-xl leading-relaxed">
            {isArabic 
              ? 'أحدث محرك تصيير ثلاثي الأبعاد للأطقم الرياضية. تحكم بالخامات، الأنماط، الإضاءة، والشعارات بجودة سينمائية فائقة.' 
              : 'Our advanced 3D render engine for bespoke sports apparel. Control fabrics, patterns, lighting, and crests in ultra-HD.'}
          </p>
        </div>

        <Button
          onClick={handleDownloadImage}
          size="lg"
          className="bg-white text-black hover:bg-gray-200 font-black rounded-2xl shadow-[0_0_40px_rgba(255,255,255,0.3)] transition-all hover:scale-105 cursor-pointer flex items-center gap-2 px-8 py-7"
        >
          <Download className="w-5 h-5" /> {isArabic ? 'تصدير (HD PNG)' : 'Export HD (PNG)'}
        </Button>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Live SVG Jersey Preview Canvas */}
        <div className="lg:col-span-5 h-[650px] relative rounded-[2rem] border border-white/10 bg-gradient-to-b from-white/5 to-transparent flex flex-col items-center justify-center p-8 overflow-visible shadow-2xl">
          {/* Studio Lights Effect */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-white/20 blur-[100px] pointer-events-none rounded-full" />
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-48 h-8 bg-black blur-xl pointer-events-none rounded-full opacity-80" />

          {/* SVG Shirt Graphic with 3D Tilt Container */}
          <motion.div
            style={{ x, y, rotateX, rotateY, z: 100 }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="relative w-full max-w-[360px] aspect-[4/5] flex items-center justify-center cursor-crosshair transform-gpu"
          >
            <svg
              ref={svgRef}
              viewBox="0 0 300 350"
              className="w-full h-full drop-shadow-[0_30px_40px_rgba(0,0,0,0.8)]"
              style={{ filter: 'drop-shadow(0px 25px 35px rgba(0,0,0,0.9))' }}
            >
              <defs>
                <linearGradient id="jerseyBaseGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor={primaryColor} stopOpacity="1" />
                  <stop offset="100%" stopColor={primaryColor} stopOpacity="0.75" />
                </linearGradient>

                {/* Advanced Micro-Mesh Texture */}
                <filter id="meshTexture">
                  <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" stitchTiles="stitch" />
                  <feColorMatrix type="matrix" values="1 0 0 0 0, 0 1 0 0 0, 0 0 1 0 0, 0 0 0 0.15 0" />
                  <feBlend mode="multiply" in2="SourceGraphic" in="noise" />
                </filter>

                {/* Realistic Cinematic Lighting / Shadow Folds */}
                <linearGradient id="shadowFolds" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#000" stopOpacity="0.7"/>
                  <stop offset="15%" stopColor="#000" stopOpacity="0"/>
                  <stop offset="25%" stopColor="#000" stopOpacity="0.2"/>
                  <stop offset="50%" stopColor="#000" stopOpacity="0"/>
                  <stop offset="75%" stopColor="#000" stopOpacity="0.25"/>
                  <stop offset="85%" stopColor="#000" stopOpacity="0"/>
                  <stop offset="100%" stopColor="#000" stopOpacity="0.8"/>
                </linearGradient>

                {/* Center Chest Spotlight */}
                <radialGradient id="chestHighlight" cx="50%" cy="30%" r="50%">
                  <stop offset="0%" stopColor="#fff" stopOpacity="0.45"/>
                  <stop offset="100%" stopColor="#fff" stopOpacity="0"/>
                </radialGradient>

                {/* Advanced Precision Cut T-Shirt Path */}
                <clipPath id="jerseyClip">
                  <path d="M 100 20 C 100 20, 150 45, 200 20 C 230 20, 255 50, 255 50 L 290 85 C 298 93, 290 110, 280 115 L 245 135 C 240 140, 230 140, 230 125 C 225 180, 225 250, 235 320 C 150 335, 150 335, 65 320 C 75 250, 75 180, 70 125 C 70 140, 60 140, 55 135 L 20 115 C 10 110, 2 93, 10 85 L 45 50 C 45 50, 70 20, 100 20 Z" />
                </clipPath>

                {/* Patterns */}
                <pattern id="pat-stripes" width="50" height="50" patternUnits="userSpaceOnUse">
                  <rect width="25" height="50" fill={secondaryColor} opacity="0.85" />
                </pattern>
                <pattern id="pat-hoops" width="50" height="50" patternUnits="userSpaceOnUse">
                  <rect width="50" height="25" fill={secondaryColor} opacity="0.85" />
                </pattern>
                <pattern id="pat-checkerboard" width="40" height="40" patternUnits="userSpaceOnUse">
                  <rect width="20" height="20" fill={secondaryColor} opacity="0.85" />
                  <rect x="20" y="20" width="20" height="20" fill={secondaryColor} opacity="0.85" />
                </pattern>
              </defs>

              {/* 1. Base Solid Color */}
              <path d="M 0 0 h 300 v 350 h -300 z" clipPath="url(#jerseyClip)" fill="url(#jerseyBaseGrad)" />

              {/* 2. Custom Pattern Layer */}
              <g clipPath="url(#jerseyClip)">
                {pattern === 'stripes' && <rect x="0" y="0" width="300" height="350" fill="url(#pat-stripes)" />}
                {pattern === 'hoops' && <rect x="0" y="0" width="300" height="350" fill="url(#pat-hoops)" />}
                {pattern === 'checkerboard' && <rect x="0" y="0" width="300" height="350" fill="url(#pat-checkerboard)" />}
                {pattern === 'halves' && <rect x="150" y="0" width="150" height="350" fill={secondaryColor} opacity="0.85" />}
                {pattern === 'sash' && <polygon points="-50,0 350,350 300,400 -100,50" fill={secondaryColor} opacity="0.85" />}
              </g>

              {/* 3. Texture Mesh Overlay */}
              <path d="M 0 0 h 300 v 350 h -300 z" clipPath="url(#jerseyClip)" fill="transparent" filter="url(#meshTexture)" />

              {/* 4. Cinematic Lighting and Volume Shading */}
              <path d="M 0 0 h 300 v 350 h -300 z" clipPath="url(#jerseyClip)" fill="url(#shadowFolds)" style={{ mixBlendMode: 'multiply' }} />
              <path d="M 0 0 h 300 v 350 h -300 z" clipPath="url(#jerseyClip)" fill="url(#chestHighlight)" style={{ mixBlendMode: 'overlay' }} />

              {/* 5. 3D Folds and Wrinkles */}
              <g clipPath="url(#jerseyClip)">
                <path d="M 110 130 Q 130 200 100 300" fill="none" stroke="#000" strokeWidth="18" filter="blur(10px)" opacity="0.25" />
                <path d="M 190 130 Q 170 200 200 300" fill="none" stroke="#000" strokeWidth="18" filter="blur(10px)" opacity="0.25" />
                <path d="M 75 140 Q 95 200 85 280" fill="none" stroke="#fff" strokeWidth="8" filter="blur(6px)" opacity="0.15" />
                <path d="M 225 140 Q 205 200 215 280" fill="none" stroke="#fff" strokeWidth="8" filter="blur(6px)" opacity="0.15" />
                <path d="M 100 20 Q 120 70 150 80" fill="none" stroke="#fff" strokeWidth="12" filter="blur(8px)" opacity="0.3" />
              </g>

              {/* 6. Structural Seams */}
              <path d="M 70 125 Q 85 70 100 20" fill="none" stroke="#000" strokeWidth="2.5" strokeOpacity="0.4" />
              <path d="M 230 125 Q 215 70 200 20" fill="none" stroke="#000" strokeWidth="2.5" strokeOpacity="0.4" />
              <path d="M 66 318 Q 150 330 234 318" fill="none" stroke="#000" strokeWidth="4" strokeOpacity="0.4" />
              <path d="M 68 316 Q 150 328 232 316" fill="none" stroke="#fff" strokeWidth="1.5" strokeOpacity="0.3" />

              {/* 7. Premium Cuffs */}
              <path d="M 10 90 L 20 115 L 55 135" fill="none" stroke={secondaryColor} strokeWidth="10" strokeLinecap="round" style={{ filter: 'drop-shadow(0px 4px 4px rgba(0,0,0,0.5))' }} />
              <path d="M 290 85 L 280 115 L 245 135" fill="none" stroke={secondaryColor} strokeWidth="10" strokeLinecap="round" style={{ filter: 'drop-shadow(0px 4px 4px rgba(0,0,0,0.5))' }} />

              {/* 8. Crest / Badge */}
              <g transform="translate(180, 80) scale(1.3)" style={{ filter: 'drop-shadow(0px 4px 6px rgba(0,0,0,0.6))' }}>
                {badgeIcon === 'shield' && (
                  <>
                    <path d="M 0 0 L 16 0 L 16 16 L 8 24 L 0 16 Z" fill={secondaryColor} stroke="#FFF" strokeWidth="1.5" />
                    <path d="M 8 24 L 16 16 L 16 0 L 8 8 Z" fill="#000" opacity="0.2" />
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

              {/* 9. Professional Collar */}
              <g style={{ filter: 'drop-shadow(0px 6px 8px rgba(0,0,0,0.7))' }}>
                {collarStyle === 'vneck' ? (
                  <>
                    <path d="M 100 20 L 150 75 L 200 20 Z" fill={secondaryColor} stroke="#000" strokeWidth="1.5" strokeOpacity="0.6" />
                    <path d="M 100 20 L 150 75 L 200 20 Z" fill="none" stroke="#FFF" strokeWidth="1" strokeOpacity="0.4" />
                  </>
                ) : (
                  <>
                    <path d="M 100 20 Q 150 90 200 20 Z" fill={secondaryColor} stroke="#000" strokeWidth="1.5" strokeOpacity="0.6" />
                    <path d="M 100 20 Q 150 90 200 20 Z" fill="none" stroke="#FFF" strokeWidth="1" strokeOpacity="0.4" />
                  </>
                )}
              </g>
            </svg>

            {/* High-Fidelity Typography Overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center pointer-events-none space-y-4 pt-16">
              <motion.div
                key={squadName}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="px-6 py-2 rounded-xl text-xs font-black tracking-[0.3em] uppercase shadow-2xl border border-white/20 backdrop-blur-md"
                style={{ backgroundColor: secondaryColor, color: primaryColor === '#FFFFFF' ? '#000' : '#FFF' }}
              >
                {squadName || (isArabic ? 'اسم الفريق' : 'SQUAD')}
              </motion.div>

              <motion.div 
                key={number}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-[6.5rem] leading-none font-black font-sans tracking-tighter text-white drop-shadow-[0_15px_25px_rgba(0,0,0,0.9)]" 
                style={{ WebkitTextStroke: '3px rgba(0,0,0,0.5)' }}
              >
                {number || '10'}
              </motion.div>

              <motion.div 
                key={playerName}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-sm font-black tracking-[0.2em] uppercase text-white drop-shadow-[0_4px_6px_rgba(0,0,0,1)] bg-black/50 px-4 py-1.5 rounded-full border border-white/10"
              >
                {playerName || (isArabic ? 'اللاعب' : 'PLAYER')}
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Studio Controls */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="rounded-[2rem] border-white/5 bg-white/[0.02] p-6 md:p-8 shadow-xl space-y-8 backdrop-blur-md">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {/* Pattern Selector */}
              <div className="space-y-3">
                <label className="text-xs font-black text-white/60 uppercase tracking-widest">{isArabic ? 'تصميم النسيج' : 'Fabric Pattern'}</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['solid', 'stripes', 'hoops', 'checkerboard', 'halves', 'sash'] as const).map((p) => (
                    <Button
                      key={p}
                      type="button"
                      variant="outline"
                      onClick={() => setPattern(p)}
                      className={`text-[10px] h-10 rounded-xl font-bold uppercase transition-all duration-300 ${
                        pattern === p 
                          ? 'bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.4)]' 
                          : 'bg-transparent text-white/60 border-white/10 hover:border-white/30 hover:bg-white/5'
                      }`}
                    >
                      {p}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Badge/Crest Selector */}
              <div className="space-y-3">
                <label className="text-xs font-black text-white/60 uppercase tracking-widest">{isArabic ? 'شعار النادي' : 'Club Crest'}</label>
                <div className="flex gap-2">
                  {([
                    { id: 'shield', icon: Shield },
                    { id: 'crown', icon: Crown },
                    { id: 'star', icon: Star },
                    { id: 'flame', icon: Flame },
                  ] as const).map((b) => {
                    const Icon = b.icon;
                    return (
                      <Button
                        key={b.id}
                        type="button"
                        variant="outline"
                        onClick={() => setBadgeIcon(b.id as any)}
                        className={`flex-1 h-10 rounded-xl transition-all duration-300 ${
                          badgeIcon === b.id 
                            ? 'bg-primary text-black border-primary shadow-[0_0_15px_var(--primary-glow)]' 
                            : 'bg-transparent text-white/60 border-white/10 hover:border-white/30 hover:bg-white/5'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </Button>
                    );
                  })}
                </div>
              </div>
            </div>

            <hr className="border-white/10" />

            {/* Colors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-xs font-black text-white/60 uppercase tracking-widest">{isArabic ? 'اللون الأساسي' : 'Base Color'}</label>
                <div className="flex flex-wrap gap-3">
                  {colors.map((c) => (
                    <button
                      key={c.hex}
                      type="button"
                      onClick={() => setPrimaryColor(c.hex)}
                      className={`w-9 h-9 rounded-full transition-all duration-300 relative ${
                        primaryColor === c.hex 
                          ? 'scale-125 z-10 shadow-[0_0_20px_rgba(255,255,255,0.3)] ring-2 ring-white/50 border-0' 
                          : 'border-2 border-white/10 hover:scale-110'
                      }`}
                      style={{ backgroundColor: c.hex }}
                      title={c.name}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-black text-white/60 uppercase tracking-widest">{isArabic ? 'اللون الثانوي (التقليمات)' : 'Accent & Trim'}</label>
                <div className="flex flex-wrap gap-3">
                  {colors.map((c) => (
                    <button
                      key={c.hex}
                      type="button"
                      onClick={() => setSecondaryColor(c.hex)}
                      className={`w-9 h-9 rounded-full transition-all duration-300 relative ${
                        secondaryColor === c.hex 
                          ? 'scale-125 z-10 shadow-[0_0_20px_rgba(255,255,255,0.3)] ring-2 ring-white/50 border-0' 
                          : 'border-2 border-white/10 hover:scale-110'
                      }`}
                      style={{ backgroundColor: c.hex }}
                      title={c.name}
                    />
                  ))}
                </div>
              </div>
            </div>

            <hr className="border-white/10" />

            {/* Typography & Personalization */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2 col-span-1 sm:col-span-3">
                <label className="text-xs font-black text-white/60 uppercase tracking-widest">{isArabic ? 'الياقة' : 'Collar Cut'}</label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCollarStyle('vneck')}
                    className={`flex-1 rounded-xl font-bold h-10 ${collarStyle === 'vneck' ? 'bg-white text-black border-white' : 'bg-transparent text-white/60 border-white/10'}`}
                  >
                    V-Neck
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCollarStyle('crew')}
                    className={`flex-1 rounded-xl font-bold h-10 ${collarStyle === 'crew' ? 'bg-white text-black border-white' : 'bg-transparent text-white/60 border-white/10'}`}
                  >
                    Crew Cut
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-white/60 uppercase tracking-widest">{isArabic ? 'اسم النادي' : 'Squad Chest'}</label>
                <input
                  type="text"
                  value={squadName}
                  maxLength={15}
                  onChange={(e) => setSquadName(e.target.value.toUpperCase())}
                  className="w-full p-3.5 rounded-xl bg-black/50 border border-white/10 text-white font-black uppercase text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-white/60 uppercase tracking-widest">{isArabic ? 'اسم اللاعب' : 'Player Back'}</label>
                <input
                  type="text"
                  value={playerName}
                  maxLength={12}
                  onChange={(e) => setPlayerName(e.target.value.toUpperCase())}
                  className="w-full p-3.5 rounded-xl bg-black/50 border border-white/10 text-white font-black uppercase text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-white/60 uppercase tracking-widest">{isArabic ? 'رقم' : 'Number'}</label>
                <input
                  type="text"
                  value={number}
                  maxLength={2}
                  onChange={(e) => setNumber(e.target.value)}
                  className="w-full p-3.5 rounded-xl bg-black/50 border border-white/10 text-white font-black uppercase font-mono text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                />
              </div>
            </div>

          </Card>
        </div>
      </div>
    </div>
  );
}
