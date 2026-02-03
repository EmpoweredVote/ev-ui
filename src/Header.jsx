import React, { useState } from 'react';
import { colors, fonts, fontWeights, fontSizes, spacing, borderRadius } from './tokens';

/**
 * Header component for Empowered Vote applications
 *
 * @param {Object} props
 * @param {string} props.logoSrc - URL for the logo image
 * @param {string} props.logoAlt - Alt text for logo (default: "Empowered Vote")
 * @param {Array} props.navItems - Navigation items [{label, href, dropdown?}]
 * @param {Object} props.ctaButton - CTA button config {label, href}
 * @param {string} props.currentPath - Current path for active state
 * @param {Function} props.onNavigate - SPA navigation handler
 * @param {Object} props.style - Additional styles for the header container
 */
export default function Header({
  logoSrc,
  logoAlt = 'Empowered Vote',
  navItems = [],
  ctaButton,
  currentPath,
  onNavigate,
  style = {},
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);

  const handleNavClick = (e, href) => {
    if (onNavigate) {
      e.preventDefault();
      onNavigate(href);
    }
  };

  const styles = {
    header: {
      backgroundColor: colors.bgWhite,
      position: 'sticky',
      top: 0,
      zIndex: 50,
      width: '100%',
      ...style,
    },
    container: {
      maxWidth: '1512px',
      margin: '0 auto',
      padding: `${spacing[4]} ${spacing[6]}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    logo: {
      height: '43px',
      cursor: 'pointer',
    },
    nav: {
      display: 'flex',
      alignItems: 'center',
      gap: spacing[10],
    },
    navItem: {
      fontFamily: fonts.primary,
      fontWeight: fontWeights.bold,
      fontSize: fontSizes.xl,
      color: colors.evTeal,
      textDecoration: 'none',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: spacing[2],
      position: 'relative',
    },
    navItemActive: {
      textDecoration: 'underline',
    },
    dropdownIcon: {
      width: '16px',
      height: '9px',
    },
    dropdown: {
      position: 'absolute',
      top: '100%',
      left: 0,
      marginTop: spacing[2],
      backgroundColor: colors.bgWhite,
      borderRadius: borderRadius.lg,
      boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
      minWidth: '200px',
      padding: spacing[2],
      zIndex: 100,
    },
    dropdownItem: {
      display: 'block',
      padding: `${spacing[3]} ${spacing[4]}`,
      fontFamily: fonts.primary,
      fontWeight: fontWeights.medium,
      fontSize: fontSizes.base,
      color: colors.evTeal,
      textDecoration: 'none',
      borderRadius: borderRadius.md,
      cursor: 'pointer',
    },
    ctaButton: {
      backgroundColor: colors.evTeal,
      color: colors.textWhite,
      fontFamily: fonts.primary,
      fontWeight: fontWeights.bold,
      fontSize: fontSizes.xl,
      padding: `${spacing[3]} ${spacing[8]}`,
      borderRadius: borderRadius.lg,
      border: 'none',
      cursor: 'pointer',
      textDecoration: 'none',
      display: 'inline-block',
    },
    mobileMenuButton: {
      display: 'none',
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      padding: spacing[2],
    },
    hamburger: {
      width: '24px',
      height: '2px',
      backgroundColor: colors.evTeal,
      position: 'relative',
    },
    mobileMenu: {
      display: mobileMenuOpen ? 'flex' : 'none',
      flexDirection: 'column',
      position: 'absolute',
      top: '100%',
      left: 0,
      right: 0,
      backgroundColor: colors.bgWhite,
      padding: spacing[4],
      boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
    },
    mobileNavItem: {
      fontFamily: fonts.primary,
      fontWeight: fontWeights.bold,
      fontSize: fontSizes.lg,
      color: colors.evTeal,
      textDecoration: 'none',
      padding: `${spacing[3]} 0`,
      borderBottom: `1px solid ${colors.borderLight}`,
    },
  };

  // Responsive styles via media query in a style tag would be better,
  // but for simplicity we'll use CSS classes that consumers can override
  const NavLink = ({ item }) => {
    const isActive = currentPath === item.href;
    const hasDropdown = item.dropdown && item.dropdown.length > 0;
    const isOpen = openDropdown === item.label;

    return (
      <div
        style={{ position: 'relative' }}
        onMouseEnter={() => hasDropdown && setOpenDropdown(item.label)}
        onMouseLeave={() => hasDropdown && setOpenDropdown(null)}
      >
        <a
          href={item.href}
          onClick={(e) => handleNavClick(e, item.href)}
          style={{
            ...styles.navItem,
            ...(isActive ? styles.navItemActive : {}),
          }}
        >
          {item.label}
          {hasDropdown && (
            <svg
              style={styles.dropdownIcon}
              viewBox="0 0 16 9"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M1 1L8 8L15 1"
                stroke={colors.evTeal}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </a>
        {hasDropdown && isOpen && (
          <div style={styles.dropdown}>
            {item.dropdown.map((dropdownItem, idx) => (
              <a
                key={idx}
                href={dropdownItem.href}
                onClick={(e) => handleNavClick(e, dropdownItem.href)}
                style={styles.dropdownItem}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = colors.bgLight;
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                }}
              >
                {dropdownItem.label}
              </a>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <header style={styles.header}>
      <div style={styles.container}>
        {/* Logo */}
        <a
          href="/"
          onClick={(e) => handleNavClick(e, '/')}
          style={{ display: 'flex', alignItems: 'center' }}
        >
          {logoSrc ? (
            <img src={logoSrc} alt={logoAlt} style={styles.logo} />
          ) : (
            <span
              style={{
                fontFamily: fonts.primary,
                fontWeight: fontWeights.bold,
                fontSize: fontSizes['2xl'],
                color: colors.evTeal,
              }}
            >
              empowered.vote
            </span>
          )}
        </a>

        {/* Desktop Navigation */}
        <nav style={styles.nav} className="ev-header-nav">
          {navItems.map((item, idx) => (
            <NavLink key={idx} item={item} />
          ))}
        </nav>

        {/* CTA Button */}
        {ctaButton && (
          <a
            href={ctaButton.href}
            onClick={(e) => handleNavClick(e, ctaButton.href)}
            style={styles.ctaButton}
            className="ev-header-cta"
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = colors.evTealDark;
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = colors.evTeal;
            }}
          >
            {ctaButton.label}
          </a>
        )}

        {/* Mobile Menu Button */}
        <button
          style={styles.mobileMenuButton}
          className="ev-header-mobile-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
          aria-expanded={mobileMenuOpen}
        >
          <div style={styles.hamburger}>
            <span
              style={{
                position: 'absolute',
                top: '-8px',
                left: 0,
                width: '100%',
                height: '2px',
                backgroundColor: colors.evTeal,
              }}
            />
            <span
              style={{
                position: 'absolute',
                top: '8px',
                left: 0,
                width: '100%',
                height: '2px',
                backgroundColor: colors.evTeal,
              }}
            />
          </div>
        </button>
      </div>

      {/* Mobile Menu */}
      <div style={styles.mobileMenu} className="ev-header-mobile-menu">
        {navItems.map((item, idx) => (
          <a
            key={idx}
            href={item.href}
            onClick={(e) => {
              handleNavClick(e, item.href);
              setMobileMenuOpen(false);
            }}
            style={styles.mobileNavItem}
          >
            {item.label}
          </a>
        ))}
        {ctaButton && (
          <a
            href={ctaButton.href}
            onClick={(e) => {
              handleNavClick(e, ctaButton.href);
              setMobileMenuOpen(false);
            }}
            style={{ ...styles.ctaButton, marginTop: spacing[4], textAlign: 'center' }}
          >
            {ctaButton.label}
          </a>
        )}
      </div>
    </header>
  );
}
