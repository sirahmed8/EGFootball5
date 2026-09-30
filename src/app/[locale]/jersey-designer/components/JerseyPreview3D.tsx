'use client';

import * as React from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';
import { CollarStyle, PatternType, BadgeType } from './types';

interface JerseyPreview3DProps {
  svgRef: React.RefObject<SVGSVGElement | null>;
  primaryColor: string;
  secondaryColor: string;
  collarStyle: CollarStyle;
  pattern: PatternType;
  badgeIcon: BadgeType;
  squadName: string;
  playerName: string;
  number: string;
}

export function JerseyPreview3D({
  svgRef,
  primaryColor,
  secondaryColor,
  collarStyle,
  pattern,
  badgeIcon,
  squadName,
  playerName,
  number,
}: JerseyPreview3DProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Smooth spring-based 3D tilt
  const mouseX = useSpring(0, { stiffness: 120, damping: 20, mass: 0.5 });
  const mouseY = useSpring(0, { stiffness: 120, damping: 20, mass: 0.5 });
  const rotateX = useTransform(mouseY, [-1, 1], [15, -15]);
  const rotateY = useTransform(mouseX, [-1, 1], [-15, 15]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set(((e.clientX - rect.left) / rect.width) * 2 - 1);
    mouseY.set(((e.clientY - rect.top) / rect.height) * 2 - 1);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <div className="lg:col-span-5 h-[600px] relative rounded-[2rem] border border-white/[0.06] bg-gradient-to-b from-white/[0.04] to-transparent flex flex-col items-center justify-center overflow-hidden shadow-2xl">
      {/* Studio spotlight */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-28 bg-white/10 blur-[80px] pointer-events-none rounded-full" />
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-40 h-6 bg-black/60 blur-xl pointer-events-none rounded-full" />

      {/* 3D tilt wrapper */}
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
              {/* Rich Gradients */}
              <linearGradient id="jerseyBaseGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={primaryColor} stopOpacity="1" />
                <stop offset="65%" stopColor={primaryColor} stopOpacity="0.95" />
                <stop offset="100%" stopColor="#000000" stopOpacity="0.35" />
              </linearGradient>

              <filter id="meshTexture" x="0%" y="0%" width="100%" height="100%">
                <feTurbulence
                  type="fractalNoise"
                  baseFrequency="1.6"
                  numOctaves="3"
                  stitchTiles="stitch"
                  result="noise"
                />
                <feColorMatrix
                  type="matrix"
                  values="1 0 0 0 0, 0 1 0 0 0, 0 0 1 0 0, 0 0 0 0.05 0"
                  in="noise"
                  result="tinted"
                />
                <feBlend mode="multiply" in="SourceGraphic" in2="tinted" />
              </filter>

              {/* 3D Realism Folds */}
              <linearGradient id="shadowFolds" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#000" stopOpacity="0.45" />
                <stop offset="12%" stopColor="#000" stopOpacity="0.08" />
                <stop offset="28%" stopColor="#fff" stopOpacity="0.18" />
                <stop offset="42%" stopColor="#000" stopOpacity="0.12" />
                <stop offset="50%" stopColor="#fff" stopOpacity="0.22" />
                <stop offset="62%" stopColor="#000" stopOpacity="0.10" />
                <stop offset="78%" stopColor="#fff" stopOpacity="0.15" />
                <stop offset="88%" stopColor="#000" stopOpacity="0.12" />
                <stop offset="100%" stopColor="#000" stopOpacity="0.5" />
              </linearGradient>

              <radialGradient id="chestHighlight" cx="50%" cy="25%" r="55%">
                <stop offset="0%" stopColor="#fff" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#fff" stopOpacity="0" />
              </radialGradient>

              {/* Real T-Shirt Shape */}
              <clipPath id="jerseyClip">
                <path
                  d="M 140 25
                     C 165 18, 235 18, 260 25
                     C 295 32, 335 52, 365 75
                     C 375 83, 385 95, 375 110
                     C 365 125, 345 142, 325 155
                     C 315 160, 305 150, 295 140
                     C 290 135, 290 155, 290 190
                     L 290 415
                     C 280 430, 200 435, 110 415
                     L 110 190
                     C 110 155, 110 135, 105 140
                     C 95 150, 85 160, 75 155
                     C 55 142, 35 125, 25 110
                     C 15 95, 25 83, 35 75
                     C 65 52, 105 32, 140 25 Z"
                />
              </clipPath>

              {/* Patterns */}
              <pattern id="pat-stripes" width="50" height="50" patternUnits="userSpaceOnUse">
                <rect width="25" height="50" fill={secondaryColor} opacity="0.88" />
              </pattern>
              <pattern id="pat-hoops" width="50" height="50" patternUnits="userSpaceOnUse">
                <rect width="50" height="25" fill={secondaryColor} opacity="0.88" />
              </pattern>
              <pattern id="pat-checkerboard" width="50" height="50" patternUnits="userSpaceOnUse">
                <rect width="25" height="25" fill={secondaryColor} opacity="0.88" />
                <rect x="25" y="25" width="25" height="25" fill={secondaryColor} opacity="0.88" />
              </pattern>
            </defs>

            {/* Base */}
            <path d="M 0 0 h 400 v 450 h -400 z" clipPath="url(#jerseyClip)" fill="url(#jerseyBaseGrad)" />

            {/* Pattern Layer */}
            <g clipPath="url(#jerseyClip)">
              {pattern === 'stripes' && <rect x="0" y="0" width="400" height="450" fill="url(#pat-stripes)" />}
              {pattern === 'hoops' && <rect x="0" y="0" width="400" height="450" fill="url(#pat-hoops)" />}
              {pattern === 'checkerboard' && (
                <rect x="0" y="0" width="400" height="450" fill="url(#pat-checkerboard)" />
              )}
              {pattern === 'halves' && (
                <rect x="200" y="0" width="200" height="450" fill={secondaryColor} opacity="0.88" />
              )}
              {pattern === 'sash' && (
                <polygon points="-50,0 450,450 400,500 -100,50" fill={secondaryColor} opacity="0.88" />
              )}
            </g>

            {/* Fabric texture overlay */}
            <path
              d="M 0 0 h 400 v 450 h -400 z"
              clipPath="url(#jerseyClip)"
              fill="transparent"
              filter="url(#meshTexture)"
            />

            {/* Shading Folds */}
            <path
              d="M 0 0 h 400 v 450 h -400 z"
              clipPath="url(#jerseyClip)"
              fill="url(#shadowFolds)"
              style={{ mixBlendMode: 'multiply' }}
            />
            <path
              d="M 0 0 h 400 v 450 h -400 z"
              clipPath="url(#jerseyClip)"
              fill="url(#chestHighlight)"
              style={{ mixBlendMode: 'overlay' }}
            />

            {/* Realistic Raglan Arm Seams */}
            <path d="M 125 150 Q 155 80 170 24" fill="none" stroke="#000" strokeWidth="2" strokeOpacity="0.3" />
            <path d="M 275 150 Q 245 80 230 24" fill="none" stroke="#000" strokeWidth="2" strokeOpacity="0.3" />

            {/* Sleeve Cuffs */}
            <path
              d="M 25 110 L 40 100 L 75 155 L 60 165 Z"
              fill={secondaryColor}
              opacity="0.9"
              style={{ filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.4))' }}
            />
            <path
              d="M 375 110 L 360 100 L 325 155 L 340 165 Z"
              fill={secondaryColor}
              opacity="0.9"
              style={{ filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.4))' }}
            />

            {/* Crest/Badge */}
            <g
              transform="translate(245, 95) scale(1.4)"
              style={{ filter: 'drop-shadow(0px 3px 5px rgba(0,0,0,0.5))' }}
            >
              {badgeIcon === 'shield' && (
                <>
                  <path
                    d="M 0 0 L 16 0 L 16 16 L 8 24 L 0 16 Z"
                    fill={secondaryColor}
                    stroke="#FFF"
                    strokeWidth="1.5"
                  />
                  <circle cx="8" cy="10" r="3" fill="#FFF" />
                </>
              )}
              {badgeIcon === 'crown' && (
                <>
                  <path
                    d="M 0 4 L 4 16 L 8 8 L 12 16 L 16 4 L 14 20 L 2 20 Z"
                    fill={secondaryColor}
                    stroke="#FFF"
                    strokeWidth="1.5"
                  />
                  <circle cx="8" cy="23" r="1.5" fill="#FFF" />
                </>
              )}
              {badgeIcon === 'star' && (
                <path
                  d="M 8 0 L 10 5 L 16 6 L 11 10 L 13 16 L 8 13 L 3 16 L 5 10 L 0 6 L 6 5 Z"
                  fill={secondaryColor}
                  stroke="#FFF"
                  strokeWidth="1.5"
                />
              )}
              {badgeIcon === 'flame' && (
                <path
                  d="M 8 0 C 14 8 16 12 14 18 C 12 24 4 24 2 18 C 0 12 4 8 8 0 Z"
                  fill={secondaryColor}
                  stroke="#FFF"
                  strokeWidth="1.5"
                />
              )}
            </g>

            {/* Collar */}
            <g style={{ filter: 'drop-shadow(0px 4px 6px rgba(0,0,0,0.5))' }}>
              {collarStyle === 'vneck' ? (
                <>
                  <path
                    d="M 160 22 L 200 95 L 240 22 L 225 18 L 200 70 L 175 18 Z"
                    fill={secondaryColor}
                    stroke="#000"
                    strokeWidth="1"
                    strokeOpacity="0.4"
                  />
                  <path
                    d="M 160 22 L 200 95 L 240 22 L 225 18 L 200 70 L 175 18 Z"
                    fill="none"
                    stroke="#FFF"
                    strokeWidth="0.8"
                    strokeOpacity="0.25"
                  />
                </>
              ) : (
                <>
                  <path
                    d="M 160 22 Q 200 75 240 22 L 228 18 Q 200 55 172 18 Z"
                    fill={secondaryColor}
                    stroke="#000"
                    strokeWidth="1"
                    strokeOpacity="0.4"
                  />
                  <path
                    d="M 160 22 Q 200 75 240 22 L 228 18 Q 200 55 172 18 Z"
                    fill="none"
                    stroke="#FFF"
                    strokeWidth="0.8"
                    strokeOpacity="0.25"
                  />
                </>
              )}
            </g>

            {/* Typography */}
            <text
              x="200"
              y="195"
              textAnchor="middle"
              fill="#FFFFFF"
              fontSize="17"
              fontWeight="900"
              letterSpacing="3"
              textLength="150"
              lengthAdjust="spacingAndGlyphs"
              fontFamily="Arial, sans-serif"
              style={{ filter: 'drop-shadow(1px 2px 4px rgba(0,0,0,0.9))' }}
            >
              {squadName || 'SQUAD'}
            </text>

            <text
              x="200"
              y="295"
              textAnchor="middle"
              fill="#FFFFFF"
              fontSize="82"
              fontWeight="900"
              fontFamily="Arial, sans-serif"
              style={{ filter: 'drop-shadow(2px 5px 8px rgba(0,0,0,0.95))' }}
            >
              {number || '10'}
            </text>

            <text
              x="200"
              y="360"
              textAnchor="middle"
              fill="#FFFFFF"
              fontSize="14"
              fontWeight="800"
              letterSpacing="3"
              textLength="130"
              lengthAdjust="spacingAndGlyphs"
              fontFamily="Arial, sans-serif"
              style={{ filter: 'drop-shadow(1px 2px 4px rgba(0,0,0,0.85))' }}
            >
              {playerName || 'PLAYER'}
            </text>
          </svg>
        </motion.div>
      </div>
    </div>
  );
}
