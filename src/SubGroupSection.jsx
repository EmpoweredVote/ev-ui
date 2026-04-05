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
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: colors.textMuted,
      textDecoration: 'none',
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
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '12px', height: '12px' }}>
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
              <path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" stroke="currentColor" strokeWidth="2" />
            </svg>
          </a>
        )}
      </div>
      <div style={styles.grid} className="ev-subgroup-grid">
        {children}
      </div>
    </div>
  );
}
