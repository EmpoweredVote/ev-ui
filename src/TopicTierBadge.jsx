import React from 'react';
import { tierColors, fonts, fontWeights, fontSizes, spacing, borderRadius } from './tokens';

const TIER_LABELS = {
  federal: { full: 'Federal', compact: 'F' },
  state:   { full: 'State',   compact: 'S' },
  local:   { full: 'Local',   compact: 'L' },
};

const SIZE_STYLES = {
  xs: {
    fontSize: fontSizes.xs,
    padding: `${spacing[1]} ${spacing[2]}`,
    gap: spacing[1],
  },
  sm: {
    fontSize: fontSizes.xs,
    padding: `${spacing[1]} ${spacing[2]}`,
    gap: spacing[1],
  },
};

/**
 * TopicTierBadge — small pill badges showing which tiers of government
 * have real jurisdiction on a compass topic.
 *
 * Used in the compass builder to help voters pick topics with good
 * cross-tier coverage. Purely informational — tier flags do NOT gate
 * compass rendering or filter politician comparisons.
 *
 * @param {Object} props
 * @param {Object} [props.topic] - Topic object with applies_federal/state/local booleans
 * @param {Array<'federal'|'state'|'local'>} [props.tiers] - Explicit tier list (overrides topic)
 * @param {'xs'|'sm'} [props.size='sm'] - Pill size
 * @param {'full'|'compact'} [props.layout='full'] - 'full' shows "Federal·State·Local", 'compact' shows "F·S·L"
 * @param {Object} [props.style] - Additional container styles
 */
export default function TopicTierBadge({
  topic,
  tiers,
  size = 'sm',
  layout = 'full',
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

  const pillStyle = (tier) => ({
    display: 'inline-flex',
    alignItems: 'center',
    padding: sizeStyle.padding,
    borderRadius: borderRadius.full,
    fontFamily: fonts.primary,
    fontWeight: fontWeights.medium,
    fontSize: sizeStyle.fontSize,
    backgroundColor: tierColors[tier].bg,
    color: tierColors[tier].text,
    border: `1px solid ${tierColors[tier].text}`,
    lineHeight: 1,
    userSelect: 'none',
  });

  return (
    <span
      className="ev-topic-tier-badge"
      style={containerStyle}
      role="group"
      aria-label={`Applies at: ${effectiveTiers.map(t => TIER_LABELS[t].full).join(', ')}`}
    >
      {effectiveTiers.map((tier) => (
        <span key={tier} style={pillStyle(tier)}>
          {TIER_LABELS[tier][layout]}
        </span>
      ))}
    </span>
  );
}
