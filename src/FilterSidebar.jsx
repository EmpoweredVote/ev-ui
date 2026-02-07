import React from 'react';
import { colors, fonts, fontWeights, fontSizes, spacing, borderRadius, shadows } from './tokens';

/**
 * FilterSidebar component for filtering politicians by level
 *
 * @param {Object} props
 * @param {string} props.title - Sidebar title (default: "Filter by")
 * @param {string} props.zipCode - Current ZIP code value
 * @param {Function} props.onZipChange - Handler for ZIP input changes
 * @param {Function} props.onZipClear - Handler for clearing ZIP
 * @param {Function} props.onZipSubmit - Handler for ZIP submission (Enter key)
 * @param {Array} props.filterOptions - Filter options [{value, label}]
 * @param {string} props.selectedFilter - Currently selected filter value
 * @param {Function} props.onFilterChange - Handler for filter changes
 * @param {string} props.locationLabel - Location display text (e.g., "Bloomington, Indiana")
 * @param {string} props.buildingImageSrc - URL for the building image
 * @param {Object} props.style - Additional styles
 */
export default function FilterSidebar({
  title = 'Filter by',
  zipCode = '',
  onZipChange,
  onZipClear,
  onZipSubmit,
  filterOptions = [
    { value: 'All', label: 'All' },
    { value: 'Local', label: 'Local' },
    { value: 'State', label: 'State' },
    { value: 'Federal', label: 'Federal' },
  ],
  selectedFilter = 'All',
  onFilterChange,
  locationLabel,
  buildingImageSrc,
  style = {},
}) {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && onZipSubmit) {
      onZipSubmit();
    }
  };

  const styles = {
    sidebar: {
      width: '240px',
      flexShrink: 0,
      padding: spacing[6],
      backgroundColor: colors.bgWhite,
      borderRight: `1px solid ${colors.borderLight}`,
      minHeight: 'calc(100vh - 80px)',
      ...style,
    },
    title: {
      fontFamily: fonts.primary,
      fontWeight: fontWeights.bold,
      fontSize: fontSizes.lg,
      color: colors.textPrimary,
      marginBottom: spacing[4],
    },
    section: {
      marginBottom: spacing[6],
    },
    sectionLabel: {
      fontFamily: fonts.primary,
      fontWeight: fontWeights.medium,
      fontSize: fontSizes.sm,
      color: colors.textSecondary,
      marginBottom: spacing[2],
    },
    zipInputWrapper: {
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
    },
    zipInput: {
      width: '100%',
      padding: `${spacing[2]} ${spacing[3]}`,
      paddingRight: spacing[8],
      fontFamily: fonts.primary,
      fontSize: fontSizes.base,
      color: colors.textPrimary,
      border: `1px solid ${colors.evTeal}`,
      borderRadius: borderRadius.md,
      outline: 'none',
    },
    clearButton: {
      position: 'absolute',
      right: spacing[2],
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      padding: spacing[1],
      color: colors.evTeal,
      fontSize: fontSizes.lg,
      lineHeight: 1,
      display: zipCode ? 'block' : 'none',
    },
    radioGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: spacing[2],
    },
    radioLabel: {
      display: 'flex',
      alignItems: 'center',
      gap: spacing[2],
      cursor: 'pointer',
      fontFamily: fonts.primary,
      fontSize: fontSizes.base,
      color: colors.textPrimary,
    },
    radioInput: {
      width: '16px',
      height: '16px',
      accentColor: colors.evTeal,
      cursor: 'pointer',
    },
    locationLabel: {
      fontFamily: fonts.primary,
      fontWeight: fontWeights.bold,
      fontSize: fontSizes.base,
      color: colors.textPrimary,
      marginBottom: spacing[3],
    },
    buildingImage: {
      width: '100%',
      borderRadius: borderRadius.lg,
      objectFit: 'cover',
      aspectRatio: '4/5',
    },
    buildingPlaceholder: {
      width: '100%',
      aspectRatio: '4/5',
      backgroundColor: colors.bgLight,
      borderRadius: borderRadius.lg,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: colors.textMuted,
      fontFamily: fonts.primary,
      fontSize: fontSizes.sm,
    },
  };

  return (
    <aside style={styles.sidebar} className="ev-filter-sidebar">
      <h2 style={styles.title}>{title}</h2>

      {/* Location Input */}
      <div style={styles.section}>
        <label style={styles.sectionLabel}>Location</label>
        <div style={styles.zipInputWrapper}>
          <input
            type="text"
            value={zipCode}
            onChange={(e) => onZipChange?.(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="ZIP or address"
            style={styles.zipInput}
            aria-label="Search location"
          />
          <button
            type="button"
            onClick={onZipClear}
            style={styles.clearButton}
            aria-label="Clear ZIP code"
          >
            &times;
          </button>
        </div>
      </div>

      {/* Filter Radio Buttons */}
      <div style={styles.section}>
        <label style={styles.sectionLabel}>Group</label>
        <div style={styles.radioGroup} role="radiogroup" aria-label="Filter by group">
          {filterOptions.map((option) => (
            <label key={option.value} style={styles.radioLabel}>
              <input
                type="radio"
                name="filter"
                value={option.value}
                checked={selectedFilter === option.value}
                onChange={() => onFilterChange?.(option.value)}
                style={styles.radioInput}
              />
              {option.label}
            </label>
          ))}
        </div>
      </div>

      {/* Location Label */}
      {locationLabel && (
        <div style={styles.locationLabel}>{locationLabel}</div>
      )}

      {/* Building Image */}
      {buildingImageSrc ? (
        <img
          src={buildingImageSrc}
          alt={`${selectedFilter} government building`}
          style={styles.buildingImage}
        />
      ) : (
        <div style={styles.buildingPlaceholder}>
          No image
        </div>
      )}
    </aside>
  );
}
