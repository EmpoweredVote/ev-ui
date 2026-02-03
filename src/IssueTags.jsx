import React from 'react';
import { colors, fonts, fontWeights, fontSizes, spacing, borderRadius } from './tokens';

/**
 * IssueTags component for displaying topic/issue tags
 *
 * @param {Object} props
 * @param {Array} props.tags - Tag items [{label, value}]
 * @param {Array} props.selectedTags - Selected tag values (for selectable variant)
 * @param {Function} props.onTagClick - Handler for tag clicks
 * @param {'default' | 'selectable'} props.variant - Tag interaction variant
 * @param {Object} props.style - Additional styles
 */
export default function IssueTags({
  tags = [],
  selectedTags = [],
  onTagClick,
  variant = 'default',
  style = {},
}) {
  const isSelectable = variant === 'selectable';

  const styles = {
    container: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: spacing[2],
      ...style,
    },
    tag: (isSelected) => ({
      display: 'inline-flex',
      alignItems: 'center',
      padding: `${spacing[2]} ${spacing[4]}`,
      borderRadius: borderRadius.full,
      fontFamily: fonts.primary,
      fontWeight: fontWeights.medium,
      fontSize: fontSizes.sm,
      border: `1px solid ${isSelected ? colors.evTeal : colors.borderMedium}`,
      backgroundColor: isSelected ? colors.evTeal : colors.bgWhite,
      color: isSelected ? colors.textWhite : colors.textPrimary,
      cursor: onTagClick ? 'pointer' : 'default',
      transition: 'all 0.2s ease',
      userSelect: 'none',
    }),
  };

  const handleTagClick = (tag) => {
    if (onTagClick) {
      onTagClick(tag.value);
    }
  };

  const handleKeyDown = (e, tag) => {
    if (onTagClick && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onTagClick(tag.value);
    }
  };

  return (
    <div style={styles.container} className="ev-issue-tags" role="list">
      {tags.map((tag) => {
        const isSelected = selectedTags.includes(tag.value);
        return (
          <span
            key={tag.value}
            style={styles.tag(isSelected)}
            onClick={() => handleTagClick(tag)}
            onKeyDown={(e) => handleKeyDown(e, tag)}
            onMouseEnter={(e) => {
              if (onTagClick && !isSelected) {
                e.currentTarget.style.borderColor = colors.evTeal;
                e.currentTarget.style.color = colors.evTeal;
              }
            }}
            onMouseLeave={(e) => {
              if (onTagClick && !isSelected) {
                e.currentTarget.style.borderColor = colors.borderMedium;
                e.currentTarget.style.color = colors.textPrimary;
              }
            }}
            role="listitem"
            tabIndex={onTagClick ? 0 : undefined}
            aria-pressed={isSelectable ? isSelected : undefined}
          >
            {tag.label}
          </span>
        );
      })}
    </div>
  );
}
