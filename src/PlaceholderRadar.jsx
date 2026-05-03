import React from 'react';
import { colorScales, borderRadius } from './tokens';

export default function PlaceholderRadar({ size = 250, name = '' }) {
  const cx = size / 2;
  const cy = size / 2;
  const r = (size / 2) * 0.65;
  const n = 8;

  const vertices = Array.from({ length: n }, (_, i) => {
    const a = (2 * Math.PI * i) / n;
    return [cx + r * Math.sin(a), cy - r * Math.cos(a)];
  });

  const outerPts = vertices.map(([x, y]) => `${x},${y}`).join(' ');
  const midPts = vertices.map(([x, y]) => `${cx + (x - cx) * 0.6},${cy + (y - cy) * 0.6}`).join(' ');
  const innerPts = vertices.map(([x, y]) => `${cx + (x - cx) * 0.3},${cy + (y - cy) * 0.3}`).join(' ');

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
      {/* Spokes from center to each vertex */}
      {vertices.map(([x, y], i) => (
        <line
          key={i}
          x1={cx} y1={cy} x2={x} y2={y}
          stroke={colorScales.gray['200']}
          strokeWidth="1"
          strokeDasharray="2 3"
          opacity="0.6"
        />
      ))}
      {/* Inner ring (30%) */}
      <polygon
        points={innerPts}
        fill="none"
        stroke={colorScales.gray['200']}
        strokeWidth="1"
        strokeDasharray="2 3"
        opacity="0.5"
      />
      {/* Mid ring (60%) */}
      <polygon
        points={midPts}
        fill="none"
        stroke={colorScales.gray['200']}
        strokeWidth="1"
        strokeDasharray="3 3"
        opacity="0.6"
      />
      {/* Outer ring (100%) */}
      <polygon
        points={outerPts}
        fill="none"
        stroke={colorScales.gray['200']}
        strokeWidth="1.5"
        strokeDasharray="4 3"
      />
    </svg>
  );
}
