import React from 'react';
import { colors, spacing } from './tokens';

/**
 * SocialLinks component for displaying politician social media links
 *
 * @param {Object} props
 * @param {string} props.email - Email address
 * @param {string} props.website - Website URL
 * @param {string} props.twitter - Twitter/X handle or URL
 * @param {string} props.facebook - Facebook handle or URL
 * @param {string} props.instagram - Instagram handle or URL
 * @param {string} props.contactFormUrl - Contact form URL
 * @param {'sm' | 'md' | 'lg'} props.size - Icon size
 * @param {Object} props.style - Additional styles
 */
export default function SocialLinks({
  email,
  website,
  twitter,
  facebook,
  instagram,
  contactFormUrl,
  size = 'md',
  style = {},
}) {
  const iconSizes = {
    sm: '20px',
    md: '24px',
    lg: '28px',
  };

  const iconSize = iconSizes[size];

  const styles = {
    container: {
      display: 'flex',
      alignItems: 'center',
      gap: spacing[3],
      flexWrap: 'wrap',
      ...style,
    },
    link: {
      color: colors.evTeal,
      transition: 'color 0.2s ease',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
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
      default:
        return value;
    }
  };

  const links = [
    {
      href: email ? `mailto:${email}` : null,
      label: 'Email',
      icon: (
        <svg style={styles.icon} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M22 6L12 13L2 6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
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
    {
      href: formatUrl(instagram, 'instagram'),
      label: 'Instagram',
      icon: (
        <svg style={styles.icon} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="2" y="2" width="20" height="20" rx="5" stroke="currentColor" strokeWidth="2" />
          <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
          <circle cx="18" cy="6" r="1" fill="currentColor" />
        </svg>
      ),
    },
    {
      href: formatUrl(facebook, 'facebook'),
      label: 'Facebook',
      icon: (
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
    },
    {
      href: formatUrl(twitter, 'twitter'),
      label: 'X (Twitter)',
      icon: (
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
    },
  ].filter((link) => link.href);

  if (links.length === 0 && !contactFormUrl) {
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
          style={styles.link}
          aria-label={link.label}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = colors.evTealDark;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = colors.evTeal;
          }}
        >
          {link.icon}
        </a>
      ))}
      {contactFormUrl && (
        <a
          href={contactFormUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            ...styles.link,
            fontFamily: "'Manrope', sans-serif",
            fontSize: '14px',
            fontWeight: 500,
            gap: spacing[1],
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = colors.evTealDark;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = colors.evTeal;
          }}
        >
          <svg style={{ width: '16px', height: '16px' }} viewBox="0 0 24 24" fill="none">
            <path
              d="M18 13V19C18 20.1046 17.1046 21 16 21H5C3.89543 21 3 20.1046 3 19V8C3 6.89543 3.89543 6 5 6H11"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M15 3H21V9"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M10 14L21 3"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Submit a Message
        </a>
      )}
    </div>
  );
}
