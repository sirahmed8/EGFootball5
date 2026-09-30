'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { Download, Sparkle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useLocale } from 'next-intl';
import { CollarStyle, PatternType, BadgeType } from './components/types';
import { JerseyPreview3D } from './components/JerseyPreview3D';
import { JerseyCustomizerControls } from './components/JerseyCustomizerControls';

export default function JerseyDesignerPage() {
  const locale = useLocale();
  const isArabic = locale === 'ar';
  const [primaryColor, setPrimaryColor] = React.useState('#10B981');
  const [secondaryColor, setSecondaryColor] = React.useState('#06B6D4');
  const [collarStyle, setCollarStyle] = React.useState<CollarStyle>('vneck');
  const [pattern, setPattern] = React.useState<PatternType>('stripes');
  const [badgeIcon, setBadgeIcon] = React.useState<BadgeType>('shield');
  const [squadName, setSquadName] = React.useState('OBOUR EAGLES');
  const [playerName, setPlayerName] = React.useState('AHMED');
  const [number, setNumber] = React.useState('10');

  const svgRef = React.useRef<SVGSVGElement>(null);

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
    <div
      className="min-h-screen bg-[#050505] py-10 px-4 md:px-8 max-w-7xl mx-auto space-y-6"
      dir={isArabic ? 'rtl' : 'ltr'}
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 md:p-8 rounded-[2rem] border border-white/[0.06] bg-white/[0.02] shadow-2xl"
      >
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-black tracking-widest uppercase">
            <Sparkle className="w-3.5 h-3.5" />
            <span>{isArabic ? 'استوديو التصميم الاحترافي' : 'PRO Kit Studio v3.0'}</span>
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
          <span>{isArabic ? 'تصدير PNG' : 'Export PNG'}</span>
        </Button>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <JerseyPreview3D
          svgRef={svgRef}
          primaryColor={primaryColor}
          secondaryColor={secondaryColor}
          collarStyle={collarStyle}
          pattern={pattern}
          badgeIcon={badgeIcon}
          squadName={squadName}
          playerName={playerName}
          number={number}
        />

        <JerseyCustomizerControls
          isArabic={isArabic}
          primaryColor={primaryColor}
          setPrimaryColor={setPrimaryColor}
          secondaryColor={secondaryColor}
          setSecondaryColor={setSecondaryColor}
          collarStyle={collarStyle}
          setCollarStyle={setCollarStyle}
          pattern={pattern}
          setPattern={setPattern}
          badgeIcon={badgeIcon}
          setBadgeIcon={setBadgeIcon}
          squadName={squadName}
          setSquadName={setSquadName}
          playerName={playerName}
          setPlayerName={setPlayerName}
          number={number}
          setNumber={setNumber}
        />
      </div>
    </div>
  );
}
