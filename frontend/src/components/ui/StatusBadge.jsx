const C = {
  draft:       ['rgba(255,255,255,0.06)', 'var(--text3)'],
  active:      ['rgba(16,185,129,0.12)',  '#10b981'],
  completed:   ['rgba(34,211,238,0.12)',  '#22d3ee'],
  archived:    ['rgba(255,255,255,0.04)', 'var(--text3)'],
  pending:     ['rgba(245,158,11,0.12)',  '#f59e0b'],
  in_progress: ['rgba(99,114,241,0.12)',  '#6272f1'],
  selected:    ['rgba(16,185,129,0.12)',  '#10b981'],
  waitlisted:  ['rgba(249,115,22,0.12)',  '#f97316'],
  rejected:    ['rgba(239,68,68,0.12)',   '#ef4444'],
  shortlisted: ['rgba(16,185,129,0.12)',  '#10b981'],
  review:      ['rgba(245,158,11,0.12)',  '#f59e0b'],
  ats_shortlisted: ['rgba(16,185,129,0.1)', '#10b981'],
  ats_review:      ['rgba(245,158,11,0.1)', '#f59e0b'],
  ats_rejected:    ['rgba(239,68,68,0.1)',  '#ef4444'],
};
const L = {
  ats_shortlisted: '✓ ATS Pass', ats_review: '~ ATS Review', ats_rejected: '✗ ATS Fail',
  in_progress: 'In Progress',
};
export default function StatusBadge({ status }) {
  const [bg, color] = C[status] || ['rgba(255,255,255,0.05)', 'var(--text3)'];
  const label = L[status] || (status || '—').replace('_', ' ');
  return (
    <span className="badge" style={{ background: bg, color, border: `1px solid ${color}28`, textTransform: 'capitalize' }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: color, flexShrink: 0, display: 'inline-block' }} />
      {label}
    </span>
  );
}
