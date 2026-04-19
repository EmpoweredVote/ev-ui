import React from 'react';
import { colors, fonts, fontWeights, fontSizes, spacing, borderRadius } from './tokens';
import IconOverlay from './IconOverlay.jsx';

/**
 * CompassCardHorizontalMeta — meta column renderer for CompassCardHorizontal.
 * Renders politician name, title (surface-switched), district label, affordance icons,
 * and the "Running unopposed" banner on elections surface.
 *
 * Internal to ev-ui — NOT exported from barrel.
 *
 * Props:
 *   politician {object}  — politician data object
 *   surface    {string}  — 'representatives' | 'elections' (default: 'representatives')
 *   userAnswers {Array|null} — user answers for affordance icon logic
 */
export default function CompassCardHorizontalMeta({
  politician,
  surface = 'representatives',
  userAnswers,
}) {
  const titleText = surface === 'elections'
    ? politician.office_running_for
    : politician.office_title;

  return (
    <div style={{
      flex: 1,
      minWidth: 0,
      display: 'flex',
      flexDirection: 'column',
      gap: spacing[1],
    }}>
      {/* Name — 18px semibold, evMutedBlue */}
      <p style={{
        fontFamily: fonts.primary,
        fontSize: fontSizes.lg,
        fontWeight: fontWeights.semibold,
        lineHeight: 1.4,
        color: colors.evMutedBlue,
        margin: 0,
      }}>
        {politician.full_name}
      </p>

      {/* Title — 14px semibold, textSecondary, 2-line clamp */}
      <p style={{
        fontFamily: fonts.primary,
        fontSize: fontSizes.sm,
        fontWeight: fontWeights.semibold,
        lineHeight: 1.4,
        color: colors.textSecondary,
        margin: 0,
        overflow: 'hidden',
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
      }}>
        {titleText || ''}
      </p>

      {/* Subtitle — 14px regular, textMuted, ellipsis single line */}
      {politician.district_label && (
        <p style={{
          fontFamily: fonts.primary,
          fontSize: fontSizes.sm,
          fontWeight: fontWeights.regular,
          lineHeight: 1.5,
          color: colors.textMuted,
          margin: 0,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>
          {politician.district_label}
        </p>
      )}

      {/* Affordance icon strip */}
      <IconOverlay
        ballot={politician.ballot || null}
        hasStances={Boolean(userAnswers && userAnswers.length > 0) || Boolean(politician.hasStances)}
        branch={politician.branch || null}
      />

      {/* Running unopposed banner — elections surface only */}
      {surface === 'elections' && politician.running_unopposed && (
        <div style={{
          backgroundColor: colors.infoLight,
          borderLeft: `3px solid ${colors.evMutedBlue}`,
          borderRadius: borderRadius.md,
          padding: `${spacing[1]} ${spacing[2]}`,
          fontFamily: fonts.primary,
          fontSize: fontSizes.xs,
          fontWeight: fontWeights.regular,
          color: colors.evMutedBlue,
          marginTop: spacing[1],
        }}>
          Running unopposed
        </div>
      )}
    </div>
  );
}
