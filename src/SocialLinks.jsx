import React from 'react';
import { colors, spacing } from './tokens';

// Platform detection patterns (duplicated from PoliticianProfile for standalone use)
const SOCIAL_PLATFORMS = [
  { test: /facebook\.com/i,  platform: 'facebook' },
  { test: /twitter\.com|x\.com/i, platform: 'twitter' },
  { test: /instagram\.com/i, platform: 'instagram' },
  { test: /linkedin\.com/i,  platform: 'linkedin' },
  { test: /youtube\.com|youtu\.be/i, platform: 'youtube' },
];

/**
 * SocialLinks component for displaying politician social media links
 *
 * @param {Object} props
 * @param {string} props.website - Website URL
 * @param {string} props.twitter - Twitter/X handle or URL
 * @param {string} props.facebook - Facebook handle or URL
 * @param {string} props.instagram - Instagram handle or URL
 * @param {string} props.linkedin - LinkedIn URL or handle
 * @param {string[]} props.extraLinks - Additional social platform URLs detected from websites list
 * @param {'sm' | 'md' | 'lg'} props.size - Icon size
 * @param {boolean} props.brandMarks - Opt in to official brand marks (currently LinkedIn) in place of stroked glyphs. Default false, because it changes the rendering for every consumer.
 * @param {Object} props.style - Additional styles
 */
