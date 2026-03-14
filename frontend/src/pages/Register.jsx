import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, Lock, Eye, EyeOff, Zap, ArrowRight, CheckCircle, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const REQ = [
  { label:'At least 6 characters', test: p => p.length >= 6 },
  { label:'Contains a number',     test: p => /\d/.test(p) },
  { label:'Contains a letter',     test: p => /[a-zA-Z]/.test(p) },
];

export default function Register() {
  const [form, setForm]       = useState({ name:'', email:'', password:'', confirm:'', role:'recruiter' });
  const [show, setShow]       = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) return toast.error('All fields required');
    if (form.password !== form.confirm) return toast.error('Passwords do not match');
    if (form.password.length < 6) return toast.error('Password must be 6+ characters');
    setLoading(true);
    try {
      const result = await register({ name:form.name, email:form.email, password:form.password, role:form.role });
      if (result?.pending) { setSubmitted(true); }
      else { toast.success('Welcome to SmartHire!'); navigate('/dashboard'); }
    } catch (err) { toast.error(err.response?.data?.message || 'Registration failed'); }
    finally { setLoading(false); }
  };

  if (submitted) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:24, background:'var(--bg)' }}>
      <motion.div initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }}
        className="card" style={{ maxWidth:400, width:'100%', padding:40, textAlign:'center' }}>
        <div style={{ width:56, height:56, borderRadius:16, background:'rgba(244,165,53,0.1)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px' }}>
          <Clock size={28} style={{ color:'var(--gold)' }} />
        </div>
        <h2 style={{ fontFamily:'Syne', fontSize:22, fontWeight:700, color:'var(--text)', marginBottom:8 }}>Request Submitted!</h2>
        <p style={{ fontSize:13, color:'var(--text2)', lineHeight:1.7, marginBottom:24 }}>
          Your account request for <strong style={{ color:'var(--text)' }}>{form.email}</strong> has been submitted. An admin will review and approve it before you can log in.
        </p>
        <div style={{ padding:16, borderRadius:10, background:'rgba(244,165,53,0.07)', border:'1px solid rgba(244,165,53,0.18)', marginBottom:24, textAlign:'left' }}>
          <p style={{ fontSize:11, fontWeight:700, color:'var(--gold)', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:10 }}>What happens next?</p>
          {['Admin reviews your request','Account gets approved','Log in with your credentials'].map((s,i) => (
            <div key={i} style={{ display:'flex', alignItems:'center', gap:10, marginBottom:6, fontSize:13, color:'var(--text2)' }}>
              <div style={{ width:20, height:20, borderRadius:'50%', background:'rgba(244,165,53,0.2)', color:'var(--gold)', fontSize:10, fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>{i+1}</div>
              {s}
            </div>
          ))}
        </div>
        <Link to="/login" className="btn btn-primary" style={{ width:'100%', padding:'11px', fontSize:14 }}>
          Back to Login
        </Link>
      </motion.div>
    </div>
  );

  return (
    <div style={{ minHeight:'100vh', display:'flex', background:'var(--bg)' }}>
      {/* Left panel */}
      <div style={{ display:'none', flex:'0 0 42%', position:'relative', overflow:'hidden', flexDirection:'column', justifyContent:'space-between', padding:48,
        background:'linear-gradient(135deg,#0c1445 0%,#1a1060 40%,#0f2460 100%)' }} className="lg:flex">
        <div style={{ position:'absolute', inset:0, opacity:0.08,
          backgroundImage:'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)',
          backgroundSize:'32px 32px' }} />
        <div style={{ position:'absolute', top:'25%', right:0, width:320, height:320, borderRadius:'50%', opacity:0.12,
          background:'radial-gradient(circle,#6272f1,transparent)', filter:'blur(60px)' }} />

        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} style={{ position:'relative', zIndex:1, display:'flex', alignItems:'center', gap:12 }}>
          <div style={{ width:40, height:40, borderRadius:11, background:'rgba(255,255,255,0.15)', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <Zap size={20} color="#fff" />
          </div>
          <span style={{ fontFamily:'Syne', fontWeight:700, fontSize:20, color:'#fff' }}>SmartHire</span>
        </motion.div>

        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.2 }} style={{ position:'relative', zIndex:1 }}>
          <h2 style={{ fontFamily:'Syne', fontSize:36, fontWeight:700, color:'#fff', lineHeight:1.2, marginBottom:12 }}>
            Request your<br />account today
          </h2>
          <p style={{ color:'rgba(255,255,255,0.55)', fontSize:14, lineHeight:1.7, marginBottom:28 }}>
            Accounts are reviewed by an admin before you can log in.
          </p>
          {['Free — no credit card needed','AI-powered ATS scoring','Real-time analytics dashboard','Admin approves within 24 hours'].map((text,i) => (
            <motion.div key={i} initial={{ opacity:0, x:-14 }} animate={{ opacity:1, x:0 }} transition={{ delay:0.3+i*0.08 }}
              style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
              <CheckCircle size={15} color="#4ade80" style={{ flexShrink:0 }} />
              <span style={{ color:'rgba(255,255,255,0.7)', fontSize:13 }}>{text}</span>
            </motion.div>
          ))}
        </motion.div>
        <p style={{ position:'relative', zIndex:1, color:'rgba(255,255,255,0.2)', fontSize:11 }}>© 2025 SmartHire</p>
      </div>

      {/* Right - form */}
      <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:24, overflowY:'auto', position:'relative', zIndex:10 }}>
        <motion.div initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} style={{ width:'100%', maxWidth:420, paddingTop:24, paddingBottom:24 }}>
          <div className="lg:hidden" style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:12, marginBottom:28 }}>
            <div style={{ width:40, height:40, borderRadius:11, background:'var(--accent)', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <Zap size={20} color="#fff" />
            </div>
            <span style={{ fontFamily:'Syne', fontWeight:700, fontSize:20, color:'var(--text)' }}>SmartHire</span>
          </div>

          <div style={{ marginBottom:24 }}>
            <h1 style={{ fontFamily:'Syne', fontSize:22, fontWeight:700, color:'var(--text)' }}>Request an account</h1>
            <p style={{ fontSize:13, color:'var(--text3)', marginTop:3 }}>
              Already have one? <Link to="/login" style={{ color:'var(--accent)', textDecoration:'none', fontWeight:600 }}>Sign in</Link>
            </p>
          </div>

          <div className="card" style={{ padding:28 }}>
            {/* Role selector */}
            <div style={{ marginBottom:20 }}>
              <label className="label">Requesting access as</label>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                {[{value:'recruiter',label:'🎯 Recruiter',desc:'Manage drives & candidates'},
                  {value:'admin',label:'👑 Admin',desc:'Full system access'}].map(({value,label,desc}) => (
                  <button key={value} type="button" onClick={() => setForm({...form,role:value})}
                    style={{ padding:'12px', borderRadius:9, textAlign:'left', cursor:'pointer', transition:'all 0.15s', border:'none',
                      background: form.role===value ? 'rgba(91,110,245,0.1)' : 'var(--card)',
                      outline: `1px solid ${form.role===value ? 'rgba(91,110,245,0.35)' : 'var(--border)'}` }}>
                    <p style={{ fontSize:13, fontWeight:600, color: form.role===value ? 'var(--accent)' : 'var(--text)' }}>{label}</p>
                    <p style={{ fontSize:11, color:'var(--text3)', marginTop:2 }}>{desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={submit} style={{ display:'flex', flexDirection:'column', gap:14 }}>
              <div>
                <label className="label">Full Name</label>
                <div style={{ position:'relative' }}>
                  <User size={13} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'var(--text3)' }} />
                  <input type="text" value={form.name} onChange={e => setForm({...form,name:e.target.value})}
                    placeholder="Priya Sharma" className="input" style={{ paddingLeft:34 }} autoComplete="name" />
                </div>
              </div>
              <div>
                <label className="label">Work Email</label>
                <div style={{ position:'relative' }}>
                  <Mail size={13} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'var(--text3)' }} />
                  <input type="email" value={form.email} onChange={e => setForm({...form,email:e.target.value})}
                    placeholder="you@company.com" className="input" style={{ paddingLeft:34 }} autoComplete="email" />
                </div>
              </div>
              <div>
                <label className="label">Password</label>
                <div style={{ position:'relative' }}>
                  <Lock size={13} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'var(--text3)' }} />
                  <input type={show?'text':'password'} value={form.password} onChange={e => setForm({...form,password:e.target.value})}
                    placeholder="Create a strong password" className="input" style={{ paddingLeft:34, paddingRight:40 }} autoComplete="new-password" />
                  <button type="button" onClick={() => setShow(!show)}
                    style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'var(--text3)' }}>
                    {show ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                {form.password && (
                  <div style={{ marginTop:8, display:'flex', flexDirection:'column', gap:4 }}>
                    {REQ.map(({label,test}) => (
                      <div key={label} style={{ display:'flex', alignItems:'center', gap:7 }}>
                        <div style={{ width:12, height:12, borderRadius:'50%', background: test(form.password) ? 'rgba(34,197,94,0.2)':'var(--card)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                          <div style={{ width:5, height:5, borderRadius:'50%', background: test(form.password) ? '#22c55e':'var(--text3)' }} />
                        </div>
                        <span style={{ fontSize:11, color: test(form.password) ? '#22c55e':'var(--text3)' }}>{label}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <label className="label">Confirm Password</label>
                <div style={{ position:'relative' }}>
                  <Lock size={13} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'var(--text3)' }} />
                  <input type="password" value={form.confirm} onChange={e => setForm({...form,confirm:e.target.value})}
                    placeholder="Repeat your password" className="input" style={{ paddingLeft:34,
                      borderColor: form.confirm && form.confirm !== form.password ? 'var(--red)':'' }} autoComplete="new-password" />
                </div>
                {form.confirm && form.confirm !== form.password && (
                  <p style={{ fontSize:11, color:'var(--red)', marginTop:4 }}>Passwords do not match</p>
                )}
              </div>

              <button type="submit" disabled={loading} className="btn btn-primary" style={{ width:'100%', padding:'11px', fontSize:14, marginTop:4 }}>
                {loading
                  ? <div style={{ width:18, height:18, border:'2px solid rgba(255,255,255,0.3)', borderTopColor:'#fff', borderRadius:'50%', animation:'spin 0.75s linear infinite' }} />
                  : <><span>Submit Request</span><ArrowRight size={15} /></>}
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
