import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Search, Briefcase, Users, ArrowRight, Trash2, Edit } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../utils/api';
import StatusBadge from '../components/ui/StatusBadge';
import { useAuth } from '../context/AuthContext';

const FILTERS = [['', 'All'], ['active', 'Active'], ['draft', 'Draft'], ['completed', 'Completed']];

export default function Drives() {
  const [drives, setDrives]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [filter, setFilter]       = useState('');
  const [page, setPage]           = useState(1);
  const [totalPages, setTP]       = useState(1);
  const [total, setTotal]         = useState(0);
  const { user } = useAuth();

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const p = new URLSearchParams({ page, limit: 10 });
      if (search) p.append('search', search);
      if (filter) p.append('status', filter);
      const { data } = await api.get('/drives?' + p);
      setDrives(data.drives || []);
      setTP(data.totalPages || 1);
      setTotal(data.total || data.drives?.length || 0);
    } catch { toast.error('Failed to load drives'); }
    setLoading(false);
  }, [page, search, filter]);

  useEffect(() => { fetch(); }, [fetch]);

  const del = async (id, name) => {
    if (!confirm('Delete "' + name + '"? This cannot be undone.')) return;
    try { await api.delete('/drives/' + id); toast.success('Deleted'); fetch(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="title">{user?.role === 'admin' ? 'All Drives' : 'My Drives'}</h1>
          <p className="subtitle">{total} drive{total !== 1 ? 's' : ''} found</p>
        </div>
        <Link to="/drives/new" className="btn btn-primary">
          <Plus size={14} /> New Drive
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <div style={{ position:'relative', flex:1, minWidth:200 }}>
          <Search size={14} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'var(--text3)' }} />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search drives..." className="input" style={{ paddingLeft:36 }} />
        </div>
        <div className="flex gap-1" style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:9, padding:3 }}>
          {FILTERS.map(([val, label]) => (
            <button key={val} onClick={() => { setFilter(val); setPage(1); }}
              style={{
                padding:'5px 14px', borderRadius:6, fontSize:12, fontWeight:600, cursor:'pointer', border:'none',
                background: filter === val ? 'var(--accent)' : 'transparent',
                color: filter === val ? '#fff' : 'var(--text2)',
                transition: 'all 0.15s',
              }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div style={{ display:'flex', justifyContent:'center', padding:48 }}>
          <div style={{ width:22, height:22, border:'2px solid var(--accent)', borderTopColor:'transparent', borderRadius:'50%', animation:'spin 0.75s linear infinite' }} />
        </div>
      ) : drives.length === 0 ? (
        <div className="card" style={{ padding:60, textAlign:'center' }}>
          <Briefcase size={36} style={{ color:'var(--text3)', margin:'0 auto 14px' }} />
          <p className="section-title" style={{ marginBottom:6 }}>No drives found</p>
          <p style={{ fontSize:13, color:'var(--text3)', marginBottom:18 }}>Create your first placement drive</p>
          <Link to="/drives/new" className="btn btn-primary">
            <Plus size={14} /> Create Drive
          </Link>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          {drives.map((drive, i) => (
            <motion.div key={drive._id} initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.04 }}>
              <div className="card" style={{ padding:'16px 20px', display:'flex', alignItems:'center', gap:16 }}>
                {/* Icon */}
                <div style={{ width:42, height:42, borderRadius:10, background:'rgba(91,110,245,0.1)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <Briefcase size={18} style={{ color:'var(--accent)' }} />
                </div>
                {/* Info */}
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:10, flexWrap:'wrap', marginBottom:3 }}>
                    <Link to={'/drives/'+drive._id}
                      style={{ fontSize:14, fontWeight:700, color:'var(--text)', textDecoration:'none', transition:'color 0.15s' }}
                      onMouseEnter={e => e.target.style.color='var(--accent)'}
                      onMouseLeave={e => e.target.style.color='var(--text)'}>
                      {drive.name}
                    </Link>
                    <StatusBadge status={drive.status} />
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:16, flexWrap:'wrap' }}>
                    <span style={{ fontSize:12, color:'var(--text3)' }}>{drive.company || 'No company'}{drive.jobRole ? ' · ' + drive.jobRole : ''}</span>
                    <span style={{ display:'flex', alignItems:'center', gap:4, fontSize:12, color:'var(--text3)' }}>
                      <Users size={11} /> {drive.totalCandidates||0} candidates
                    </span>
                    <span style={{ fontSize:12, color:'var(--text3)' }}>{drive.rounds?.length||0} rounds</span>
                    {user?.role === 'admin' && drive.createdBy?.name && (
                      <span className="badge" style={{ background:'rgba(91,110,245,0.08)', color:'var(--accent)', fontSize:10 }}>
                        {drive.createdBy.name}
                      </span>
                    )}
                  </div>
                </div>
                {/* Actions */}
                <div style={{ display:'flex', alignItems:'center', gap:6, flexShrink:0 }}>
                  <Link to={'/drives/'+drive._id+'/add-candidates'} className="btn btn-secondary" style={{ fontSize:12, padding:'6px 12px' }}>
                    <Plus size={12} /> Add
                  </Link>
                  <Link to={'/drives/'+drive._id+'/edit'} className="btn-icon" title="Edit">
                    <Edit size={13} />
                  </Link>
                  <button onClick={() => del(drive._id, drive.name)} className="btn-icon" title="Delete"
                    onMouseEnter={e => { e.currentTarget.style.color='var(--red)'; e.currentTarget.style.borderColor='rgba(244,63,94,0.3)'; }}
                    onMouseLeave={e => { e.currentTarget.style.color=''; e.currentTarget.style.borderColor=''; }}>
                    <Trash2 size={13} />
                  </button>
                  <Link to={'/drives/'+drive._id} className="btn btn-secondary" style={{ fontSize:12, padding:'6px 10px' }}>
                    <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:10 }}>
          <button disabled={page <= 1} onClick={() => setPage(p => p-1)} className="btn btn-ghost" style={{ fontSize:12 }}>← Prev</button>
          <span style={{ fontSize:12, color:'var(--text3)' }}>Page {page} of {totalPages}</span>
          <button disabled={page >= totalPages} onClick={() => setPage(p => p+1)} className="btn btn-ghost" style={{ fontSize:12 }}>Next →</button>
        </div>
      )}
    </div>
  );
}
