import React, { useState, useEffect } from 'react';
import {
  colors, fonts, fontWeights, fontSizes,
  spacing, borderRadius, shadows, focus, duration,
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
 *   politician   {object}       — required politician data
 *   userAnswers  {Array|null}   — user compass answers; null/[] → PlaceholderRadar
 *   tierVisuals  {object|null}  — { bg, accent, text } for tier-specific card background
 *   view         {string}       — 'compass' | 'portrait' (default: 'compass')
 *   surface      {string}       — 'representatives' | 'elections' (default: 'representatives')
 *   onClick      {Function}     — optional click handler (replaces internal navigate)
 */

const RADAR_SIZE = 250;
const SLOT_WIDTH = 260; // RADAR_SIZE + 10 label-bleed wrapper (Pitfall 1)

export default function CompassCardHorizontal({
  politician,
  userAnswers = null,
  tierVisuals = null,
  view = 'compass',
  surface = 'representatives',
  onClick,
}) {
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [imgError, setImgError] = useState(false);

  useEffect(() => { setImgError(false); }, [politician?.photo_origin_url]);

  const cardStyle = {
    position: 'relative',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[4],
    backgroundColor: tierVisuals?.bg ?? colors.bgWhite,
    border: `1px solid ${colors.borderLight}`,
    borderRadius: borderRadius.xl,
    padding: spacing[4],
    boxShadow: focused ? focus.ring : hovered ? shadows.cardHover : shadows.md,
    transform: hovered ? 'translateY(-2px)' : 'none',
    transition: `box-shadow ${duration.normal} ease, transform ${duration.normal} ease`,
    cursor: onClick ? 'pointer' : 'default',
    fontFamily: fonts.primary,
    outline: 'none',
    minHeight: '44px',
  };

  const slotStyle = { width: SLOT_WIDTH, flexShrink: 0, overflow: 'hidden' };

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
    let compareData = null;

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
            height: SLOT_WIDTH, // square 260px — grid uniformity (Pitfall 2, D-10)
            objectFit: 'cover',
            objectPosition: politician.imageFocalPoint ?? 'center 20%',
            display: 'block',
          }}
          onError={() => setImgError(true)}
        />
      );
    }

    // Initials fallback — evMutedBlue bg, white text
    const parts = (politician?.full_name || '').split(' ').filter(Boolean);
    const initials = (parts.length >= 2
      ? parts[0][0] + parts[parts.length - 1][0]
      : parts[0]?.[0] || '?').toUpperCase();

    return (
      <div style={{
        width: '100%',
        height: SLOT_WIDTH,
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
        {view === 'portrait' ? renderPortrait() : renderCompass()}
      </div>
      <CompassCardHorizontalMeta
        politician={politician}
        surface={surface}
        userAnswers={userAnswers}
      />
    </div>
  );
}
