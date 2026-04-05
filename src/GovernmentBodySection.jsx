import React, { useState } from 'react';
import { colors, fonts, fontWeights, fontSizes, spacing, tierColors } from './tokens';

/**
 * GovernmentBodySection — collapsible accordion for a government body.
 *
 * @param {Object} props
 * @param {string} props.title - Accordion header (e.g., "City of Bloomington")
 * @param {string} [props.websiteUrl] - Top-level website link at far right
 * @param {string} [props.tier] - "local" | "state" | "federal"
 * @param {boolean} [props.defaultExpanded=true] - Initial expand state
 * @param {React.ReactNode} props.children - SubGroupSection components
 */
export default function GovernmentBodySection({
  title,
  websiteUrl,
  tier,
  defaultExpanded = true,
  children,
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  const tierStyle = tier ? tierColors[tier] : null;
  const accentColor = tierStyle?.accent ?? colors.borderMedium;

  const styles = {
    section: {
      marginBottom: spacing[5],
      borderLeft: `3px solid ${accentColor}`,
      paddingLeft: spacing[4],
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      gap: spacing[2],
      marginBottom: expanded ? spacing[3] : 0,
      cursor: 'pointer',
      userSelect: 'none',
    },
    title: {
      fontSize: fontSizes.base,
      fontWeight: fontWeights.bold,
      color: colors.textPrimary,
      fontFamily: fonts.primary,
    },
    toggle: {
      fontSize: fontSizes.xs,
      color: colors.textMuted,
      transition: 'transform 0.2s',
      transform: expanded ? 'rotate(0deg)' : 'rotate(-90deg)',
    },
    link: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: colors.textMuted,
      textDecoration: 'none',
    },
    content: {
      display: expanded ? 'block' : 'none',
    },
  };

  return (
    <section style={styles.section} className="ev-gov-body-section">
      <div
        style={styles.header}
        onClick={() => setExpanded((prev) => !prev)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setExpanded((prev) => !prev);
          }
        }}
        aria-expanded={expanded}
        aria-label={`${expanded ? 'Collapse' : 'Expand'} ${title}`}
      >
        <span style={styles.title}>{title}</span>
        {websiteUrl && (
          <a
            href={websiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={styles.link}
            onClick={(e) => e.stopPropagation()}
            aria-label={`Visit ${title} website`}
          >
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '14px', height: '14px' }}>
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
              <path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" stroke="currentColor" strokeWidth="2" />
            </svg>
          </a>
        )}
        <span style={styles.toggle} aria-hidden="true">▼</span>
      </div>
      <div style={styles.content}>
        {children}
      </div>
    </section>
  );
}
