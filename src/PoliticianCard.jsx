import React from 'react';
import { colors, fonts, fontWeights, fontSizes, spacing, borderRadius, shadows } from './tokens';

/**
 * PoliticianCard component for displaying politician info
 *
 * @param {Object} props
 * @param {string} props.id - Politician ID
 * @param {string} props.imageSrc - Profile image URL
 * @param {string} props.name - Politician name
 * @param {string} props.title - Politician title/position
 * @param {string} [props.subtitle] - Optional 3rd line (e.g., chamber + district)
 * @param {Function} props.onClick - Handler for card click
 * @param {Function} props.onCompassClick - Handler for compass button click
 * @param {'horizontal' | 'vertical'} props.variant - Card layout variant
 * @param {Object} props.style - Additional styles
 * @param {string} props.badge - Optional badge label (e.g., "Candidate") shown as coral pill
 */
export default function PoliticianCard({
  id,
  imageSrc,
  name,
  title,
  subtitle,
  onClick,
  onCompassClick,
  variant = 'horizontal',
  style = {},
  badge,
}) {
  const isHorizontal = variant === 'horizontal';

  const handleCardClick = (e) => {
    // Don't trigger card click if compass button was clicked
    if (e.target.closest('.ev-compass-button')) return;
    onClick?.();
  };

  const handleCompassClick = (e) => {
    e.stopPropagation();
    onCompassClick?.();
  };

  const styles = {
    card: {
      display: 'flex',
      flexDirection: isHorizontal ? 'row' : 'column',
      alignItems: 'stretch',
      backgroundColor: colors.bgWhite,
      borderRadius: borderRadius.lg,
      border: `1px solid ${colors.borderLight}`,
      overflow: 'hidden',
      cursor: onClick ? 'pointer' : 'default',
      transition: 'box-shadow 0.2s ease, transform 0.2s ease',
      position: 'relative',
      height: isHorizontal ? '80px' : undefined,
      ...style,
    },
    imageWrapper: {
      width: isHorizontal ? '80px' : '100%',
      height: isHorizontal ? undefined : 'auto',
      aspectRatio: isHorizontal ? undefined : '4/5',
      flexShrink: 0,
      overflow: 'hidden',
    },
    image: {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
    },
    imagePlaceholder: {
      width: '100%',
      height: '100%',
      backgroundColor: colors.evTeal,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#ffffff',
      fontFamily: fonts.primary,
      fontSize: isHorizontal ? fontSizes.base : fontSizes.xl,
      fontWeight: fontWeights.bold,
      borderRadius: 0,
    },
    content: {
      flex: 1,
      padding: isHorizontal ? `${spacing[2]} ${spacing[3]}` : spacing[3],
      minWidth: 0,
    },
    name: {
      fontFamily: fonts.primary,
      fontWeight: fontWeights.bold,
      fontSize: isHorizontal ? fontSizes.sm : fontSizes.base,
      color: colors.evTeal,
      margin: 0,
      marginBottom: spacing[1],
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: isHorizontal ? 'nowrap' : 'normal',
      display: isHorizontal ? 'block' : '-webkit-box',
      WebkitLineClamp: isHorizontal ? undefined : 2,
      WebkitBoxOrient: 'vertical',
    },
    title: {
      fontFamily: fonts.primary,
      fontWeight: fontWeights.regular,
      fontSize: isHorizontal ? fontSizes.xs : fontSizes.sm,
      color: colors.textSecondary,
      margin: 0,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: isHorizontal ? 'nowrap' : 'normal',
      display: isHorizontal ? 'block' : '-webkit-box',
      WebkitLineClamp: isHorizontal ? undefined : 2,
      WebkitBoxOrient: isHorizontal ? undefined : 'vertical',
    },
    subtitle: {
      fontFamily: fonts.primary,
      fontWeight: fontWeights.regular,
      fontSize: isHorizontal ? '11px' : fontSizes.xs,
      color: colors.textMuted,
      margin: 0,
      marginTop: spacing[1],
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },
    compassButton: {
      width: isHorizontal ? '36px' : '40px',
      height: isHorizontal ? '36px' : '40px',
      borderRadius: '50%',
      backgroundColor: colors.evTeal,
      border: 'none',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      marginRight: isHorizontal ? spacing[2] : 0,
      marginTop: isHorizontal ? 0 : spacing[2],
      position: isHorizontal ? 'relative' : 'absolute',
      bottom: isHorizontal ? 'auto' : spacing[3],
      right: isHorizontal ? 'auto' : spacing[3],
      transition: 'background-color 0.2s ease',
    },
    compassIcon: {
      width: isHorizontal ? '18px' : '20px',
      height: isHorizontal ? '18px' : '20px',
      color: colors.textWhite,
    },
    badge: {
      position: 'absolute',
      top: spacing[1],
      right: spacing[1],
      backgroundColor: colors.evCoral,
      color: colors.textWhite,
      fontFamily: fonts.primary,
      fontWeight: fontWeights.semibold,
      fontSize: '10px',
      lineHeight: 1,
      padding: `${spacing[1]} ${spacing[2]}`,
      borderRadius: borderRadius.full,
      zIndex: 1,
      letterSpacing: '0.02em',
      textTransform: 'uppercase',
    },
  };

  // Compass/radar icon SVG
  const CompassIcon = () => (
    <svg
      style={styles.compassIcon}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z"
        fill="currentColor"
      />
    </svg>
  );

  // Extract initials from name for placeholder avatar
  const getInitials = (n) => {
    const parts = (n || '').split(' ').filter(Boolean);
    const initials = parts.length >= 2
      ? parts[0][0] + parts[parts.length - 1][0]
      : parts[0]?.[0] || '?';
    return initials.toUpperCase();
  };

  return (
    <div
      style={styles.card}
      className="ev-politician-card"
      onClick={handleCardClick}
      onMouseEnter={(e) => {
        if (onClick) {
          e.currentTarget.style.boxShadow = shadows.md;
          e.currentTarget.style.transform = 'translateY(-2px)';
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.transform = 'none';
      }}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick();
        }
      }}
    >
      {/* Badge */}
      {badge && <span style={styles.badge}>{badge}</span>}

      {/* Image */}
      <div style={styles.imageWrapper}>
        {imageSrc ? (
          <img
            src={imageSrc}
            alt={`${name} portrait`}
            style={styles.image}
          />
        ) : (
          <div style={styles.imagePlaceholder}>
            {getInitials(name)}
          </div>
        )}
      </div>

      {/* Content */}
      <div style={styles.content}>
        <h3 style={styles.name}>{name}</h3>
        <p style={styles.title}>{title}</p>
        {subtitle && (
          <p style={styles.subtitle}>{subtitle}</p>
        )}
      </div>

      {/* Compass Button */}
      {onCompassClick && (
        <button
          type="button"
          style={styles.compassButton}
          className="ev-compass-button"
          onClick={handleCompassClick}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = colors.evTealDark;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = colors.evTeal;
          }}
          aria-label={`View ${name}'s compass`}
        >
          <CompassIcon />
        </button>
      )}
    </div>
  );
}
