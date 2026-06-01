import React, { useState, useRef, useCallback, useEffect } from 'react';
import Favicon from './Favicon';

/**
 * Truncate a URL for display (hostname + path, max 60 chars).
 */
function getDisplayUrl(url) {
  try {
    const u = new URL(url);
    let host = u.hostname.replace(/^www\./, '');
    const path = u.pathname === '/' ? '' : u.pathname;
    const display = host + path;
    return display.length > 60 ? display.slice(0, 57) + '...' : display;
  } catch {
    return url.length > 60 ? url.slice(0, 57) + '...' : url;
  }
}

// Comparison dot colors — from the EV dataViz palette (tokens.js).
// Antipartisan: neutral dusk/sage pairing, never party colors.
const USER_DOT = '#7C6B9E';            // Dusk — "You"
const POL_DOT_LIGHT = '#5A9A6E';       // Sage — politician (light)
const POL_DOT_DARK = '#6DD28C';        // brighter sage for dark surfaces

/**
 * Resolve the color palette for the current theme. Drives every color from the
 * `darkMode` prop (mirrors RadarChartCore) so the component is self-contained and
 * does not depend on consumer `!important` overrides.
 */
function palette(darkMode) {
  return darkMode
    ? {
        rowBorder: 'rgba(255,255,255,0.08)',
        rowHover: '#1e2a3a',          // ev-navy-elevated
        title: '#f3f4f6',
        chipLabel: '#d1d5db',
        sectionLabel: '#9ca3af',     // 6.24:1 on #1a2235 ✓ AA
        reasoning: '#d1d5db',
        chevron: '#9ca3af',          // 6.24:1 — bumped from #6b7280 (3.28) for clarity
        pillActiveBg: '#1e2a3a',
        pillActiveBorder: 'rgba(255,255,255,0.14)',
        pillIdleText: '#9ca3af',     // 6.24:1 ✓ AA
        pillActiveText: '#f3f4f6',
        link: '#59b0c4',             // 6.37:1 ✓ AA
        sourceText: '#9ca3af',
        quoteText: '#d1d5db',
        quoteBorder: 'rgba(255,255,255,0.14)',
        emptyText: '#9ca3af',        // 6.24:1 — bumped from #6b7280 (3.28, failed AA)
        spinnerTrack: '#374151',
        polDot: POL_DOT_DARK,
        agreedBg: 'rgba(14,116,144,0.18)',
        agreedText: '#67e8f9',
        disagreedBg: 'rgba(180,83,9,0.18)',
        disagreedText: '#fbbf24',
      }
    : {
        rowBorder: '#f1f1f1',
        rowHover: '#f9fafb',
        title: '#262626',
        chipLabel: '#525252',
        sectionLabel: '#6b7280',     // 4.83:1 on white — bumped from #a3a3a3 (2.52, failed AA)
        reasoning: '#404040',
        chevron: '#6b7280',          // 4.83:1 — bumped from #a3a3a3 (2.52, failed 3:1)
        pillActiveBg: '#fafafa',
        pillActiveBorder: '#e5e5e5',
        pillIdleText: '#737373',     // 4.74:1 ✓ AA
        pillActiveText: '#171717',
        link: '#00657c',
        sourceText: '#737373',
        quoteText: '#374151',
        quoteBorder: '#e2e8f0',
        emptyText: '#6b7280',        // 4.83:1 — bumped from #a3a3a3 (2.52, failed AA)
        spinnerTrack: '#e2e8f0',
        polDot: POL_DOT_LIGHT,
        agreedBg: '#ecfeff',
        agreedText: '#0e7490',
        disagreedBg: '#fffbeb',
        disagreedText: '#b45309',
      };
}

