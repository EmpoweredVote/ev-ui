import React from 'react';
import { METRIC_LABELS, formatMetricValue, formatDate } from './judicialUtils.js';

const sectionStyle = {
  fontFamily: "'Manrope', sans-serif",
  borderTop: '1px solid #e2e8f0',
  paddingTop: '24px',
  marginTop: '24px',
};

const headingStyle = {
  fontSize: '16px',
  fontWeight: 700,
  color: '#2d3748',
  marginBottom: '16px',
};

const cardGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
  gap: '12px',
  marginBottom: '16px',
};

const metricCardStyle = {
  backgroundColor: '#f7fafc',
  borderRadius: '8px',
  padding: '14px 16px',
  border: '1px solid #e2e8f0',
};

const metricValueStyle = {
  fontSize: '22px',
  fontWeight: 700,
  color: '#2d3748',
  lineHeight: 1.2,
};

const metricLabelStyle = {
  fontSize: '12px',
  fontWeight: 600,
  color: '#718096',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  marginBottom: '4px',
};

const metricContextStyle = {
  fontSize: '12px',
  color: '#a0aec0',
  marginTop: '4px',
};

const evalChipStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  backgroundColor: '#ebf8ff',
  color: '#2b6cb0',
  borderRadius: '6px',
  padding: '6px 12px',
  fontSize: '13px',
  fontWeight: 600,
  marginRight: '8px',
  marginBottom: '8px',
};

const disciplinaryStyle = {
  borderLeft: '3px solid #fc8181',
  backgroundColor: '#fff5f5',
  borderRadius: '0 6px 6px 0',
  padding: '10px 14px',
  marginBottom: '8px',
  fontSize: '13px',
  color: '#742a2a',
};

const linkStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '4px',
  color: '#319795',
  fontSize: '14px',
  fontWeight: 600,
  textDecoration: 'none',
  marginTop: '8px',
  cursor: 'pointer',
};

/**
 * JudicialScorecard — compact scorecard for judge profiles.
 * Renders in the same slot as LegislativeInlineSummary for legislators.
 *
 * Props:
 *   judicialRecord: { judge_detail, evaluations[], metrics[], disciplinary_records[] }
 *   politicianId: string (for building the detail link)
 *   onNavigateToRecord: (href) => void
 */
export default function JudicialScorecard({ judicialRecord, politicianId, onNavigateToRecord }) {
  if (!judicialRecord) return null;

  const { evaluations = [], metrics = [], disciplinary_records: disciplinary = [] } = judicialRecord;

  // Don't render if there's no data at all
  if (evaluations.length === 0 && metrics.length === 0 && disciplinary.length === 0) {
    return null;
  }

  const handleNavigate = (e) => {
    e.preventDefault();
    if (onNavigateToRecord) {
      onNavigateToRecord(`/politician/${politicianId}/judicial-record`);
    }
  };

  return (
    <section style={sectionStyle}>
      <h3 style={headingStyle}>Judicial Record</h3>

      {/* Evaluation chips */}
      {evaluations.length > 0 && (
        <div style={{ marginBottom: '16px' }}>
          {evaluations.slice(0, 3).map((ev, i) => (
            <span key={i} style={evalChipStyle}>
              {ev.rating}
              <span style={{ fontWeight: 400, color: '#4a90a4', fontSize: '11px' }}>
                — {ev.source}
              </span>
            </span>
          ))}
        </div>
      )}

      {/* Metric cards */}
      {metrics.length > 0 && (
        <div style={cardGridStyle}>
          {metrics.slice(0, 4).map((m, i) => (
            <div key={i} style={metricCardStyle}>
              <div style={metricLabelStyle}>
                {METRIC_LABELS[m.metric_type] || m.metric_type.replace(/_/g, ' ')}
              </div>
              <div style={metricValueStyle}>
                {formatMetricValue(m.metric_type, m.value)}
              </div>
              {m.context_label && (
                <div style={metricContextStyle}>{m.context_label}</div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Disciplinary flag (if any) */}
      {disciplinary.length > 0 && (
        <div style={{ marginBottom: '12px' }}>
          {disciplinary.slice(0, 2).map((d, i) => (
            <div key={i} style={disciplinaryStyle}>
              <strong>{d.record_type}</strong> — {formatDate(d.record_date)}
              {d.description && <div style={{ marginTop: '4px' }}>{d.description}</div>}
            </div>
          ))}
        </div>
      )}

      {/* Link to full record */}
      <a href={`/politician/${politicianId}/judicial-record`} onClick={handleNavigate} style={linkStyle}>
        View Full Judicial Record →
      </a>
    </section>
  );
}
