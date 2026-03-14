import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Briefcase, Users, Trophy, Activity, Plus, ArrowRight,
  RefreshCw, CheckCircle, Target, TrendingUp
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, RadialBarChart, RadialBar,
  PieChart, Pie, Cell
} from 'recharts';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import StatCard from '../components/ui/StatCard';
import StatusBadge from '../components/ui/StatusBadge';
import SkillHeatmap from '../components/ui/SkillHeatmap';

const TT = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:10, padding:'8px 14px', fontSize:12 }}>
      {label && <p style={{ color:'var(--text2)', marginBottom:5 }}>{label}</p>}
      {payload.map((p,i) => (
        <div key={i} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:16 }}>
          <div style={{ display:'flex', alignItems:'center', gap:7 }}>
            <div style={{ width:7, height:7, borderRadius:'50%', background:p.color }} />
            <span style={{ color:'var(--text2)' }}>{p.name}</span>
          </div>
          <span style={{ color:p.color, fontWeight:700 }}>{p.value}</span>
        </div>
      ))}
    </div>
  );
};

const PTT = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const p = payload[0];
  return (
    <div style={{ background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:10, padding:'10px 14px' }}>
      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
        <div style={{ width:9, height:9, borderRadius:2, background:p.payload.fill }} />
        <span style={{ color:'var(--text)', fontWeight:600, fontSize:13, textTransform:'capitalize' }}>
          {p.name?.replace('_',' ')}
        </span>
      </div>
      <p style={{ color:p.payload.fill, fontWeight:700, fontSize:20 }}>{p.value}</p>
      {p.payload.pct !== undefined && <p style={{ color:'var(--text3)', fontSize:11 }}>{p.payload.pct}%</p>}
    </div>
  );
};

const COLORS = ['#5b6ef5','#1fd8e8','#f4a535','#22c55e','#f43f5e'];

