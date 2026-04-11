import React from 'react';
import { fonts, fontWeights, fontSizes, spacing, borderRadius } from './tokens';

/**
 * ExpandCompassNudge — card-style prompt shown below the deep stance view
 * on a politician profile. Tells the voter how many topics the politician
 * has stances on that the voter hasn't answered yet, and offers a CTA to
 * expand the compass.
 *
 * Only useful to render when missingCount > 0. Caller should handle the
 * zero-missing case by not rendering this component at all.
 *
 * @param {Object} props
 * @param {string} props.politicianName - Display name for the CTA text
 * @param {number} props.missingCount - How many topics the politician has stances on that the voter hasn't answered
 * @param {string} props.compassUrl - URL to deep-link into the compass builder (should include a return param)
 * @param {Object} [props.style] - Additional styles to merge
 */
export default function ExpandCompassNudge({
  politicianName,
  missingCount,
  compassUrl,
  style = {},
}) {
  if (!missingCount || missingCount <= 0) return null;

  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: spacing[2],
    padding: spacing[4],
    marginTop: spacing[4],
    backgroundColor: '#F5F9FA',
    borderRadius: borderRadius.lg,
    border: '1px solid #e0e6eb',
    fontFamily: fonts.primary,
    ...style,
  };

  const headlineStyle = {
    fontSize: fontSizes.base,
    fontWeight: fontWeights.semibold,
    color: '#2d3748',
    margin: 0,
  };

  const bodyStyle = {
    fontSize: fontSizes.sm,
    color: '#4a5568',
    lineHeight: 1.5,
    margin: 0,
  };

  const ctaStyle = {
    display: 'inline-block',
    marginTop: spacing[2],
    padding: `${spacing[2]} ${spacing[4]}`,
    backgroundColor: '#00657c',
    color: '#ffffff',
    borderRadius: borderRadius.full,
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.semibold,
    textDecoration: 'none',
    cursor: 'pointer',
  };

  const topicsLabel = missingCount === 1 ? 'topic' : 'topics';
  const speakerName = politicianName || 'This politician';

  return (
    <div className="ev-expand-compass-nudge" style={containerStyle} role="region">
      <p style={headlineStyle}>Want a richer comparison?</p>
      <p style={bodyStyle}>
        {speakerName} has stances on {missingCount} more {topicsLabel} you haven't
        answered yet. Expand your compass to see where you stand on all of them.
      </p>
      <a href={compassUrl} style={ctaStyle}>
        Expand my compass →
      </a>
    </div>
  );
}
