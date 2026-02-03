import React, { useState } from 'react';
import { colors, fonts, fontWeights, fontSizes, spacing, borderRadius } from './tokens';

/**
 * CategorySection component for grouping politicians by category
 *
 * @param {Object} props
 * @param {string} props.title - Category title (e.g., "Mayor", "Council")
 * @param {string} props.infoTooltip - Tooltip text for info icon
 * @param {React.ReactNode} props.children - Card grid content
 * @param {Object} props.style - Additional styles
 */
export default function CategorySection({
  title,
  infoTooltip,
  children,
  style = {},
}) {
  const [showTooltip, setShowTooltip] = useState(false);

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
      border: `1px solid ${colors.borderMedium}`,
      borderRadius: borderRadius.lg,
      fontFamily: fonts.primary,
      fontWeight: fontWeights.medium,
      fontSize: fontSizes.base,
      color: colors.textPrimary,
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
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
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
      </div>
      <div style={styles.grid} className="ev-category-grid">
        {children}
      </div>
    </section>
  );
}
