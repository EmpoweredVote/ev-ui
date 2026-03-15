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
