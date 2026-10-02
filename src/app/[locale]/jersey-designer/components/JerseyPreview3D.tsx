'use client';

import * as React from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';
import { CollarStyle, PatternType, BadgeType } from './types';
import { JerseySvgDefs } from './JerseySvgDefs';
import { JerseyBadgeIcon } from './JerseyBadgeIcon';

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
            <JerseySvgDefs primaryColor={primaryColor} secondaryColor={secondaryColor} />

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
            <JerseyBadgeIcon badgeIcon={badgeIcon} secondaryColor={secondaryColor} />

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
