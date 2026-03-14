import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Zap, Sparkles, Brain, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [form, setForm]       = useState({ email: '', password: '' });
  const [show, setShow]       = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login }  = useAuth();
  const navigate   = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) { toast.error('Fill all fields'); return; }
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid credentials');
    } finally { setLoading(false); }
  };

  const fill = (type) => setForm({
    email: type === 'admin' ? 'admin@smarthire.com' : 'recruiter@smarthire.com',
    password: 'password123',
  });

  return (
    <div style={{ minHeight:'100vh', display:'flex', background:'var(--bg)' }}>
      {/* Left */}
      <div style={{ display:'none', flex:'0 0 50%', position:'relative', overflow:'hidden',
        background:'linear-gradient(135deg,#1a1060 0%,#2d1b8c 35%,#0f2460 70%,#071a3e 100%)' }}
        className="lg:flex flex-col justify-between p-12">
        {/* Glow blobs */}
        {[
          ['500px','#6272f1','-10%','-10%','0s','10s'],
          ['400px','#22d3ee','50%','60%','3s','13s'],
          ['300px','#a855f7','20%','70%','6s','9s'],
          ['250px','#f59e0b','70%','-5%','2s','11s'],
        ].map(([size,color,top,left,delay,dur]) => (
          <div key={color} style={{ position:'absolute', width:size, height:size, borderRadius:'50%',
            background:`radial-gradient(circle,${color},transparent)`, top, left,
            filter:'blur(40px)', opacity:0.2, animationDelay:delay, animationDuration:dur,
            animation:`float ${dur} ease-in-out infinite` }} />
        ))}
        <div style={{ position:'absolute', inset:0, opacity:0.08,
          backgroundImage:'linear-gradient(rgba(255,255,255,0.1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.1) 1px,transparent 1px)',
          backgroundSize:'60px 60px' }} />

        {/* Logo */}
        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} style={{ position:'relative', zIndex:1, display:'flex', alignItems:'center', gap:12 }}>
          <div style={{ width:40, height:40, borderRadius:11, background:'rgba(255,255,255,0.18)', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <Zap size={20} color="#fff" />
          </div>
          <span style={{ color:'#fff', fontFamily:'Syne', fontWeight:700, fontSize:20 }}>SmartHire</span>
        </motion.div>

        {/* Content */}
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.2 }}
          style={{ position:'relative', zIndex:1 }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'7px 16px', borderRadius:99,
            background:'rgba(255,255,255,0.1)', border:'1px solid rgba(255,255,255,0.2)', marginBottom:20 }}>
            <Sparkles size={14} color="#fbbf24" />
            <span style={{ color:'rgba(255,255,255,0.9)', fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'1.5px' }}>AI-Powered Platform</span>
          </div>
          <h1 style={{ color:'#fff', fontFamily:'Syne', fontSize:44, fontWeight:700, lineHeight:1.15, marginBottom:12 }}>
            AI-Powered<br />Recruitment<br />
            <span style={{ background:'linear-gradient(90deg,#22d3ee,#a855f7,#f59e0b)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>Intelligence</span>
          </h1>
          <p style={{ color:'rgba(255,255,255,0.55)', fontSize:15, lineHeight:1.7, maxWidth:360 }}>
            Evaluate candidates faster. Hire smarter.
          </p>

          <div style={{ marginTop:32, display:'flex', flexDirection:'column', gap:12 }}>
            {[
              [Brain,    'ATS Score — AI-powered candidate ranking'],
              [Sparkles, 'Skill Heatmap — Visualize talent distribution'],
              [Zap,      'Real-time Dashboard — Live analytics'],
            ].map(([Icon, text], i) => (
              <motion.div key={text} initial={{ opacity:0, x:-16 }} animate={{ opacity:1, x:0 }} transition={{ delay:0.3+i*0.1 }}
                style={{ display:'flex', alignItems:'center', gap:12 }}>
                <div style={{ width:32, height:32, borderRadius:8, background:'rgba(255,255,255,0.12)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <Icon size={15} color="#fff" />
                </div>
                <span style={{ color:'rgba(255,255,255,0.75)', fontSize:13 }}>{text}</span>
              </motion.div>
            ))}
          </div>

          <div style={{ marginTop:36, paddingTop:28, borderTop:'1px solid rgba(255,255,255,0.12)', display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16 }}>
            {[['98%','Accuracy'],['3x','Faster Hiring'],['500+','Companies']].map(([val,label]) => (
              <div key={label}>
                <p style={{ fontFamily:'Syne', fontWeight:700, fontSize:24, color:'#fff' }}>{val}</p>
                <p style={{ fontSize:12, color:'rgba(255,255,255,0.4)' }}>{label}</p>
              </div>
            ))}
          </div>
        </motion.div>

        <p style={{ position:'relative', zIndex:1, color:'rgba(255,255,255,0.25)', fontSize:11 }}>© 2025 SmartHire. All rights reserved.</p>
      </div>

      {/* Right */}
      <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:24, position:'relative', zIndex:10 }}>
        <motion.div initial={{ opacity:0, x:24 }} animate={{ opacity:1, x:0 }} transition={{ duration:0.5 }} style={{ width:'100%', maxWidth:420 }}>
          {/* Mobile logo */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:12, marginBottom:32 }} className="lg:hidden">
            <div style={{ width:40, height:40, borderRadius:11, background:'var(--accent)', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <Zap size={20} color="#fff" />
            </div>
            <span style={{ fontFamily:'Syne', fontWeight:700, fontSize:20, color:'var(--text)' }}>SmartHire</span>
          </div>

          <div className="card" style={{ padding:32 }}>
            <h2 style={{ fontFamily:'Syne', fontSize:22, fontWeight:700, color:'var(--text)', marginBottom:4 }}>Welcome back</h2>
            <p style={{ fontSize:13, color:'var(--text3)', marginBottom:28 }}>Sign in to your SmartHire account</p>

            <form onSubmit={submit} style={{ display:'flex', flexDirection:'column', gap:16 }}>
              <div>
                <label className="label">Email Address</label>
                <div style={{ position:'relative' }}>
                  <Mail size={14} style={{ position:'absolute', left:13, top:'50%', transform:'translateY(-50%)', color:'var(--text3)' }} />
                  <input type="email" value={form.email} onChange={e => setForm({...form,email:e.target.value})}
                    placeholder="you@company.com" className="input" style={{ paddingLeft:36 }} autoComplete="email" />
                </div>
              </div>

              <div>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
                  <label className="label" style={{ margin:0 }}>Password</label>
                  <button type="button" onClick={() => toast('Coming soon')}
                    style={{ fontSize:12, color:'var(--accent)', background:'none', border:'none', cursor:'pointer', fontWeight:500 }}>
                    Forgot password?
                  </button>
                </div>
                <div style={{ position:'relative' }}>
                  <Lock size={14} style={{ position:'absolute', left:13, top:'50%', transform:'translateY(-50%)', color:'var(--text3)' }} />
                  <input type={show?'text':'password'} value={form.password} onChange={e => setForm({...form,password:e.target.value})}
                    placeholder="••••••••" className="input" style={{ paddingLeft:36, paddingRight:40 }} autoComplete="current-password" />
                  <button type="button" onClick={() => setShow(!show)}
                    style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'var(--text3)' }}>
                    {show ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <input type="checkbox" id="rem" checked={remember} onChange={e => setRemember(e.target.checked)}
                  style={{ width:15, height:15, accentColor:'var(--accent)', cursor:'pointer' }} />
                <label htmlFor="rem" style={{ fontSize:13, color:'var(--text2)', cursor:'pointer' }}>Remember me for 30 days</label>
              </div>

              <button type="submit" disabled={loading} className="btn btn-primary" style={{ width:'100%', padding:'11px', fontSize:14, marginTop:4 }}>
                {loading
                  ? <div style={{ width:18, height:18, border:'2px solid rgba(255,255,255,0.3)', borderTopColor:'#fff', borderRadius:'50%', animation:'spin 0.75s linear infinite' }} />
                  : <><span>Sign In</span><ArrowRight size={15} /></>}
              </button>
            </form>

            <div style={{ display:'flex', alignItems:'center', gap:12, margin:'20px 0' }}>
              <div style={{ flex:1, height:1, background:'var(--border)' }} />
              <span style={{ fontSize:12, color:'var(--text3)' }}>or</span>
              <div style={{ flex:1, height:1, background:'var(--border)' }} />
            </div>

            <Link to="/register" style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:6,
              padding:'10px', borderRadius:9, background:'var(--card)', border:'1px solid var(--border)',
              color:'var(--text2)', fontSize:13, fontWeight:600, textDecoration:'none', transition:'all 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor='var(--border-h)'; e.currentTarget.style.color='var(--text)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.color='var(--text2)'; }}>
              Create Account <ChevronRight size={14} />
            </Link>

            {/* Demo credentials */}
            <div style={{ marginTop:20, padding:16, borderRadius:10, background:'rgba(91,110,245,0.06)', border:'1px solid rgba(91,110,245,0.15)' }}>
              <p style={{ fontSize:11, fontWeight:700, color:'var(--text3)', textAlign:'center', marginBottom:10, textTransform:'uppercase', letterSpacing:'0.5px' }}>
                ⚡ Demo Credentials
              </p>
              <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                {[{label:'👑 Admin',type:'admin',email:'admin@smarthire.com'},{label:'🎯 Recruiter',type:'recruiter',email:'recruiter@smarthire.com'}].map(({label,type,email}) => (
                  <button key={type} onClick={() => fill(type)}
                    style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'9px 12px', borderRadius:8, background:'var(--card)', border:'1px solid var(--border)', cursor:'pointer', transition:'all 0.15s', textAlign:'left', width:'100%' }}
                    onMouseEnter={e => e.currentTarget.style.borderColor='var(--accent)'}
                    onMouseLeave={e => e.currentTarget.style.borderColor='var(--border)'}>
                    <div>
                      <p style={{ fontSize:13, fontWeight:600, color:'var(--text)' }}>{label}</p>
                      <p style={{ fontSize:11, fontFamily:'monospace', color:'var(--text3)' }}>{email}</p>
                    </div>
                    <span style={{ fontSize:11, color:'var(--accent)', fontWeight:600 }}>Fill ↗</span>
                  </button>
                ))}
              </div>
              <p style={{ fontSize:11, color:'var(--text3)', textAlign:'center', marginTop:8 }}>
                Password: <span style={{ fontFamily:'monospace', color:'var(--text2)' }}>password123</span>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
