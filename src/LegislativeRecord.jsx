import React, { useState } from 'react';
import { colors, fonts, fontWeights, fontSizes, spacing, borderRadius } from './tokens';
import useMediaQuery from './useMediaQuery';

const DEFAULT_LIMIT = 25;

/**
 * Normalize a position or role string: replace underscores with spaces, title-case each word.
 */
function normalizeText(str) {
  if (!str) return '';
  return str
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Extract 4-digit year from a date string safely using slice (not new Date() to avoid timezone bugs).
 * Returns null if dateStr is falsy or doesn't start with 4 digits.
 */
function extractYear(dateStr) {
  if (!dateStr || typeof dateStr !== 'string') return null;
  const year = dateStr.slice(0, 4);
  return /^\d{4}$/.test(year) ? year : null;
}

/**
 * Get unique sorted years (descending) from an array of items using a date key.
 */
function getYears(items, dateKey) {
  const yearSet = new Set();
  items.forEach((item) => {
    const y = extractYear(item[dateKey]);
    if (y) yearSet.add(y);
  });
  return Array.from(yearSet).sort((a, b) => b.localeCompare(a));
}

/**
 * Format a date string "YYYY-MM-DD" to "Mar 15, 2024" for display.
 * Uses slice to extract parts safely.
 */
function formatDate(dateStr) {
  if (!dateStr) return '';
  const year = extractYear(dateStr);
  if (!year) return dateStr;
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthIdx = parseInt(dateStr.slice(5, 7), 10) - 1;
  const day = parseInt(dateStr.slice(8, 10), 10);
  if (isNaN(monthIdx) || monthIdx < 0 || monthIdx > 11) return year;
  if (isNaN(day)) return `${monthNames[monthIdx]} ${year}`;
  return `${monthNames[monthIdx]} ${day}, ${year}`;
}

// ─── Role badge config ────────────────────────────────────────────────────────

const ROLE_BADGE_CONFIG = {
  chair: { label: 'Chair', bg: colors.evCoral, text: colors.textWhite },
  vice_chair: { label: 'Vice Chair', bg: colors.evTealLight, text: colors.textWhite },
  ranking_member: { label: 'Ranking Member', bg: colors.evTeal, text: colors.textWhite },
  ex_officio: { label: 'Ex Officio', bg: colors.textMuted, text: colors.textWhite },
  member: { label: 'Member', bg: colors.borderMedium, text: colors.textSecondary },
};

function getRoleBadge(role) {
  const key = (role || 'member').toLowerCase().replace(/\s+/g, '_');
  return ROLE_BADGE_CONFIG[key] || ROLE_BADGE_CONFIG.member;
}

// ─── Status badge config ──────────────────────────────────────────────────────

function getStatusBadge(statusLabel) {
  const s = (statusLabel || '').toLowerCase();
  if (s === 'became law') {
    return { bg: '#dcfce7', text: colors.success };
  }
  if (s === 'vetoed') {
    return { bg: '#fee2e2', text: colors.error };
  }
  if (s === 'passed house' || s === 'passed senate') {
    return { bg: colors.bgLight, text: colors.evTeal };
  }
  if (s === 'failed') {
    return { bg: colors.borderLight, text: colors.textMuted };
  }
  if (s === 'introduced') {
    return { bg: colors.borderLight, text: colors.textMuted };
  }
  // Default fallback
  return { bg: colors.borderLight, text: colors.textSecondary };
}

// ─── Position badge config ────────────────────────────────────────────────────

function getPositionBadge(position) {
  const norm = normalizeText(position);
  if (norm === 'Yea') {
    return { bg: '#bbf7d0', text: colors.success };
  }
  if (norm === 'Nay') {
    return { bg: '#fecaca', text: colors.error };
  }
  if (norm === 'Not Voting') {
    return { bg: colors.borderLight, text: colors.textMuted };
  }
  if (norm === 'Abstain') {
    return { bg: colors.evYellowLight, text: colors.evYellowDark };
  }
  if (norm === 'Absent') {
    return { bg: colors.borderLight, text: colors.textMuted };
  }
  return { bg: colors.borderLight, text: colors.textSecondary };
}

// ─── Shared sub-components ────────────────────────────────────────────────────

function Badge({ label, bg, text }) {
  return (
    <span style={{
      display: 'inline-block',
      background: bg,
      color: text,
      borderRadius: borderRadius.full,
      fontSize: fontSizes.xs,
      fontWeight: fontWeights.semibold,
      fontFamily: fonts.primary,
      padding: `${spacing[1]} ${spacing[3]}`,
      whiteSpace: 'nowrap',
    }}>
      {label}
    </span>
  );
}

function SectionHeader({ title, yearFilter, years, onYearChange }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: spacing[4],
    }}>
      <h2 style={{
        fontFamily: fonts.primary,
        fontSize: fontSizes.xl,
        fontWeight: fontWeights.bold,
        color: colors.evTeal,
        margin: 0,
      }}>
        {title}
      </h2>
      {years && years.length > 0 && (
        <select
          value={yearFilter}
          onChange={(e) => onYearChange(e.target.value)}
          style={{
            fontFamily: fonts.primary,
            fontSize: fontSizes.sm,
            color: colors.textSecondary,
            border: `1px solid ${colors.borderLight}`,
            borderRadius: borderRadius.md,
            padding: `${spacing[1]} ${spacing[2]}`,
            background: colors.bgWhite,
            cursor: 'pointer',
          }}
        >
          <option value="All">All years</option>
          {years.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      )}
    </div>
  );
}

