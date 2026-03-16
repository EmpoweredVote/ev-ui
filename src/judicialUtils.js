/** Format a date string (ISO or YYYY-MM-DD or YYYY-MM) into readable form like "November 7, 2012". */
export function formatDate(dateStr) {
  if (!dateStr) return '';
  // Strip any time/timezone portion: "2012-11-07T00:00:00Z" → "2012-11-07"
  const cleaned = dateStr.replace(/T.*$/, '');
  const parts = cleaned.split('-');
  // Handle YYYY-MM (no day)
  if (parts.length === 2) {
    const d = new Date(`${cleaned}-01T12:00:00`);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }
  const d = new Date(`${cleaned}T12:00:00`);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

export const METRIC_LABELS = {
  reversal_rate: 'Reversal Rate',
  caseload_volume: 'Cases Handled',
  avg_disposition_days: 'Avg. Days to Resolve',
  retention_vote_pct: 'Last Retention Vote',
};

export function formatMetricValue(type, value) {
  if (type === 'reversal_rate' || type === 'retention_vote_pct') return `${value}%`;
  if (type === 'avg_disposition_days') return `${Math.round(value)} days`;
  if (type === 'caseload_volume') return Math.round(value).toLocaleString();
  return String(value);
}
