import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trophy, Medal, ChevronDown } from 'lucide-react';
import api from '../utils/api';
import StatusBadge from '../components/ui/StatusBadge';
import toast from 'react-hot-toast';

export default function Rankings() {
  const [drives, setDrives] = useState([]);
  const [selectedDrive, setSelectedDrive] = useState('');
  const [selectedDriveName, setSelectedDriveName] = useState('');
  const [rankings, setRankings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [driveOpen, setDriveOpen] = useState(false);

  useEffect(() => {
    api.get('/drives?limit=50').then(({ data }) => {
      setDrives(data.drives);
      if (data.drives.length > 0) {
        setSelectedDrive(data.drives[0]._id);
        setSelectedDriveName(data.drives[0].name);
      }
    });
  }, []);

  useEffect(() => {
    if (!selectedDrive) return;
    setLoading(true);
    api.get(`/candidates/drive/${selectedDrive}/rankings`)
      .then(({ data }) => setRankings(data.candidates))
      .catch(() => toast.error('Failed to load rankings'))
      .finally(() => setLoading(false));
  }, [selectedDrive]);

  const selectDrive = (drive) => {
    setSelectedDrive(drive._id);
    setSelectedDriveName(drive.name);
    setDriveOpen(false);
  };

  const medalStyle = [
    { bg: 'rgba(245,158,11,0.15)', color: '#f59e0b', ring: '2px solid rgba(245,158,11,0.4)' },
    { bg: 'rgba(148,163,184,0.15)', color: '#94a3b8', ring: '2px solid rgba(148,163,184,0.3)' },
    { bg: 'rgba(180,83,9,0.15)', color: '#b45309', ring: '2px solid rgba(180,83,9,0.3)' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Rankings</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text3)' }}>Candidate rankings by drive</p>
      </div>

      {/* Custom Drive Selector */}
      <div className="relative">
        <button
          onClick={() => setDriveOpen(!driveOpen)}
          className="glass w-full flex items-center justify-between px-5 py-4 hover:border-[var(--border-h)] transition-all"
          style={{ borderColor: driveOpen ? 'var(--accent)' : undefined }}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(245,158,11,0.12)' }}>
              <Trophy size={18} style={{ color: '#f59e0b' }} />
            </div>
            <div className="text-left">
              <p className="text-xs font-medium" style={{ color: 'var(--text3)' }}>Viewing rankings for</p>
              <p className="font-display font-semibold" style={{ color: 'var(--text)' }}>
                {selectedDriveName || 'Select a drive...'}
              </p>
            </div>
          </div>
          <ChevronDown size={18} style={{ color: 'var(--text3)', transform: driveOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
        </button>

        {driveOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-full left-0 right-0 mt-2 rounded-xl overflow-hidden z-50 shadow-2xl"
            style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}
          >
            {drives.length === 0 ? (
              <div className="px-5 py-4 text-sm" style={{ color: 'var(--text3)' }}>No drives found</div>
            ) : drives.map((d) => (
              <button key={d._id} onClick={() => selectDrive(d)}
                className="w-full flex items-center justify-between px-5 py-3.5 text-left transition-colors"
                style={{
                  background: selectedDrive === d._id ? 'rgba(99,114,241,0.1)' : 'transparent',
                  borderBottom: '1px solid var(--border)',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(99,114,241,0.08)'}
                onMouseLeave={e => e.currentTarget.style.background = selectedDrive === d._id ? 'rgba(99,114,241,0.1)' : 'transparent'}
              >
                <div>
                  <p className="font-medium text-sm" style={{ color: 'var(--text)' }}>{d.name}</p>
                  <p className="text-xs" style={{ color: 'var(--text3)' }}>{d.company || 'No company'} · {d.totalCandidates || 0} candidates</p>
                </div>
                {selectedDrive === d._id && (
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(99,114,241,0.15)', color: 'var(--accent)' }}>Active</span>
                )}
              </button>
            ))}
          </motion.div>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--accent)' }} />
        </div>
      ) : rankings.length === 0 ? (
        <div className="glass p-16 text-center">
          <Trophy size={48} className="mx-auto mb-4 opacity-20" style={{ color: 'var(--text3)' }} />
          <p style={{ color: 'var(--text3)' }}>No ranked candidates yet for this drive</p>
        </div>
      ) : (
        <div className="glass overflow-hidden">
          {/* Top 3 Podium */}
          {rankings.length >= 3 && (
            <div className="p-8" style={{ borderBottom: '1px solid var(--border)', background: 'rgba(99,114,241,0.03)' }}>
              <p className="text-center text-xs font-semibold uppercase tracking-widest mb-6" style={{ color: 'var(--text3)' }}>Top Performers</p>
              <div className="flex items-end justify-center gap-6">
                {[1, 0, 2].map((pos) => {
                  const c = rankings[pos];
                  if (!c) return null;
                  const ms = medalStyle[pos];
                  const heights = [28, 36, 22];
                  const isFirst = pos === 0;
                  return (
                    <motion.div key={c._id}
                      initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: pos * 0.12 }}
                      className="flex flex-col items-center gap-2">
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                        style={{ background: ms.bg, outline: ms.ring }}>
                        <Medal size={22} style={{ color: ms.color }} />
                      </div>
                      <p className="font-display font-semibold text-sm text-center max-w-[96px] truncate"
                        style={{ color: 'var(--text)' }}>{c.name}</p>
                      <p className="font-mono font-bold text-lg" style={{ color: ms.color }}>{c.finalScore?.toFixed(1)}</p>
                      <div className="w-20 rounded-t-xl flex items-start justify-center pt-2"
                        style={{ height: heights[pos === 0 ? 1 : pos === 1 ? 0 : 2] * 4, background: isFirst ? `linear-gradient(to bottom, rgba(245,158,11,0.25), rgba(245,158,11,0.05))` : 'var(--card)' }}>
                        <span className="font-display font-bold text-xl" style={{ color: ms.color }}>#{pos + 1}</span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['Rank', 'Candidate', 'Score', 'ATS', 'Status'].map(h => (
                    <th key={h} className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider"
                      style={{ color: 'var(--text3)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rankings.map((c, i) => {
                  const ms = i < 3 ? medalStyle[i] : null;
                  return (
                    <motion.tr key={c._id}
                      initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                      style={{ borderBottom: '1px solid var(--border)' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--card)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <td className="px-6 py-4">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold"
                          style={{ background: ms ? ms.bg : 'rgba(255,255,255,0.04)', color: ms ? ms.color : 'var(--text3)', outline: ms ? ms.ring : undefined }}>
                          {i + 1}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Link to={`/candidates/${c._id}`}>
                          <p className="font-semibold text-sm transition-colors"
                            style={{ color: 'var(--text)' }}
                            onMouseEnter={e => e.target.style.color = 'var(--accent)'}
                            onMouseLeave={e => e.target.style.color = 'var(--text)'}
                          >{c.name}</p>
                          <p className="text-xs mt-0.5" style={{ color: 'var(--text3)' }}>{c.college || c.email}</p>
                        </Link>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <span className="font-mono font-bold text-lg" style={{ color: 'var(--text)' }}>
                            {c.finalScore?.toFixed(1) || '—'}
                          </span>
                          <div className="w-16 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                            <div className="h-full rounded-full" style={{
                              width: `${c.finalScore || 0}%`,
                              background: 'linear-gradient(90deg, var(--accent), var(--accent2))'
                            }} />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {c.atsScore > 0 ? (
                          <span className="font-mono text-sm font-semibold"
                            style={{ color: c.atsScore >= 75 ? '#10b981' : c.atsScore >= 50 ? '#f59e0b' : '#ef4444' }}>
                            {c.atsScore}
                          </span>
                        ) : <span style={{ color: 'var(--text3)' }}>—</span>}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={c.status} />
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
