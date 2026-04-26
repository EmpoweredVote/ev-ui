import React, { useEffect, useState } from 'react';
import { colors, fonts, fontWeights, fontSizes, spacing, borderRadius } from './tokens';
import { evContext } from './evContext.js';

/**
 * CompassKey — small page-level legend that decodes the radar's colors.
 *
 * Renders an expanded legend strip by default. The user can dismiss it via the
 * × button; the dismissed flag persists to the cross-subdomain ev-context, so
 * once they dismiss it on essentials they won't see it again on compass /
 * read-rank / etc. either. After dismiss it collapses to a small "?" pill that
 * re-expands on click.
 *
 * Drop one anywhere above the cards section. Render-cost is trivial; legend
 * isn't tied to a specific card.
 */
export default function CompassKey({ compact = false } = {}) {
  const [dismissed, setDismissed] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    evContext.get().then((shared) => {
      if (cancelled) return;
      setDismissed(Boolean(shared?.compassKeyDismissed));
      setLoaded(true);
    }).catch(() => { if (!cancelled) setLoaded(true); });
    return () => { cancelled = true; };
  }, []);

  function persistDismissed(value) {
    evContext.get().then((current) => {
      const next = { ...(current || {}), compassKeyDismissed: value };
      evContext.set(next).catch(() => {});
    }).catch(() => {});
  }

  function handleDismiss() {
    setDismissed(true);
    persistDismissed(true);
  }

  function handleReopen() {
    setDismissed(false);
    persistDismissed(false);
  }

  if (!loaded) return null;

  const Swatch = ({ color, label, ring }) => (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: spacing[1] }}>
      <span style={{
        display: 'inline-block', width: 12, height: 12, borderRadius: '50%',
        background: color, border: `2px solid ${ring || '#fff'}`,
        boxShadow: '0 0 0 1px rgba(0,0,0,0.08)',
      }} />
      <span style={{ fontSize: fontSizes.xs, color: colors.textSecondary, fontFamily: fonts.primary }}>
        {label}
      </span>
    </span>
  );

  if (dismissed) {
    return (
      <button
        type="button"
        onClick={handleReopen}
        aria-label="Show compass legend"
        style={{
          display: 'inline-flex', alignItems: 'center', gap: spacing[1],
          padding: '4px 10px', borderRadius: borderRadius.full,
          background: 'transparent', border: `1px solid ${colors.borderLight}`,
          color: colors.textMuted, fontFamily: fonts.primary,
          fontSize: fontSizes.xs, fontWeight: fontWeights.semibold,
          cursor: 'pointer',
        }}
      >
        <span aria-hidden="true">?</span> Compass key
      </button>
    );
  }

  return (
    <div
      role="region"
      aria-label="Compass legend"
      style={{
        display: 'inline-flex', alignItems: 'center',
        flexWrap: 'wrap',
        gap: compact ? spacing[2] : spacing[3],
        padding: compact ? `${spacing[1]} ${spacing[2]}` : `${spacing[2]} ${spacing[3]}`,
        background: '#fff', border: `1px solid ${colors.borderLight}`,
        borderRadius: borderRadius.md, fontFamily: fonts.primary,
        maxWidth: '100%', boxSizing: 'border-box',
      }}
    >
      {!compact && (
        <span style={{
          fontSize: fontSizes.xs, fontWeight: fontWeights.semibold,
          color: colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.5px',
        }}>
          Compass key
        </span>
      )}
      <Swatch color="#7C6B9E" label="You" />
      <Swatch color="#5A9A6E" label="Politician" />
      <Swatch color="#fed12e" label="Match" />
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: spacing[1] }}>
        <span style={{
          fontSize: fontSizes.xs, fontWeight: fontWeights.semibold,
          color: '#9ca3af', fontFamily: fonts.primary,
          textDecoration: 'underline', textDecorationStyle: 'dashed',
          textUnderlineOffset: '3px',
        }}>
          Topic
        </span>
        <span style={{ fontSize: fontSizes.xs, color: colors.textSecondary, fontFamily: fonts.primary }}>
          = no stance
        </span>
      </span>
      <button
        type="button"
        onClick={handleDismiss}
        aria-label="Hide compass legend"
        style={{
          marginLeft: spacing[2], padding: '2px 6px', border: 'none',
          background: 'transparent', color: colors.textMuted,
          fontSize: '16px', lineHeight: 1, cursor: 'pointer',
        }}
      >
        ×
      </button>
    </div>
  );
}
