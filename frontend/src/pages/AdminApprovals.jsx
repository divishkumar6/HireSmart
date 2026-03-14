import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, CheckCircle, XCircle, RefreshCw, Users, Mail, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../utils/api';

export default function AdminApprovals() {
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState({});

  const fetch = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/pending-users');
      setPending(data.users);
    } catch { toast.error('Failed to load'); }
    setLoading(false);
  };

  useEffect(() => { fetch(); }, []);

  const approve = async (id, name) => {
    setActing(a => ({ ...a, [id]: 'approving' }));
    try {
      await api.put('/admin/users/' + id + '/approve');
      setPending(p => p.filter(u => u._id !== id));
      toast.success(name + ' approved!');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    setActing(a => { const n = { ...a }; delete n[id]; return n; });
  };

  const reject = async (id, name) => {
    setActing(a => ({ ...a, [id]: 'rejecting' }));
    try {
      await api.put('/admin/users/' + id + '/reject');
      setPending(p => p.filter(u => u._id !== id));
      toast.success(name + "'s request rejected");
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    setActing(a => { const n = { ...a }; delete n[id]; return n; });
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="page-title flex items-center gap-3">
            <Clock size={24} style={{ color: '#f59e0b' }} /> Account Approvals
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text3)' }}>
            Review and approve pending account requests
          </p>
        </div>
        <button onClick={fetch} className="btn-ghost flex items-center gap-2 text-sm">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Badge */}
      {pending.length > 0 && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl"
          style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
          <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <p className="text-sm font-semibold" style={{ color: '#f59e0b' }}>
            {pending.length} pending request{pending.length !== 1 ? 's' : ''} waiting for your review
          </p>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-7 h-7 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--accent)' }} />
        </div>
      ) : pending.length === 0 ? (
        <div className="glass p-16 text-center">
          <CheckCircle size={40} className="mx-auto mb-4 opacity-30" style={{ color: '#10b981' }} />
          <p className="section-title mb-1">All caught up!</p>
          <p className="text-sm" style={{ color: 'var(--text3)' }}>No pending account requests.</p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {pending.map((user, i) => (
              <motion.div key={user._id}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: 40 }}
                transition={{ delay: i * 0.05 }}
                className="glass p-5"
              >
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold text-white shrink-0"
                      style={{ background: user.role === 'admin' ? 'linear-gradient(135deg,#f59e0b,#f97316)' : 'linear-gradient(135deg,var(--accent),var(--accent2))' }}>
                      {user.name?.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-display font-semibold" style={{ color: 'var(--text)' }}>{user.name}</p>
                        <span className="badge text-xs px-2 py-0.5"
                          style={{ background: user.role === 'admin' ? 'rgba(245,158,11,0.12)' : 'rgba(99,114,241,0.12)', color: user.role === 'admin' ? '#f59e0b' : 'var(--accent)' }}>
                          {user.role === 'admin' ? '👑 Admin' : '🎯 Recruiter'}
                        </span>
                      </div>
                      <p className="text-sm flex items-center gap-1 mt-1" style={{ color: 'var(--text3)' }}>
                        <Mail size={12} /> {user.email}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--text3)' }}>
                        Requested {new Date(user.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => reject(user._id, user.name)}
                      disabled={!!acting[user._id]}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                      style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.18)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
                    >
                      {acting[user._id] === 'rejecting'
                        ? <div className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#ef4444' }} />
                        : <><XCircle size={15} /> Reject</>}
                    </button>
                    <button
                      onClick={() => approve(user._id, user.name)}
                      disabled={!!acting[user._id]}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                      style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981', border: '1px solid rgba(16,185,129,0.2)' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(16,185,129,0.18)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'rgba(16,185,129,0.1)'}
                    >
                      {acting[user._id] === 'approving'
                        ? <div className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#10b981' }} />
                        : <><CheckCircle size={15} /> Approve</>}
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
