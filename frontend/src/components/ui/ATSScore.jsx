import { motion } from 'framer-motion';
import { Brain, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
const SC = {
  shortlisted: { label: 'Shortlisted', color: '#10b981', bg: 'rgba(16,185,129,0.1)', icon: CheckCircle },
  review:      { label: 'Under Review', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', icon: AlertCircle },
  rejected:    { label: 'Not Suitable', color: '#ef4444', bg: 'rgba(239,68,68,0.1)',  icon: XCircle },
  pending:     { label: 'Pending',       color: '#6272f1', bg: 'rgba(99,114,241,0.1)', icon: Brain },
};
const BD = [
  { key: 'skillMatch',      label: 'Skill Match',      weight: '40%', color: '#6272f1' },
  { key: 'experienceMatch', label: 'Experience',        weight: '30%', color: '#22d3ee' },
  { key: 'educationMatch',  label: 'Education',         weight: '15%', color: '#f59e0b' },
  { key: 'keywordRelevance',label: 'Keywords',          weight: '15%', color: '#10b981' },
];
export default function ATSScore({ atsScore = 0, atsStatus = 'pending', atsBreakdown = {} }) {
  const cfg = SC[atsStatus] || SC.pending;
  const Icon = cfg.icon;
  const c = atsScore >= 75 ? '#10b981' : atsScore >= 50 ? '#f59e0b' : '#ef4444';
  const circ = 2 * Math.PI * 36;
  return (
    <div className="card p-5 space-y-4">
      <div className="flex items-center gap-2.5">
        <Brain size={16} style={{ color: 'var(--accent)' }} />
        <span className="section-title">ATS Score</span>
      </div>
      <div className="flex items-center gap-5">
        <div className="relative w-24 h-24 shrink-0">
          <svg width="96" height="96" viewBox="0 0 96 96" style={{ transform: 'rotate(-90deg)' }}>
            <circle cx="48" cy="48" r="36" fill="none" stroke="var(--border)" strokeWidth="7" />
            <motion.circle cx="48" cy="48" r="36" fill="none" stroke={c} strokeWidth="7" strokeLinecap="round"
              strokeDasharray={circ}
              initial={{ strokeDashoffset: circ }}
              animate={{ strokeDashoffset: circ - (atsScore / 100) * circ }}
              transition={{ duration: 1.2, ease: 'easeOut', delay: 0.2 }} />
          </svg>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 22, fontFamily: 'Syne', fontWeight: 700, color: c }}>{atsScore}</span>
            <span style={{ fontSize: 11, color: 'var(--text3)' }}>/100</span>
          </div>
        </div>
        <div className="space-y-2 flex-1">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ background: cfg.bg, border: `1px solid ${cfg.color}25` }}>
            <Icon size={13} style={{ color: cfg.color }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: cfg.color }}>{cfg.label}</span>
          </div>
          <p style={{ fontSize: 11, color: 'var(--text3)', lineHeight: 1.6 }}>
            {atsScore >= 75 ? 'Moves to interview rounds automatically.' : atsScore >= 50 ? 'Requires manual review.' : 'Below threshold.'}
          </p>
        </div>
      </div>
      <div className="space-y-2.5 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
        {BD.map(({ key, label, weight, color }) => {
          const val = atsBreakdown[key] ?? 0;
          return (
            <div key={key}>
              <div className="flex justify-between mb-1" style={{ fontSize: 11 }}>
                <div className="flex items-center gap-1.5">
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: color }} />
                  <span style={{ color: 'var(--text2)' }}>{label} <span style={{ color: 'var(--text3)' }}>({weight})</span></span>
                </div>
                <span style={{ fontWeight: 700, color: 'var(--text)' }}>{val}%</span>
              </div>
              <div style={{ height: 4, borderRadius: 99, background: 'var(--border)', overflow: 'hidden' }}>
                <motion.div style={{ height: '100%', borderRadius: 99, background: color }}
                  initial={{ width: 0 }} animate={{ width: val + '%' }} transition={{ duration: 0.8, delay: 0.15 }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