function ShowAllLink({ totalCount, visibleCount, onClick }) {
  if (totalCount <= visibleCount) return null;
  return (
    <div style={{ textAlign: 'center', marginTop: spacing[3] }}>
      <button
        type="button"
        onClick={onClick}
        style={{
          background: 'none',
          border: 'none',
          color: colors.evTeal,
          fontSize: fontSizes.sm,
          fontFamily: fonts.primary,
          fontWeight: fontWeights.medium,
          cursor: 'pointer',
          padding: `${spacing[1]} ${spacing[2]}`,
        }}
        onMouseEnter={(e) => { e.currentTarget.style.textDecoration = 'underline'; }}
        onMouseLeave={(e) => { e.currentTarget.style.textDecoration = 'none'; }}
      >
        Show all {totalCount} items
      </button>
    </div>
  );
}

function EmptyState({ message }) {
  return (
    <p style={{
      fontFamily: fonts.primary,
      fontSize: fontSizes.sm,
      color: colors.textMuted,
      fontStyle: 'italic',
      margin: 0,
      padding: `${spacing[3]} 0`,
    }}>
      {message}
    </p>
  );
}

function Spinner() {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: spacing[10],
    }}>
      <div style={{
        width: '40px',
        height: '40px',
        borderRadius: borderRadius.full,
        border: `3px solid ${colors.borderLight}`,
        borderTopColor: colors.evTeal,
        animation: 'ev-spin 0.8s linear infinite',
      }} />
      <style>{`@keyframes ev-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ─── Section 1: Committees & Leadership ──────────────────────────────────────

function CommitteesSection({ committees, leadership }) {
  const [showAll, setShowAll] = useState(false);

  const visible = showAll ? committees : committees.slice(0, DEFAULT_LIMIT);

  return (
    <div style={{ marginBottom: spacing[8] }}>
      <SectionHeader title="Committees & Leadership" />

      {/* Leadership badges */}
      {leadership && leadership.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: spacing[2], marginBottom: spacing[4] }}>
          {leadership.map((role, i) => (
            <div key={i} style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: spacing[1],
              background: colors.evCoral,
              color: colors.textWhite,
              borderRadius: borderRadius.md,
              padding: `${spacing[1]} ${spacing[3]}`,
              fontFamily: fonts.primary,
              fontSize: fontSizes.sm,
              fontWeight: fontWeights.semibold,
            }}>
              {role.title}
              {role.chamber && (
                <span style={{ fontWeight: fontWeights.regular, opacity: 0.85 }}>
                  ({role.chamber})
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {committees.length === 0 ? (
        <EmptyState message="Committee information is not available for this office." />
      ) : (
        <>
          <div>
            {visible.map((c, i) => {
              const badge = getRoleBadge(c.role);
              return (
                <div key={i} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: `${spacing[3]} 0`,
                  borderBottom: `1px solid ${colors.borderLight}`,
                  gap: spacing[3],
                }}>
                  <span style={{
                    fontFamily: fonts.primary,
                    fontSize: fontSizes.sm,
                    color: colors.textSecondary,
                    flex: 1,
                    minWidth: 0,
                  }}>
                    {c.committee_name}
                    {c.parent_name && (
                      <span style={{ color: colors.textMuted, marginLeft: spacing[1] }}>
                        ({c.parent_name})
                      </span>
                    )}
                  </span>
                  <Badge label={badge.label} bg={badge.bg} text={badge.text} />
                </div>
              );
            })}
          </div>
          {!showAll && (
            <ShowAllLink
              totalCount={committees.length}
              visibleCount={DEFAULT_LIMIT}
              onClick={() => setShowAll(true)}
            />
          )}
        </>
      )}
    </div>
  );
}

// ─── Section 2: Sponsored Legislation ────────────────────────────────────────

function LegislationSection({ bills, isMobile }) {
  const years = getYears(bills, 'introduced_at');
  const [yearFilter, setYearFilter] = useState('All');
  const [showAll, setShowAll] = useState(false);

  // Reset showAll when year filter changes
  const handleYearChange = (y) => {
    setYearFilter(y);
    setShowAll(false);
  };

  const filtered = yearFilter === 'All'
    ? bills
    : bills.filter((b) => extractYear(b.introduced_at) === yearFilter);

  const visible = showAll ? filtered : filtered.slice(0, DEFAULT_LIMIT);

  return (
    <div style={{ marginBottom: spacing[8] }}>
      <SectionHeader
        title="Sponsored Legislation"
        yearFilter={yearFilter}
        years={years}
        onYearChange={handleYearChange}
      />

      {bills.length === 0 ? (
        <EmptyState message="Sponsored legislation data is not available for this office." />
      ) : (
        <>
          <div>
            {visible.map((bill, i) => {
              const statusBadge = getStatusBadge(bill.status_label);
              return (
                <div key={i} style={{
                  display: 'flex',
                  flexDirection: isMobile ? 'column' : 'row',
                  alignItems: isMobile ? 'flex-start' : 'center',
                  gap: isMobile ? spacing[1] : spacing[3],
                  padding: `${spacing[3]} 0`,
                  borderBottom: `1px solid ${colors.borderLight}`,
                }}>
                  {/* Bill number + title */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span style={{
                      fontFamily: fonts.primary,
                      fontSize: fontSizes.xs,
                      fontWeight: fontWeights.bold,
                      color: colors.textSecondary,
                      marginRight: spacing[2],
                    }}>
                      {bill.number}
                    </span>
                    <span style={{
                      fontFamily: fonts.primary,
                      fontSize: fontSizes.sm,
                      color: colors.textSecondary,
                    }}>
                      {bill.title}
                    </span>
                  </div>

                  {/* Right side: status + date + sponsor indicator */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: spacing[2],
                    flexShrink: 0,
                    flexWrap: 'wrap',
                  }}>
                    <Badge label={bill.status_label || 'Unknown'} bg={statusBadge.bg} text={statusBadge.text} />
                    {bill.introduced_at && (
                      <span style={{
                        fontFamily: fonts.primary,
                        fontSize: fontSizes.xs,
                        color: colors.textMuted,
                      }}>
                        {formatDate(bill.introduced_at)}
                      </span>
                    )}
                    <span style={{
                      fontFamily: fonts.primary,
                      fontSize: fontSizes.xs,
                      color: colors.textMuted,
                      fontStyle: 'italic',
                    }}>
                      {bill.is_sponsor ? 'Sponsored' : 'Cosponsored'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
          {!showAll && (
            <ShowAllLink
              totalCount={filtered.length}
              visibleCount={DEFAULT_LIMIT}
              onClick={() => setShowAll(true)}
            />
          )}
        </>
      )}
    </div>
  );
}

// ─── Section 3: Voting Record ─────────────────────────────────────────────────

function VotingSection({ votes, isMobile }) {
  const years = getYears(votes, 'vote_date');
  const [yearFilter, setYearFilter] = useState('All');
  const [showAll, setShowAll] = useState(false);

  const handleYearChange = (y) => {
    setYearFilter(y);
    setShowAll(false);
  };

  const filtered = yearFilter === 'All'
    ? votes
    : votes.filter((v) => extractYear(v.vote_date) === yearFilter);

  const visible = showAll ? filtered : filtered.slice(0, DEFAULT_LIMIT);

  return (
    <div style={{ marginBottom: spacing[8] }}>
      <SectionHeader
        title="Voting Record"
        yearFilter={yearFilter}
        years={years}
        onYearChange={handleYearChange}
      />

      {votes.length === 0 ? (
        <EmptyState message="Voting records are not available for this office." />
      ) : (
        <>
          <div>
            {visible.map((vote, i) => {
              const positionBadge = getPositionBadge(vote.position);
              const normPosition = normalizeText(vote.position);
              const topic = vote.bill_title || vote.vote_question;
              const sourceUrl = vote.bill_url;
              return (
                <div key={i} style={{
                  display: 'flex',
                  flexDirection: isMobile ? 'column' : 'row',
                  alignItems: isMobile ? 'flex-start' : 'center',
                  gap: isMobile ? spacing[1] : spacing[3],
                  padding: `${spacing[3]} 0`,
                  borderBottom: `1px solid ${colors.borderLight}`,
                }}>
                  {/* Topic */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span style={{
                      fontFamily: fonts.primary,
                      fontSize: fontSizes.sm,
                      color: colors.textSecondary,
                    }}>
                      {topic}
                    </span>
                  </div>

                  {/* Right side: date + position + outcome + source */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: spacing[2],
                    flexShrink: 0,
                    flexWrap: 'wrap',
                  }}>
                    {vote.vote_date && (
                      <span style={{
                        fontFamily: fonts.primary,
                        fontSize: fontSizes.xs,
                        color: colors.textMuted,
                      }}>
                        {formatDate(vote.vote_date)}
                      </span>
                    )}
                    <Badge label={normPosition || 'Unknown'} bg={positionBadge.bg} text={positionBadge.text} />
                    {vote.result && (
                      <span style={{
                        fontFamily: fonts.primary,
                        fontSize: fontSizes.xs,
                        color: vote.result === 'Passed' ? colors.success : colors.textMuted,
                        fontWeight: fontWeights.medium,
                      }}>
                        {vote.result}
                      </span>
                    )}
                    {sourceUrl && (
                      <a
                        href={sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          fontFamily: fonts.primary,
                          fontSize: fontSizes.xs,
                          color: colors.evTeal,
                          textDecoration: 'none',
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.textDecoration = 'underline'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.textDecoration = 'none'; }}
                      >
                        Source
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          {!showAll && (
            <ShowAllLink
              totalCount={filtered.length}
              visibleCount={DEFAULT_LIMIT}
              onClick={() => setShowAll(true)}
            />
          )}
        </>
      )}
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

/**
 * LegislativeRecord - Full legislative record content component.
 * Headless: no Header, no routing, no data fetching.
 * The page wrapper in essentials handles those concerns.
 *
 * @param {Object} props
 * @param {Array} props.committees - Committee memberships
 * @param {Array} props.leadership - Leadership roles
 * @param {Array} props.bills - Sponsored/cosponsored legislation
 * @param {Array} props.votes - Roll-call vote records
 * @param {boolean} props.loading - Loading state
 * @param {string} props.politicianName - Display name for heading
 */
export default function LegislativeRecord({
  committees = [],
  leadership = [],
  bills = [],
  votes = [],
  loading = false,
  politicianName = '',
}) {
  const isMobile = useMediaQuery('(max-width: 768px)');

  if (loading) {
    return <Spinner />;
  }

  return (
    <div style={{ fontFamily: fonts.primary }}>
      {politicianName && (
        <h1 style={{
          fontFamily: fonts.primary,
          fontSize: isMobile ? fontSizes['2xl'] : fontSizes['4xl'],
          fontWeight: fontWeights.bold,
          color: colors.evTeal,
          marginBottom: spacing[8],
          marginTop: 0,
        }}>
          Legislative Record: {politicianName}
        </h1>
      )}

      <CommitteesSection committees={committees} leadership={leadership} />
      <LegislationSection bills={bills} isMobile={isMobile} />
      <VotingSection votes={votes} isMobile={isMobile} />
    </div>
  );
}
