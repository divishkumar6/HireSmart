import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Briefcase, Users, Trophy, Settings,
  LogOut, ChevronLeft, ChevronRight, Zap,
  Sun, Moon, Monitor, Brain, Shield, Clock
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import api from '../../utils/api';

const BASE = [
  { to:'/dashboard',   icon:LayoutDashboard, label:'Dashboard'   },
  { to:'/drives',      icon:Briefcase,       label:'Drives'      },
  { to:'/candidates',  icon:Users,           label:'Candidates'  },
  { to:'/ats-checker', icon:Brain,           label:'ATS Checker' },
  { to:'/rankings',    icon:Trophy,          label:'Rankings'    },
  { to:'/settings',    icon:Settings,        label:'Settings'    },
];
const ADMIN = [
  { to:'/admin/users',     icon:Shield, label:'User Mgmt',  admin:true },
  { to:'/admin/approvals', icon:Clock,  label:'Approvals',  admin:true },
];

function ThemeToggle() {
  const { theme, changeTheme } = useTheme();
  const opts = [['light',Sun],['system',Monitor],['dark',Moon]];
  return (
    <div style={{ display:'flex', alignItems:'center', background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:8, padding:2, gap:2 }}>
      {opts.map(([v, Icon]) => (
        <button key={v} onClick={() => changeTheme(v)} title={v}
          style={{ width:26, height:26, borderRadius:6, border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', transition:'all 0.15s',
            background: theme===v ? 'var(--accent)' : 'transparent',
            color: theme===v ? '#fff' : 'var(--text3)',
          }}>
          <Icon size={11} />
        </button>
      ))}
    </div>
  );
}

