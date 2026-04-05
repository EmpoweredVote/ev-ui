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
      fontSize: fontSizes.xs,
      color: '#59b0c4',
      textDecoration: 'none',
      marginLeft: 'auto',
      fontFamily: fonts.primary,
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
        <span style={styles.toggle} aria-hidden="true">▼</span>
        {websiteUrl && (
          <a
            href={websiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={styles.link}
            onClick={(e) => e.stopPropagation()}
            aria-label={`Visit ${title} website`}
          >
            {websiteUrl.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')} ↗
          </a>
        )}
      </div>
      <div style={styles.content}>
        {children}
      </div>
    </section>
  );
}
