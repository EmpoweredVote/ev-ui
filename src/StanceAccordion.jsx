import { useState, useRef, useCallback } from 'react';
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

/**
 * StanceAccordion — vertical list of topic rows showing politician stance labels.
 * Expanding a row lazy-fetches reasoning + source links from the context endpoint.
 * True accordion: only one row open at a time.
 *
 * Props:
 *   topics           — filtered intersection topics (from CompassCard's topicsFiltered)
 *   polAnswers       — array of { topic_id, value }
 *   politicianId     — politician UUID
 *   allTopics        — full topic objects with stances arrays
 *   expandedTopics   — full set of topics for "show all" toggle
 *   verdictsByTopic  — Record<string, 'agreed' | 'disagreed'> | undefined
 *   apiUrl           — API base URL (default: 'https://api.empowered.vote')
 */
export default function StanceAccordion({
  topics,
  polAnswers,
  politicianId,
  allTopics,
  expandedTopics,
  verdictsByTopic,  // Record<string, 'agreed' | 'disagreed'> | undefined
  apiUrl = 'https://api.empowered.vote',
}) {
  const [expandedTopicId, setExpandedTopicId] = useState(null);
  const [loadingId, setLoadingId] = useState(null);
  const [showAll, setShowAll] = useState(false);
  const contextCache = useRef(new Map());

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
   * Toggle accordion row. Lazy-fetch context if not cached.
   */
  const handleToggle = useCallback(
    async (topicId) => {
      if (expandedTopicId === topicId) {
        setExpandedTopicId(null);
        return;
      }

      setExpandedTopicId(topicId);

      // Check cache
      if (contextCache.current.has(topicId)) return;

      // Fetch context
      setLoadingId(topicId);
      try {
        const res = await fetch(
          `${apiUrl}/compass/politicians/${politicianId}/${topicId}/context`,
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
      } finally {
        setLoadingId(null);
      }
    },
    [expandedTopicId, politicianId, apiUrl]
  );

  if (!topics || topics.length === 0) return null;

  const hasToggle = expandedTopics && expandedTopics.length > topics.length;
  const visibleTopics = hasToggle && showAll ? expandedTopics : topics;

  return (
    <div
      className="flex flex-col"
      style={{ fontFamily: "'Manrope', sans-serif" }}
    >
      <h3
        className="text-sm font-semibold text-neutral-400 uppercase tracking-wider mb-2"
        style={{ fontSize: '12px' }}
      >
        Stance Breakdown
      </h3>

      {visibleTopics.map((topic) => {
        const topicId = String(topic.id);
        const value = polAnswerMap[topicId];
        const label = getStanceLabel(topicId, value);
        const isExpanded = expandedTopicId === topicId;
        const isLoading = loadingId === topicId;
        const cached = contextCache.current.get(topicId);
        const fullTopic = topicById[topicId];
        const questionText = fullTopic?.question_text;
        const verdict = verdictsByTopic ? verdictsByTopic[topicId] : undefined;

        return (
          <div key={topicId} className="border-b border-neutral-100">
            {/* Collapsed row */}
            <button
              type="button"
              onClick={() => handleToggle(topicId)}
              className="w-full flex items-center justify-between py-3 px-2 text-left cursor-pointer hover:bg-neutral-50 transition-colors"
            >
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-medium text-neutral-800 truncate">
                  {topic.short_title}
                </span>
                {questionText && (
                  <span className="text-xs text-neutral-400 mt-0.5">
                    {questionText}
                  </span>
                )}
                <span className="text-xs text-neutral-500 mt-0.5">
                  {label}
                </span>
                {verdict === 'agreed' && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px',
                    backgroundColor: '#ecfeff', color: '#0e7490', padding: '2px 8px',
                    borderRadius: '9999px', fontSize: '11px', fontWeight: 500,
                    marginTop: '3px', flexShrink: 0, alignSelf: 'flex-start' }}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 13l4 4L19 7" />
                    </svg>
                    Agreed
                  </span>
                )}
                {verdict === 'disagreed' && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px',
                    backgroundColor: '#fffbeb', color: '#b45309', padding: '2px 8px',
                    borderRadius: '9999px', fontSize: '11px', fontWeight: 500,
                    marginTop: '3px', flexShrink: 0, alignSelf: 'flex-start' }}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Disagreed
                  </span>
                )}
              </div>

              {/* Chevron */}
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-neutral-400 flex-shrink-0 ml-2"
                style={{
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
                <div className="px-2 pb-4">
                  {isLoading && (
                    <div className="flex items-center py-3">
                      <div
                        style={{
                          width: '20px',
                          height: '20px',
                          border: '2px solid #e2e8f0',
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
                          className="text-sm text-neutral-700 mb-3"
                          style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}
                        >
                          {cached.reasoning}
                        </p>
                      ) : null}

                      {cached.sources && cached.sources.length > 0 && (
                        <div className="mt-2">
                          <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1.5">
                            References
                          </p>
                          <ol className="list-decimal list-inside space-y-1">
                            {cached.sources.map((src, i) => (
                              <li key={i} className="text-xs text-neutral-600">
                                <a
                                  href={src}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1.5 hover:text-[#00657c] transition-colors"
                                >
                                  <Favicon url={src} />
                                  <span className="underline underline-offset-2">
                                    {getDisplayUrl(src)}
                                  </span>
                                </a>
                              </li>
                            ))}
                          </ol>
                        </div>
                      )}

                      {!cached.reasoning &&
                        (!cached.sources || cached.sources.length === 0) && (
                          <p className="text-sm text-neutral-400 italic py-2">
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
          style={{ color: '#00657c' }}
        >
          {showAll ? 'Show fewer' : `Show all ${expandedTopics.length} topics`}
        </button>
      )}
    </div>
  );
}
