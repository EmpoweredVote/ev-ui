import React from 'react';
import Header from './Header.jsx';

/**
 * Pre-configured site header for Empowered Vote applications
 *
 * This component provides consistent navigation across all EV apps.
 * It wraps the base Header component with standard nav items.
 *
 * @param {Object} props
 * @param {string} props.logoSrc - URL for the logo image (defaults to /EVLogo.svg)
 * @param {string} props.currentPath - Current path for active state highlighting
 * @param {Function} props.onNavigate - Navigation handler (receives href string)
 * @param {Object} props.style - Additional styles for the header container
 */

// Standard navigation configuration for all EV apps
const defaultNavItems = [
  {
    label: 'Features',
    href: '#',
    dropdown: [
      { label: 'Political Compass', href: 'https://compass.empowered.vote' },
      { label: 'Find Representatives', href: 'https://essentials.empowered.vote' },
      { label: 'Read & Rank', href: 'https://readrank.empowered.vote' },
      { label: 'Treasury Tracker', href: 'https://treasurytracker.empowered.vote' },
      { label: 'Empowered Badges', href: 'https://badges.empowered.vote' },
    ],
  },
];

const defaultCtaButton = {
  label: 'Donate',
  href: 'https://empowered.vote/donate',
};

export default function SiteHeader({
  logoSrc = '/EVLogo.svg',
  currentPath,
  onNavigate,
  profileMenu,
  style = {},
}) {
  const handleNavigate = (href) => {
    if (onNavigate) {
      onNavigate(href);
    } else {
      // Default behavior: navigate directly
      window.location.href = href;
    }
  };

  return (
    <Header
      logoSrc={logoSrc}
      logoAlt="Empowered Vote"
      navItems={defaultNavItems}
      ctaButton={defaultCtaButton}
      currentPath={currentPath}
      onNavigate={handleNavigate}
      profileMenu={profileMenu}
      style={style}
    />
  );
}

// Export the default configs in case apps need to customize
export { defaultNavItems, defaultCtaButton };
