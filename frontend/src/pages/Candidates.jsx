import { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Users, ArrowRight, Trash2, GraduationCap, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../utils/api';
import StatusBadge from '../components/ui/StatusBadge';

export default function Candidates() {
  const [sp] = useSearchParams();
  const [candidates, setCandidates] = useState([]);
  const [drives, setDrives]         = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [status, setStatus]         = useState('');
  const [drive, setDrive]           = useState(sp.get('drive') || '');
  const [page, setPage]             = useState(1);
  const [total, setTotal]           = useState(0);
  const [totalPages, setTP]         = useState(1);

  useEffect(() => { api.get('/drives?limit=50').then(({ data }) => setDrives(data.drives||[])); }, []);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const p = new URLSearchParams({ page, limit:15 });
      if (search) p.append('search', search);
      if (status) p.append('status', status);
      if (drive)  p.append('drive', drive);
      const { data } = await api.get('/candidates?' + p);
      setCandidates(data.candidates||[]);
      setTP(data.totalPages||1);
      setTotal(data.total||data.candidates?.length||0);
    } catch { toast.error('Failed to load'); }
    setLoading(false);
  }, [page, search, status, drive]);

  useEffect(() => { fetch(); }, [fetch]);

  const del = async (id, name) => {
    if (!confirm('Remove ' + name + '?')) return;
    try { await api.delete('/candidates/' + id); toast.success('Removed'); fetch(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="title">Candidates</h1>
          <p className="subtitle">{total} total</p>
        </div>
        <button onClick={fetch} className="btn btn-ghost" style={{ fontSize:12 }}>
          <RefreshCw size={12} /> Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <div style={{ position:'relative', flex:1, minWidth:200 }}>
          <Search size={13} style={{ position:'absolute', left:11, top:'50%', transform:'translateY(-50%)', color:'var(--text3)' }} />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Name, email or college…" className="input" style={{ paddingLeft:34, fontSize:13 }} />
        </div>
        <select value={drive} onChange={e => { setDrive(e.target.value); setPage(1); }} className="input" style={{ width:180 }}>
          <option value="">All Drives</option>
          {drives.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
        </select>
        <select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }} className="input" style={{ width:150 }}>
          <option value="">All Status</option>
          {['selected','waitlisted','in_progress','pending','rejected'].map(s => (
            <option key={s} value={s}>{s.replace('_',' ')}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div style={{ display:'flex', justifyContent:'center', padding:48 }}>
          <div style={{ width:22, height:22, border:'2px solid var(--accent)', borderTopColor:'transparent', borderRadius:'50%', animation:'spin 0.75s linear infinite' }} />
        </div>
      ) : candidates.length === 0 ? (
        <div className="card" style={{ padding:60, textAlign:'center' }}>
          <Users size={36} style={{ color:'var(--text3)', margin:'0 auto 12px' }} />
          <p className="section-title" style={{ marginBottom:4 }}>No candidates found</p>
          <p style={{ fontSize:13, color:'var(--text3)' }}>Try adjusting your filters</p>
        </div>
      ) : (
        <>
          <div className="card" style={{ overflow:'hidden' }}>
            <table className="tbl">
              <thead>
                <tr>
                  <th>Candidate</th>
                  <th>USN</th>
                  <th>Drive</th>
                  <th>Score</th>
                  <th>ATS</th>
                  <th>Status</th>
                  <th style={{ width:80 }}></th>
                </tr>
              </thead>
              <tbody>
                {candidates.map((c, i) => (
                  <motion.tr key={c._id} initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:i*0.025 }}>
                    <td>
                      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                        <div style={{ width:32, height:32, borderRadius:8, background:'var(--accent)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize:11, fontWeight:700, flexShrink:0 }}>
                          {c.name?.slice(0,2).toUpperCase()}
                        </div>
                        <div>
                          <Link to={'/candidates/'+c._id}
                            style={{ fontSize:13, fontWeight:600, color:'var(--text)', textDecoration:'none', transition:'color 0.15s' }}
                            onMouseEnter={e => e.target.style.color='var(--accent)'}
                            onMouseLeave={e => e.target.style.color='var(--text)'}>
                            {c.name}
                          </Link>
                          <p style={{ fontSize:11, color:'var(--text3)' }}>{c.email}</p>
                        </div>
                      </div>
                    </td>
                    <td><span style={{ fontFamily:'monospace', fontSize:12, color:'var(--text2)' }}>{c.usn||'—'}</span></td>
                    <td>
                      <span style={{ display:'flex', alignItems:'center', gap:5, fontSize:12, color:'var(--text2)' }}>
                        <GraduationCap size={12} style={{ color:'var(--text3)' }} />
                        {c.drive?.name||'—'}
                      </span>
                    </td>
                    <td>
                      {c.finalScore > 0 ? (
                        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                          <span style={{ fontFamily:'monospace', fontWeight:700, fontSize:13, color:'var(--text)' }}>{c.finalScore.toFixed(1)}</span>
                          <div style={{ width:44, height:3, borderRadius:99, background:'var(--border)', overflow:'hidden' }}>
                            <div style={{ width:c.finalScore+'%', height:'100%', background:'linear-gradient(90deg,var(--accent),var(--accent2))', borderRadius:99 }} />
                          </div>
                        </div>
                      ) : <span style={{ color:'var(--text3)' }}>—</span>}
                    </td>
                    <td>
                      {c.atsScore > 0
                        ? <span style={{ fontFamily:'monospace', fontWeight:700, fontSize:12, color:c.atsScore>=75?'#22c55e':c.atsScore>=50?'#f4a535':'#f43f5e' }}>{c.atsScore}</span>
                        : <span style={{ color:'var(--text3)' }}>—</span>}
                    </td>
                    <td><StatusBadge status={c.status} /></td>
                    <td>
                      <div style={{ display:'flex', gap:4 }}>
                        <Link to={'/candidates/'+c._id} className="btn-icon"><ArrowRight size={12} /></Link>
                        <button className="btn-icon" onClick={() => del(c._id, c.name)}
                          onMouseEnter={e => { e.currentTarget.style.color='var(--red)'; e.currentTarget.style.borderColor='rgba(244,63,94,0.3)'; }}
                          onMouseLeave={e => { e.currentTarget.style.color=''; e.currentTarget.style.borderColor=''; }}>
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:10 }}>
              <button disabled={page<=1} onClick={() => setPage(p=>p-1)} className="btn btn-ghost" style={{ fontSize:12 }}>← Prev</button>
              <span style={{ fontSize:12, color:'var(--text3)' }}>Page {page} of {totalPages}</span>
              <button disabled={page>=totalPages} onClick={() => setPage(p=>p+1)} className="btn btn-ghost" style={{ fontSize:12 }}>Next →</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
