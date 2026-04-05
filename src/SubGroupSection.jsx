import React from 'react';
import { colors, fonts, fontWeights, fontSizes, spacing } from './tokens';

/**
 * SubGroupSection — a sub-group label + card grid inside a GovernmentBodySection.
 *
 * @param {Object} props
 * @param {string} props.title - Sub-group label (e.g., "Bloomington Common Council")
 * @param {string} [props.websiteUrl] - Optional inline link after label
 * @param {React.ReactNode} props.children - PoliticianCard components
 */
export default function SubGroupSection({ title, websiteUrl, children }) {
  const styles = {
    section: {
      marginBottom: spacing[4],
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      gap: spacing[2],
      marginBottom: spacing[2],
    },
    label: {
      fontSize: fontSizes.xs,
      fontWeight: fontWeights.semibold,
      textTransform: 'uppercase',
      letterSpacing: '0.8px',
      color: colors.textMuted,
      fontFamily: fonts.primary,
    },
    link: {
      color: '#59b0c4',
      textDecoration: 'none',
      fontSize: '10px',
      fontWeight: fontWeights.medium,
      fontFamily: fonts.primary,
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(min(250px, 100%), 1fr))',
      gap: spacing[2],
    },
  };

  return (
    <div style={styles.section}>
      <div style={styles.header}>
        <span style={styles.label}>{title}</span>
        {websiteUrl && (
          <a
            href={websiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={styles.link}
          >
            {websiteUrl.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')} ↗
          </a>
        )}
      </div>
      <div style={styles.grid} className="ev-subgroup-grid">
        {children}
      </div>
    </div>
  );
}
