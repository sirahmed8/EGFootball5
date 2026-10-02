import * as React from 'react';
import { BadgeType } from './types';

interface JerseyBadgeIconProps {
  badgeIcon: BadgeType;
  secondaryColor: string;
}

export function JerseyBadgeIcon({ badgeIcon, secondaryColor }: JerseyBadgeIconProps) {
  return (
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
  );
}
