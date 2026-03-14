import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, Brain, FileText, CheckCircle, AlertCircle, XCircle,
  ChevronDown, Zap, Target, BookOpen, Star, ArrowRight, X, RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../utils/api';

const statusConfig = {
  shortlisted: { label: 'Shortlisted ✓', color: '#10b981', bg: 'rgba(16,185,129,0.12)', icon: CheckCircle, msg: 'Strong match — candidate recommended for interview rounds' },
  review: { label: 'Under Review', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', icon: AlertCircle, msg: 'Partial match — requires manual review before proceeding' },
  rejected: { label: 'Not Suitable', color: '#ef4444', bg: 'rgba(239,68,68,0.12)', icon: XCircle, msg: 'Weak match — consider for other roles or reject' },
};

const breakdownItems = [
  { key: 'skillMatch', label: 'Skill Match', weight: '40%', color: '#6272f1' },
  { key: 'experienceMatch', label: 'Experience Match', weight: '30%', color: '#22d3ee' },
  { key: 'educationMatch', label: 'Education Match', weight: '15%', color: '#f59e0b' },
  { key: 'keywordRelevance', label: 'Keyword Relevance', weight: '15%', color: '#10b981' },
];

function ScoreRing({ score, color }) {
  const r = 52, circ = 2 * Math.PI * r;
  return (
    <div className="relative w-36 h-36 mx-auto">
      <svg width="144" height="144" viewBox="0 0 144 144" className="-rotate-90">
        <circle cx="72" cy="72" r={r} fill="none" stroke="var(--border)" strokeWidth="10" />
        <motion.circle cx="72" cy="72" r={r} fill="none" stroke={color} strokeWidth="10"
          strokeLinecap="round" strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ - (score / 100) * circ }}
          transition={{ duration: 1.4, ease: 'easeOut', delay: 0.3 }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
          className="text-4xl font-display font-bold" style={{ color }}>{score}</motion.span>
        <span className="text-sm" style={{ color: 'var(--text3)' }}>/100</span>
      </div>
    </div>
  );
}

