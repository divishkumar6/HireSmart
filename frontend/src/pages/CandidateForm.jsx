import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, UserPlus, X, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../utils/api';

export default function CandidateForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newSkill, setNewSkill] = useState('');
  const [form, setForm] = useState({
    name: '', email: '', phone: '', college: '', branch: '',
    graduationYear: new Date().getFullYear(), cgpa: '',
    experience: 0, skills: [],
    drive: searchParams.get('drive') || '', notes: '',
  });

  useEffect(() => {
    api.get('/drives?status=active&limit=50').then(({ data }) => setDrives(data.drives));
  }, []);

  const addSkill = () => {
    if (!newSkill.trim()) return;
    setForm(prev => ({ ...prev, skills: [...prev.skills, newSkill.trim().toLowerCase()] }));
    setNewSkill('');
  };

  const removeSkill = (idx) => setForm(prev => ({ ...prev, skills: prev.skills.filter((_, i) => i !== idx) }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.drive) { toast.error('Name, email and drive are required'); return; }
    setLoading(true);
    try {
      await api.post('/candidates', form);
      toast.success('Candidate added!');
      navigate(form.drive ? `/drives/${form.drive}` : '/candidates');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to add candidate'); }
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="btn-ghost py-2 px-3"><ArrowLeft size={15} /></button>
        <div>
          <h1 className="page-title">Add Candidate</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text3)' }}>Register a new candidate to a drive</p>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="glass p-8 space-y-5">
        <div>
          <label className="label">Drive *</label>
          <select value={form.drive} onChange={(e) => setForm({ ...form, drive: e.target.value })} className="input">
            <option value="">Select a drive...</option>
            {drives.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Full Name *</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Arjun Sharma" className="input" />
          </div>
          <div>
            <label className="label">Email *</label>
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="arjun@college.edu" className="input" />
          </div>
          <div>
            <label className="label">Phone</label>
            <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="9876543210" className="input" />
          </div>
          <div>
            <label className="label">College</label>
            <input value={form.college} onChange={(e) => setForm({ ...form, college: e.target.value })} placeholder="IIT Delhi" className="input" />
          </div>
          <div>
            <label className="label">Branch</label>
            <input value={form.branch} onChange={(e) => setForm({ ...form, branch: e.target.value })} placeholder="Computer Science" className="input" />
          </div>
          <div>
            <label className="label">Graduation Year</label>
            <input type="number" value={form.graduationYear} onChange={(e) => setForm({ ...form, graduationYear: Number(e.target.value) })} className="input" />
          </div>
          <div>
            <label className="label">CGPA</label>
            <input type="number" step="0.1" min="0" max="10" value={form.cgpa} onChange={(e) => setForm({ ...form, cgpa: e.target.value })} placeholder="8.5" className="input" />
          </div>
          <div>
            <label className="label">Experience (years)</label>
            <input type="number" min="0" value={form.experience} onChange={(e) => setForm({ ...form, experience: Number(e.target.value) })} placeholder="0" className="input" />
          </div>
        </div>
        {/* Skills */}
        <div>
          <label className="label">Skills (for ATS scoring)</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {form.skills.map((skill, idx) => (
              <span key={idx} className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium"
                style={{ background: 'rgba(99,114,241,0.12)', color: 'var(--accent)', border: '1px solid rgba(99,114,241,0.2)' }}>
                {skill}
                <button type="button" onClick={() => removeSkill(idx)} className="hover:text-red-400 transition-colors"><X size={11} /></button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input value={newSkill} onChange={(e) => setNewSkill(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
              placeholder="e.g. python, react, java..." className="input flex-1" />
            <button type="button" onClick={addSkill} className="btn-ghost px-4"><Plus size={15} /></button>
          </div>
          <p className="text-xs mt-1.5" style={{ color: 'var(--text3)' }}>Press Enter or click + to add. Skills are used for ATS scoring.</p>
        </div>
        <div>
          <label className="label">Notes</label>
          <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Any additional notes..." className="input resize-none h-20" />
        </div>
        <div className="flex gap-3 pt-1">
          <button type="button" onClick={() => navigate(-1)} className="btn-ghost flex-1 justify-center">Cancel</button>
          <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center">
            {loading
              ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : <><UserPlus size={15} /> Add Candidate</>}
          </button>
        </div>
      </form>
    </div>
  );
}
