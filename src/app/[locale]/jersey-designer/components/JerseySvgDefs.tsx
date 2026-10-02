import * as React from 'react';

interface JerseySvgDefsProps {
  primaryColor: string;
  secondaryColor: string;
}

export function JerseySvgDefs({ primaryColor, secondaryColor }: JerseySvgDefsProps) {
  return (
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
  );
}
