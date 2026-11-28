import React, { useState } from 'react';
import { colors, fonts, fontWeights, fontSizes, spacing, borderRadius } from './tokens';

const DEFAULT_LIMIT = 25;
const WORKED_OUT_NOTE = "Worked out from the attendance list and tally in the clerk's record.";
const PENDING_COPY = 'How each member voted will appear when the clerk posts the record of this meeting.';

const POSITION_WORDS = {
  yea: 'Yes',
  nay: 'No',
  present: 'Abstain',
  absent: 'Absent',
  not_voting: 'Not present',
};

const OUTCOME_WORDS = { passed: 'Passed', failed: 'Failed', vetoed: 'Vetoed' };

// Year from the "YYYY-MM-DD" text itself (not new Date, to avoid timezone drift).
function extractYear(dateStr) {
  if (!dateStr || typeof dateStr !== 'string') return null;
  const year = dateStr.slice(0, 4);
  return /^\d{4}$/.test(year) ? year : null;
}

function formatDate(dateStr) {
  const year = extractYear(dateStr);
  if (!year) return dateStr || '';
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const m = parseInt(dateStr.slice(5, 7), 10) - 1;
  const d = parseInt(dateStr.slice(8, 10), 10);
  if (isNaN(m) || m < 0 || m > 11) return year;
  if (isNaN(d)) return `${months[m]} ${year}`;
  return `${months[m]} ${d}, ${year}`;
}

// Every date an item shows: its votes and its pending meeting.
function itemDates(item) {
  const dates = (item.votes || []).map((v) => v.meeting_date);
  if (item.pending) dates.push(item.pending.meeting_date);
  return dates;
}

function getYears(items) {
  const set = new Set();
  items.forEach((it) => itemDates(it).forEach((d) => { const y = extractYear(d); if (y) set.add(y); }));
  return Array.from(set).sort((a, b) => b.localeCompare(a));
}

function tallyText(o) {
  if (!o || o.yes == null || o.no == null) return '';
  const parts = [`${o.yes} yes`, `${o.no} no`];
  if (o.abstain) parts.push(`${o.abstain} abstain`);
  return parts.join(', ');
}

function positionStyle(position) {
  if (position === 'yea') return { bg: '#bbf7d0', text: colors.success };
  if (position === 'nay') return { bg: '#fecaca', text: colors.error };
  if (position === 'present') return { bg: colors.evYellowLight, text: colors.evYellowDark };
  return { bg: colors.borderLight, text: colors.textMuted };
}

const linkStyle = {
  fontFamily: fonts.primary,
  fontSize: fontSizes.xs,
  color: colors.evTeal,
  textDecoration: 'none',
};
const hoverOn = (e) => { e.currentTarget.style.textDecoration = 'underline'; };
const hoverOff = (e) => { e.currentTarget.style.textDecoration = 'none'; };

const srOnly = {
  position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px',
  overflow: 'hidden', clip: 'rect(0, 0, 0, 0)', whiteSpace: 'nowrap', border: 0,
};

function ExtLink({ href, label, children }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" aria-label={`${label} (opens in a new tab)`} style={linkStyle} onMouseEnter={hoverOn} onMouseLeave={hoverOff}>
      {children}
    </a>
  );
}

function VoteRow({ vote, number }) {
  const style = positionStyle(vote.position);
  const sourceLabel = vote.source_kind === 'memorandum' ? "Clerk's memo" : 'Minutes';
  const tally = tallyText(vote);
  return (
    <div
      data-vote-row
      title={vote.worked_out ? WORKED_OUT_NOTE : undefined}
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: spacing[2],
        padding: `${spacing[2]} 0`,
        borderTop: `1px solid ${colors.borderLight}`,
      }}
    >
      {vote.meeting_date && (
        <span style={{ fontFamily: fonts.primary, fontSize: fontSizes.xs, color: colors.textMuted }}>
          {formatDate(vote.meeting_date)}
        </span>
      )}
      <span style={{ flex: 1, minWidth: 0, fontFamily: fonts.primary, fontSize: fontSizes.sm, color: colors.textSecondary }}>
        {vote.question}
        {vote.seat_label && (
          <span style={{ marginLeft: spacing[2], fontSize: fontSizes.xs, color: colors.textMuted }}>
            as {vote.seat_label}
          </span>
        )}
        {vote.worked_out && <span style={srOnly}> {WORKED_OUT_NOTE}</span>}
      </span>
      <span
        data-testid="position"
        style={{
          background: style.bg,
          color: style.text,
          borderRadius: borderRadius.full,
          fontSize: fontSizes.xs,
          fontWeight: fontWeights.semibold,
          fontFamily: fonts.primary,
          padding: `${spacing[1]} ${spacing[3]}`,
          whiteSpace: 'nowrap',
        }}
      >
        {POSITION_WORDS[vote.position] || 'Unknown'}
      </span>
      <span style={{ fontFamily: fonts.primary, fontSize: fontSizes.xs, color: colors.textMuted }}>
        {[OUTCOME_WORDS[vote.outcome], tally].filter(Boolean).join(' · ')}
      </span>
      {vote.minutes_url && <ExtLink href={vote.minutes_url} label={`${sourceLabel} for ${number}`}>{sourceLabel}</ExtLink>}
    </div>
  );
}

