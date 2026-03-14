import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Shield, UserX, UserCheck, Crown, Search,
  Trash2, ChevronDown, RefreshCw, Mail, Calendar,
  ToggleLeft, ToggleRight, AlertTriangle, X
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../utils/api';

const RoleBadge = ({ role }) => (
  <span className="badge" style={{
    background: role === 'admin' ? 'rgba(245,158,11,0.12)' : 'rgba(99,114,241,0.12)',
    color: role === 'admin' ? '#f59e0b' : 'var(--accent)',
    border: `1px solid ${role === 'admin' ? 'rgba(245,158,11,0.25)' : 'rgba(99,114,241,0.25)'}`,
  }}>
    {role === 'admin' ? '👑' : '🎯'} {role}
  </span>
);

const StatusDot = ({ active }) => (
  <div className="flex items-center gap-1.5">
    <div className="w-2 h-2 rounded-full" style={{ background: active ? '#10b981' : '#ef4444' }} />
    <span className="text-xs" style={{ color: active ? '#10b981' : '#ef4444' }}>{active ? 'Active' : 'Inactive'}</span>
  </div>
);

function ConfirmModal({ title, message, onConfirm, onCancel, danger }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}>
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
        className="glass p-7 max-w-sm w-full" style={{ boxShadow: '0 24px 64px rgba(0,0,0,0.5)' }}>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: danger ? 'rgba(239,68,68,0.12)' : 'rgba(245,158,11,0.12)' }}>
            <AlertTriangle size={20} style={{ color: danger ? '#ef4444' : '#f59e0b' }} />
          </div>
          <h3 className="section-title">{title}</h3>
        </div>
        <p className="text-sm mb-6" style={{ color: 'var(--text2)' }}>{message}</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="btn-ghost flex-1 justify-center text-sm py-2">Cancel</button>
          <button onClick={onConfirm}
            className="flex-1 py-2 rounded-xl text-sm font-semibold text-white transition-all flex items-center justify-center"
            style={{ background: danger ? '#ef4444' : 'var(--accent)' }}>
            Confirm
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [confirm, setConfirm] = useState(null);
  const [openMenu, setOpenMenu] = useState(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (roleFilter) params.set('role', roleFilter);
      const { data } = await api.get(`/admin/users?${params}`);
      setUsers(data.users);
    } catch { toast.error('Failed to fetch users'); }
    setLoading(false);
  }, [search, roleFilter]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleToggle = (user) => {
    setConfirm({
      title: user.isActive ? 'Deactivate User' : 'Activate User',
      message: `${user.isActive ? 'Deactivate' : 'Activate'} account for ${user.name}? ${user.isActive ? 'They will no longer be able to log in.' : 'They will regain access.'}`,
      danger: user.isActive,
      onConfirm: async () => {
        try {
          const { data } = await api.put(`/admin/users/${user._id}/toggle-status`);
          setUsers(prev => prev.map(u => u._id === user._id ? data.user : u));
          toast.success(data.message);
        } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
        setConfirm(null);
      },
    });
  };

  const handleRoleChange = (user, newRole) => {
    setOpenMenu(null);
    setConfirm({
      title: 'Change Role',
      message: `Change ${user.name}'s role from ${user.role} to ${newRole}? This changes their access level.`,
      danger: false,
      onConfirm: async () => {
        try {
          const { data } = await api.put(`/admin/users/${user._id}/role`, { role: newRole });
          setUsers(prev => prev.map(u => u._id === user._id ? data.user : u));
          toast.success('Role updated');
        } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
        setConfirm(null);
      },
    });
  };

  const handleDelete = (user) => {
    setOpenMenu(null);
    setConfirm({
      title: 'Delete User',
      message: `Permanently delete ${user.name}? Their drives will be reassigned to you. This cannot be undone.`,
      danger: true,
      onConfirm: async () => {
        try {
          await api.delete(`/admin/users/${user._id}`);
          setUsers(prev => prev.filter(u => u._id !== user._id));
          toast.success('User deleted');
        } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
        setConfirm(null);
      },
    });
  };

  const admins = users.filter(u => u.role === 'admin').length;
  const recruiters = users.filter(u => u.role === 'recruiter').length;
  const activeCount = users.filter(u => u.isActive).length;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="page-title flex items-center gap-3">
            <Shield size={26} style={{ color: 'var(--accent)' }} /> User Management
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text3)' }}>Admin-only · Manage all user accounts and permissions</p>
        </div>
        <button onClick={fetchUsers} className="btn-ghost flex items-center gap-2 text-sm">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Users', value: users.length, color: 'var(--accent)', bg: 'rgba(99,114,241,0.1)' },
          { label: 'Active', value: activeCount, color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
          { label: 'Admins', value: admins, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className="glass p-4 text-center" style={{ background: bg }}>
            <p className="text-2xl font-display font-bold" style={{ color }}>{value}</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text3)' }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--text3)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search users..." className="input pl-11 py-2.5 text-sm" />
        </div>
        <div className="flex gap-2">
          {[['', 'All'], ['admin', '👑 Admins'], ['recruiter', '🎯 Recruiters']].map(([val, label]) => (
            <button key={val} onClick={() => setRoleFilter(val)}
              className="px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
              style={{
                background: roleFilter === val ? 'rgba(99,114,241,0.15)' : 'var(--card)',
                border: `1px solid ${roleFilter === val ? 'rgba(99,114,241,0.4)' : 'var(--border)'}`,
                color: roleFilter === val ? 'var(--accent)' : 'var(--text2)',
              }}>{label}
            </button>
          ))}
        </div>
      </div>

      {/* Users table */}
      <div className="glass overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-7 h-7 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--accent)' }} />
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-12">
            <Users size={36} className="mx-auto mb-3 opacity-20" style={{ color: 'var(--text3)' }} />
            <p style={{ color: 'var(--text3)' }}>No users found</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', background: 'rgba(255,255,255,0.02)' }}>
                {['User', 'Role', 'Status', 'Last Login', 'Actions'].map(h => (
                  <th key={h} className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider"
                    style={{ color: 'var(--text3)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((user, i) => (
                <motion.tr key={user._id}
                  initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                  style={{ borderBottom: '1px solid var(--border)', opacity: user.isActive ? 1 : 0.6 }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(99,114,241,0.04)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold text-white shrink-0"
                        style={{ background: user.role === 'admin' ? 'linear-gradient(135deg,#f59e0b,#f97316)' : 'linear-gradient(135deg,var(--accent),var(--accent2))' }}>
                        {user.name?.slice(0,2).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-sm" style={{ color: 'var(--text)' }}>{user.name}</p>
                        <p className="text-xs flex items-center gap-1" style={{ color: 'var(--text3)' }}>
                          <Mail size={10} /> {user.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4"><RoleBadge role={user.role} /></td>
                  <td className="px-6 py-4"><StatusDot active={user.isActive} /></td>
                  <td className="px-6 py-4">
                    <p className="text-xs" style={{ color: 'var(--text3)' }}>
                      {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 relative">
                      {/* Toggle active */}
                      <button onClick={() => handleToggle(user)} title={user.isActive ? 'Deactivate' : 'Activate'}
                        className="w-9 h-9 rounded-lg flex items-center justify-center transition-all"
                        style={{ background: user.isActive ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)' }}>
                        {user.isActive
                          ? <ToggleRight size={18} style={{ color: '#10b981' }} />
                          : <ToggleLeft size={18} style={{ color: '#ef4444' }} />}
                      </button>

                      {/* More menu */}
                      <div className="relative">
                        <button onClick={() => setOpenMenu(openMenu === user._id ? null : user._id)}
                          className="w-9 h-9 rounded-lg flex items-center justify-center transition-all"
                          style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                          <ChevronDown size={15} style={{ color: 'var(--text3)' }} />
                        </button>
                        <AnimatePresence>
                          {openMenu === user._id && (
                            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                              className="absolute right-0 top-full mt-1 w-44 rounded-xl overflow-hidden z-20 shadow-2xl"
                              style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}>
                              {user.role !== 'admin' && (
                                <button onClick={() => handleRoleChange(user, 'admin')}
                                  className="w-full flex items-center gap-2 px-4 py-3 text-sm transition-colors text-left"
                                  style={{ color: '#f59e0b' }}
                                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(245,158,11,0.08)'}
                                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                  <Crown size={14} /> Make Admin
                                </button>
                              )}
                              {user.role !== 'recruiter' && (
                                <button onClick={() => handleRoleChange(user, 'recruiter')}
                                  className="w-full flex items-center gap-2 px-4 py-3 text-sm transition-colors text-left"
                                  style={{ color: 'var(--accent)' }}
                                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(99,114,241,0.08)'}
                                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                  <Shield size={14} /> Make Recruiter
                                </button>
                              )}
                              <div style={{ borderTop: '1px solid var(--border)' }} />
                              <button onClick={() => handleDelete(user)}
                                className="w-full flex items-center gap-2 px-4 py-3 text-sm transition-colors text-left"
                                style={{ color: '#ef4444' }}
                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                <Trash2 size={14} /> Delete User
                              </button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {confirm && (
        <ConfirmModal {...confirm} onCancel={() => setConfirm(null)} />
      )}

      {openMenu && (
        <div className="fixed inset-0 z-10" onClick={() => setOpenMenu(null)} />
      )}
    </div>
  );
}
