import React from 'react';
import { colorScales, borderRadius } from './tokens';

export default function PlaceholderRadar({ size = 250, name = '' }) {
  const cx = size / 2;
  const cy = size / 2;
  const r = (size / 2) * 0.65;
  const n = 8;
  const pts = Array.from({ length: n }, (_, i) => {
    const a = (2 * Math.PI * i) / n;
    return `${cx + r * Math.sin(a)},${cy - r * Math.cos(a)}`;
  }).join(' ');
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      role="img"
      aria-label={name ? `${name} — compass data unavailable` : 'compass data unavailable'}
      style={{
        backgroundColor: colorScales.teal['050'],
        borderRadius: borderRadius.sm,
        flexShrink: 0,
      }}
    >
      <polygon
        points={pts}
        fill="none"
        stroke={colorScales.gray['200']}
        strokeWidth="1.5"
        strokeDasharray="4 3"
      />
    </svg>
  );
}