function ItemBlock({ item, year }) {
  const votes = (item.votes || []).filter((v) => year === 'All' || extractYear(v.meeting_date) === year);
  const showPending = item.pending && (year === 'All' || extractYear(item.pending.meeting_date) === year);
  return (
    <div style={{ padding: `${spacing[3]} 0`, borderBottom: `1px solid ${colors.borderLight}` }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', gap: spacing[2], marginBottom: spacing[1] }}>
        <span style={{ fontFamily: fonts.primary, fontSize: fontSizes.xs, fontWeight: fontWeights.bold, color: colors.textSecondary }}>
          {item.number}
        </span>
        <span style={{ flex: 1, minWidth: 0, fontFamily: fonts.primary, fontSize: fontSizes.sm, color: colors.textSecondary }}>
          {item.title}
        </span>
        {item.status_label && (
          <span style={{ fontFamily: fonts.primary, fontSize: fontSizes.xs, color: colors.textMuted }}>{item.status_label}</span>
        )}
        {item.url && <ExtLink href={item.url} label={`Legislation page for ${item.number}`}>Legislation page</ExtLink>}
      </div>
      {showPending && (
        <div style={{ padding: `${spacing[2]} 0` }}>
          <div style={{ fontFamily: fonts.primary, fontSize: fontSizes.xs, color: colors.textMuted }}>
            {[formatDate(item.pending.meeting_date), OUTCOME_WORDS[item.pending.outcome], tallyText(item.pending)].filter(Boolean).join(' · ')}
          </div>
          <p style={{ fontFamily: fonts.primary, fontSize: fontSizes.sm, color: colors.textMuted, fontStyle: 'italic', margin: `${spacing[1]} 0 0` }}>
            {PENDING_COPY}
          </p>
        </div>
      )}
      {votes.map((v, i) => (
        <VoteRow key={v.roll_call_id || i} vote={v} number={item.number} />
      ))}
    </div>
  );
}

function Spinner() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: spacing[10] }}>
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

/**
 * CouncilVoteRecord - a city council member's votes, grouped by legislation.
 * Headless: no data fetching. `items` is the API response's items array
 * (latest meeting first; votes already ordered).
 */
export default function CouncilVoteRecord({ items = [], loading = false }) {
  const years = getYears(items);
  const [yearFilter, setYearFilter] = useState('All');
  const [showAll, setShowAll] = useState(false);

  if (loading) return <Spinner />;

  const filtered = yearFilter === 'All'
    ? items
    : items.filter((it) => itemDates(it).some((d) => extractYear(d) === yearFilter));
  const visible = showAll ? filtered : filtered.slice(0, DEFAULT_LIMIT);

  return (
    <div style={{ fontFamily: fonts.primary, marginBottom: spacing[8] }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing[4] }}>
        <h2 style={{ fontFamily: fonts.primary, fontSize: fontSizes.xl, fontWeight: fontWeights.bold, color: colors.evTeal, margin: 0 }}>
          Council votes
        </h2>
        {years.length > 0 && (
          <select
            aria-label="Filter by year"
            value={yearFilter}
            onChange={(e) => { setYearFilter(e.target.value); setShowAll(false); }}
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
            {years.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        )}
      </div>

      {items.length === 0 ? (
        <p style={{ fontFamily: fonts.primary, fontSize: fontSizes.sm, color: colors.textMuted, fontStyle: 'italic', margin: 0, padding: `${spacing[3]} 0` }}>
          No council votes on file.
        </p>
      ) : (
        <>
          {visible.map((item, i) => (
            <ItemBlock key={item.bill_id || i} item={item} year={yearFilter} />
          ))}
          {!showAll && filtered.length > DEFAULT_LIMIT && (
            <div style={{ textAlign: 'center', marginTop: spacing[3] }}>
              <button
                type="button"
                onClick={() => setShowAll(true)}
                style={{ background: 'none', border: 'none', color: colors.evTeal, fontSize: fontSizes.sm, fontFamily: fonts.primary, fontWeight: fontWeights.medium, cursor: 'pointer', padding: `${spacing[1]} ${spacing[2]}` }}
              >
                Show all {filtered.length} items
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
