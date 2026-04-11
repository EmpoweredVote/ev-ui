import React, { useState } from 'react';
import { tierColors, fonts, fontWeights, fontSizes, spacing, borderRadius } from './tokens';

const TIER_LABELS = {
  federal: 'federal',
  state:   'state',
  local:   'local',
};

/**
 * CompassCoverageCallout — non-blocking banner shown on results pages when
 * the voter's compass has poor tier coverage for politicians in the current
 * results. Suggests adding more tier-applicable topics, with a CTA that
 * deep-links to the compass builder.
 *
 * The callout is purely informational. It does not change what politicians
 * are shown, reshape any compass radar, or filter results. It's a hint.
 *
 * @param {Object} props
 * @param {'federal'|'state'|'local'} props.tier - The tier that's under-covered
 * @param {number} props.count - How many of the voter's compass topics apply at this tier
 * @param {number} [props.totalSelected] - Total compass size (for context in the message)
 * @param {string} props.compassUrl - URL to open the compass builder (absolute or relative)
 * @param {Function} [props.onDismiss] - Optional dismiss handler; if provided, a close button renders
 */
export default function CompassCoverageCallout({
  tier,
  count,
  totalSelected,
  compassUrl,
  onDismiss,
}) {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  const tierLabel = TIER_LABELS[tier] || tier;
  const tierStyle = tierColors[tier] || tierColors.federal;

  const containerStyle = {
    display: 'flex',
    alignItems: 'flex-start',
    gap: spacing[3],
    padding: `${spacing[3]} ${spacing[4]}`,
    borderLeft: `4px solid ${tierStyle.text}`,
    backgroundColor: tierStyle.bg,
    borderRadius: `0 ${borderRadius.md} ${borderRadius.md} 0`,
    fontFamily: fonts.primary,
    margin: `${spacing[3]} 0`,
  };

  const textStyle = {
    flex: 1,
    fontSize: fontSizes.sm,
    color: '#2d3748',
    lineHeight: 1.5,
  };

  const headlineStyle = {
    fontWeight: fontWeights.semibold,
    marginBottom: spacing[1],
    color: tierStyle.text,
  };

  const ctaStyle = {
    display: 'inline-block',
    marginTop: spacing[2],
    padding: `${spacing[2]} ${spacing[4]}`,
    backgroundColor: tierStyle.text,
    color: '#ffffff',
    borderRadius: borderRadius.full,
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.semibold,
    textDecoration: 'none',
    cursor: 'pointer',
  };

  const closeStyle = {
    background: 'none',
    border: 'none',
    padding: spacing[1],
    cursor: 'pointer',
    color: '#718096',
    fontSize: fontSizes.lg,
    lineHeight: 1,
  };

  const handleDismiss = () => {
    setDismissed(true);
    if (onDismiss) onDismiss();
  };

  return (
    <div
      className="ev-compass-coverage-callout"
      role="status"
      style={containerStyle}
    >
      <div style={textStyle}>
        <div style={headlineStyle}>Your compass covers {tierLabel} issues lightly</div>
        <div>
          {count === 0
            ? `None of your ${totalSelected ?? 'selected'} compass topics apply at the ${tierLabel} level. `
            : `Only ${count} of your ${totalSelected ?? 'selected'} compass topics apply at the ${tierLabel} level. `}
          Add more {tierLabel}-applicable topics to get better comparisons with {tierLabel} officials.
        </div>
        <a href={compassUrl} style={ctaStyle}>
          Add {tierLabel} topics →
        </a>
      </div>
      {onDismiss !== undefined && (
        <button
          onClick={handleDismiss}
          style={closeStyle}
          aria-label="Dismiss coverage callout"
        >
          ×
        </button>
      )}
    </div>
  );
}
