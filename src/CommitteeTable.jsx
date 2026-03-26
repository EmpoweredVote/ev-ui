import React, { useState } from 'react';
import { fonts, fontWeights, spacing } from './tokens';

const ROLE_ORDER = {
  'chair': 0,
  'co-chair': 1,
  'vice chair': 2,
  'vice-chair': 2,
  'ranking member': 3,
  'member': 4,
};

function getRoleRank(position) {
  if (!position) return 99;
  const lower = formatPosition(position).toLowerCase();
  for (const [key, rank] of Object.entries(ROLE_ORDER)) {
    if (lower.includes(key)) return rank;
  }
  return 99;
}

/** Convert snake_case/kebab-case position to Title Case (e.g. "ranking_member" → "Ranking Member") */
function formatPosition(position) {
  if (!position) return '';
  return position
    .replace(/[_-]/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())
    .trim();
}

/**
 * CommitteeTable component for displaying committee memberships
 *
 * @param {Object} props
 * @param {Array} props.committees - Committee items [{name, position, url?}]
 * @param {string} props.title - Table title (default: "Committee Memberships")
 * @param {number} props.maxVisible - Max rows to show before "Show all" (default: 6)
 * @param {Object} props.style - Additional styles
 */
export default function CommitteeTable({
  committees = [],
  title = 'Committee Memberships',
  maxVisible = 6,
  style = {},
}) {
  const [showAll, setShowAll] = useState(false);

  if (committees.length === 0) {
    return null;
  }

  // Sort: chairs first, then vice chairs, then ranking members, then members
  const sorted = [...committees].sort((a, b) => getRoleRank(a.position) - getRoleRank(b.position));
  const visible = showAll ? sorted : sorted.slice(0, maxVisible);
  const hasMore = sorted.length > maxVisible;

  const styles = {
    container: {
      ...style,
    },
    heading: {
      display: 'flex',
      alignItems: 'center',
      gap: spacing[2],
      fontFamily: fonts.primary,
      fontWeight: fontWeights.semibold,
      fontSize: '18px',
      color: '#101828',
      margin: 0,
      marginBottom: spacing[3],
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
    },
    row: {
      borderBottom: '1px solid #F3F4F6',
    },
    cell: {
      padding: `${spacing[2]} 0`,
      fontFamily: fonts.primary,
      fontSize: '14px',
      verticalAlign: 'top',
    },
    nameCell: {
      color: '#364153',
      paddingRight: spacing[4],
    },
    positionCell: {
      color: '#6A7282',
      textAlign: 'right',
      whiteSpace: 'nowrap',
    },
    link: {
      color: '#364153',
      textDecoration: 'none',
    },
    toggle: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: spacing[1],
      fontFamily: fonts.primary,
      fontSize: '14px',
      fontWeight: fontWeights.medium,
      color: '#6A7282',
      background: 'none',
      border: 'none',
      padding: `${spacing[2]} 0`,
      cursor: 'pointer',
    },
  };

  return (
    <div style={styles.container} className="ev-committee-table">
      <h4 style={styles.heading}>
        {/* Users icon */}
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
        </svg>
        {title}
      </h4>
      <table style={styles.table}>
        <tbody>
          {visible.map((committee, index) => (
            <tr key={index} style={styles.row}>
              <td style={{ ...styles.cell, ...styles.nameCell }}>
                {committee.url ? (
                  <a
                    href={committee.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={styles.link}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.textDecoration = 'underline';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.textDecoration = 'none';
                    }}
                  >
                    {committee.name}
                  </a>
                ) : (
                  committee.name
                )}
              </td>
              <td style={{ ...styles.cell, ...styles.positionCell }}>
                {formatPosition(committee.position)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {hasMore && (
        <button
          type="button"
          style={styles.toggle}
          onClick={() => setShowAll(!showAll)}
        >
          {showAll ? 'Show less' : `Show all ${sorted.length} committees`}
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ transform: showAll ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
      )}
    </div>
  );
}