export default function ATSChecker() {
  const [drives, setDrives] = useState([]);
  const [selectedDrive, setSelectedDrive] = useState('');
  const [driveOpen, setDriveOpen] = useState(false);
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState('');
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    api.get('/drives?status=active&limit=50').then(({ data }) => setDrives(data.drives || []));
  }, []);

  useEffect(() => {
    if (!selectedDrive) { setCandidates([]); return; }
    api.get(`/candidates?drive=${selectedDrive}&limit=100`).then(({ data }) => setCandidates(data.candidates || []));
  }, [selectedDrive]);

  const onDrop = useCallback((e) => {
    e.preventDefault(); setDragging(false);
    const f = e.dataTransfer?.files[0] || e.target.files?.[0];
    if (!f) return;
    if (!['application/pdf', 'text/plain'].includes(f.type)) return toast.error('Only PDF or TXT files');
    if (f.size > 5 * 1024 * 1024) return toast.error('File must be under 5MB');
    setFile(f); setResult(null);
  }, []);

  const analyze = async () => {
    if (!file) return toast.error('Please upload a resume first');
    setLoading(true);
    const fd = new FormData();
    fd.append('resume', file);
    if (selectedDrive) fd.append('driveId', selectedDrive);
    if (selectedCandidate) fd.append('candidateId', selectedCandidate);
    try {
      const { data } = await api.post('/ats/analyze', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResult(data);
      if (selectedCandidate) toast.success('ATS score saved to candidate profile!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Analysis failed');
    }
    setLoading(false);
  };

  const reset = () => { setFile(null); setResult(null); };

  const sc = result ? statusConfig[result.atsStatus] || statusConfig.review : null;
  const scoreColor = result ? (result.atsScore >= 75 ? '#10b981' : result.atsScore >= 50 ? '#f59e0b' : '#ef4444') : '#6272f1';

  const selectedDriveName = drives.find(d => d._id === selectedDrive)?.name || '';

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="page-title flex items-center gap-3">
          <Brain size={26} style={{ color: 'var(--accent)' }} /> ATS Resume Checker
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text3)' }}>
          Upload a resume (PDF or TXT) for AI-powered ATS scoring against drive requirements
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Left: upload + config */}
        <div className="space-y-4">
          {/* Drive selector */}
          <div className="glass p-5">
            <label className="label">Target Drive (optional but recommended)</label>
            <div className="relative">
              <button onClick={() => setDriveOpen(!driveOpen)}
                className="w-full flex items-center justify-between input py-3 text-left"
                style={{ borderColor: driveOpen ? 'var(--accent)' : 'var(--border)' }}>
                <span style={{ color: selectedDrive ? 'var(--text)' : 'var(--text3)' }}>
                  {selectedDriveName || 'Select a drive for requirement matching...'}
                </span>
                <ChevronDown size={15} style={{ color: 'var(--text3)', transform: driveOpen ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
              </button>
              <AnimatePresence>
                {driveOpen && (
                  <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                    className="absolute top-full left-0 right-0 mt-1 rounded-xl overflow-hidden z-20 shadow-2xl"
                    style={{ background: 'var(--bg2)', border: '1px solid var(--border)', maxHeight: 240, overflowY: 'auto' }}>
                    <button onClick={() => { setSelectedDrive(''); setDriveOpen(false); }}
                      className="w-full px-4 py-3 text-left text-sm transition-colors"
                      style={{ color: 'var(--text3)', borderBottom: '1px solid var(--border)' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(99,114,241,0.05)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      No specific drive (general scoring)
                    </button>
                    {drives.map(d => (
                      <button key={d._id} onClick={() => { setSelectedDrive(d._id); setDriveOpen(false); }}
                        className="w-full px-4 py-3 text-left text-sm transition-colors"
                        style={{
                          background: selectedDrive === d._id ? 'rgba(99,114,241,0.1)' : 'transparent',
                          borderBottom: '1px solid var(--border)',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(99,114,241,0.08)'}
                        onMouseLeave={e => e.currentTarget.style.background = selectedDrive === d._id ? 'rgba(99,114,241,0.1)' : 'transparent'}
                      >
                        <p className="font-medium" style={{ color: 'var(--text)' }}>{d.name}</p>
                        {d.requiredSkills?.length > 0 && (
                          <p className="text-xs mt-0.5" style={{ color: 'var(--text3)' }}>
                            Skills: {d.requiredSkills.slice(0, 3).join(', ')}{d.requiredSkills.length > 3 ? '...' : ''}
                          </p>
                        )}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Candidate linker */}
            {selectedDrive && candidates.length > 0 && (
              <div className="mt-3">
                <label className="label">Link to Candidate (auto-saves ATS score)</label>
                <select value={selectedCandidate} onChange={e => setSelectedCandidate(e.target.value)} className="input">
                  <option value="">Don't link to a candidate</option>
                  {candidates.map(c => <option key={c._id} value={c._id}>{c.name} — {c.email}</option>)}
                </select>
              </div>
            )}
          </div>

          {/* File upload */}
          <div className="glass p-5">
            <label className="label">Resume File (PDF or TXT, max 5MB)</label>
            {!file ? (
              <div
                onDrop={onDrop} onDragOver={e => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                className="border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all"
                style={{ borderColor: dragging ? 'var(--accent)' : 'var(--border)', background: dragging ? 'rgba(99,114,241,0.06)' : 'transparent' }}
                onClick={() => document.getElementById('resume-input').click()}
              >
                <Upload size={36} className="mx-auto mb-3" style={{ color: dragging ? 'var(--accent)' : 'var(--text3)', opacity: 0.6 }} />
                <p className="font-semibold text-sm" style={{ color: 'var(--text2)' }}>
                  {dragging ? 'Drop it!' : 'Drag & drop resume or click to browse'}
                </p>
                <p className="text-xs mt-1" style={{ color: 'var(--text3)' }}>PDF or TXT · Max 5MB</p>
                <input id="resume-input" type="file" accept=".pdf,.txt" className="hidden" onChange={onDrop} />
              </div>
            ) : (
              <div className="flex items-center gap-4 p-4 rounded-xl"
                style={{ background: 'rgba(99,114,241,0.08)', border: '1px solid rgba(99,114,241,0.2)' }}>
                <div className="w-11 h-11 rounded-xl flex items-center justify-center"
                  style={{ background: 'rgba(99,114,241,0.15)' }}>
                  <FileText size={20} style={{ color: 'var(--accent)' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate" style={{ color: 'var(--text)' }}>{file.name}</p>
                  <p className="text-xs" style={{ color: 'var(--text3)' }}>{(file.size / 1024).toFixed(1)} KB · {file.type}</p>
                </div>
                <button onClick={() => { setFile(null); setResult(null); }}
                  className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                  style={{ color: 'var(--text3)' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--text3)'}>
                  <X size={15} />
                </button>
              </div>
            )}
          </div>

          <button onClick={analyze} disabled={!file || loading}
            className="btn-primary w-full justify-center py-3.5 text-base">
            {loading
              ? <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Analyzing Resume...</>
              : <><Zap size={18} /> Analyze with ATS</>}
          </button>
        </div>

        {/* Right: results */}
        <div>
          {!result ? (
            <div className="glass p-10 flex flex-col items-center justify-center text-center h-full min-h-80">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 opacity-40"
                style={{ background: 'rgba(99,114,241,0.1)' }}>
                <Brain size={32} style={{ color: 'var(--accent)' }} />
              </div>
              <p className="section-title mb-2">Results appear here</p>
              <p className="text-sm" style={{ color: 'var(--text3)' }}>
                Upload a resume and click Analyze to see the ATS score, skill breakdown, and recommendation.
              </p>
            </div>
          ) : (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              {/* Score card */}
              <div className="glass p-6 text-center">
                {result.driveContext && (
                  <p className="text-xs mb-3 px-3 py-1 rounded-full inline-block" style={{ background: 'rgba(99,114,241,0.1)', color: 'var(--accent)' }}>
                    Scored against: {result.driveContext.name}
                  </p>
                )}
                <ScoreRing score={result.atsScore} color={scoreColor} />
                <div className="mt-4 flex items-center justify-center gap-3">
                  <div className="flex items-center gap-2 px-4 py-2 rounded-xl"
                    style={{ background: sc.bg, border: `1px solid ${sc.color}30` }}>
                    <sc.icon size={16} style={{ color: sc.color }} />
                    <span className="font-semibold text-sm" style={{ color: sc.color }}>{sc.label}</span>
                  </div>
                </div>
                <p className="text-sm mt-3 max-w-xs mx-auto" style={{ color: 'var(--text3)' }}>{sc.msg}</p>
              </div>

              {/* Breakdown */}
              <div className="glass p-5 space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text3)' }}>Score Breakdown</p>
                {breakdownItems.map(({ key, label, weight, color }) => {
                  const val = result.breakdown?.[key] ?? 0;
                  return (
                    <div key={key}>
                      <div className="flex justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full" style={{ background: color }} />
                          <span className="text-sm" style={{ color: 'var(--text2)' }}>{label}</span>
                          <span className="text-xs" style={{ color: 'var(--text3)' }}>({weight})</span>
                        </div>
                        <span className="text-sm font-bold" style={{ color: 'var(--text)' }}>{val}%</span>
                      </div>
                      <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                        <motion.div className="h-full rounded-full" style={{ background: color }}
                          initial={{ width: 0 }} animate={{ width: `${val}%` }} transition={{ duration: 0.9, ease: 'easeOut', delay: 0.2 }} />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Details */}
              <div className="glass p-5 space-y-4">
                <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text3)' }}>Parsed Details</p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Experience', value: `${result.experience || 0} year${result.experience !== 1 ? 's' : ''}`, icon: Star },
                    { label: 'Education', value: result.educationLevel || 'Not detected', icon: BookOpen },
                    { label: 'CGPA', value: result.cgpa ? result.cgpa.toFixed(1) : '—', icon: Target },
                    { label: 'Resume Length', value: `${result.resumeWordCount || 0} words`, icon: FileText },
                  ].map(({ label, value, icon: Icon }) => (
                    <div key={label} className="flex items-center gap-2 p-3 rounded-lg"
                      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)' }}>
                      <Icon size={14} style={{ color: 'var(--accent)' }} />
                      <div>
                        <p className="text-xs" style={{ color: 'var(--text3)' }}>{label}</p>
                        <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{value}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Detected skills */}
                {result.extractedSkills?.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold mb-2" style={{ color: 'var(--text3)' }}>Detected Skills ({result.extractedSkills.length})</p>
                    <div className="flex flex-wrap gap-1.5">
                      {result.extractedSkills.map(skill => {
                        const isMatch = result.matchedSkills?.includes(skill);
                        return (
                          <span key={skill} className="px-2 py-0.5 rounded-full text-xs font-medium capitalize"
                            style={{
                              background: isMatch ? 'rgba(16,185,129,0.12)' : 'rgba(99,114,241,0.08)',
                              color: isMatch ? '#10b981' : 'var(--accent)',
                              border: `1px solid ${isMatch ? 'rgba(16,185,129,0.25)' : 'rgba(99,114,241,0.2)'}`,
                            }}>
                            {isMatch ? '✓ ' : ''}{skill}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Missing skills */}
                {result.missingSkills?.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold mb-2" style={{ color: '#ef4444' }}>Missing Required Skills ({result.missingSkills.length})</p>
                    <div className="flex flex-wrap gap-1.5">
                      {result.missingSkills.map(skill => (
                        <span key={skill} className="px-2 py-0.5 rounded-full text-xs font-medium capitalize"
                          style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}>
                          ✗ {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <button onClick={reset} className="btn-ghost w-full justify-center text-sm">
                <RefreshCw size={14} /> Analyze Another Resume
              </button>
            </motion.div>
          )}
        </div>
      </div>

      {driveOpen && <div className="fixed inset-0 z-10" onClick={() => setDriveOpen(false)} />}
    </div>
  );
}
