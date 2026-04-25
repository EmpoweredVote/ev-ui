import React, { useState, useEffect } from 'react';
import {
  colors, fonts, fontWeights, fontSizes,
  spacing, borderRadius, shadows, focus, duration,
  semanticTokens,
  colorScales,
} from './tokens';
import RadarChartCore from './RadarChartCore.jsx';
import PlaceholderRadar from './PlaceholderRadar.jsx';
import CompassCardHorizontalMeta from './CompassCardHorizontalMeta.jsx';
import { buildAnswerMapByShortTitle } from './compassHelpers.js';

/**
 * CompassCardHorizontal — Variant C horizontal card with radar-left / meta-right layout.
 * Ported from essentials/src/components/CompassFirstCard.jsx (variant C branch).
 *
 * Fully controlled — consumer owns view and surface state (D-03).
 * Router-agnostic and context-agnostic. No router or context imports.
 *
 * Props:
 *   politician     {object}        — required politician data
 *   userAnswers    {Array|null}    — user compass answers; null/[] → PlaceholderRadar
 *   tierVisuals    {object|null}   — { bg, accent, text } for tier-specific card background
 *   view           {string}        — 'compass' | 'portrait' (default: 'compass')
 *   surface        {string}        — 'representatives' | 'elections' (default: 'representatives')
 *   variant        {string}        — 'compass' | 'empty' | 'administrative' | 'judicial' (default: 'compass')
 *   onBuildCompass {Function|null} — called when empty-variant CTA clicked; parent owns deep-link URL
 *   onClick        {Function}      — optional click handler (replaces internal navigate)
 */

const RADAR_SIZE = 250;
const SLOT_WIDTH = 260; // RADAR_SIZE + 10 label-bleed wrapper (Pitfall 1)

