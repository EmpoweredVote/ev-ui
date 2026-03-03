import React from 'react';
import { colors, fonts, fontWeights, fontSizes, spacing, borderRadius, shadows } from './tokens';
import useMediaQuery from './useMediaQuery';

/**
 * Normalize a position string: replace underscores with spaces, title-case each word.
 * "not_voting" -> "Not Voting"
 */
function normalizePosition(pos) {
  if (!pos) return '';
  return pos
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Derive attendance percentage from votes array.
 * Present = position is NOT "Not Voting" and NOT "Absent" (after normalizing).
 * Returns null if totalVotes === 0.
 */
function deriveAttendance(votes) {
  if (!votes || votes.length === 0) return null;
  const present = votes.filter((v) => {
    const norm = normalizePosition(v.position);
    return norm !== 'Not Voting' && norm !== 'Absent';
  }).length;
  return Math.round((present / votes.length) * 100);
}

/**
 * Build a one-line most-recent-action string.
 * Picks the most recent item from bills or votes by date.
 */
function getMostRecentAction(bills, votes) {
  const items = [];

  (bills || []).forEach((b) => {
    if (b.introduced_at) {
      items.push({
        date: b.introduced_at,
        text: `${b.number}: ${b.title} \u2014 ${b.status_label}`,
      });
    }
  });

  (votes || []).forEach((v) => {
    if (v.vote_date) {
      const topic = v.bill_title || v.vote_question;
      const normPos = normalizePosition(v.position);
      items.push({
        date: v.vote_date,
        text: `Voted ${normPos} on ${topic} \u2014 ${v.result}`,
      });
    }
  });

  if (items.length === 0) return null;
  items.sort((a, b) => (a.date < b.date ? 1 : -1));
  return items[0].text;
}

/**
 * LegislativeInlineSummary - Inline legislative activity card embedded in the profile.
 *
 * @param {Object} props
 * @param {Object} props.summary - { recent_bills: [], recent_votes: [] }
 * @param {string} props.politicianId - Opaque ID string for building the /record link
 */
export default function LegislativeInlineSummary({ summary, politicianId }) {
  const isMobile = useMediaQuery('(max-width: 768px)');

  // Guard: render nothing when no legislative data exists (local politicians, etc.)
  if (!summary) return null;
  const bills = summary.recent_bills || [];
  const votes = summary.recent_votes || [];
  if (bills.length === 0 && votes.length === 0) return null;

  // Derive stats — only show stats with real values
  const attendancePct = deriveAttendance(votes);
  const billsAdvanced = bills.length > 0 ? bills.length : null;

  const mostRecentAction = getMostRecentAction(bills, votes);

  const stats = [];
  if (attendancePct !== null) {
    stats.push({ value: `${attendancePct}%`, label: 'attendance' });
  }
  if (billsAdvanced !== null) {
    stats.push({ value: String(billsAdvanced), label: billsAdvanced === 1 ? 'bill advanced' : 'bills advanced' });
  }

  const recordHref = '/politician/' + politicianId + '/record';

  const card = {
    background: colors.bgWhite,
    borderRadius: borderRadius.lg,
    boxShadow: `0 1px 3px 0 rgba(0,0,0,0.08), 0 0 0 1px ${colors.borderLight}`,
    padding: spacing[4],
    marginBottom: spacing[8],
    fontFamily: fonts.primary,
  };

  const statsRow = {
    display: 'flex',
    flexDirection: isMobile ? 'column' : 'row',
    gap: isMobile ? spacing[2] : spacing[6],
    marginBottom: mostRecentAction ? spacing[3] : spacing[2],
    alignItems: isMobile ? 'flex-start' : 'center',
  };

  const statItem = {
    display: 'inline-flex',
    alignItems: 'baseline',
    gap: spacing[1],
  };

  const statValue = {
    fontFamily: fonts.primary,
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.semibold,
    color: colors.evTeal,
  };

  const statLabel = {
    fontFamily: fonts.primary,
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.regular,
    color: colors.textSecondary,
  };

  const actionLine = {
    fontFamily: fonts.primary,
    fontSize: fontSizes.xs,
    color: colors.textSecondary,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    marginBottom: spacing[3],
  };

  const footerRow = {
    display: 'flex',
    justifyContent: 'flex-end',
  };

  const recordLink = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: spacing[1],
    color: colors.evTeal,
    textDecoration: 'none',
    fontFamily: fonts.primary,
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.medium,
  };

  return (
    <div style={card}>
      {/* Stats row */}
      {stats.length > 0 && (
        <div style={statsRow}>
          {stats.map((s, i) => (
            <div key={i} style={statItem}>
              <span style={statValue}>{s.value}</span>
              <span style={statLabel}>{s.label}</span>
            </div>
          ))}
        </div>
      )}

      {/* Most recent action */}
      {mostRecentAction && (
        <div style={actionLine} title={mostRecentAction}>
          {mostRecentAction}
        </div>
      )}

      {/* Topic tags — populated when mapping table ships */}
      <div>{/* Topic tags placeholder — deferred */}</div>

      {/* View Full Legislative Record link */}
      <div style={footerRow}>
        <a
          href={recordHref}
          style={recordLink}
          onMouseEnter={(e) => { e.currentTarget.style.textDecoration = 'underline'; }}
          onMouseLeave={(e) => { e.currentTarget.style.textDecoration = 'none'; }}
        >
          View Full Legislative Record
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </a>
      </div>
    </div>
  );
}
