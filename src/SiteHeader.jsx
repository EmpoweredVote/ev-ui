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
  { label: 'About Us', href: 'https://empowered.vote/about' },
  {
    label: 'Features',
    href: '#',
    dropdown: [
      { label: 'Political Compass', href: 'https://ev-compass.netlify.app' },
      { label: 'Find Representatives', href: 'https://ev-essentials.netlify.app' },
      { label: 'Read & Rank', href: 'https://ev-prototypes.netlify.app/read-rank/dist' },
      { label: 'Treasury Tracker', href: 'https://ev-prototypes.netlify.app/treasury-tracker/dist' },
      { label: 'Empowered Badges', href: 'https://ev-prototypes.netlify.app/empowered-badges/dist' },
    ],
  },
  { label: 'Volunteer', href: 'https://empowered.vote/volunteer' },
  { label: 'FAQ', href: 'https://empowered.vote/faq' },
];

const defaultCtaButton = {
  label: 'Donate',
  href: 'https://empowered.vote/donate',
};

export default function SiteHeader({
  logoSrc = '/EVLogo.svg',
  currentPath,
  onNavigate,
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
      style={style}
    />
  );
}

// Export the default configs in case apps need to customize
export { defaultNavItems, defaultCtaButton };
