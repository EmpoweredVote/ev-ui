import React from 'react';
import { tierColors, fonts, fontWeights, fontSizes, spacing, borderRadius } from './tokens';

// ────────────────────────────────────────────────────────────────────
// Tier icons — Lucide-style inline SVGs, 24x24 viewBox, stroke-based
// ────────────────────────────────────────────────────────────────────

function LandmarkIcon({ size = 14 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path d="M10 18v-7" />
      <path d="M11.12 2.198a2 2 0 0 1 1.76.006l7.866 3.847c.476.233.31.949-.22.949H3.474c-.53 0-.695-.716-.22-.949z" />
      <path d="M14 18v-7" />
      <path d="M18 18v-7" />
      <path d="M3 22h18" />
      <path d="M6 18v-7" />
    </svg>
  );
}

function Building2Icon({ size = 14 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" />
      <path d="M6 12H4a2 2 0 0 0-2 2v8h4" />
      <path d="M18 9h2a2 2 0 0 1 2 2v11h-4" />
      <path d="M10 6h4" />
      <path d="M10 10h4" />
      <path d="M10 14h4" />
      <path d="M10 18h4" />
    </svg>
  );
}

function HomeIcon({ size = 14 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

const TIER_INFO = {
  federal: { label: 'Federal', Icon: LandmarkIcon },
  state:   { label: 'State',   Icon: Building2Icon },
  local:   { label: 'Local',   Icon: HomeIcon },
};

// ────────────────────────────────────────────────────────────────────
// Size presets
// ────────────────────────────────────────────────────────────────────

const SIZE_STYLES = {
  xs: {
    iconSize: 12,
    fontSize: fontSizes.xs,
    pillPadding: `${spacing[1]} ${spacing[2]}`,
    gap: spacing[1],
    iconGap: '3px',
  },
  sm: {
    iconSize: 14,
    fontSize: fontSizes.xs,
    pillPadding: `${spacing[1]} ${spacing[2]}`,
    gap: spacing[2],
    iconGap: '4px',
  },
};

// ────────────────────────────────────────────────────────────────────
// Component
// ────────────────────────────────────────────────────────────────────

/**
 * TopicTierBadge — small icon + label badges showing which tiers of
 * government have real jurisdiction on a compass topic.
 *
 * Uses Lucide-style SVG icons:
 *   Federal → Landmark (classical building with columns)
 *   State   → Building2 (office building)
 *   Local   → Home (house)
 *
 * Tier flags are purely informational — they don't gate compass
 * rendering or filter politician comparisons. This badge helps voters
 * pick topics with good cross-tier coverage when building their compass.
 *
 * @param {Object} props
 * @param {Object} [props.topic] - Topic object with applies_federal/state/local booleans
 * @param {Array<'federal'|'state'|'local'>} [props.tiers] - Explicit tier list (overrides topic)
 * @param {'xs'|'sm'} [props.size='sm'] - Icon + text size
 * @param {boolean} [props.iconOnly=false] - Hide text labels, show icons only (saves space)
 * @param {'tinted'|'muted'} [props.variant='tinted'] - 'tinted' uses tier-specific colors; 'muted' uses neutral gray for subtler presentation
 * @param {Object} [props.style] - Additional container styles
 */
export default function TopicTierBadge({
  topic,
  tiers,
  size = 'sm',
  iconOnly = false,
  variant = 'tinted',
  style = {},
}) {
  // Derive tiers from topic if not explicitly passed
  const effectiveTiers = tiers ?? (
    topic
      ? [
          topic.applies_federal ? 'federal' : null,
          topic.applies_state ? 'state' : null,
          topic.applies_local ? 'local' : null,
        ].filter(Boolean)
      : []
  );

  if (effectiveTiers.length === 0) return null;

  const sizeStyle = SIZE_STYLES[size] || SIZE_STYLES.sm;

  const containerStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: sizeStyle.gap,
    flexWrap: 'wrap',
    ...style,
  };

  const itemStyle = (tier) => {
    const color = variant === 'muted' ? '#6B7280' : tierColors[tier].text;
    return {
      display: 'inline-flex',
      alignItems: 'center',
      gap: sizeStyle.iconGap,
      fontFamily: fonts.primary,
      fontWeight: fontWeights.medium,
      fontSize: sizeStyle.fontSize,
      color,
      lineHeight: 1,
      userSelect: 'none',
    };
  };

  return (
    <span
      className="ev-topic-tier-badge"
      style={containerStyle}
      role="group"
      aria-label={`Applies at: ${effectiveTiers.map(t => TIER_INFO[t].label).join(', ')}`}
    >
      {effectiveTiers.map((tier) => {
        const { label, Icon } = TIER_INFO[tier];
        return (
          <span key={tier} style={itemStyle(tier)}>
            <Icon size={sizeStyle.iconSize} />
            {!iconOnly && <span>{label}</span>}
          </span>
        );
      })}
    </span>
  );
}
