import React, { useState } from 'react';
import { colors, fonts, fontWeights, fontSizes, spacing, borderRadius, tierColors } from './tokens';

/**
 * CategorySection component for grouping politicians by category
 *
 * @param {Object} props
 * @param {string} props.title - Category title (e.g., "Mayor", "Council")
 * @param {string} props.infoTooltip - Tooltip text for info icon
 * @param {string} [props.websiteUrl] - Optional URL for external website link
 * @param {React.ReactNode} props.children - Card grid content
 * @param {Object} props.style - Additional styles
 */
export default function CategorySection({
  title,
  infoTooltip,
  websiteUrl,
  children,
  style = {},
  tier,
}) {
  const [showTooltip, setShowTooltip] = useState(false);

  const tierStyle = tier ? tierColors[tier] : null;

  const styles = {
    section: {
      marginBottom: spacing[8],
      ...style,
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      gap: spacing[2],
      marginBottom: spacing[4],
    },
    titlePill: {
      display: 'inline-flex',
      alignItems: 'center',
      padding: `${spacing[2]} ${spacing[4]}`,
      backgroundColor: colors.bgWhite,
      border: `1px solid ${tierStyle?.accent ?? colors.borderMedium}`,
      borderRadius: borderRadius.lg,
      fontFamily: fonts.primary,
      fontWeight: fontWeights.medium,
      fontSize: fontSizes.base,
      color: tierStyle?.text ?? colors.textPrimary,
    },
    infoButton: {
      width: '20px',
      height: '20px',
      borderRadius: '50%',
      border: `1px solid ${colors.borderMedium}`,
      backgroundColor: colors.bgWhite,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: fonts.primary,
      fontSize: fontSizes.xs,
      color: colors.textMuted,
      position: 'relative',
    },
    tooltip: {
      position: 'absolute',
      top: '100%',
      left: '50%',
      transform: 'translateX(-50%)',
      marginTop: spacing[2],
      padding: `${spacing[2]} ${spacing[3]}`,
      backgroundColor: colors.textPrimary,
      color: colors.textWhite,
      fontFamily: fonts.primary,
      fontSize: fontSizes.sm,
      borderRadius: borderRadius.md,
      whiteSpace: 'nowrap',
      zIndex: 100,
    },
    externalLink: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: colors.textMuted,
      textDecoration: 'none',
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(min(250px, 100%), 1fr))',
      gap: spacing[4],
    },
  };

  return (
    <section style={styles.section} className="ev-category-section">
      <div style={styles.header}>
        <span style={styles.titlePill}>{title}</span>
        {infoTooltip && (
          <button
            type="button"
            style={styles.infoButton}
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            onFocus={() => setShowTooltip(true)}
            onBlur={() => setShowTooltip(false)}
            aria-label={`Info about ${title}`}
          >
            i
            {showTooltip && (
              <div style={styles.tooltip} role="tooltip">
                {infoTooltip}
              </div>
            )}
          </button>
        )}
        {websiteUrl && (
          <a
            href={websiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={styles.externalLink}
            aria-label={`Visit official website for ${title}`}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{ width: '14px', height: '14px' }}
            >
              <path
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </a>
        )}
      </div>
      <div style={styles.grid} className="ev-category-grid">
        {children}
      </div>
    </section>
  );
}
