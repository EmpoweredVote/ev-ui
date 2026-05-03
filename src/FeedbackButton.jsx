import React from 'react';
import { colors, fonts, fontWeights, fontSizes, spacing, borderRadius } from './tokens';

/**
 * FeedbackButton — links to the ev-landing feedback form.
 *
 * Auto-detects which EV tool the user is on from window.location.hostname
 * and pre-fills the ?feature= query param. Also passes the current page URL
 * as ?url= so the report has context. Both can be overridden via props.
 *
 * @param {Object} props
 * @param {string} [props.feature] - explicit feature override (skips auto-detect)
 * @param {string} [props.baseUrl] - feedback form URL (default: alpha.empowered.vote/feedback)
 * @param {string} [props.label] - button text (default: "Feedback")
 * @param {'pill'|'link'} [props.variant] - visual style (default: 'pill')
 * @param {boolean} [props.includeUrl] - pass current href as ?url= (default: true)
 * @param {string} [props.className] - additional class names
 * @param {Object} [props.style] - additional inline styles
 */

const FEEDBACK_BASE_DEFAULT = 'https://alpha.empowered.vote/feedback';

// Hostname → feature slug. Slugs MUST match the backend Zod enum:
// compass | essentials | readrank | treasury | badges | trivia | landing | other
export const HOST_FEATURE_MAP = {
  'compass.empowered.vote': 'compass',
  'essentials.empowered.vote': 'essentials',
  'readrank.empowered.vote': 'readrank',
  'treasurytracker.empowered.vote': 'treasury',
  'badges.empowered.vote': 'badges',
  'ctc.empowered.vote': 'trivia',
  'alpha.empowered.vote': 'landing',
  'ev-landing.empowered.vote': 'landing',
  'ev-landing.onrender.com': 'landing',
};

export function detectFeature() {
  if (typeof window === 'undefined') return undefined;
  const host = window.location.hostname;

  // Exact host match (production subdomains)
  if (HOST_FEATURE_MAP[host]) return HOST_FEATURE_MAP[host];

  // Subdomain prefix match — handles previews/staging like
  // compass-pr-12.onrender.com or compass.staging.empowered.vote
  const firstLabel = host.split('.')[0];
  for (const [knownHost, feature] of Object.entries(HOST_FEATURE_MAP)) {
    const knownPrefix = knownHost.split('.')[0];
    if (firstLabel === knownPrefix || firstLabel.startsWith(`${knownPrefix}-`)) {
      return feature;
    }
  }

  // Localhost / unknown
  return 'other';
}

function buildHref({ baseUrl, feature, includeUrl }) {
  const params = new URLSearchParams();
  if (feature) params.set('feature', feature);
  if (includeUrl && typeof window !== 'undefined') {
    params.set('url', window.location.href);
  }
  const qs = params.toString();
  return qs ? `${baseUrl}?${qs}` : baseUrl;
}

export default function FeedbackButton({
  feature: featureProp,
  baseUrl = FEEDBACK_BASE_DEFAULT,
  label = 'Feedback',
  variant = 'pill',
  includeUrl = true,
  className = '',
  style = {},
}) {
  const feature = featureProp ?? detectFeature();
  const href = buildHref({ baseUrl, feature, includeUrl });

  const pillStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: spacing[1],
    padding: `${spacing[2]} ${spacing[4]}`,
    backgroundColor: 'transparent',
    color: colors.evTeal,
    border: `1.5px solid ${colors.evTeal}`,
    borderRadius: borderRadius.full || '999px',
    fontFamily: fonts.primary,
    fontWeight: fontWeights.bold,
    fontSize: fontSizes.base,
    lineHeight: 1.2,
    textDecoration: 'none',
    cursor: 'pointer',
    transition: 'background-color 0.15s ease, color 0.15s ease',
  };

  const linkStyle = {
    color: colors.evTeal,
    fontFamily: fonts.primary,
    fontWeight: fontWeights.medium,
    textDecoration: 'underline',
    cursor: 'pointer',
  };

  const baseStyle = variant === 'link' ? linkStyle : pillStyle;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`ev-feedback-button ${className}`.trim()}
      style={{ ...baseStyle, ...style }}
      aria-label="Send feedback"
      onMouseEnter={(e) => {
        if (variant === 'pill') {
          e.currentTarget.style.backgroundColor = colors.evTeal;
          e.currentTarget.style.color = colors.textWhite || '#ffffff';
        }
      }}
      onMouseLeave={(e) => {
        if (variant === 'pill') {
          e.currentTarget.style.backgroundColor = 'transparent';
          e.currentTarget.style.color = colors.evTeal;
        }
      }}
    >
      {label}
    </a>
  );
}
