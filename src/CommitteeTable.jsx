import React from 'react';
import { colors, fonts, fontWeights, fontSizes, spacing } from './tokens';

/**
 * CommitteeTable component for displaying committee memberships
 *
 * @param {Object} props
 * @param {Array} props.committees - Committee items [{name, position, url?}]
 * @param {string} props.title - Table title (default: "Committee Memberships")
 * @param {Object} props.style - Additional styles
 */
export default function CommitteeTable({
  committees = [],
  title = 'Committee Memberships',
  style = {},
}) {
  if (committees.length === 0) {
    return null;
  }

  const styles = {
    container: {
      ...style,
    },
    title: {
      fontFamily: fonts.primary,
      fontWeight: fontWeights.bold,
      fontSize: fontSizes.base,
      color: colors.evTeal,
      marginBottom: spacing[3],
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
    },
    row: {
      borderBottom: `1px solid ${colors.borderLight}`,
    },
    cell: {
      padding: `${spacing[2]} 0`,
      fontFamily: fonts.primary,
      fontSize: fontSizes.sm,
      verticalAlign: 'top',
    },
    nameCell: {
      color: colors.evTeal,
      paddingRight: spacing[4],
    },
    positionCell: {
      color: colors.textSecondary,
    },
    link: {
      color: colors.evTeal,
      textDecoration: 'none',
    },
  };

  return (
    <div style={styles.container} className="ev-committee-table">
      <h4 style={styles.title}>{title}</h4>
      <table style={styles.table}>
        <tbody>
          {committees.map((committee, index) => (
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
                {committee.position}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
