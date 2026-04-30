import React from 'react';
import Header from './Header.jsx';
import FeedbackButton from './FeedbackButton.jsx';

/**
 * Pre-configured site header for Empowered Vote applications
 *
 * Provides consistent navigation across all EV apps. Wraps the base Header
 * with standard nav items, a Donate CTA, and a Feedback button (auto-detects
 * the current tool from window.location.hostname).
 *
 * @param {Object} props
 * @param {string} props.logoSrc - URL for the logo image (defaults to /EVLogo.svg)
 * @param {string} props.currentPath - Current path for active state highlighting
 * @param {Function} props.onNavigate - Navigation handler (receives href string)
 * @param {Object} [props.profileMenu] - Optional profile dropdown config
 * @param {React.ReactNode|Object|false} [props.secondaryAction] - Override the
 *   default Feedback button. Pass `false` to hide. Pass a React node or a
 *   {label, href, target} config to replace it.
 * @param {string} [props.feedbackFeature] - Override auto-detected feature slug
 *   for the default Feedback button (e.g. "compass" if you want to force it).
 * @param {Object} props.style - Additional styles for the header container
 */

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
  secondaryAction,
  feedbackFeature,
  style = {},
}) {
  const handleNavigate = (href) => {
    if (onNavigate) {
      onNavigate(href);
    } else {
      window.location.href = href;
    }
  };

  // secondaryAction === false → hide. undefined → default Feedback button.
  // anything else → caller-provided override.
  let resolvedSecondary;
  if (secondaryAction === false) {
    resolvedSecondary = undefined;
  } else if (secondaryAction === undefined) {
    resolvedSecondary = <FeedbackButton feature={feedbackFeature} />;
  } else {
    resolvedSecondary = secondaryAction;
  }

  return (
    <Header
      logoSrc={logoSrc}
      logoAlt="Empowered Vote"
      navItems={defaultNavItems}
      ctaButton={defaultCtaButton}
      secondaryAction={resolvedSecondary}
      currentPath={currentPath}
      onNavigate={handleNavigate}
      profileMenu={profileMenu}
      style={style}
    />
  );
}

export { defaultNavItems, defaultCtaButton };
