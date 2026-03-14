import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, UserPlus, Upload, Users, Search, Plus, X,
  FileSpreadsheet, Download, CheckCircle, AlertCircle, ChevronRight
} from 'lucide-react';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';
import api from '../utils/api';

const TABS = [
  { id: 'single',   label: 'Add Single',   icon: UserPlus },
  { id: 'import',   label: 'Bulk Import',  icon: FileSpreadsheet },
  { id: 'previous', label: 'Previous Candidates', icon: Users },
];

// ── Single form ──────────────────────────────────────────────────────────────
function SingleForm({ driveId, onSuccess }) {
  const [form, setForm] = useState({
    name: '', email: '', usn: '', phone: '', college: '', branch: '',
    graduationYear: new Date().getFullYear(), cgpa: '', experience: 0,
    skills: [], notes: '',
  });
  const [newSkill, setNewSkill] = useState('');
  const [loading, setLoading] = useState(false);

  const addSkill = () => {
    if (!newSkill.trim()) return;
    setForm(p => ({ ...p, skills: [...p.skills, newSkill.trim().toLowerCase()] }));
    setNewSkill('');
  };
  const removeSkill = (i) => setForm(p => ({ ...p, skills: p.skills.filter((_, j) => j !== i) }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email) return toast.error('Name and email required');
    setLoading(true);
    try {
      await api.post('/candidates', { ...form, drive: driveId });
      toast.success('Candidate added!');
      onSuccess();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[['name','Full Name *','Arjun Sharma'],['email','Email *','arjun@college.edu'],
          ['usn','USN *','1BM21CS001'],['phone','Phone','9876543210'],
          ['college','College *','BMS College of Engineering'],['branch','Branch *','Computer Science']].map(([field, label, ph]) => (
          <div key={field}>
            <label className="label">{label}</label>
            <input value={form[field]} onChange={e => setForm({ ...form, [field]: e.target.value })}
              placeholder={ph} className="input" />
          </div>
        ))}
        <div>
          <label className="label">Graduation Year</label>
          <input type="number" value={form.graduationYear} onChange={e => setForm({ ...form, graduationYear: Number(e.target.value) })} className="input" />
        </div>
        <div>
          <label className="label">CGPA</label>
          <input type="number" step="0.1" min="0" max="10" value={form.cgpa} onChange={e => setForm({ ...form, cgpa: e.target.value })} placeholder="8.5" className="input" />
        </div>
        <div>
          <label className="label">Experience (years)</label>
          <input type="number" min="0" value={form.experience} onChange={e => setForm({ ...form, experience: Number(e.target.value) })} className="input" />
        </div>
      </div>
      <div>
        <label className="label">Skills (for ATS scoring)</label>
        <div className="flex flex-wrap gap-1.5 mb-2">
          {form.skills.map((s, i) => (
            <span key={i} className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
              style={{ background: 'rgba(99,114,241,0.12)', color: 'var(--accent)', border: '1px solid rgba(99,114,241,0.2)' }}>
              {s} <button type="button" onClick={() => removeSkill(i)} className="hover:text-red-400"><X size={10} /></button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input value={newSkill} onChange={e => setNewSkill(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }}
            placeholder="python, java, react..." className="input flex-1" />
          <button type="button" onClick={addSkill} className="btn-ghost px-4"><Plus size={15} /></button>
        </div>
      </div>
      <div>
        <label className="label">Notes</label>
        <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Any remarks..." className="input resize-none h-16" />
      </div>
      <div className="flex gap-3 pt-1">
        <Link to={'/drives/' + driveId} className="btn-ghost flex-1 justify-center">Cancel</Link>
        <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center">
          {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><UserPlus size={15} /> Add Candidate</>}
        </button>
      </div>
    </form>
  );
}

// ── Bulk Import ──────────────────────────────────────────────────────────────
function BulkImport({ driveId, onSuccess }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState([]);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState(null);

  const handleFile = (f) => {
    if (!f) return;
    setFile(f);
    const reader = new FileReader();
    reader.onload = (e) => {
      const wb = XLSX.read(e.target.result, { type: 'binary' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(ws, { header: 1 });
      // Find header row (row 4 in our template = index 3)
      let headerRow = -1;
      for (let i = 0; i < Math.min(rows.length, 6); i++) {
        if (rows[i] && rows[i].some(c => String(c || '').includes('Name'))) { headerRow = i; break; }
      }
      if (headerRow === -1) { toast.error('Could not find header row. Use the provided template.'); return; }
      const headers = rows[headerRow].map(h => String(h || '').toLowerCase().replace(/[^a-z0-9]/g, '').replace('graduationyear', 'graduationYear').replace('experienceyears', 'experience').replace('usn', 'usn').replace('10th', 'tenth').replace('12th', 'twelfth'));
      const HEADER_MAP = {
        'name': 'name', 'email': 'email', 'usn': 'usn', 'phone': 'phone',
        'college': 'college', 'branch': 'branch', 'graduationyear': 'graduationYear',
        'cgpa': 'cgpa', 'experienceyears': 'experience', 'skills': 'skills',
        'gender': 'gender', '10th': 'tenth', '12th': 'twelfth', 'notes': 'notes',
      };
      // Map using original header text
      const rawHeaders = rows[headerRow].map(h => String(h || ''));
      const parsed = [];
      for (let i = headerRow + 2; i < rows.length; i++) { // skip example row
        const row = rows[i];
        if (!row || row.every(c => !c)) continue;
        const obj = {};
        rawHeaders.forEach((h, j) => {
          const clean = h.replace(' *', '').trim();
          const key = {
            'Name': 'name', 'Email': 'email', 'USN': 'usn', 'Phone': 'phone',
            'College': 'college', 'Branch': 'branch', 'Graduation Year': 'graduationYear',
            'CGPA': 'cgpa', 'Experience (Years)': 'experience', 'Skills': 'skills',
            'Gender': 'gender', '10th %': 'tenth', '12th %': 'twelfth', 'Notes': 'notes',
          }[clean];
          if (key && row[j] !== undefined && row[j] !== '') obj[key] = row[j];
        });
        if (obj.name || obj.email) parsed.push(obj);
      }
      setPreview(parsed.slice(0, 5));
      setFile({ file: f, rows: parsed });
    };
    reader.readAsBinaryString(f);
  };

  const doImport = async () => {
    if (!file?.rows?.length) return;
    setImporting(true);
    try {
      const { data } = await api.post('/candidates/bulk-import', { driveId, rows: file.rows });
      setResult(data);
      toast.success('Import complete: ' + data.added + ' added');
      if (data.added > 0) setTimeout(onSuccess, 1500);
    } catch (err) { toast.error(err.response?.data?.message || 'Import failed'); }
    setImporting(false);
  };

  const downloadTemplate = () => {
    const a = document.createElement('a');
    a.href = '/candidate_import_template.xlsx';
    a.download = 'SmartHire_Candidate_Import_Template.xlsx';
    a.click();
  };

  return (
    <div className="space-y-5">
      {/* Download template */}
      <div className="flex items-center justify-between p-4 rounded-xl"
        style={{ background: 'rgba(99,114,241,0.06)', border: '1px solid rgba(99,114,241,0.15)' }}>
        <div>
          <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Download Template First</p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text3)' }}>
            Fill the .xlsx template with student data including USN, then upload below
          </p>
        </div>
        <button onClick={downloadTemplate} className="btn-ghost flex items-center gap-2 text-sm shrink-0">
          <Download size={14} /> Template
        </button>
      </div>

      {/* File drop */}
      {!file ? (
        <div
          className="border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all"
          style={{ borderColor: 'var(--border)', background: 'transparent' }}
          onClick={() => document.getElementById('xlsx-input').click()}
          onDrop={e => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); }}
          onDragOver={e => e.preventDefault()}
        >
          <FileSpreadsheet size={36} className="mx-auto mb-3 opacity-40" style={{ color: '#10b981' }} />
          <p className="font-semibold text-sm" style={{ color: 'var(--text2)' }}>Drop .xlsx file or click to browse</p>
          <p className="text-xs mt-1" style={{ color: 'var(--text3)' }}>Supports the SmartHire template format · Max 500 rows</p>
          <input id="xlsx-input" type="file" accept=".xlsx,.xls" className="hidden"
            onChange={e => handleFile(e.target.files[0])} />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-4 p-4 rounded-xl"
            style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}>
            <FileSpreadsheet size={20} style={{ color: '#10b981' }} />
            <div className="flex-1">
              <p className="font-semibold text-sm" style={{ color: 'var(--text)' }}>
                {file.file?.name || 'file.xlsx'}
              </p>
              <p className="text-xs" style={{ color: 'var(--text3)' }}>{file.rows?.length} rows detected</p>
            </div>
            <button onClick={() => { setFile(null); setPreview([]); setResult(null); }}
              className="hover:text-red-400 transition-colors" style={{ color: 'var(--text3)' }}>
              <X size={16} />
            </button>
          </div>

          {/* Preview */}
          {preview.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: 'var(--text3)' }}>
                Preview (first 5 rows)
              </p>
              <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
                <table className="w-full text-xs">
                  <thead>
                    <tr style={{ background: 'var(--card)' }}>
                      {['Name', 'Email', 'USN', 'College', 'Branch'].map(h => (
                        <th key={h} className="px-3 py-2 text-left font-semibold uppercase tracking-wide"
                          style={{ color: 'var(--text3)', borderBottom: '1px solid var(--border)' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {preview.map((row, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                        {['name', 'email', 'usn', 'college', 'branch'].map(k => (
                          <td key={k} className="px-3 py-2 truncate max-w-xs" style={{ color: 'var(--text2)' }}>
                            {row[k] || '—'}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Result */}
          {result && (
            <div className="p-4 rounded-xl space-y-1"
              style={{ background: result.added > 0 ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)', border: '1px solid ' + (result.added > 0 ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)') }}>
              <p className="font-semibold text-sm" style={{ color: result.added > 0 ? '#10b981' : '#ef4444' }}>
                Import Complete
              </p>
              <p className="text-xs" style={{ color: 'var(--text2)' }}>
                ✓ Added: {result.added} · ⟳ Skipped (duplicates): {result.skipped}
                {result.errors?.length > 0 && ' · ⚠ Errors: ' + result.errors.length}
              </p>
            </div>
          )}

          {!result && (
            <button onClick={doImport} disabled={importing} className="btn-primary w-full justify-center">
              {importing
                ? <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Importing...</>
                : <><Upload size={15} /> Import {file.rows?.length} Candidates</>}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ── Previous Candidates ──────────────────────────────────────────────────────
function PreviousCandidates({ driveId, onSuccess }) {
  const [search, setSearch] = useState('');
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(new Set());
  const [adding, setAdding] = useState(false);

  const doSearch = useCallback(async () => {
    if (!search.trim()) return;
    setLoading(true);
    try {
      const { data } = await api.get('/candidates?search=' + encodeURIComponent(search) + '&limit=30');
      // Filter out ones already in this drive
      const filtered = data.candidates.filter(c => c.drive?._id !== driveId && String(c.drive) !== driveId);
      setCandidates(filtered);
    } catch { toast.error('Search failed'); }
    setLoading(false);
  }, [search, driveId]);

  const toggle = (id) => setSelected(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const addSelected = async () => {
    if (!selected.size) return;
    setAdding(true);
    let added = 0;
    for (const id of selected) {
      const c = candidates.find(x => x._id === id);
      if (!c) continue;
      try {
        await api.post('/candidates', {
          name: c.name, email: c.email, phone: c.phone, college: c.college,
          branch: c.branch, cgpa: c.cgpa, experience: c.experience,
          skills: c.skills, usn: c.usn, graduationYear: c.graduationYear,
          drive: driveId,
        });
        added++;
      } catch {}
    }
    toast.success(added + ' candidates added to this drive');
    setAdding(false);
    onSuccess();
  };

  return (
    <div className="space-y-4">
      <p className="text-sm" style={{ color: 'var(--text3)' }}>
        Search for candidates who participated in previous drives and add them to this drive.
      </p>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--text3)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && doSearch()}
            placeholder="Search by name, email or college..." className="input pl-11" />
        </div>
        <button onClick={doSearch} disabled={loading} className="btn-primary px-5">
          {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Search'}
        </button>
      </div>

      {candidates.length > 0 && (
        <>
          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {candidates.map(c => (
              <div key={c._id}
                onClick={() => toggle(c._id)}
                className="flex items-center gap-4 p-3.5 rounded-xl cursor-pointer transition-all"
                style={{
                  background: selected.has(c._id) ? 'rgba(99,114,241,0.1)' : 'var(--card)',
                  border: '1px solid ' + (selected.has(c._id) ? 'rgba(99,114,241,0.3)' : 'var(--border)'),
                }}>
                <div className="w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-all"
                  style={{ borderColor: selected.has(c._id) ? 'var(--accent)' : 'var(--border)', background: selected.has(c._id) ? 'var(--accent)' : 'transparent' }}>
                  {selected.has(c._id) && <CheckCircle size={10} className="text-white" />}
                </div>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white shrink-0"
                  style={{ background: 'linear-gradient(135deg,var(--accent),var(--accent2))' }}>
                  {c.name?.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm" style={{ color: 'var(--text)' }}>{c.name}</p>
                  <p className="text-xs" style={{ color: 'var(--text3)' }}>
                    {c.email} {c.usn ? '· ' + c.usn : ''} · {c.drive?.name || 'Previous drive'}
                  </p>
                </div>
                {c.atsScore > 0 && (
                  <span className="text-xs font-mono font-bold shrink-0"
                    style={{ color: c.atsScore >= 75 ? '#10b981' : c.atsScore >= 50 ? '#f59e0b' : '#ef4444' }}>
                    ATS {c.atsScore}
                  </span>
                )}
              </div>
            ))}
          </div>

          {selected.size > 0 && (
            <button onClick={addSelected} disabled={adding} className="btn-primary w-full justify-center">
              {adding
                ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <><UserPlus size={15} /> Add {selected.size} selected candidate{selected.size > 1 ? 's' : ''}</>}
            </button>
          )}
        </>
      )}
    </div>
  );
}

// ── Main page ────────────────────────────────────────────────────────────────
export default function AddCandidates() {
  const { driveId } = useParams();
  const navigate = useNavigate();
  const [tab, setTab] = useState('single');
  const [drive, setDrive] = useState(null);

  useEffect(() => {
    api.get('/drives/' + driveId).then(({ data }) => setDrive(data.drive)).catch(() => {});
  }, [driveId]);

  const onSuccess = () => navigate('/drives/' + driveId);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/drives/' + driveId)} className="btn-ghost py-2 px-3">
          <ArrowLeft size={15} />
        </button>
        <div>
          <h1 className="page-title">Add Candidates</h1>
          {drive && <p className="text-sm mt-0.5" style={{ color: 'var(--text3)' }}>to {drive.name}</p>}
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
        {TABS.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setTab(id)}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-semibold transition-all"
            style={{
              background: tab === id ? 'var(--accent)' : 'transparent',
              color: tab === id ? 'white' : 'var(--text3)',
            }}>
            <Icon size={15} />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      <div className="glass p-6">
        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}>
            {tab === 'single'   && <SingleForm driveId={driveId} onSuccess={onSuccess} />}
            {tab === 'import'   && <BulkImport driveId={driveId} onSuccess={onSuccess} />}
            {tab === 'previous' && <PreviousCandidates driveId={driveId} onSuccess={onSuccess} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