export default function CompassCardHorizontal({
  politician,
  userAnswers = null,
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
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: tierVisuals?.bg ?? colors.bgWhite,
    border: `1px solid ${colors.borderLight}`,
    borderRadius: borderRadius.xl,
    overflow: 'hidden', // clips slot corners via card border-radius — no padding needed
    boxShadow: focused ? focus.ring : hovered ? shadows.cardHover : shadows.md,
    transform: hovered ? 'translateY(-2px)' : 'none',
    transition: `box-shadow ${duration.normal} ease, transform ${duration.normal} ease`,
    cursor: onClick ? 'pointer' : 'default',
    fontFamily: fonts.primary,
    outline: 'none',
  };

  // fixed square slot — portrait and compass render at same 260×260 dimensions
  const slotStyle = { width: SLOT_WIDTH, height: SLOT_WIDTH, flexShrink: 0, overflow: 'hidden', position: 'relative' };

  function renderCompass() {
    if (!userAnswers || userAnswers.length === 0) {
      return <PlaceholderRadar size={RADAR_SIZE} name={politician?.full_name || ''} />;
    }

    // Shape userAnswers into topics/data arrays for RadarChartCore.
    // Use short_title keys from the answers directly since userAnswers may already
    // be a map or an array with topic_id references.
    // We build a simple topics list from the answers array and extract values.
    let topics = [];
    let data = {};
    let compareData = {};

    try {
      if (Array.isArray(userAnswers) && userAnswers.length > 0) {
        // userAnswers is an array of { topic_id, value, topic?: { short_title, title, id } }
        // If topics are embedded in userAnswers, use them; otherwise build minimal topic stubs
        const hasEmbeddedTopics = userAnswers[0]?.topic?.short_title;
        if (hasEmbeddedTopics) {
          const allowedShorts = userAnswers.map(a => a.topic.short_title);
          const allTopics = userAnswers.map(a => a.topic);
          const { topicsFiltered, answersByShort } = buildAnswerMapByShortTitle(
            allTopics,
            userAnswers,
            allowedShorts
          );
          topics = topicsFiltered;
          data = answersByShort;
        } else {
          // Minimal: treat userAnswers as pre-shaped { short_title: value } map or
          // array with short_title directly
          if (!Array.isArray(userAnswers[0])) {
            // Try treating as array of { short_title, value }
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

      // Build compareData from politician stances if available
      if (politician?.stances && typeof politician.stances === 'object') {
        compareData = Array.isArray(politician.stances)
          ? politician.stances.reduce((acc, s) => {
              if (s.short_title) acc[s.short_title] = s.value ?? 0;
              return acc;
            }, {})
          : politician.stances;
      }

      // Fallback: if we couldn't shape topics, render placeholder
      if (topics.length === 0) {
        return <PlaceholderRadar size={RADAR_SIZE} name={politician?.full_name || ''} />;
      }
    } catch (err) {
      // T-127-06: malformed userAnswers guard — render placeholder instead of throwing
      return <PlaceholderRadar size={RADAR_SIZE} name={politician?.full_name || ''} />;
    }

    return (
      <RadarChartCore
        topics={topics}
        data={data}
        compareData={compareData}
        invertedSpokes={{}}
        onToggleInversion={() => {}}
        onReplaceTopic={() => {}}
        size={RADAR_SIZE}
        padding={20}
        labelOffset={5}
        labelFontSize={12}
      />
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
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: politician.imageFocalPoint ?? 'center 20%',
            display: 'block',
          }}
          onError={() => setImgError(true)}
        />
      );
    }

    // Initials fallback — evMutedBlue bg, white text, fills slot
    const parts = (politician?.full_name || '').split(' ').filter(Boolean);
    const initials = (parts.length >= 2
      ? parts[0][0] + parts[parts.length - 1][0]
      : parts[0]?.[0] || '?').toUpperCase();

    return (
      <div style={{
        width: '100%',
        height: '100%',
        backgroundColor: colors.evMutedBlue,
        color: colors.textWhite,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: fonts.primary,
        fontWeight: fontWeights.bold,
        fontSize: fontSizes['4xl'],
      }}>
        {initials}
      </div>
    );
  }

  function renderEmptyVariant() {
    return (
      <div style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        padding: '12px 14px',
        boxSizing: 'border-box',
        backgroundColor: colorScales.teal['050'],
      }}>
        <PlaceholderRadar size={140} name={politician?.full_name || ''} />
        <p style={{
          margin: 0,
          fontSize: fontSizes.xs,
          color: colors.textMuted,
          textAlign: 'center',
          lineHeight: 1.4,
          fontFamily: fonts.primary,
        }}>
          Calibrate your compass to see how you align with {politician?.full_name || 'this official'}
        </p>
        <button
          type="button"
          onClick={onBuildCompass || undefined}
          onMouseEnter={() => setEmptyCtaHovered(true)}
          onMouseLeave={() => setEmptyCtaHovered(false)}
          style={{
            minWidth: '160px',
            height: '40px',
            padding: '0 16px',
            backgroundColor: emptyCtaHovered
              ? semanticTokens.light.buttonPrimary.background.hovered
              : semanticTokens.light.buttonPrimary.background.default,
            color: colors.textWhite,
            fontSize: fontSizes.xs,
            fontWeight: fontWeights.semibold,
            fontFamily: fonts.primary,
            borderRadius: borderRadius.full,
            border: 'none',
            cursor: onBuildCompass ? 'pointer' : 'default',
            whiteSpace: 'nowrap',
            transition: `background ${duration.normal} ease`,
            flexShrink: 0,
          }}
        >
          Calibrate your compass
        </button>
      </div>
    );
  }

  function renderUnavailablePlate() {
    return (
      <div style={{
        width: '100%',
        height: '100%',
        backgroundColor: colorScales.teal['050'],
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: spacing[4],
        boxSizing: 'border-box',
      }}>
        <p style={{
          fontSize: fontSizes.sm,
          fontWeight: fontWeights.semibold,
          lineHeight: 1.4,
          color: colors.textMuted,
          textAlign: 'center',
          maxWidth: '180px',
          margin: 0,
          fontFamily: fonts.primary,
        }}>
          Compass currently unavailable for this role.
        </p>
      </div>
    );
  }

  function renderSlotContent() {
    if (view === 'portrait') return renderPortrait();
    if (variant === 'empty') return renderEmptyVariant();
    if (variant === 'administrative' || variant === 'judicial') return renderUnavailablePlate();
    return (
      <div style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: spacing[3],
        boxSizing: 'border-box',
      }}>
        {renderCompass()}
      </div>
    );
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
      <div style={slotStyle}>
        {renderSlotContent()}
        {surface === 'elections' && politician.running_unopposed && (
          <div style={{
            position: 'absolute',
            bottom: '15px',
            left: 0,
            width: '100%',
            backgroundColor: 'rgba(0,0,0,0.35)',
            color: '#fff',
            fontSize: '12px',
            fontWeight: 700,
            letterSpacing: '0.4px',
            textAlign: 'center',
            textTransform: 'uppercase',
            padding: '6px 0',
            pointerEvents: 'none',
          }}>
            Running Unopposed
          </div>
        )}
      </div>
      <div style={{ flex: 1, minWidth: 0, padding: spacing[4], paddingLeft: spacing[3] }}>
        <CompassCardHorizontalMeta
          politician={politician}
          surface={surface}
          userAnswers={userAnswers}
        />
      </div>
    </div>
  );
}
