import React from 'react';
import { METRIC_LABELS, formatMetricValue } from './judicialUtils.js';

const containerStyle = {
  fontFamily: "'Manrope', sans-serif",
  maxWidth: '800px',
};

const backBtnStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '4px',
  color: '#718096',
  fontSize: '14px',
  fontWeight: 600,
  cursor: 'pointer',
  background: 'none',
  border: 'none',
  padding: '8px 0',
  marginBottom: '16px',
};

const nameStyle = {
  fontSize: '24px',
  fontWeight: 700,
  color: '#2d3748',
  marginBottom: '4px',
};

const roleStyle = {
  fontSize: '15px',
  color: '#718096',
  marginBottom: '24px',
};

const sectionHeadingStyle = {
  fontSize: '18px',
  fontWeight: 700,
  color: '#2d3748',
  marginTop: '32px',
  marginBottom: '12px',
  paddingBottom: '8px',
  borderBottom: '2px solid #e2e8f0',
};

const tableStyle = {
  width: '100%',
  borderCollapse: 'collapse',
  fontSize: '14px',
};

const thStyle = {
  textAlign: 'left',
  padding: '8px 12px',
  fontWeight: 600,
  color: '#718096',
  borderBottom: '1px solid #e2e8f0',
  fontSize: '12px',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
};

const tdStyle = {
  padding: '10px 12px',
  borderBottom: '1px solid #f7fafc',
  color: '#2d3748',
};

const detailRowStyle = {
  display: 'flex',
  gap: '8px',
  padding: '8px 0',
  borderBottom: '1px solid #f7fafc',
};

const detailLabelStyle = {
  fontWeight: 600,
  color: '#718096',
  minWidth: '160px',
  fontSize: '14px',
};

const detailValueStyle = {
  color: '#2d3748',
  fontSize: '14px',
};

const emptyStateStyle = {
  padding: '24px',
  backgroundColor: '#f7fafc',
  borderRadius: '8px',
  color: '#a0aec0',
  fontSize: '14px',
  textAlign: 'center',
};

/**
 * JudicialRecordDetail — full-page judicial record view.
 *
 * Props:
 *   politician: { full_name, first_name, last_name, office_title, ... }
 *   judicialRecord: { judge_detail, evaluations[], metrics[], disciplinary_records[] }
 *   onBack: () => void
 */
export function JudicialRecordDetail({ politician = {}, judicialRecord, onBack }) {
  if (!judicialRecord) {
    return (
      <div style={containerStyle}>
        <button style={backBtnStyle} onClick={onBack}>&larr; Back to Profile</button>
        <div style={emptyStateStyle}>No judicial record data available.</div>
      </div>
    );
  }

  const {
    judge_detail: detail,
    evaluations = [],
    metrics = [],
    disciplinary_records: disciplinary = [],
  } = judicialRecord;

  const displayName = politician.full_name || `${politician.first_name || ''} ${politician.last_name || ''}`.trim();

  return (
    <div style={containerStyle}>
      <button style={backBtnStyle} onClick={onBack}>&larr; Back to Profile</button>

      <h1 style={nameStyle}>{displayName}</h1>
      <p style={roleStyle}>
        {detail?.court_role || politician.office_title}
        {detail?.date_seated && ` · Seated ${detail.date_seated}`}
      </p>

      {/* Judge Background */}
      {detail && (
        <>
          <h2 style={sectionHeadingStyle}>Background</h2>
          {detail.appointed_by && (
            <div style={detailRowStyle}>
              <span style={detailLabelStyle}>Appointed by</span>
              <span style={detailValueStyle}>{detail.appointed_by} ({detail.appointing_president_party})</span>
            </div>
          )}
          {detail.confirmation_vote && (
            <div style={detailRowStyle}>
              <span style={detailLabelStyle}>Confirmation Vote</span>
              <span style={detailValueStyle}>{detail.confirmation_vote}</span>
            </div>
          )}
          {detail.election_type && (
            <div style={detailRowStyle}>
              <span style={detailLabelStyle}>Election Type</span>
              <span style={detailValueStyle}>{detail.election_type === 'retention' ? 'Retention (Yes/No)' : 'Contested Election'}</span>
            </div>
          )}
          {detail.areas_of_focus?.length > 0 && (
            <div style={detailRowStyle}>
              <span style={detailLabelStyle}>Areas of Focus</span>
              <span style={detailValueStyle}>{detail.areas_of_focus.join(', ')}</span>
            </div>
          )}
        </>
      )}

      {/* Evaluations */}
      <h2 style={sectionHeadingStyle}>Performance Evaluations</h2>
      {evaluations.length === 0 ? (
        <div style={emptyStateStyle}>No evaluation data available yet.</div>
      ) : (
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>Source</th>
              <th style={thStyle}>Rating</th>
              <th style={thStyle}>Date</th>
            </tr>
          </thead>
          <tbody>
            {evaluations.map((ev, i) => (
              <tr key={i}>
                <td style={tdStyle}>
                  {ev.source_url ? (
                    <a href={ev.source_url} target="_blank" rel="noopener noreferrer" style={{ color: '#319795' }}>
                      {ev.source}
                    </a>
                  ) : ev.source}
                </td>
                <td style={{ ...tdStyle, fontWeight: 600 }}>{ev.rating}</td>
                <td style={tdStyle}>{ev.rating_date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Metrics */}
      <h2 style={sectionHeadingStyle}>Performance Metrics</h2>
      {metrics.length === 0 ? (
        <div style={emptyStateStyle}>No performance metric data available yet.</div>
      ) : (
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>Metric</th>
              <th style={thStyle}>Value</th>
              <th style={thStyle}>Context</th>
              <th style={thStyle}>Period</th>
            </tr>
          </thead>
          <tbody>
            {metrics.map((m, i) => (
              <tr key={i}>
                <td style={{ ...tdStyle, fontWeight: 600 }}>
                  {METRIC_LABELS[m.metric_type] || m.metric_type.replace(/_/g, ' ')}
                </td>
                <td style={tdStyle}>{formatMetricValue(m.metric_type, m.value)}</td>
                <td style={{ ...tdStyle, color: '#718096', fontSize: '13px' }}>{m.context_label}</td>
                <td style={tdStyle}>{m.time_period}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Disciplinary Records */}
      {disciplinary.length > 0 && (
        <>
          <h2 style={sectionHeadingStyle}>Disciplinary History</h2>
          {disciplinary.map((d, i) => (
            <div key={i} style={{
              borderLeft: '3px solid #fc8181',
              backgroundColor: '#fff5f5',
              borderRadius: '0 6px 6px 0',
              padding: '12px 16px',
              marginBottom: '10px',
            }}>
              <div style={{ fontWeight: 700, color: '#742a2a', fontSize: '14px' }}>
                {d.record_type} — {d.record_date}
              </div>
              {d.description && (
                <div style={{ color: '#9b2c2c', fontSize: '13px', marginTop: '4px' }}>{d.description}</div>
              )}
              {d.source_url && (
                <a href={d.source_url} target="_blank" rel="noopener noreferrer"
                  style={{ color: '#c53030', fontSize: '12px', marginTop: '4px', display: 'inline-block' }}>
                  View source &rarr;
                </a>
              )}
            </div>
          ))}
        </>
      )}
    </div>
  );
}