export default function SocialLinks({
  website,
  twitter,
  facebook,
  instagram,
  linkedin,
  extraLinks = [],
  size = 'md',
  darkMode = false,
  brandMarks = false,
  style = {},
}) {
  const iconSizes = {
    sm: '16px',
    md: '18px',
    lg: '20px',
  };

  const boxSizes = {
    sm: '32px',
    md: '36px',
    lg: '40px',
  };

  const iconSize = iconSizes[size];
  const boxSize = boxSizes[size];
  // Brand marks are solid shapes rather than strokes, so they need a little more
  // room than a stroked glyph to carry the same visual weight.
  const logoSize = `${parseInt(iconSize, 10) + 4}px`;

  const styles = {
    container: {
      display: 'flex',
      alignItems: 'center',
      gap: spacing[2],
      flexWrap: 'wrap',
      ...style,
    },
    link: {
      color: darkMode ? '#9ca3af' : '#6A7282',
      transition: 'color 0.2s ease, border-color 0.2s ease',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: boxSize,
      height: boxSize,
      border: `1px solid ${darkMode ? 'rgba(255,255,255,0.15)' : '#E5E7EB'}`,
      borderRadius: '10px',
    },
    icon: {
      width: iconSize,
      height: iconSize,
    },
  };

  // Helper to format URLs
  const formatUrl = (value, platform) => {
    if (!value) return null;
    if (value.startsWith('http')) return value;

    switch (platform) {
      case 'twitter':
        return `https://twitter.com/${value.replace('@', '')}`;
      case 'facebook':
        return `https://facebook.com/${value}`;
      case 'instagram':
        return `https://instagram.com/${value.replace('@', '')}`;
      case 'linkedin':
        return `https://linkedin.com/in/${value}`;
      default:
        return value;
    }
  };

  const platformIconMap = {
    twitter: (
      <svg style={styles.icon} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M4 4L10.5 12.5M20 20L13.5 11.5M10.5 12.5L4 20H8L13.5 11.5M10.5 12.5L16 4H20L13.5 11.5"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    facebook: (
      <svg style={styles.icon} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M18 2H15C13.6739 2 12.4021 2.52678 11.4645 3.46447C10.5268 4.40215 10 5.67392 10 7V10H7V14H10V22H14V14H17L18 10H14V7C14 6.73478 14.1054 6.48043 14.2929 6.29289C14.4804 6.10536 14.7348 6 15 6H18V2Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    instagram: (
      <svg style={styles.icon} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="2" width="20" height="20" rx="5" stroke="currentColor" strokeWidth="2" />
        <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
        <circle cx="18" cy="6" r="1" fill="currentColor" />
      </svg>
    ),
    // Under `brandMarks`, the official LinkedIn "in" mark (Simple Icons, CC0).
    // It is a filled square rather than a stroked glyph, so the link also drops
    // its outlined box in the render below — a box around a solid tile reads as
    // a double border.
    linkedin: brandMarks ? (
      <svg style={{ width: logoSize, height: logoSize }} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ) : (
      <svg style={styles.icon} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M16 8C17.5913 8 19.1174 8.63214 20.2426 9.75736C21.3679 10.8826 22 12.4087 22 14V21H18V14C18 13.4696 17.7893 12.9609 17.4142 12.5858C17.0391 12.2107 16.5304 12 16 12C15.4696 12 14.9609 12.2107 14.5858 12.5858C14.2107 12.9609 14 13.4696 14 14V21H10V14C10 12.4087 10.6321 10.8826 11.7574 9.75736C12.8826 8.63214 14.4087 8 16 8Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <rect x="2" y="9" width="4" height="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="4" cy="4" r="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    youtube: (
      <svg style={styles.icon} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="5" width="20" height="14" rx="3" stroke="currentColor" strokeWidth="2"/>
        <polygon points="10,9 16,12 10,15" fill="currentColor"/>
      </svg>
    ),
  };

  const links = [
    {
      href: formatUrl(twitter, 'twitter'),
      label: 'X (Twitter)',
      platform: 'twitter',
      icon: platformIconMap.twitter,
    },
    {
      href: formatUrl(facebook, 'facebook'),
      label: 'Facebook',
      platform: 'facebook',
      icon: platformIconMap.facebook,
    },
    {
      href: formatUrl(instagram, 'instagram'),
      label: 'Instagram',
      platform: 'instagram',
      icon: platformIconMap.instagram,
    },
    {
      href: formatUrl(linkedin, 'linkedin'),
      label: 'LinkedIn',
      platform: 'linkedin',
      icon: platformIconMap.linkedin,
    },
    {
      href: website,
      label: 'Website',
      icon: (
        <svg style={styles.icon} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
          <path
            d="M2 12H22M12 2C14.5 4.5 16 8 16 12C16 16 14.5 19.5 12 22C9.5 19.5 8 16 8 12C8 8 9.5 4.5 12 2Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
  ].filter((link) => link.href);

  // Append extraLinks mapped to platform icons, skipping duplicates
  extraLinks.forEach((url) => {
    const detected = SOCIAL_PLATFORMS.find(({ test }) => test.test(url));
    if (detected && platformIconMap[detected.platform]) {
      const alreadyPresent = links.some(
        (l) => l.href === url || (l.href && l.href.includes(detected.platform))
      );
      if (!alreadyPresent) {
        links.push({
          href: url,
          label: detected.platform.charAt(0).toUpperCase() + detected.platform.slice(1),
          // Carry the platform itself. The display label is title-cased from it
          // ("Linkedin"), so it does not match the canonical "LinkedIn" and is
          // not a safe key for per-platform rendering rules.
          platform: detected.platform,
          icon: platformIconMap[detected.platform],
        });
      }
    }
  });

  if (links.length === 0) {
    return null;
  }

  return (
    <div style={styles.container} className="ev-social-links">
      {links.map((link) => (
        <a
          key={link.label}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          style={
            brandMarks && link.platform === 'linkedin'
              ? { ...styles.link, border: 'none' }
              : styles.link
          }
          aria-label={link.label}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = colors.evTeal;
            e.currentTarget.style.borderColor = colors.evTeal;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = darkMode ? '#9ca3af' : '#6A7282';
            e.currentTarget.style.borderColor = darkMode ? 'rgba(255,255,255,0.15)' : '#E5E7EB';
          }}
        >
          {link.icon}
        </a>
      ))}
    </div>
  );
}
