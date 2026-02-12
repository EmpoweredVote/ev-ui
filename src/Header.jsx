import React, { useState, useRef, useEffect } from 'react';
import { colors, fonts, fontWeights, fontSizes, spacing, borderRadius } from './tokens';
import useMediaQuery from './useMediaQuery';

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
  profileMenu,
  style = {},
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)');
  const profileRef = useRef(null);

  useEffect(() => {
    if (!profileOpen) return;
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [profileOpen]);

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
      padding: isMobile ? `${spacing[3]} ${spacing[3]}` : `${spacing[4]} ${spacing[6]}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    logo: {
      height: '43px',
      cursor: 'pointer',
    },
    nav: {
      display: isMobile ? 'none' : 'flex',
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
      paddingTop: spacing[2],
      zIndex: 100,
    },
    dropdownInner: {
      backgroundColor: colors.bgWhite,
      borderRadius: borderRadius.lg,
      boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
      minWidth: '200px',
      padding: spacing[2],
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
      display: isMobile ? 'block' : 'none',
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
    profileButton: {
      width: '40px',
      height: '40px',
      borderRadius: borderRadius.full,
      border: `2px solid ${colors.evTeal}`,
      backgroundColor: colors.bgLight,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 0,
    },
    profileDropdown: {
      position: 'absolute',
      top: '100%',
      right: 0,
      paddingTop: spacing[2],
      zIndex: 100,
    },
    profileDropdownInner: {
      backgroundColor: colors.bgWhite,
      borderRadius: borderRadius.lg,
      boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
      minWidth: '160px',
      padding: spacing[2],
    },
    profileDropdownItem: {
      display: 'block',
      width: '100%',
      padding: `${spacing[3]} ${spacing[4]}`,
      fontFamily: fonts.primary,
      fontWeight: fontWeights.medium,
      fontSize: fontSizes.base,
      color: colors.evTeal,
      textDecoration: 'none',
      borderRadius: borderRadius.md,
      cursor: 'pointer',
      border: 'none',
      backgroundColor: 'transparent',
      textAlign: 'left',
    },
    mobileDivider: {
      height: '1px',
      backgroundColor: colors.borderLight,
      margin: `${spacing[3]} 0`,
    },
    profileLabel: {
      padding: `${spacing[2]} ${spacing[4]} ${spacing[3]}`,
      fontFamily: fonts.primary,
      fontWeight: fontWeights.semibold,
      fontSize: fontSizes.sm,
      color: colors.textMuted,
      borderBottom: `1px solid ${colors.borderLight}`,
      marginBottom: spacing[1],
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
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
            <div style={styles.dropdownInner}>
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

        {/* Right side: CTA + Profile */}
        <div style={{ display: isMobile ? 'none' : 'flex', alignItems: 'center', gap: spacing[4] }}>
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

          {/* Profile Menu (Desktop) */}
          {profileMenu && (
            <div ref={profileRef} style={{ position: 'relative' }}>
              <button
                style={styles.profileButton}
                onClick={() => setProfileOpen(!profileOpen)}
                aria-label="Profile menu"
                aria-expanded={profileOpen}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={colors.evTeal}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </button>
              {profileOpen && (
                <div style={styles.profileDropdown}>
                  <div style={styles.profileDropdownInner}>
                    {profileMenu.label && (
                      <div style={styles.profileLabel}>{profileMenu.label}</div>
                    )}
                    {profileMenu.items.map((item, idx) => {
                      if (item.href) {
                        return (
                          <a
                            key={idx}
                            href={item.href}
                            onClick={(e) => {
                              setProfileOpen(false);
                              if (onNavigate) {
                                e.preventDefault();
                                onNavigate(item.href);
                              }
                            }}
                            style={styles.profileDropdownItem}
                            onMouseEnter={(e) => {
                              e.target.style.backgroundColor = colors.bgLight;
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.backgroundColor = 'transparent';
                            }}
                          >
                            {item.label}
                          </a>
                        );
                      }
                      return (
                        <button
                          key={idx}
                          onClick={() => {
                            setProfileOpen(false);
                            item.onClick?.();
                          }}
                          style={styles.profileDropdownItem}
                          onMouseEnter={(e) => {
                            e.target.style.backgroundColor = colors.bgLight;
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.backgroundColor = 'transparent';
                          }}
                        >
                          {item.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

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
        {navItems.map((item, idx) => {
          const hasDropdown = item.dropdown && item.dropdown.length > 0;
          return (
            <React.Fragment key={idx}>
              {hasDropdown ? (
                <>
                  <span
                    style={{
                      ...styles.mobileNavItem,
                      cursor: 'default',
                      display: 'block',
                    }}
                  >
                    {item.label}
                  </span>
                  {item.dropdown.map((sub, subIdx) => (
                    <a
                      key={subIdx}
                      href={sub.href}
                      onClick={(e) => {
                        handleNavClick(e, sub.href);
                        setMobileMenuOpen(false);
                      }}
                      style={{
                        ...styles.mobileNavItem,
                        fontWeight: fontWeights.medium,
                        fontSize: fontSizes.base,
                        paddingLeft: spacing[4],
                      }}
                    >
                      {sub.label}
                    </a>
                  ))}
                </>
              ) : (
                <a
                  href={item.href}
                  onClick={(e) => {
                    handleNavClick(e, item.href);
                    setMobileMenuOpen(false);
                  }}
                  style={styles.mobileNavItem}
                >
                  {item.label}
                </a>
              )}
            </React.Fragment>
          );
        })}
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

        {/* Profile items in mobile menu */}
        {profileMenu && (
          <>
            <div style={styles.mobileDivider} />
            {profileMenu.label && (
              <span
                style={{
                  ...styles.mobileNavItem,
                  fontWeight: fontWeights.medium,
                  fontSize: fontSizes.sm,
                  color: colors.textMuted,
                  cursor: 'default',
                  display: 'block',
                  borderBottom: 'none',
                }}
              >
                {profileMenu.label}
              </span>
            )}
            {profileMenu.items.map((item, idx) => {
              if (item.href) {
                return (
                  <a
                    key={idx}
                    href={item.href}
                    onClick={(e) => {
                      setMobileMenuOpen(false);
                      if (onNavigate) {
                        e.preventDefault();
                        onNavigate(item.href);
                      }
                    }}
                    style={styles.mobileNavItem}
                  >
                    {item.label}
                  </a>
                );
              }
              return (
                <button
                  key={idx}
                  onClick={() => {
                    setMobileMenuOpen(false);
                    item.onClick?.();
                  }}
                  style={{
                    ...styles.mobileNavItem,
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    width: '100%',
                    textAlign: 'left',
                  }}
                >
                  {item.label}
                </button>
              );
            })}
          </>
        )}
      </div>
    </header>
  );
}
