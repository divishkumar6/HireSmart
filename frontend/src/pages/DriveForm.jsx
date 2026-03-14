import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Trash2, ArrowLeft, Save, AlertCircle, Image, Tag, X } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../utils/api';

const roundTypes = ['aptitude', 'technical', 'coding', 'hr', 'group_discussion', 'other'];

const emptyRound = () => ({
  id: Date.now(),
  name: '',
  type: 'technical',
  weightage: '',
  maxScore: 100,
  cutoffScore: 60,
  order: 0,
});

export default function DriveForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState({
    name: '',
    description: '',
    company: '',
    jobRole: '',
    companyLogo: '',
    status: 'draft',
    selectionThreshold: 75,
    waitlistThreshold: 60,
    requiredSkills: [],
    requiredExperience: 0,
    offerPackage: '',
    offerDetails: { probationPeriod: '6 months', workMode: 'Hybrid', workLocation: '', benefits: [] },
    rounds: [{ ...emptyRound(), name: 'Aptitude Test', type: 'aptitude', weightage: 25 }],
  });
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(isEdit);

  useEffect(() => {
    if (isEdit) {
      api.get(`/drives/${id}`).then(({ data }) => {
        const d = data.drive;
        setForm({
          ...d,
          rounds: d.rounds.map((r) => ({ ...r, id: r._id || Date.now() })),
        });
        setFetchLoading(false);
      }).catch(() => {
        toast.error('Drive not found');
        navigate('/drives');
      });
    }
  }, [id]);

  const totalWeightage = form.rounds.reduce((s, r) => s + Number(r.weightage || 0), 0);

  const addRound = () => {
    setForm({ ...form, rounds: [...form.rounds, { ...emptyRound(), order: form.rounds.length }] });
  };

  const removeRound = (idx) => {
    setForm({ ...form, rounds: form.rounds.filter((_, i) => i !== idx) });
  };

  const updateRound = (idx, field, value) => {
    const rounds = [...form.rounds];
    rounds[idx] = { ...rounds[idx], [field]: value };
    setForm({ ...form, rounds });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name) return toast.error('Drive name is required');
    if (form.rounds.length > 0 && Math.round(totalWeightage) !== 100) {
      return toast.error('Total round weightage must equal 100%');
    }

    setLoading(true);
    try {
      const payload = { ...form };
      delete payload.id;
      payload.rounds = payload.rounds.map(({ id: _, ...r }) => r);

      if (isEdit) {
        await api.put(`/drives/${id}`, payload);
        toast.success('Drive updated!');
      } else {
        await api.post('/drives', payload);
        toast.success('Drive created!');
      }
      navigate('/drives');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save drive');
    }
    setLoading(false);
  };

  if (fetchLoading) {
    return <div className="flex justify-center py-16"><div className="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/drives')} className="btn-ghost py-2 px-3">
          <ArrowLeft size={16} />
        </button>
        <div>
          <h1 className="page-title">{isEdit ? 'Edit Drive' : 'Create Drive'}</h1>
          <p className="text-[var(--text3)] mt-0.5">Configure your recruitment drive</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="glass p-6 space-y-4">
          <h2 className="section-title">Basic Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="label">Drive Name *</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g., Software Engineer 2024" className="input" />
            </div>
            <div>
              <label className="label">Company</label>
              <input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} placeholder="Company name" className="input" />
            </div>
            <div>
              <label className="label">Job Role</label>
              <input value={form.jobRole} onChange={(e) => setForm({ ...form, jobRole: e.target.value })} placeholder="e.g., Backend Engineer" className="input" />
            </div>
            <div>
              <label className="label">Company Logo URL (optional)</label>
              <input value={form.companyLogo} onChange={(e) => setForm({ ...form, companyLogo: e.target.value })} placeholder="https://company.com/logo.png" className="input" />
              {form.companyLogo && (
                <div className="mt-2 flex items-center gap-2">
                  <img src={form.companyLogo} alt="Logo preview" className="w-8 h-8 object-contain rounded"
                    onError={e => { e.target.style.display='none'; }} />
                  <span className="text-xs" style={{ color: 'var(--text3)' }}>Logo preview</span>
                </div>
              )}
            </div>
            <div>
              <label className="label">Offer Package (CTC)</label>
              <input value={form.offerPackage} onChange={(e) => setForm({ ...form, offerPackage: e.target.value })} placeholder="e.g. 8 LPA or ₹8,00,000 p.a." className="input" />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Description</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Drive description..." className="input resize-none h-24" />
            </div>
            <div>
              <label className="label">Status</label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="input">
                {['draft', 'active', 'completed', 'archived'].map((s) => (
                  <option key={s} value={s} className="bg-surface-900">{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Thresholds */}
        <div className="glass p-6 space-y-4">
          <h2 className="section-title">Score Thresholds</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Selection Threshold (%)</label>
              <input type="number" min="0" max="100" value={form.selectionThreshold} onChange={(e) => setForm({ ...form, selectionThreshold: Number(e.target.value) })} className="input" />
              <p className="text-xs text-[var(--text3)] mt-1">Candidates above this score get selected</p>
            </div>
            <div>
              <label className="label">Waitlist Threshold (%)</label>
              <input type="number" min="0" max="100" value={form.waitlistThreshold} onChange={(e) => setForm({ ...form, waitlistThreshold: Number(e.target.value) })} className="input" />
              <p className="text-xs text-[var(--text3)] mt-1">Candidates above this get waitlisted</p>
            </div>
          </div>
        </div>

        {/* Offer Letter Details */}
        <div className="glass p-6 space-y-4">
          <h2 className="section-title">Offer Letter Details</h2>
          <p className="text-xs" style={{ color: 'var(--text3)' }}>Used when generating offer letters for selected candidates</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Work Location</label>
              <input value={form.offerDetails?.workLocation || ''} onChange={(e) => setForm({ ...form, offerDetails: { ...form.offerDetails, workLocation: e.target.value } })} placeholder="Bangalore, Karnataka" className="input" />
            </div>
            <div>
              <label className="label">Work Mode</label>
              <select value={form.offerDetails?.workMode || 'Hybrid'} onChange={(e) => setForm({ ...form, offerDetails: { ...form.offerDetails, workMode: e.target.value } })} className="input">
                {['Hybrid', 'Work From Office', 'Remote'].map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Probation Period</label>
              <input value={form.offerDetails?.probationPeriod || '6 months'} onChange={(e) => setForm({ ...form, offerDetails: { ...form.offerDetails, probationPeriod: e.target.value } })} placeholder="6 months" className="input" />
            </div>
          </div>
        </div>

        {/* Rounds */}
        <div className="glass p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="section-title">Evaluation Rounds</h2>
              <p className="text-xs text-[var(--text3)] mt-0.5">Total weightage must equal 100%</p>
            </div>
            <div className="flex items-center gap-3">
              <div className={`px-3 py-1 rounded-lg text-sm font-mono font-bold ${Math.round(totalWeightage) === 100 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                {totalWeightage.toFixed(0)}%
              </div>
              <button type="button" onClick={addRound} className="btn-ghost py-2 text-sm">
                <Plus size={14} /> Add Round
              </button>
            </div>
          </div>

          {Math.round(totalWeightage) !== 100 && form.rounds.length > 0 && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm">
              <AlertCircle size={16} />
              Weightages must total 100%. Currently: {totalWeightage.toFixed(0)}%
            </div>
          )}

          <div className="space-y-3">
            {form.rounds.map((round, idx) => (
              <motion.div
                key={round.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-xl bg-[var(--card)] border border-white/10"
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-6 h-6 rounded-full #4a5de3/30 var(--accent) text-xs flex items-center justify-center font-bold">
                    {idx + 1}
                  </span>
                  <input
                    value={round.name}
                    onChange={(e) => updateRound(idx, 'name', e.target.value)}
                    placeholder="Round name (e.g., Aptitude Test)"
                    className="input flex-1 py-2"
                  />
                  <button type="button" onClick={() => removeRound(idx)} className="w-8 h-8 rounded-lg bg-red-500/10 hover:bg-red-500/20 flex items-center justify-center text-red-400 shrink-0">
                    <Trash2 size={14} />
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="label text-xs">Type</label>
                    <select value={round.type} onChange={(e) => updateRound(idx, 'type', e.target.value)} className="input py-2 text-sm">
                      {roundTypes.map((t) => <option key={t} value={t} className="bg-surface-900">{t.replace('_', ' ')}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="label text-xs">Weightage (%)</label>
                    <input type="number" min="1" max="100" value={round.weightage} onChange={(e) => updateRound(idx, 'weightage', e.target.value)} className="input py-2 text-sm" />
                  </div>
                  <div>
                    <label className="label text-xs">Max Score</label>
                    <input type="number" min="1" value={round.maxScore} onChange={(e) => updateRound(idx, 'maxScore', Number(e.target.value))} className="input py-2 text-sm" />
                  </div>
                  <div>
                    <label className="label text-xs">Cutoff Score</label>
                    <input type="number" min="0" value={round.cutoffScore} onChange={(e) => updateRound(idx, 'cutoffScore', Number(e.target.value))} className="input py-2 text-sm" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Submit */}
        <div className="flex gap-3">
          <button type="button" onClick={() => navigate('/drives')} className="btn-ghost flex-1 justify-center">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center">
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <><Save size={16} /> {isEdit ? 'Update Drive' : 'Create Drive'}</>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
