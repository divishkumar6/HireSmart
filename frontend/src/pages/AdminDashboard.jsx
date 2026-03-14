import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Briefcase, Users, Trophy, Activity, Plus, ArrowRight,
  RefreshCw, Shield, UserCog, TrendingUp
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell
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
      {payload.map((p, i) => (
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
      <p style={{ color:'var(--text3)', fontSize:11 }}>{p.payload.pct}% of total</p>
    </div>
  );
};

const COLORS = ['#5b6ef5','#1fd8e8','#f4a535','#22c55e','#f43f5e','#a855f7'];

function EmptyChart({ message }) {
  return (
    <div style={{ height:200, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:8 }}>
      <TrendingUp size={28} style={{ color:'var(--text3)', opacity:0.3 }} />
      <p style={{ fontSize:13, color:'var(--text3)' }}>{message || 'No data yet'}</p>
      <p style={{ fontSize:11, color:'var(--text3)', opacity:0.7 }}>Add candidates and drives to see analytics</p>
    </div>
  );
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats,   setStats]   = useState(null);
  const [drives,  setDrives]  = useState([]);
  const [heatmap, setHeatmap] = useState([]);
  const [monthly, setMonthly] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [updated, setUpdated] = useState(new Date());
  const [errors,  setErrors]  = useState({});

  const load = useCallback(async (silent = false) => {
    silent ? setSyncing(true) : setLoading(true);
    const errs = {};

    const calls = [
      { key:'stats',   url:'/candidates/dashboard-stats', set: d => setStats(d.stats) },
      { key:'drives',  url:'/drives?limit=6',             set: d => setDrives(d.drives || []) },
      { key:'heatmap', url:'/candidates/heatmap',         set: d => setHeatmap(d.heatmap || []) },
      { key:'monthly', url:'/admin/analytics',            set: d => setMonthly(d.monthlyData || []) },
    ];

    await Promise.all(calls.map(async ({ key, url, set }) => {
      try {
        const { data } = await api.get(url);
        set(data);
      } catch (e) {
        errs[key] = e?.response?.data?.message || e.message;
        console.error(`[Dashboard] ${key} failed:`, errs[key]);
      }
    }));

    setErrors(errs);
    setUpdated(new Date());
    setLoading(false);
    setSyncing(false);
  }, []);

  useEffect(() => {
    load();
    const iv = setInterval(() => load(true), 15000);
    return () => clearInterval(iv);
  }, [load]);

  const s = stats || {};
  const total = s.totalCandidates || 0;
  const pie = (s.statusBreakdown || []).map((x, i) => ({
    name: x._id || 'unknown',
    value: x.count,
    fill: COLORS[i % COLORS.length],
    pct: total ? Math.round((x.count / total) * 100) : 0,
  }));

  const hasMonthly = monthly.some(m => m.candidates > 0 || m.drives > 0);

  const Skel = () => (
    <div style={{ height:24, borderRadius:6, background:'var(--border)', animation:'pulse 1.5s ease-in-out infinite', width:'60%' }} />
  );

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:22 }}>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
            <span className="badge" style={{ background:'rgba(244,165,53,0.12)', color:'var(--gold)', border:'1px solid rgba(244,165,53,0.2)' }}>
              👑 Admin Control Panel
            </span>
            <div style={{ display:'flex', alignItems:'center', gap:5 }}>
              <div style={{ width:6, height:6, borderRadius:'50%', background:'#22c55e', animation:'pulse 2s infinite' }} />
              <span style={{ fontSize:11, color:'var(--text3)' }}>Live · {updated.toLocaleTimeString()}</span>
            </div>
          </div>
          <h1 className="title">Welcome back, <span className="gradient-text">{user?.name?.split(' ')[0]}</span></h1>
          <p className="subtitle">System overview — all recruiters &amp; drives</p>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <button onClick={() => load(true)} disabled={syncing} className="btn btn-secondary" style={{ fontSize:12 }}>
            <RefreshCw size={13} style={{ animation: syncing ? 'spin 0.75s linear infinite' : 'none' }} />
            {syncing ? 'Syncing…' : 'Refresh'}
          </button>
          <Link to="/drives/new" className="btn btn-primary"><Plus size={14} /> New Drive</Link>
        </div>
      </div>

      {/* Error banner */}
      {Object.keys(errors).length > 0 && (
        <div style={{ padding:'10px 16px', borderRadius:9, background:'rgba(244,63,94,0.08)', border:'1px solid rgba(244,63,94,0.2)', fontSize:12, color:'var(--red)' }}>
          ⚠ Some data failed to load. Check your API connection. {Object.entries(errors).map(([k,v]) => `${k}: ${v}`).join(' | ')}
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard icon={Briefcase}  label="Total Drives"    value={loading ? '…' : (s.totalDrives    ?? 0)} color="#5b6ef5" delay={0}    />
        <StatCard icon={Activity}   label="Active Drives"   value={loading ? '…' : (s.activeDrives   ?? 0)} color="#1fd8e8" delay={0.06} />
        <StatCard icon={Users}      label="All Candidates"  value={loading ? '…' : (s.totalCandidates ?? 0)} color="#f4a535" delay={0.12} />
        <StatCard icon={Trophy}     label="Selected"        value={loading ? '…' : (s.selectedCount   ?? 0)} color="#22c55e" delay={0.18} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

        {/* Area chart */}
        <motion.div initial={{ opacity:0, y:14 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.22 }}
          className="card" style={{ padding:20, gridColumn:'span 2' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
            <div>
              <p className="section-title">Recruitment Trend</p>
              <p style={{ fontSize:11, color:'var(--text3)', marginTop:2 }}>Candidates &amp; selections — last 6 months (live)</p>
            </div>
            <span className="badge" style={{ background:'rgba(34,197,94,0.1)', color:'#22c55e', border:'1px solid rgba(34,197,94,0.2)' }}>
              <div style={{ width:5, height:5, borderRadius:'50%', background:'#22c55e', animation:'pulse 2s infinite' }} />
              Live
            </span>
          </div>
          {loading ? <div style={{ height:200, background:'var(--card)', borderRadius:9, animation:'pulse 1.5s ease-in-out infinite' }} /> :
           !hasMonthly ? <EmptyChart message="No activity yet this period" /> : (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={monthly}>
                <defs>
                  <linearGradient id="gC" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#5b6ef5" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#5b6ef5" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="gS" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" tick={{ fill:'var(--text3)', fontSize:11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill:'var(--text3)', fontSize:11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<TT />} />
                <Area type="monotone" dataKey="candidates" stroke="#5b6ef5" fill="url(#gC)" strokeWidth={2} name="Candidates" />
                <Area type="monotone" dataKey="selected"   stroke="#22c55e" fill="url(#gS)" strokeWidth={2} name="Selected"   />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        {/* Pie chart */}
        <motion.div initial={{ opacity:0, y:14 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.28 }}
          className="card" style={{ padding:20 }}>
          <p className="section-title" style={{ marginBottom:4 }}>Status Breakdown</p>
          <p style={{ fontSize:11, color:'var(--text3)', marginBottom:12 }}>All candidates by status</p>
          {loading ? <div style={{ height:200, background:'var(--card)', borderRadius:9, animation:'pulse 1.5s ease-in-out infinite' }} /> :
           pie.length === 0 ? <EmptyChart message="No candidates yet" /> : (
            <>
              <ResponsiveContainer width="100%" height={150}>
                <PieChart>
                  <Pie data={pie} cx="50%" cy="50%" innerRadius={42} outerRadius={66}
                    paddingAngle={3} dataKey="value" strokeWidth={0}>
                    {pie.map((e, i) => <Cell key={i} fill={e.fill} />)}
                  </Pie>
                  <Tooltip content={<PTT />} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display:'flex', flexDirection:'column', gap:6, marginTop:8 }}>
                {pie.map(item => (
                  <div key={item.name} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', fontSize:12 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:7 }}>
                      <div style={{ width:8, height:8, borderRadius:2, background:item.fill }} />
                      <span style={{ color:'var(--text2)', textTransform:'capitalize' }}>{item.name.replace('_',' ')}</span>
                    </div>
                    <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                      <span style={{ color:'var(--text3)', fontSize:10 }}>{item.pct}%</span>
                      <span style={{ fontWeight:700, color:'var(--text)' }}>{item.value}</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </motion.div>
      </div>

      {/* Bar chart - drives per month */}
      <motion.div initial={{ opacity:0, y:14 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.34 }}
        className="card" style={{ padding:20 }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
          <div>
            <p className="section-title">Drives Created per Month</p>
            <p style={{ fontSize:11, color:'var(--text3)', marginTop:2 }}>Real-time from database</p>
          </div>
        </div>
        {loading ? <div style={{ height:140, background:'var(--card)', borderRadius:9, animation:'pulse 1.5s ease-in-out infinite' }} /> :
         !hasMonthly ? <EmptyChart message="No drives created yet" /> : (
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={monthly} barSize={22}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="month" tick={{ fill:'var(--text3)', fontSize:11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill:'var(--text3)', fontSize:11 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<TT />} cursor={{ fill:'rgba(91,110,245,0.06)' }} />
              <Bar dataKey="drives" name="Drives" fill="#5b6ef5" radius={[5,5,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </motion.div>

      {/* Quick admin shortcuts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { to:'/admin/users',  icon:UserCog,  label:'User Management',   desc:'Manage accounts, roles & access', color:'#f4a535' },
          { to:'/ats-checker',  icon:Shield,   label:'ATS Resume Checker', desc:'Analyze resumes instantly',       color:'#5b6ef5' },
          { to:'/rankings',     icon:Trophy,   label:'Global Rankings',    desc:'Candidate rankings across drives', color:'#1fd8e8' },
        ].map(({ to, icon:Icon, label, desc, color }) => (
          <Link key={to} to={to} className="card" style={{ padding:'16px 18px', display:'flex', alignItems:'flex-start', gap:14, textDecoration:'none', transition:'all 0.18s' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = color+'50'; e.currentTarget.style.transform='translateY(-2px)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform='none'; }}>
            <div style={{ width:36, height:36, borderRadius:9, background:color+'14', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <Icon size={17} style={{ color }} />
            </div>
            <div>
              <p style={{ fontSize:13, fontWeight:600, color:'var(--text)', marginBottom:3 }}>{label}</p>
              <p style={{ fontSize:11, color:'var(--text3)' }}>{desc}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Skill heatmap */}
      <SkillHeatmap data={heatmap} loading={loading} />

      {/* All Drives */}
      <div className="card" style={{ overflow:'hidden' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 20px', borderBottom:'1px solid var(--border)' }}>
          <div>
            <p className="section-title">All Drives</p>
            <p style={{ fontSize:11, color:'var(--text3)', marginTop:2 }}>Across all recruiters</p>
          </div>
          <Link to="/drives" style={{ fontSize:12, color:'var(--accent)', textDecoration:'none', display:'flex', alignItems:'center', gap:4, fontWeight:600 }}>
            View all <ArrowRight size={13} />
          </Link>
        </div>
        {loading ? (
          <div style={{ display:'flex', justifyContent:'center', padding:32 }}>
            <div style={{ width:20, height:20, border:'2px solid var(--accent)', borderTopColor:'transparent', borderRadius:'50%', animation:'spin 0.75s linear infinite' }} />
          </div>
        ) : drives.length === 0 ? (
          <div style={{ padding:32, textAlign:'center' }}>
            <p style={{ fontSize:13, color:'var(--text3)' }}>No drives yet.</p>
            <Link to="/drives/new" style={{ fontSize:12, color:'var(--accent)', textDecoration:'none', fontWeight:600, marginTop:6, display:'block' }}>Create first drive →</Link>
          </div>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))', gap:1, background:'var(--border)' }}>
            {drives.map(drive => (
              <Link key={drive._id} to={'/drives/'+drive._id}
                style={{ background:'var(--bg2)', padding:'14px 18px', display:'flex', alignItems:'center', gap:12, textDecoration:'none', transition:'background 0.13s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg3)'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--bg2)'}>
                <div style={{ width:36, height:36, borderRadius:9, background:'rgba(91,110,245,0.1)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <Briefcase size={15} style={{ color:'var(--accent)' }} />
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <p style={{ fontSize:13, fontWeight:600, color:'var(--text)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{drive.name}</p>
                  <p style={{ fontSize:11, color:'var(--text3)' }}>{drive.totalCandidates||0} candidates · by {drive.createdBy?.name||'Unknown'}</p>
                </div>
                <StatusBadge status={drive.status} />
              </Link>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
