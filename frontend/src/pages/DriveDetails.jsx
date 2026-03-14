import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Edit, Users, Trophy, Plus, FileText,
  Target, Award, BarChart3, RefreshCw, Clock, CheckCircle,
  TrendingUp, ChevronRight
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import toast from 'react-hot-toast';
import api from '../utils/api';
import StatusBadge from '../components/ui/StatusBadge';

const STATUS_COLORS = {
  selected: '#10b981', waitlisted: '#f97316', pending: '#6272f1',
  rejected: '#ef4444', in_progress: '#22d3ee',
};

const PieTT = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const p = payload[0];
  return (
    <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, padding: '8px 14px', boxShadow: '0 8px 24px rgba(0,0,0,0.4)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 10, height: 10, borderRadius: 3, background: p.payload.fill }} />
        <span style={{ color: 'var(--text)', fontWeight: 600, textTransform: 'capitalize', fontSize: 13 }}>{p.name?.replace('_', ' ')}</span>
      </div>
      <p style={{ color: p.payload.fill, fontWeight: 700, fontSize: 18, margin: '2px 0 0' }}>{p.value}</p>
    </div>
  );
};

export default function DriveDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [drive, setDrive] = useState(null);
  const [stats, setStats] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const fetchAll = useCallback(async (silent = false) => {
    if (!silent) setLoading(true); else setRefreshing(true);
    try {
      const [driveRes, statsRes, candidateRes] = await Promise.all([
        api.get('/drives/' + id),
        api.get('/drives/' + id + '/stats'),
        api.get('/candidates/drive/' + id + '/rankings'),
      ]);
      setDrive(driveRes.data.drive);
      setStats(statsRes.data.stats);
      setCandidates(candidateRes.data.candidates);
      setLastUpdated(new Date());
    } catch {
      toast.error('Failed to load drive');
      navigate('/drives');
    }
    setLoading(false);
    setRefreshing(false);
  }, [id]);

  useEffect(() => {
    fetchAll();
    const iv = setInterval(() => fetchAll(true), 20000);
    return () => clearInterval(iv);
  }, [fetchAll]);

  if (loading) return (
    <div className="flex justify-center py-16">
      <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--accent)' }} />
    </div>
  );
  if (!drive) return null;

  const pieData = (stats?.statusBreakdown || []).map(s => ({
    name: s._id, value: s.count, fill: STATUS_COLORS[s._id] || '#6272f1',
  }));

  const selectedCount = stats?.statusBreakdown?.find(s => s._id === 'selected')?.count || 0;
  const roundColors = ['#6272f1', '#22d3ee', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/drives')} className="btn-ghost py-2 px-3">
            <ArrowLeft size={16} />
          </button>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="page-title">{drive.name}</h1>
              <StatusBadge status={drive.status} />
            </div>
            {drive.company && (
              <p className="text-sm mt-0.5" style={{ color: 'var(--text3)' }}>
                {drive.company}{drive.jobRole ? ' · ' + drive.jobRole : ''}
              </p>
            )}
            <div className="flex items-center gap-2 mt-1">
              <p className="text-xs" style={{ color: 'var(--text3)' }}>
                Updated {lastUpdated.toLocaleTimeString()}
              </p>
              <button onClick={() => fetchAll(true)} disabled={refreshing}
                className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-lg"
                style={{ color: 'var(--accent)', background: 'rgba(99,114,241,0.08)', border: '1px solid rgba(99,114,241,0.2)' }}>
                <RefreshCw size={10} className={refreshing ? 'animate-spin' : ''} />
                {refreshing ? 'Syncing...' : 'Sync'}
              </button>
            </div>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Link to={'/drives/' + id + '/edit'} className="btn-ghost flex items-center gap-2 text-sm">
            <Edit size={14} /> Edit
          </Link>
          <Link to={'/drives/' + id + '/add-candidates'} className="btn-primary flex items-center gap-2 text-sm">
            <Plus size={14} /> Add Candidates
          </Link>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { icon: Users, label: 'Total Candidates', value: stats?.totalCandidates || 0, color: '#6272f1', bg: 'rgba(99,114,241,0.1)' },
          { icon: CheckCircle, label: 'Selected', value: selectedCount, color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
          { icon: Target, label: 'Selection Threshold', value: drive.selectionThreshold + '%', color: '#22d3ee', bg: 'rgba(34,211,238,0.1)' },
          { icon: BarChart3, label: 'Rounds', value: drive.rounds?.length || 0, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
        ].map(({ icon: Icon, label, value, color, bg }, i) => (
          <motion.div key={label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="glass p-4 text-center" style={{ background: bg }}>
            <Icon size={20} className="mx-auto mb-2" style={{ color }} />
            <p className="text-2xl font-display font-bold" style={{ color: 'var(--text)' }}>{value}</p>
            <p className="text-xs" style={{ color: 'var(--text3)' }}>{label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left: Rounds + Pie */}
        <div className="space-y-5">
          <div className="glass p-6">
            <h2 className="section-title mb-4">Evaluation Rounds</h2>
            <div className="space-y-2">
              {drive.rounds?.map((round, i) => (
                <div key={round._id} className="flex items-center gap-3 p-3 rounded-xl"
                  style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0"
                    style={{ background: roundColors[i % roundColors.length] + '20', color: roundColors[i % roundColors.length] }}>
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate" style={{ color: 'var(--text)' }}>{round.name}</p>
                    <p className="text-xs capitalize" style={{ color: 'var(--text3)' }}>{round.type?.replace('_', ' ')}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold" style={{ color: roundColors[i % roundColors.length] }}>{round.weightage}%</p>
                    <p className="text-xs" style={{ color: 'var(--text3)' }}>cut: {round.cutoffScore}</p>
                  </div>
                </div>
              ))}
              {(!drive.rounds || drive.rounds.length === 0) && (
                <p className="text-sm text-center py-4" style={{ color: 'var(--text3)' }}>No rounds configured</p>
              )}
            </div>
            {drive.rounds?.length > 0 && (
              <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
                <div className="h-2 rounded-full overflow-hidden flex gap-0.5">
                  {drive.rounds.map((r, i) => (
                    <div key={r._id} className="h-full rounded-full"
                      style={{ width: r.weightage + '%', background: roundColors[i % roundColors.length] }} />
                  ))}
                </div>
                <p className="text-xs mt-1" style={{ color: 'var(--text3)' }}>Weightage distribution</p>
              </div>
            )}
          </div>

          {/* Status pie */}
          {pieData.length > 0 && (
            <div className="glass p-6">
              <h2 className="section-title mb-4">Status Breakdown</h2>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={42} outerRadius={68}
                    paddingAngle={3} dataKey="value" strokeWidth={0}>
                    {pieData.map((e, i) => <Cell key={i} fill={e.fill} />)}
                  </Pie>
                  <Tooltip content={<PieTT />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1.5 mt-2">
                {pieData.map(item => (
                  <div key={item.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-sm" style={{ background: item.fill }} />
                      <span className="capitalize" style={{ color: 'var(--text2)' }}>{item.name?.replace('_', ' ')}</span>
                    </div>
                    <span className="font-bold" style={{ color: 'var(--text)' }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Rankings */}
        <div className="glass p-6 xl:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="section-title">Candidate Rankings</h2>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text3)' }}>
                {candidates.length} candidates · sorted by final score
              </p>
            </div>
            <Link to={'/candidates?drive=' + id}
              className="text-sm flex items-center gap-1" style={{ color: 'var(--accent)' }}>
              View all <ChevronRight size={14} />
            </Link>
          </div>

          {candidates.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center opacity-30"
                style={{ background: 'rgba(99,114,241,0.1)' }}>
                <Users size={28} style={{ color: 'var(--text3)' }} />
              </div>
              <div className="text-center">
                <p className="font-semibold" style={{ color: 'var(--text2)' }}>No candidates yet</p>
                <p className="text-sm mt-1" style={{ color: 'var(--text3)' }}>Add candidates to start evaluating</p>
              </div>
              <Link to={'/drives/' + id + '/add-candidates'} className="btn-primary flex items-center gap-2 text-sm">
                <Plus size={14} /> Add Candidates
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {candidates.slice(0, 10).map((c, i) => {
                const medalColors = ['#f59e0b', '#94a3b8', '#b45309'];
                const isMedal = i < 3;
                return (
                  <motion.div key={c._id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}>
                    <Link to={'/candidates/' + c._id}
                      className="flex items-center gap-4 p-3.5 rounded-xl transition-all block group"
                      style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)' }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-h)'; e.currentTarget.style.background = 'var(--card)'; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}
                    >
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold shrink-0"
                        style={{
                          background: isMedal ? medalColors[i] + '20' : 'var(--card)',
                          color: isMedal ? medalColors[i] : 'var(--text3)',
                          border: '1px solid ' + (isMedal ? medalColors[i] + '40' : 'var(--border)'),
                        }}>
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate" style={{ color: 'var(--text)' }}>{c.name}</p>
                        <p className="text-xs truncate" style={{ color: 'var(--text3)' }}>
                          {c.college || c.email}
                          {c.usn ? ' · ' + c.usn : ''}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        {c.atsScore > 0 && (
                          <span className="text-xs font-mono font-bold"
                            style={{ color: c.atsScore >= 75 ? '#10b981' : c.atsScore >= 50 ? '#f59e0b' : '#ef4444' }}>
                            ATS {c.atsScore}
                          </span>
                        )}
                        <div className="text-right">
                          <p className="font-mono font-bold text-sm" style={{ color: 'var(--text)' }}>
                            {c.finalScore?.toFixed(1) || '—'}
                          </p>
                          <StatusBadge status={c.status} />
                        </div>
                        {c.status === 'selected' && (
                          <Link to={'/offer-letter/' + c._id}
                            onClick={e => e.stopPropagation()}
                            className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg transition-all"
                            style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981', border: '1px solid rgba(16,185,129,0.2)' }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(16,185,129,0.18)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'rgba(16,185,129,0.1)'}>
                            <FileText size={11} /> Offer
                          </Link>
                        )}
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
              {candidates.length > 10 && (
                <Link to={'/candidates?drive=' + id}
                  className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all"
                  style={{ color: 'var(--accent)', background: 'rgba(99,114,241,0.06)', border: '1px solid rgba(99,114,241,0.15)' }}>
                  View all {candidates.length} candidates <ChevronRight size={14} />
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