export default function Layout({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const [pending, setPending]     = useState(0);
  const { user, logout }          = useAuth();
  const navigate                  = useNavigate();

  useEffect(() => {
    if (user?.role !== 'admin') return;
    const poll = async () => {
      try { const { data } = await api.get('/admin/pending-users'); setPending(data.count||0); } catch {}
    };
    poll();
    const iv = setInterval(poll, 30000);
    return () => clearInterval(iv);
  }, [user]);

  const nav = [...BASE, ...(user?.role==='admin' ? ADMIN : [])];

  const sideW = collapsed ? 56 : 210;

  return (
    <div style={{ display:'flex', minHeight:'100vh', position:'relative', zIndex:10 }}>
      {/* ── Sidebar ── */}
      <motion.aside animate={{ width:sideW }} transition={{ duration:0.22, ease:'easeInOut' }}
        style={{ display:'flex', flexDirection:'column', flexShrink:0, position:'relative',
          background:'var(--bg2)', borderRight:'1px solid var(--border)', overflow:'hidden' }}>

        {/* Logo */}
        <div style={{ display:'flex', alignItems:'center', gap:10, height:52, padding:'0 14px', borderBottom:'1px solid var(--border)', flexShrink:0 }}>
          <div style={{ width:28, height:28, borderRadius:8, background:'var(--accent)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            <Zap size={14} color="#fff" />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.span initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
                style={{ fontFamily:'Syne', fontWeight:700, fontSize:14.5, color:'var(--text)', whiteSpace:'nowrap' }}>
                SmartHire
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Role badge */}
        <AnimatePresence>
          {!collapsed && (
            <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
              style={{ margin:'10px 10px 0', padding:'6px 10px', borderRadius:8,
                background: user?.role==='admin' ? 'rgba(244,165,53,0.1)' : 'rgba(91,110,245,0.1)',
                border: `1px solid ${user?.role==='admin' ? 'rgba(244,165,53,0.2)' : 'rgba(91,110,245,0.2)'}`,
              }}>
              <span style={{ fontSize:10.5, fontWeight:700, color:user?.role==='admin'?'var(--gold)':'var(--accent)', textTransform:'uppercase', letterSpacing:'0.5px' }}>
                {user?.role==='admin' ? '👑 Admin' : '🎯 Recruiter'}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Nav */}
        <nav style={{ flex:1, padding:'8px 6px', overflowY:'auto', display:'flex', flexDirection:'column', gap:1 }}>
          {nav.map(({ to, icon:Icon, label, admin }, idx) => (
            <div key={to}>
              {admin && !nav[idx-1]?.admin && (
                <div style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 6px 4px', margin:'4px 0' }}>
                  <div style={{ flex:1, height:1, background:'var(--border)' }} />
                  {!collapsed && <span style={{ fontSize:9.5, fontWeight:700, color:'var(--text3)', textTransform:'uppercase', letterSpacing:'0.7px', whiteSpace:'nowrap' }}>Admin</span>}
                  <div style={{ flex:1, height:1, background:'var(--border)' }} />
                </div>
              )}
              <NavLink to={to} style={({ isActive }) => ({
                display:'flex', alignItems:'center', gap:9,
                padding: collapsed ? '9px' : '8px 10px',
                borderRadius:8, justifyContent: collapsed ? 'center' : 'flex-start',
                textDecoration:'none', transition:'all 0.15s',
                background: isActive ? (admin ? 'rgba(244,165,53,0.1)' : 'rgba(91,110,245,0.12)') : 'transparent',
                color: isActive ? (admin ? 'var(--gold)' : 'var(--accent)') : 'var(--text2)',
                border: `1px solid ${isActive ? (admin ? 'rgba(244,165,53,0.2)' : 'rgba(91,110,245,0.2)') : 'transparent'}`,
              })}>
                <Icon size={15} style={{ flexShrink:0 }} />
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
                      style={{ fontSize:13, fontWeight:500, whiteSpace:'nowrap', flex:1 }}>
                      {label}
                    </motion.span>
                  )}
                </AnimatePresence>
                {!collapsed && label==='Approvals' && pending>0 && (
                  <span style={{ background:'var(--red)', color:'#fff', fontSize:9.5, fontWeight:700, padding:'1px 6px', borderRadius:99, lineHeight:1.6 }}>{pending}</span>
                )}
              </NavLink>
            </div>
          ))}
        </nav>

        {/* Bottom: theme + user + logout */}
        <div style={{ padding:'8px 6px 10px', borderTop:'1px solid var(--border)', display:'flex', flexDirection:'column', gap:4 }}>
          <AnimatePresence>
            {!collapsed && (
              <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} style={{ padding:'0 4px 4px' }}>
                <ThemeToggle />
              </motion.div>
            )}
          </AnimatePresence>

          {/* User info */}
          <div style={{ display:'flex', alignItems:'center', gap:8, padding:'6px 8px', borderRadius:8, background:'var(--card)', border:'1px solid var(--border)', overflow:'hidden' }}>
            <div style={{ width:26, height:26, borderRadius:7, background:'var(--accent)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, fontWeight:700, color:'#fff', flexShrink:0 }}>
              {user?.name?.slice(0,2).toUpperCase()}
            </div>
            <AnimatePresence>
              {!collapsed && (
                <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} style={{ minWidth:0, flex:1 }}>
                  <p style={{ fontSize:12, fontWeight:600, color:'var(--text)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user?.name}</p>
                  <p style={{ fontSize:10.5, color:'var(--text3)', textTransform:'capitalize' }}>{user?.role}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button onClick={() => { logout(); navigate('/login'); }}
            style={{ display:'flex', alignItems:'center', gap:8, padding:'7px 8px', borderRadius:8, border:'none', background:'transparent', cursor:'pointer', color:'var(--text3)', fontSize:12, fontWeight:500, justifyContent: collapsed ? 'center' : 'flex-start', transition:'all 0.15s', width:'100%' }}
            onMouseEnter={e => { e.currentTarget.style.color='var(--red)'; e.currentTarget.style.background='rgba(244,63,94,0.08)'; }}
            onMouseLeave={e => { e.currentTarget.style.color='var(--text3)'; e.currentTarget.style.background='transparent'; }}>
            <LogOut size={14} style={{ flexShrink:0 }} />
            <AnimatePresence>
              {!collapsed && <motion.span initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>Logout</motion.span>}
            </AnimatePresence>
          </button>
        </div>

        {/* Toggle */}
        <button onClick={() => setCollapsed(!collapsed)}
          style={{ position:'absolute', top:13, right:-12, width:24, height:24, borderRadius:'50%', border:'1px solid var(--border)', background:'var(--bg3)', color:'var(--text3)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', zIndex:10, transition:'all 0.15s' }}
          onMouseEnter={e => { e.currentTarget.style.borderColor='var(--border-h)'; e.currentTarget.style.color='var(--text)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.color='var(--text3)'; }}>
          {collapsed ? <ChevronRight size={11} /> : <ChevronLeft size={11} />}
        </button>
      </motion.aside>

      {/* ── Main ── */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', minHeight:'100vh', overflow:'hidden' }}>
        <header style={{ display:'flex', alignItems:'center', justifyContent:'flex-end', height:52, padding:'0 20px', borderBottom:'1px solid var(--border)', background:'var(--bg2)', gap:10 }}>
          <ThemeToggle />
          <div style={{ width:30, height:30, borderRadius:8, background:'var(--accent)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700, color:'#fff' }}>
            {user?.name?.slice(0,2).toUpperCase()}
          </div>
        </header>
        <main style={{ flex:1, overflowY:'auto', padding:24 }}>
          <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.28 }}>
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