export default function RecruiterDashboard() {
  const { user } = useAuth();
  const [stats,   setStats]   = useState(null);
  const [drives,  setDrives]  = useState([]);
  const [recent,  setRecent]  = useState([]);
  const [heatmap, setHeatmap] = useState([]);
  const [monthly, setMonthly] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [updated, setUpdated] = useState(new Date());

  const load = useCallback(async (silent = false) => {
    silent ? setSyncing(true) : setLoading(true);
    await Promise.all([
      api.get('/candidates/dashboard-stats').then(({data}) => setStats(data.stats)).catch(e => console.error('stats',e.message)),
      api.get('/drives?limit=5').then(({data}) => setDrives(data.drives||[])).catch(e => console.error('drives',e.message)),
      api.get('/candidates?limit=5').then(({data}) => setRecent(data.candidates||[])).catch(e => console.error('candidates',e.message)),
      api.get('/candidates/heatmap').then(({data}) => setHeatmap(data.heatmap||[])).catch(e => console.error('heatmap',e.message)),
      api.get('/admin/analytics').then(({data}) => setMonthly(data.monthlyData||[])).catch(e => console.error('analytics',e.message)),
    ]);
    setUpdated(new Date());
    setLoading(false); setSyncing(false);
  }, []);

  useEffect(() => {
    load();
    const iv = setInterval(() => load(true), 15000);
    return () => clearInterval(iv);
  }, [load]);

  const s = stats || {};
  const total    = s.totalCandidates || 0;
  const selected = s.selectedCount || 0;
  const rate     = total ? Math.round((selected / total) * 100) : 0;
  const pie      = (s.statusBreakdown || []).map((x,i) => ({
    name: x._id||'unknown', value:x.count, fill:COLORS[i%COLORS.length],
    pct: total ? Math.round((x.count/total)*100) : 0,
  }));
  const hasMonthly = monthly.some(m => m.candidates > 0);

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:22 }}>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
            <span className="badge" style={{ background:'rgba(91,110,245,0.1)', color:'var(--accent)', border:'1px solid rgba(91,110,245,0.2)' }}>
              🎯 Recruiter Workspace
            </span>
            <div style={{ display:'flex', alignItems:'center', gap:5 }}>
              <div style={{ width:6, height:6, borderRadius:'50%', background:'#22c55e', animation:'pulse 2s infinite' }} />
              <span style={{ fontSize:11, color:'var(--text3)' }}>Live · {updated.toLocaleTimeString()}</span>
            </div>
          </div>
          <h1 className="title">
            {new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 17 ? 'Good afternoon' : 'Good evening'}, <span className="gradient-text">{user?.name?.split(' ')[0]}</span>
          </h1>
          <p className="subtitle">Your personal workspace</p>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <button onClick={() => load(true)} disabled={syncing} className="btn btn-secondary" style={{ fontSize:12 }}>
            <RefreshCw size={13} style={{ animation: syncing ? 'spin 0.75s linear infinite' : 'none' }} />
            {syncing ? 'Syncing…' : 'Refresh'}
          </button>
          <Link to="/drives/new" className="btn btn-primary"><Plus size={14} /> New Drive</Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard icon={Briefcase}   label="My Drives"    value={loading ? '…' : (s.totalDrives    ?? 0)} color="#5b6ef5" delay={0}    />
        <StatCard icon={Activity}    label="Active"       value={loading ? '…' : (s.activeDrives   ?? 0)} color="#1fd8e8" delay={0.06} />
        <StatCard icon={Users}       label="Candidates"   value={loading ? '…' : (s.totalCandidates ?? 0)} color="#f4a535" delay={0.12} />
        <StatCard icon={CheckCircle} label="Selected"     value={loading ? '…' : selected}                 color="#22c55e" delay={0.18} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

        {/* Selection rate */}
        <motion.div initial={{ opacity:0, y:14 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.22 }}
          className="card" style={{ padding:20, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', textAlign:'center' }}>
          <p className="section-title" style={{ marginBottom:4 }}>Selection Rate</p>
          <p style={{ fontSize:11, color:'var(--text3)', marginBottom:16 }}>Candidates converted to offers</p>
          <div style={{ position:'relative', width:140, height:140 }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart innerRadius="60%" outerRadius="100%" data={[{ value:rate, fill:'#22c55e' }]} startAngle={90} endAngle={-270}>
                <RadialBar dataKey="value" background={{ fill:'var(--border)' }} cornerRadius={8} />
              </RadialBarChart>
            </ResponsiveContainer>
            <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
              <span style={{ fontSize:28, fontFamily:'Syne', fontWeight:700, color:'#22c55e' }}>{rate}%</span>
              <span style={{ fontSize:11, color:'var(--text3)' }}>success</span>
            </div>
          </div>
          <div style={{ display:'flex', gap:24, marginTop:16, fontSize:13 }}>
            <div><p style={{ fontFamily:'Syne', fontWeight:700, fontSize:18, color:'var(--text)' }}>{selected}</p><p style={{ fontSize:11, color:'var(--text3)' }}>selected</p></div>
            <div style={{ width:1, background:'var(--border)' }} />
            <div><p style={{ fontFamily:'Syne', fontWeight:700, fontSize:18, color:'var(--text)' }}>{total}</p><p style={{ fontSize:11, color:'var(--text3)' }}>total</p></div>
          </div>
        </motion.div>

        {/* Area trend */}
        <motion.div initial={{ opacity:0, y:14 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.28 }}
          className="card" style={{ padding:20, gridColumn:'span 2' }}>
          <p className="section-title" style={{ marginBottom:4 }}>Activity Trend</p>
          <p style={{ fontSize:11, color:'var(--text3)', marginBottom:16 }}>Candidates &amp; selections — last 6 months</p>
          {loading ? <div style={{ height:175, background:'var(--card)', borderRadius:9, animation:'pulse 1.5s ease-in-out infinite' }} /> :
           !hasMonthly ? (
            <div style={{ height:175, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:8 }}>
              <TrendingUp size={24} style={{ color:'var(--text3)', opacity:0.3 }} />
              <p style={{ fontSize:13, color:'var(--text3)' }}>No activity yet</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={175}>
              <AreaChart data={monthly}>
                <defs>
                  <linearGradient id="rA" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#5b6ef5" stopOpacity={0.25}/><stop offset="95%" stopColor="#5b6ef5" stopOpacity={0}/></linearGradient>
                  <linearGradient id="rB" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#1fd8e8" stopOpacity={0.25}/><stop offset="95%" stopColor="#1fd8e8" stopOpacity={0}/></linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" tick={{ fill:'var(--text3)', fontSize:11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill:'var(--text3)', fontSize:11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<TT />} />
                <Area type="monotone" dataKey="candidates" stroke="#5b6ef5" fill="url(#rA)" strokeWidth={2} name="Candidates" />
                <Area type="monotone" dataKey="selected"   stroke="#1fd8e8" fill="url(#rB)" strokeWidth={2} name="Selected"   />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </motion.div>
      </div>

      {/* Pie + Drives */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">

        {/* Pie */}
        <motion.div initial={{ opacity:0, y:14 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.34 }}
          className="card" style={{ padding:20 }}>
          <p className="section-title" style={{ marginBottom:4 }}>My Candidates by Status</p>
          <p style={{ fontSize:11, color:'var(--text3)', marginBottom:12 }}>Across all your drives</p>
          {pie.length === 0 ? (
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:150, gap:8 }}>
              <Target size={24} style={{ color:'var(--text3)', opacity:0.3 }} />
              <p style={{ fontSize:13, color:'var(--text3)' }}>No candidates yet</p>
              <Link to="/drives/new" style={{ fontSize:12, color:'var(--accent)', textDecoration:'none', fontWeight:600 }}>Create a drive →</Link>
            </div>
          ) : (
            <div style={{ display:'flex', alignItems:'center', gap:16 }}>
              <ResponsiveContainer width={140} height={140}>
                <PieChart>
                  <Pie data={pie} cx="50%" cy="50%" innerRadius={36} outerRadius={60} paddingAngle={3} dataKey="value" strokeWidth={0}>
                    {pie.map((e,i) => <Cell key={i} fill={e.fill} />)}
                  </Pie>
                  <Tooltip content={<PTT />} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ flex:1, display:'flex', flexDirection:'column', gap:6 }}>
                {pie.map(item => (
                  <div key={item.name} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', fontSize:12 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:7 }}>
                      <div style={{ width:8, height:8, borderRadius:2, background:item.fill }} />
                      <span style={{ color:'var(--text2)', textTransform:'capitalize' }}>{item.name.replace('_',' ')}</span>
                    </div>
                    <div style={{ display:'flex', gap:7, alignItems:'center' }}>
                      <span style={{ color:'var(--text3)', fontSize:10 }}>{item.pct}%</span>
                      <span style={{ fontWeight:700, color:'var(--text)' }}>{item.value}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        {/* My Drives */}
        <motion.div initial={{ opacity:0, y:14 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.4 }}
          className="card" style={{ padding:20 }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
            <p className="section-title">My Drives</p>
            <Link to="/drives" style={{ fontSize:12, color:'var(--accent)', textDecoration:'none', display:'flex', alignItems:'center', gap:4, fontWeight:600 }}>
              All <ArrowRight size={12} />
            </Link>
          </div>
          {loading ? (
            <div style={{ display:'flex', justifyContent:'center', padding:24 }}>
              <div style={{ width:18, height:18, border:'2px solid var(--accent)', borderTopColor:'transparent', borderRadius:'50%', animation:'spin 0.75s linear infinite' }} />
            </div>
          ) : drives.length === 0 ? (
            <div style={{ textAlign:'center', padding:24 }}>
              <p style={{ fontSize:13, color:'var(--text3)', marginBottom:8 }}>No drives yet</p>
              <Link to="/drives/new" className="btn btn-primary" style={{ fontSize:12, padding:'7px 14px' }}>
                <Plus size={13} /> Create Drive
              </Link>
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
              {drives.map((drive,i) => (
                <motion.div key={drive._id} initial={{ opacity:0, x:-8 }} animate={{ opacity:1, x:0 }} transition={{ delay:0.4+i*0.04 }}>
                  <Link to={'/drives/'+drive._id}
                    style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 12px', borderRadius:9,
                      background:'var(--card)', border:'1px solid var(--border)', textDecoration:'none', transition:'all 0.15s' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor='var(--border-h)'; e.currentTarget.style.background='var(--card-h)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.background='var(--card)'; }}>
                    <Briefcase size={14} style={{ color:'var(--accent)', flexShrink:0 }} />
                    <div style={{ flex:1, minWidth:0 }}>
                      <p style={{ fontSize:13, fontWeight:600, color:'var(--text)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{drive.name}</p>
                      <p style={{ fontSize:11, color:'var(--text3)' }}>{drive.totalCandidates||0} candidates · {drive.rounds?.length||0} rounds</p>
                    </div>
                    <StatusBadge status={drive.status} />
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      <SkillHeatmap data={heatmap} loading={loading} />

      {/* Recent candidates */}
      <div className="card" style={{ overflow:'hidden' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 20px', borderBottom:'1px solid var(--border)' }}>
          <p className="section-title">Recently Added</p>
          <Link to="/candidates" style={{ fontSize:12, color:'var(--accent)', textDecoration:'none', display:'flex', alignItems:'center', gap:4, fontWeight:600 }}>
            All candidates <ArrowRight size={13} />
          </Link>
        </div>
        {recent.length === 0 ? (
          <div style={{ padding:28, textAlign:'center', color:'var(--text3)', fontSize:13 }}>No candidates yet</div>
        ) : (
          <table className="tbl">
            <tbody>
              {recent.map(c => (
                <tr key={c._id}>
                  <td>
                    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                      <div style={{ width:32, height:32, borderRadius:8, background:'var(--accent)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize:11, fontWeight:700, flexShrink:0 }}>
                        {c.name?.slice(0,2).toUpperCase()}
                      </div>
                      <div>
                        <p style={{ fontSize:13, fontWeight:600, color:'var(--text)' }}>{c.name}</p>
                        <p style={{ fontSize:11, color:'var(--text3)' }}>{c.drive?.name || '—'}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    {c.finalScore > 0 && (
                      <span style={{ fontFamily:'monospace', fontWeight:700, fontSize:13, color:'var(--text)' }}>
                        {c.finalScore.toFixed(1)}
                      </span>
                    )}
                  </td>
                  <td>
                    {c.atsScore > 0 && (
                      <span style={{ fontFamily:'monospace', fontWeight:700, fontSize:12, color:c.atsScore>=75?'#22c55e':c.atsScore>=50?'#f4a535':'#f43f5e' }}>
                        ATS {c.atsScore}
                      </span>
                    )}
                  </td>
                  <td><StatusBadge status={c.status} /></td>
                  <td>
                    <Link to={'/candidates/'+c._id} style={{ fontSize:12, color:'var(--accent)', textDecoration:'none', fontWeight:600 }}>View →</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

    </div>
  );
}
