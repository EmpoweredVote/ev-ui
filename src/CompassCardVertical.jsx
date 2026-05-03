import React, { useState, useEffect } from 'react';
import {
  colors, fonts, fontWeights, fontSizes,
  spacing, borderRadius, shadows, focus, duration,
  semanticTokens,
  colorScales,
} from './tokens';
import RadarChartCore from './RadarChartCore.jsx';
import PlaceholderRadar from './PlaceholderRadar.jsx';
import IconOverlay from './IconOverlay.jsx';
import { buildAnswerMapByShortTitle } from './compassHelpers.js';

/**
 * CompassCardVertical — meta-on-top, large-radar-below layout.
 * Same prop contract as CompassCardHorizontal.
 */

const RADAR_SIZE = 400;

export default function CompassCardVertical({
  politician,
  userAnswers = null,
  invertedSpokes = {},
  tierVisuals = null,
  view = 'compass',
  surface = 'representatives',
  variant = 'compass',
  onBuildCompass = null,
  onClick,
}) {
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [emptyCtaHovered, setEmptyCtaHovered] = useState(false);

  useEffect(() => { setImgError(false); }, [politician?.photo_origin_url]);

  const cardStyle = {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    backgroundColor: tierVisuals?.bg ?? colors.bgWhite,
    border: `1px solid ${colors.borderLight}`,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    boxShadow: focused ? focus.ring : hovered ? shadows.cardHover : shadows.md,
    transform: hovered ? 'translateY(-2px)' : 'none',
    transition: `box-shadow ${duration.normal} ease, transform ${duration.normal} ease`,
    cursor: onClick ? 'pointer' : 'default',
    fontFamily: fonts.primary,
    outline: 'none',
  };

  const titleText = surface === 'elections'
    ? politician.office_running_for
    : politician.office_title;

  function renderCompass() {
    if (!userAnswers || userAnswers.length === 0) {
      return <PlaceholderRadar size={RADAR_SIZE} name={politician?.full_name || ''} />;
    }
    let topics = [];
    let data = {};
    let compareData = {};
    try {
      if (Array.isArray(userAnswers) && userAnswers.length > 0) {
        const hasEmbeddedTopics = userAnswers[0]?.topic?.short_title;
        if (hasEmbeddedTopics) {
          const allowedShorts = userAnswers.map(a => a.topic.short_title);
          const allTopics = userAnswers.map(a => a.topic);
          const { topicsFiltered, answersByShort } = buildAnswerMapByShortTitle(
            allTopics, userAnswers, allowedShorts
          );
          topics = topicsFiltered;
          data = answersByShort;
        } else {
          if (!Array.isArray(userAnswers[0])) {
            topics = userAnswers
              .filter(a => a.short_title)
              .map(a => ({ id: a.topic_id || a.short_title, short_title: a.short_title, title: a.short_title }));
            data = {};
            for (const a of userAnswers) {
              if (a.short_title) data[a.short_title] = a.value ?? 0;
            }
          }
        }
      }
      if (politician?.stances && typeof politician.stances === 'object') {
        compareData = Array.isArray(politician.stances)
          ? politician.stances.reduce((acc, s) => {
              if (s.short_title) acc[s.short_title] = s.value ?? 0;
              return acc;
            }, {})
          : politician.stances;
      }
      if (topics.length === 0) {
        return <PlaceholderRadar size={RADAR_SIZE} name={politician?.full_name || ''} />;
      }
    } catch {
      return <PlaceholderRadar size={RADAR_SIZE} name={politician?.full_name || ''} />;
    }
    // Mark a spoke as "unanswered" when the politician has no value on it.
    // Dims the axis line and label so sparse-data politicians read more clearly.
    const unansweredSpokes = {};
    for (const t of topics) {
      const v = compareData[t.short_title];
      if (!v || Number(v) === 0) unansweredSpokes[t.short_title] = true;
    }
    return (
      <div style={{ width: RADAR_SIZE + 240, maxWidth: '100%', flexShrink: 0 }}>
        <RadarChartCore
          topics={topics}
          data={data}
          compareData={compareData}
          invertedSpokes={invertedSpokes || {}}
          unansweredSpokes={unansweredSpokes}
          onToggleInversion={() => {}}
          onReplaceTopic={() => {}}
          size={RADAR_SIZE}
          padding={40}
          labelOffset={5}
          labelFontSize={18}
          tightFit={true}
        />
      </div>
    );
  }

  function renderAvatar() {
    const imageSrc = politician?.photo_origin_url
      || (politician?.images && politician.images[0]?.url)
      || null;
    const baseStyle = {
      width: 88, height: 110,
      flexShrink: 0, overflow: 'hidden',
      borderRadius: borderRadius.md,
      backgroundColor: colors.evMutedBlue,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    };
    if (imageSrc && !imgError) {
      return (
        <div style={baseStyle}>
          <img
            src={imageSrc}
            alt={`${politician.full_name} portrait`}
            onError={() => setImgError(true)}
            style={{
              width: '100%', height: '100%',
              objectFit: 'cover',
              objectPosition: politician.imageFocalPoint ?? 'center 20%',
              display: 'block',
            }}
          />
        </div>
      );
    }
    const parts = (politician?.full_name || '').split(' ').filter(Boolean);
    const initials = (parts.length >= 2
      ? parts[0][0] + parts[parts.length - 1][0]
      : parts[0]?.[0] || '?').toUpperCase();
    return (
      <div style={baseStyle}>
        <span style={{
          color: colors.textWhite,
          fontFamily: fonts.primary,
          fontWeight: fontWeights.bold,
          fontSize: fontSizes['2xl'],
        }}>{initials}</span>
      </div>
    );
  }

  function renderPortrait() {
    const imageSrc = politician?.photo_origin_url
      || (politician?.images && politician.images[0]?.url)
      || null;
    if (imageSrc && !imgError) {
      return (
        <img
          src={imageSrc}
          alt={`${politician.full_name} portrait`}
          style={{
            width: RADAR_SIZE,
            height: RADAR_SIZE,
            objectFit: 'cover',
            objectPosition: politician.imageFocalPoint ?? 'center 20%',
            display: 'block',
            borderRadius: borderRadius.md,
          }}
          onError={() => setImgError(true)}
        />
      );
    }
    const parts = (politician?.full_name || '').split(' ').filter(Boolean);
    const initials = (parts.length >= 2
      ? parts[0][0] + parts[parts.length - 1][0]
      : parts[0]?.[0] || '?').toUpperCase();
    return (
      <div style={{
        width: RADAR_SIZE,
        height: RADAR_SIZE,
        backgroundColor: colors.evMutedBlue,
        color: colors.textWhite,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: fonts.primary,
        fontWeight: fontWeights.bold,
        fontSize: fontSizes['5xl'],
        borderRadius: borderRadius.md,
      }}>
        {initials}
      </div>
    );
  }

  function renderEmptyVariant() {
    return (
      <div style={{
        width: '100%', height: '100%', flex: 1,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: '12px', padding: '20px', boxSizing: 'border-box',
        backgroundColor: colorScales.teal['050'],
        borderRadius: borderRadius.md,
      }}>
        <PlaceholderRadar size={220} name={politician?.full_name || ''} />
        <p style={{
          margin: 0, fontSize: fontSizes.sm, color: colors.textMuted,
          textAlign: 'center', lineHeight: 1.4, fontFamily: fonts.primary,
        }}>
          Calibrate your compass to see how you align with {politician?.full_name || 'this official'}
        </p>
        <button
          type="button"
          onClick={onBuildCompass || undefined}
          onMouseEnter={() => setEmptyCtaHovered(true)}
          onMouseLeave={() => setEmptyCtaHovered(false)}
          style={{
            minWidth: '180px', height: '44px', padding: '0 20px',
            backgroundColor: emptyCtaHovered
              ? semanticTokens.light.buttonPrimary.background.hovered
              : semanticTokens.light.buttonPrimary.background.default,
            color: colors.textWhite,
            fontSize: fontSizes.sm, fontWeight: fontWeights.semibold,
            fontFamily: fonts.primary, borderRadius: borderRadius.full,
            border: 'none', cursor: onBuildCompass ? 'pointer' : 'default',
            transition: `background ${duration.normal} ease`,
          }}
        >
          Calibrate your compass
        </button>
      </div>
    );
  }

  function renderUnavailablePlate(message) {
    return (
      <div style={{
        width: '100%', height: '100%', flex: 1,
        backgroundColor: colorScales.teal['050'],
        borderRadius: borderRadius.md,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: spacing[6], boxSizing: 'border-box',
      }}>
        <p style={{
          fontSize: fontSizes.base, fontWeight: fontWeights.semibold,
          lineHeight: 1.4, color: colors.textMuted, textAlign: 'center',
          margin: 0, fontFamily: fonts.primary,
        }}>
          {message}
        </p>
      </div>
    );
  }

  function renderSlotContent() {
    if (view === 'portrait') return renderPortrait();
    if (variant === 'empty') return renderEmptyVariant();
    if (variant === 'administrative' || variant === 'judicial') {
      return renderUnavailablePlate('Compass currently unavailable for this role.');
    }
    if (variant === 'no-stances') {
      return renderUnavailablePlate(`No compass stances on file for ${politician?.full_name || 'this official'} yet.`);
    }
    return renderCompass();
  }

  return (
    <div
      role="article"
      aria-label={`${politician.full_name}, ${politician.office_title || ''}`}
      tabIndex={0}
      style={cardStyle}
      onClick={onClick}
      onKeyDown={(e) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick();
        }
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    >
      {/* Meta block on top: portrait left, text/icons right.
          flexShrink: 0 so the meta never gets squeezed by the compass slot —
          long names / wrapped titles always render in full. */}
      <div style={{ padding: spacing[4], paddingBottom: spacing[3], display: 'flex', alignItems: 'stretch', gap: spacing[3], flexShrink: 0 }}>
        {renderAvatar()}
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[1], minWidth: 0, flex: 1 }}>
          <p style={{
            fontFamily: fonts.primary, fontSize: fontSizes.xl,
            fontWeight: fontWeights.semibold, lineHeight: 1.3,
            color: colors.evMutedBlue, margin: 0,
          }}>
            {politician.full_name}
          </p>
          <p style={{
            fontFamily: fonts.primary, fontSize: fontSizes.sm,
            fontWeight: fontWeights.semibold, lineHeight: 1.4,
            color: colors.textSecondary, margin: 0,
          }}>
            {titleText || ''}
          </p>
          {politician.district_label && (
            <p style={{
              fontFamily: fonts.primary, fontSize: fontSizes.sm,
              fontWeight: fontWeights.regular, lineHeight: 1.5,
              color: colors.textMuted, margin: 0,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {politician.district_label}
            </p>
          )}
          <div style={{ marginTop: 'auto' }}>
            <IconOverlay
              ballot={politician.ballot || null}
              hasStances={false}
              branch={politician.branch || null}
            />
          </div>
        </div>
      </div>

      {/* Status banner — sits between meta and compass on elections surface.
          Withdrawn takes precedence over running_unopposed. */}
      {surface === 'elections' && politician.withdrawn && (
        <div style={{
          margin: `0 ${spacing[4]} ${spacing[3]}`,
          backgroundColor: 'rgba(120,0,0,0.85)',
          color: '#fff', fontSize: '12px', fontWeight: 700,
          letterSpacing: '0.4px', textAlign: 'center',
          textTransform: 'uppercase', padding: '6px 0',
          borderRadius: borderRadius.sm,
        }}>
          Withdrawn
        </div>
      )}
      {surface === 'elections' && !politician.withdrawn && politician.running_unopposed && (
        <div style={{
          margin: `0 ${spacing[4]} ${spacing[3]}`,
          backgroundColor: 'rgba(0,0,0,0.75)',
          color: '#fff', fontSize: '12px', fontWeight: 700,
          letterSpacing: '0.4px', textAlign: 'center',
          textTransform: 'uppercase', padding: '6px 0',
          borderRadius: borderRadius.sm,
        }}>
          {typeof politician.running_unopposed === 'string' ? politician.running_unopposed : 'Running Unopposed'}
        </div>
      )}

      {/* Compass slot */}
      <div style={{
        flex: 1,
        padding: spacing[4],
        paddingTop: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        minHeight: 0,
      }}>
        {renderSlotContent()}
      </div>
    </div>
  );
}