/**
 * StanceAccordion — vertical list of topic rows showing politician stance labels.
 * Expanding a row reveals the full stance spectrum (with You / politician dots),
 * lazy-fetched reasoning + source links, and the politician's quotes for the topic.
 * True accordion: only one row open at a time.
 *
 * Props:
 *   topics           — filtered intersection topics (from CompassCard's topicsFiltered)
 *   polAnswers       — array of { topic_id, value }
 *   userAnswerMap    — Record<topic_id, value> — the viewer's own answers (for the "You" dot)
 *   politicianId     — politician UUID
 *   allTopics        — full topic objects with stances arrays
 *   expandedTopics   — full set of topics for "show all" toggle
 *   darkMode         — boolean — drives the color palette
 *   verdictsByTopic        — DEPRECATED (kept for backward compat, no longer used in render)
 *   verdictsByQuote        — Record<quote_id, 'agreed' | 'disagreed'> | undefined — per-quote verdicts
 *   initialExpandedTopicId — topic ID to auto-open on mount (e.g. deep-linked from ReadRank)
 *   apiUrl                 — API base URL (default: 'https://api.empowered.vote')
 */
export default function StanceAccordion({
  topics,
  polAnswers,
  userAnswerMap = {},
  politicianId,
  allTopics,
  expandedTopics,
  darkMode = false,
  verdictsByTopic,  // DEPRECATED, no longer rendered
  verdictsByQuote,  // Record<quote_id, 'agreed' | 'disagreed'> | undefined
  initialExpandedTopicId,
  apiUrl = 'https://api.empowered.vote',
}) {
  const [expandedTopicId, setExpandedTopicId] = useState(null);
  const [loadingId, setLoadingId] = useState(null);
  const [showAll, setShowAll] = useState(false);
  const contextCache = useRef(new Map());
  const quotesCache = useRef(null); // null = unfetched, array = fetched (may be empty)

  const c = palette(darkMode);

  // Build lookup: topic_id -> polAnswer value
  const polAnswerMap = {};
  if (polAnswers) {
    polAnswers.forEach((a) => {
      polAnswerMap[String(a.topic_id)] = a.value;
    });
  }

  // Build lookup: topic id -> full topic (for stance label resolution)
  const topicById = {};
  if (allTopics) {
    allTopics.forEach((t) => {
      topicById[String(t.id)] = t;
    });
  }

  /**
   * Resolve stance label from answer value.
   * topic.stances[value - 1].text -> e.g., "Strongly Support"
   */
  function getStanceLabel(topicId, value) {
    const topic = topicById[String(topicId)];
    if (!topic || !topic.stances || !value) return 'No position';
    const idx = value - 1;
    if (idx < 0 || idx >= topic.stances.length) return 'No position';
    return topic.stances[idx].text || 'No position';
  }

  /**
   * Fetch context for a topic (reasoning + sources). Returns after caching.
   */
  async function fetchContext(topicId) {
    if (contextCache.current.has(topicId)) return;
    try {
      const res = await fetch(
        `${apiUrl}/api/compass/politicians/${politicianId}/${topicId}/context`,
        { credentials: 'include' }
      );
      if (res.status === 404) {
        contextCache.current.set(topicId, { reasoning: '', sources: [] });
      } else if (res.ok) {
        const data = await res.json();
        contextCache.current.set(topicId, {
          reasoning: data.reasoning || '',
          sources: data.sources || [],
        });
      } else {
        contextCache.current.set(topicId, { reasoning: '', sources: [] });
      }
    } catch {
      contextCache.current.set(topicId, { reasoning: '', sources: [] });
    }
  }

  /**
   * Fetch quotes for this politician once and store in quotesCache.
   * The backend filters by politician_id when provided; this client-side
   * cache holds only quotes for the current politician.
   * Subsequent calls return immediately (no-op).
   */
  async function ensureQuotesFetched() {
    if (quotesCache.current !== null) return;
    try {
      const res = await fetch(
        `${apiUrl}/api/essentials/quotes?politician_id=${politicianId}`,
        { credentials: 'include' }
      );
      if (res.ok) {
        const data = await res.json();
        quotesCache.current = data.quotes || [];
      } else {
        quotesCache.current = [];
      }
    } catch {
      quotesCache.current = [];
    }
  }

  /**
   * Toggle accordion row. Lazy-fetch context + quotes in parallel if not cached.
   */
  const handleToggle = useCallback(
    async (topicId) => {
      if (expandedTopicId === topicId) {
        setExpandedTopicId(null);
        return;
      }

      setExpandedTopicId(topicId);

      // Check if context already cached (quotes fetched separately)
      if (contextCache.current.has(topicId) && quotesCache.current !== null) return;

      // Fetch context and quotes in parallel
      setLoadingId(topicId);
      try {
        await Promise.all([fetchContext(topicId), ensureQuotesFetched()]);
      } finally {
        setLoadingId(null);
      }
    },
    [expandedTopicId, politicianId, apiUrl]
  );

  // Auto-open the deep-linked topic once both topics and initialExpandedTopicId are available.
  // Depends on both so it fires whether topics or the ID arrives last.
  useEffect(() => {
    if (initialExpandedTopicId && topics && topics.length > 0) {
      handleToggle(String(initialExpandedTopicId));
    }
    // handleToggle is stable per render cycle; omitting avoids infinite loop
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialExpandedTopicId, topics?.length]);

  if (!topics || topics.length === 0) return null;

  const hasToggle = expandedTopics && expandedTopics.length > topics.length;
  const baseTopics = hasToggle && showAll ? expandedTopics : topics;

  // Pin the deep-linked topic to the top so it's always visible without "show all"
  let visibleTopics = baseTopics;
  if (initialExpandedTopicId) {
    const fullList = expandedTopics || topics;
    const pinned = fullList.find((t) => String(t.id) === String(initialExpandedTopicId));
    if (pinned && String(baseTopics[0]?.id) !== String(initialExpandedTopicId)) {
      visibleTopics = [pinned, ...baseTopics.filter((t) => String(t.id) !== String(initialExpandedTopicId))];
    }
  }

  const sectionLabelStyle = {
    fontSize: '11px',
    fontWeight: 600,
    color: c.sectionLabel,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
  };

  return (
    <div
      className="ev-stance-panel flex flex-col"
      style={{ fontFamily: "'Manrope', sans-serif" }}
    >
      <h3 style={{ ...sectionLabelStyle, marginBottom: '8px' }}>
        Stance Breakdown
      </h3>

      {visibleTopics.map((topic) => {
        const topicId = String(topic.id);
        const polValue = polAnswerMap[topicId];
        const userValue = userAnswerMap[topicId];
        const label = getStanceLabel(topicId, polValue);
        const isExpanded = expandedTopicId === topicId;
        const isLoading = loadingId === topicId;
        const cached = contextCache.current.get(topicId);
        const fullTopic = topicById[topicId];
        const questionText = fullTopic?.question_text;
        const titleText = questionText || topic.short_title;
        const stances = fullTopic?.stances || topic.stances || [];

        // Filter quotes for this politician and topic.
        // candidateId guard is a defensive check — the backend already filters by
        // politician_id, but this ensures correctness if the cache is ever shared.
        const topicQuotes = quotesCache.current
          ? quotesCache.current.filter((q) => {
              if (!q.issue) return false;
              if (q.candidateId && q.candidateId !== politicianId) return false;
              if (topic.topic_key) return q.issue === topic.topic_key;
              return topic.short_title && q.issue.toLowerCase() === topic.short_title.toLowerCase();
            })
          : [];

        return (
          <div
            key={topicId}
            style={{ borderBottom: `1px solid ${c.rowBorder}` }}
          >
            {/* Collapsed row — question-led title + politician stance chip */}
            <button
              type="button"
              onClick={() => handleToggle(topicId)}
              className="w-full flex items-start justify-between text-left cursor-pointer"
              style={{
                padding: '12px 8px',
                background: 'transparent',
                border: 'none',
                transition: 'background 0.15s ease',
                borderRadius: '8px',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = c.rowHover; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
            >
              <div className="flex flex-col min-w-0" style={{ gap: '5px' }}>
                <span
                  style={{
                    fontSize: '14px',
                    fontWeight: 600,
                    color: c.title,
                    lineHeight: 1.4,
                  }}
                >
                  {titleText}
                </span>
                {/* Stance chip: sage dot + politician's current position.
                    Wraps to full lines so the whole stance reads before expanding. */}
                <span style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                  <span
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: c.polDot,
                      flexShrink: 0,
                      marginTop: '6px',
                    }}
                  />
                  <span
                    style={{
                      fontSize: '13px',
                      color: c.chipLabel,
                      lineHeight: 1.45,
                    }}
                  >
                    {label}
                  </span>
                </span>
              </div>

              {/* Chevron */}
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke={c.chevron}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="flex-shrink-0 ml-2"
                style={{
                  marginTop: '3px',
                  transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s ease',
                }}
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>

            {/* Expanded content */}
            <div
              style={{
                display: 'grid',
                gridTemplateRows: isExpanded ? '1fr' : '0fr',
                transition: 'grid-template-rows 0.25s ease',
              }}
            >
              <div style={{ overflow: 'hidden' }}>
                <div style={{ padding: '4px 8px 16px' }}>
                  {/* Stance spectrum — full scale with You / politician dots.
                      Read-only on the profile (editing belongs to the compass tool). */}
                  {stances.length > 0 && (
                    <>
                      {/* Legend */}
                      {(userValue > 0 || polValue > 0) && (
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '14px',
                            marginBottom: '8px',
                            fontSize: '12px',
                            color: c.sourceText,
                          }}
                        >
                          {userValue > 0 && (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                              <span style={{ width: '9px', height: '9px', borderRadius: '50%', backgroundColor: USER_DOT }} />
                              You
                            </span>
                          )}
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ width: '9px', height: '9px', borderRadius: '50%', backgroundColor: c.polDot }} />
                            Their stance
                          </span>
                        </div>
                      )}

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '14px' }}>
                        {stances.map((stance, i) => {
                          const stanceNum = i + 1;
                          const isUser = userValue === stanceNum;
                          const isPol = polValue === stanceNum;
                          const isActive = isUser || isPol;
                          return (
                            <div
                              key={i}
                              style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: '10px',
                                padding: '10px 12px',
                                borderRadius: '12px',
                                fontSize: '13px',
                                lineHeight: 1.4,
                                border: `1px solid ${isActive ? c.pillActiveBorder : 'transparent'}`,
                                backgroundColor: isActive ? c.pillActiveBg : 'transparent',
                              }}
                            >
                              {/* Left dot rail — fixed width so every stance's text
                                  aligns and the You / their-stance markers scan vertically. */}
                              <span
                                style={{
                                  flexShrink: 0,
                                  width: '30px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '5px',
                                  paddingTop: '3px',
                                }}
                              >
                                {isUser && (
                                  <span style={{ width: '9px', height: '9px', borderRadius: '50%', backgroundColor: USER_DOT, boxShadow: `0 0 0 3px ${USER_DOT}33` }} />
                                )}
                                {isPol && (
                                  <span style={{ width: '9px', height: '9px', borderRadius: '50%', backgroundColor: c.polDot, boxShadow: `0 0 0 3px ${c.polDot}33` }} />
                                )}
                              </span>
                              <span
                                style={{
                                  flex: 1,
                                  color: isActive ? c.pillActiveText : c.pillIdleText,
                                  fontWeight: isActive ? 500 : 400,
                                }}
                              >
                                {stance.text}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}

                  {isLoading && (
                    <div className="flex items-center" style={{ padding: '12px 0' }}>
                      <div
                        style={{
                          width: '20px',
                          height: '20px',
                          border: `2px solid ${c.spinnerTrack}`,
                          borderTopColor: '#00657c',
                          borderRadius: '50%',
                          animation: 'ev-spin 0.8s linear infinite',
                        }}
                      />
                    </div>
                  )}

                  {!isLoading && cached && (
                    <>
                      {cached.reasoning ? (
                        <p
                          style={{
                            fontSize: '14px',
                            color: c.reasoning,
                            marginBottom: '12px',
                            whiteSpace: 'pre-wrap',
                            lineHeight: 1.6,
                          }}
                        >
                          {cached.reasoning}
                        </p>
                      ) : null}

                      {cached.sources && cached.sources.length > 0 && (
                        <div style={{ marginTop: '8px' }}>
                          <p style={{ ...sectionLabelStyle, marginBottom: '6px' }}>
                            References
                          </p>
                          <ol style={{ listStyle: 'decimal', listStylePosition: 'inside', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            {cached.sources.map((src, i) => (
                              <li key={i} style={{ fontSize: '12px', color: c.sourceText }}>
                                <a
                                  href={src}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1.5"
                                  style={{ color: c.link }}
                                >
                                  <Favicon url={src} />
                                  <span style={{ textDecoration: 'underline', textUnderlineOffset: '2px' }}>
                                    {getDisplayUrl(src)}
                                  </span>
                                </a>
                              </li>
                            ))}
                          </ol>
                        </div>
                      )}

                      {topicQuotes.length > 0 && (
                        <div style={{ marginTop: '14px' }}>
                          <p style={{ ...sectionLabelStyle, marginBottom: '8px' }}>
                            Quotes
                          </p>
                          {topicQuotes.map((quote) => {
                            const verdict = verdictsByQuote ? verdictsByQuote[quote.id] : undefined;
                            const borderColor =
                              verdict === 'agreed'
                                ? c.agreedText
                                : verdict === 'disagreed'
                                ? c.disagreedText
                                : c.quoteBorder;
                            const sourceName = quote.source_name || quote.sourceName;
                            return (
                              <div
                                key={quote.id}
                                style={{
                                  borderLeft: `3px solid ${borderColor}`,
                                  paddingLeft: '10px',
                                  paddingTop: '6px',
                                  paddingBottom: '6px',
                                  marginBottom: '8px',
                                }}
                              >
                                <p
                                  style={{
                                    fontSize: '13px',
                                    fontStyle: 'italic',
                                    color: c.quoteText,
                                    margin: 0,
                                    lineHeight: 1.5,
                                  }}
                                >
                                  {quote.text}
                                </p>
                                {verdict === 'agreed' && (
                                  <span
                                    style={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '4px',
                                      backgroundColor: c.agreedBg,
                                      color: c.agreedText,
                                      padding: '2px 8px',
                                      borderRadius: '9999px',
                                      fontSize: '11px',
                                      fontWeight: 500,
                                      marginTop: '4px',
                                      flexShrink: 0,
                                    }}
                                  >
                                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                                      <path d="M5 13l4 4L19 7" />
                                    </svg>
                                    Agreed
                                  </span>
                                )}
                                {verdict === 'disagreed' && (
                                  <span
                                    style={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '4px',
                                      backgroundColor: c.disagreedBg,
                                      color: c.disagreedText,
                                      padding: '2px 8px',
                                      borderRadius: '9999px',
                                      fontSize: '11px',
                                      fontWeight: 500,
                                      marginTop: '4px',
                                      flexShrink: 0,
                                    }}
                                  >
                                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                                      <path d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                    Disagreed
                                  </span>
                                )}
                                {sourceName && (
                                  <a
                                    href={quote.source_url || quote.sourceUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    style={{
                                      display: 'block',
                                      fontSize: '11px',
                                      color: c.link,
                                      marginTop: '3px',
                                      textDecoration: 'none',
                                    }}
                                  >
                                    {sourceName}
                                  </a>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {!cached.reasoning &&
                        (!cached.sources || cached.sources.length === 0) &&
                        topicQuotes.length === 0 && (
                          <p style={{ fontSize: '14px', color: c.emptyText, fontStyle: 'italic', padding: '8px 0' }}>
                            No detailed reasoning available for this topic.
                          </p>
                        )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {hasToggle && (
        <button
          type="button"
          onClick={() => setShowAll((v) => !v)}
          className="text-sm font-medium mt-2 px-2 py-1 self-start cursor-pointer hover:underline"
          style={{ color: c.link }}
        >
          {showAll ? 'Show fewer' : `Show all ${expandedTopics.length} topics`}
        </button>
      )}
    </div>
  );
}
