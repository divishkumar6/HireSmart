import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Save, Award, Mail, Phone, GraduationCap,
  Edit2, X, Plus, FileText, ChevronDown
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../utils/api';
import StatusBadge from '../components/ui/StatusBadge';
import ATSScore from '../components/ui/ATSScore';

const STATUS_OPTIONS = [
  { value: 'selected',    label: '✓ Selected',    color: '#10b981' },
  { value: 'waitlisted',  label: '⏳ Waitlisted',  color: '#f97316' },
  { value: 'rejected',    label: '✗ Rejected',    color: '#ef4444' },
  { value: 'in_progress', label: '● In Progress', color: '#6272f1' },
  { value: 'pending',     label: '○ Pending',     color: '#94a3b8' },
];

export default function CandidateDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [candidate, setCandidate] = useState(null);
  const [scores, setScores] = useState({});
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [newSkill, setNewSkill] = useState('');
  const [statusOpen, setStatusOpen] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const load = async () => {
    try {
      const { data } = await api.get('/candidates/' + id);
      const c = data.candidate;
      setCandidate(c);
      setEditForm({
        name: c.name,
        email: c.email,
        phone: c.phone || '',
        college: c.college || '',
        branch: c.branch || '',
        cgpa: c.cgpa || '',
        experience: c.experience || 0,
        skills: [...(c.skills || [])],
      });
      const s = {};
      c.scores.forEach(sc => { s[sc.roundId] = sc.score; });
      setScores(s);
      setLoading(false);
    } catch {
      toast.error('Candidate not found');
      navigate('/candidates');
    }
  };

  useEffect(() => { load(); }, [id]);

  const handleSaveScores = async () => {
    setSaving(true);
    try {
      const scorePayload = Object.entries(scores).map(([roundId, score]) => ({
        roundId,
        score: Number(score),
      }));
      await api.put('/candidates/' + id + '/scores', { scores: scorePayload });
      await load();
      toast.success('Scores saved & rankings updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save scores');
    }
    setSaving(false);
  };

  const handleUpdateProfile = async () => {
    try {
      await api.put('/candidates/' + id, editForm);
      await load();
      setEditMode(false);
      toast.success('Profile updated');
    } catch {
      toast.error('Failed to update');
    }
  };

  const handleStatusChange = async (newStatus) => {
    setStatusOpen(false);
    setUpdatingStatus(true);
    try {
      await api.put('/offers/' + id + '/status', { status: newStatus });
      setCandidate(prev => ({ ...prev, status: newStatus }));
      toast.success('Status updated to ' + newStatus.replace('_', ' '));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    }
    setUpdatingStatus(false);
  };

  const addSkill = () => {
    if (!newSkill.trim()) return;
    setEditForm(prev => ({ ...prev, skills: [...prev.skills, newSkill.trim()] }));
    setNewSkill('');
  };

  const removeSkill = (idx) => {
    setEditForm(prev => ({ ...prev, skills: prev.skills.filter((_, i) => i !== idx) }));
  };

  if (loading) return (
    <div className="flex justify-center py-16">
      <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin"
        style={{ borderColor: 'var(--accent)' }} />
    </div>
  );

  const rounds = candidate?.drive?.rounds || [];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="btn-ghost py-2 px-3">
          <ArrowLeft size={16} />
        </button>
        <div className="flex-1 flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="page-title">{candidate?.name}</h1>
            <p className="text-sm mt-0.5" style={{ color: 'var(--text3)' }}>{candidate?.email}</p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* ATS status badge */}
            {candidate?.atsStatus && candidate.atsStatus !== 'pending' && (
              <StatusBadge status={'ats_' + candidate.atsStatus} />
            )}

            {/* Status changer dropdown */}
            <div className="relative">
              <button
                onClick={() => setStatusOpen(!statusOpen)}
                disabled={updatingStatus}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-semibold transition-all"
                style={{
                  background: 'var(--card)',
                  border: '1px solid var(--border)',
                  color: 'var(--text)',
                }}
              >
                {updatingStatus ? (
                  <div className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin"
                    style={{ borderColor: 'var(--accent)' }} />
                ) : (
                  <>
                    <StatusBadge status={candidate?.status} />
                    <ChevronDown size={13} style={{ color: 'var(--text3)' }} />
                  </>
                )}
              </button>

              {statusOpen && (
                <div
                  className="absolute right-0 top-full mt-1 rounded-xl overflow-hidden z-30 shadow-2xl"
                  style={{
                    background: 'var(--bg2)',
                    border: '1px solid var(--border)',
                    minWidth: 170,
                  }}
                >
                  {STATUS_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => handleStatusChange(opt.value)}
                      className="w-full px-4 py-2.5 text-left text-sm transition-colors flex items-center gap-2"
                      style={{ color: opt.color }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(99,114,241,0.08)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Rank badge */}
            {candidate?.rank && (
              <div
                className="px-3 py-1 rounded-lg text-sm font-bold"
                style={{
                  background: 'rgba(245,158,11,0.1)',
                  border: '1px solid rgba(245,158,11,0.2)',
                  color: '#f59e0b',
                }}
              >
                Rank #{candidate.rank}
              </div>
            )}

            {/* Offer letter button — only for selected */}
            {candidate?.status === 'selected' && (
              <Link
                to={'/offer-letter/' + id}
                className="btn-primary text-sm py-1.5 px-4 flex items-center gap-2"
              >
                <FileText size={14} /> Offer Letter
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="space-y-5">
          {/* Profile card */}
          <div className="glass p-6 space-y-4">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold text-white"
              style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent2))' }}
            >
              {candidate?.name?.slice(0, 2).toUpperCase()}
            </div>

            {!editMode ? (
              <>
                <div className="space-y-3">
                  {[
                    { icon: Mail,          label: 'Email',   value: candidate?.email },
                    { icon: Phone,         label: 'Phone',   value: candidate?.phone || '—' },
                    { icon: GraduationCap, label: 'College', value: candidate?.college || '—' },
                  ].map(({ icon: Icon, label, value }) => (
                    <div key={label} className="flex items-start gap-3">
                      <Icon size={14} className="mt-0.5 shrink-0" style={{ color: 'var(--text3)' }} />
                      <div>
                        <p className="text-xs" style={{ color: 'var(--text3)' }}>{label}</p>
                        <p className="text-sm" style={{ color: 'var(--text)' }}>{value}</p>
                      </div>
                    </div>
                  ))}
                  {candidate?.branch && (
                    <p className="text-sm" style={{ color: 'var(--text2)' }}>
                      Branch: {candidate.branch}
                    </p>
                  )}
                  {candidate?.cgpa && (
                    <p className="text-sm" style={{ color: 'var(--text2)' }}>
                      CGPA: {candidate.cgpa} · Exp: {candidate.experience || 0}y
                    </p>
                  )}
                </div>

                {candidate?.skills?.length > 0 && (
                  <div className="pt-3" style={{ borderTop: '1px solid var(--border)' }}>
                    <p className="text-xs font-semibold uppercase tracking-wide mb-2"
                      style={{ color: 'var(--text3)' }}>Skills</p>
                    <div className="flex flex-wrap gap-1.5">
                      {candidate.skills.map(skill => (
                        <span
                          key={skill}
                          className="px-2 py-0.5 rounded-full text-xs font-medium capitalize"
                          style={{
                            background: 'rgba(99,114,241,0.12)',
                            color: 'var(--accent)',
                            border: '1px solid rgba(99,114,241,0.2)',
                          }}
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-3" style={{ borderTop: '1px solid var(--border)' }}>
                  <Link
                    to={'/drives/' + candidate?.drive?._id}
                    className="text-sm font-medium"
                    style={{ color: 'var(--accent)' }}
                  >
                    {candidate?.drive?.name}
                  </Link>
                </div>

                <button onClick={() => setEditMode(true)} className="btn-ghost w-full justify-center text-sm py-2">
                  <Edit2 size={13} /> Edit Profile
                </button>
              </>
            ) : (
              <div className="space-y-3">
                {[
                  ['name', 'Name'],
                  ['email', 'Email'],
                  ['phone', 'Phone'],
                  ['college', 'College'],
                  ['branch', 'Branch'],
                ].map(([field, label]) => (
                  <div key={field}>
                    <label className="label text-xs">{label}</label>
                    <input
                      value={editForm[field]}
                      onChange={e => setEditForm({ ...editForm, [field]: e.target.value })}
                      className="input py-2 text-sm"
                    />
                  </div>
                ))}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="label text-xs">CGPA</label>
                    <input
                      type="number" step="0.1" min="0" max="10"
                      value={editForm.cgpa}
                      onChange={e => setEditForm({ ...editForm, cgpa: e.target.value })}
                      className="input py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="label text-xs">Experience (yrs)</label>
                    <input
                      type="number" min="0"
                      value={editForm.experience}
                      onChange={e => setEditForm({ ...editForm, experience: Number(e.target.value) })}
                      className="input py-2 text-sm"
                    />
                  </div>
                </div>

                {/* Skills editor */}
                <div>
                  <label className="label text-xs">Skills</label>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {editForm.skills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs"
                        style={{ background: 'rgba(99,114,241,0.12)', color: 'var(--accent)' }}
                      >
                        {skill}
                        <button onClick={() => removeSkill(idx)} className="hover:text-red-400">
                          <X size={10} />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      value={newSkill}
                      onChange={e => setNewSkill(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }}
                      placeholder="Add skill..."
                      className="input py-2 text-sm flex-1"
                    />
                    <button type="button" onClick={addSkill} className="btn-ghost py-2 px-3 text-sm">
                      <Plus size={14} />
                    </button>
                  </div>
                </div>

                <div className="flex gap-2 pt-1">
                  <button onClick={() => setEditMode(false)} className="btn-ghost flex-1 justify-center text-sm py-2">
                    Cancel
                  </button>
                  <button onClick={handleUpdateProfile} className="btn-primary flex-1 justify-center text-sm py-2">
                    <Save size={13} /> Save
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ATS Score */}
          <ATSScore
            atsScore={candidate?.atsScore || 0}
            atsStatus={candidate?.atsStatus || 'pending'}
            atsBreakdown={candidate?.atsBreakdown || {}}
          />
        </div>

        {/* Right column: Scores */}
        <div className="xl:col-span-2 space-y-5">
          {/* Final Score */}
          <div className="glass p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm" style={{ color: 'var(--text3)' }}>Final Weighted Score</p>
                <p className="text-5xl font-display font-bold mt-1">
                  <span className="gradient-text">{candidate?.finalScore?.toFixed(1) || '0.0'}</span>
                  <span className="text-2xl" style={{ color: 'var(--text3)' }}>/100</span>
                </p>
              </div>
              <div className="relative w-20 h-20">
                <svg width="80" height="80" viewBox="0 0 80 80" className="-rotate-90">
                  <circle cx="40" cy="40" r="30" fill="none" stroke="var(--border)" strokeWidth="7" />
                  <motion.circle
                    cx="40" cy="40" r="30" fill="none"
                    stroke="var(--accent)" strokeWidth="7" strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 30}
                    initial={{ strokeDashoffset: 2 * Math.PI * 30 }}
                    animate={{ strokeDashoffset: 2 * Math.PI * 30 * (1 - (candidate?.finalScore || 0) / 100) }}
                    transition={{ duration: 1.2, ease: 'easeOut' }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Award size={20} style={{ color: 'var(--accent)' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Round Scores */}
          <div className="glass p-6">
            <h2 className="section-title mb-5">Round Scores</h2>
            {rounds.length === 0 ? (
              <p className="text-sm text-center py-4" style={{ color: 'var(--text3)' }}>
                No rounds configured for this drive
              </p>
            ) : (
              <div className="space-y-4">
                {rounds.map(round => {
                  const existingScore = candidate?.scores?.find(s => s.roundId === round._id);
                  const currentVal = scores[round._id] ?? existingScore?.score ?? '';
                  const pct = currentVal !== '' ? Math.min(100, (Number(currentVal) / round.maxScore) * 100) : 0;
                  const isBelowCutoff = currentVal !== '' && Number(currentVal) < round.cutoffScore;

                  return (
                    <div
                      key={round._id}
                      className="p-4 rounded-xl"
                      style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="font-medium text-sm" style={{ color: 'var(--text)' }}>
                            {round.name}
                          </p>
                          <p className="text-xs capitalize" style={{ color: 'var(--text3)' }}>
                            {round.type?.replace('_', ' ')} · {round.weightage}% weight
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="number" min="0" max={round.maxScore}
                            value={currentVal}
                            onChange={e => setScores({ ...scores, [round._id]: e.target.value })}
                            placeholder="—"
                            className="input w-20 text-center py-2 text-sm font-mono"
                            style={{ borderColor: isBelowCutoff ? '#ef4444' : undefined }}
                          />
                          <span className="text-sm" style={{ color: 'var(--text3)' }}>/{round.maxScore}</span>
                        </div>
                      </div>
                      <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                        <motion.div
                          className="h-full rounded-full"
                          style={{
                            background: isBelowCutoff
                              ? '#ef4444'
                              : 'linear-gradient(90deg, var(--accent), var(--accent2))',
                          }}
                          animate={{ width: pct + '%' }}
                          transition={{ duration: 0.4 }}
                        />
                      </div>
                      <div className="flex justify-between mt-1">
                        <span className="text-xs"
                          style={{ color: isBelowCutoff ? '#ef4444' : 'var(--text3)' }}>
                          {isBelowCutoff ? '⚠ Below cutoff' : 'Cutoff: ' + round.cutoffScore}
                        </span>
                        <span className="text-xs" style={{ color: 'var(--text3)' }}>
                          {pct.toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  );
                })}

                <button onClick={handleSaveScores} disabled={saving} className="btn-primary w-full justify-center mt-1">
                  {saving ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <><Save size={15} /> Save Scores & Update Rankings</>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Close status dropdown on outside click */}
      {statusOpen && (
        <div className="fixed inset-0 z-20" onClick={() => setStatusOpen(false)} />
      )}
    </div>
  );
}
