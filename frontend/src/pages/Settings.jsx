import { useState } from 'react';
import { motion } from 'framer-motion';
import { Save, User, Lock, Shield, Sun, Moon, Monitor } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function Settings() {
  const { user, updateUser } = useAuth();
  const { theme, changeTheme } = useTheme();
  const [profile, setProfile] = useState({ name: user?.name || '', email: user?.email || '' });
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [saving, setSaving] = useState(false);
  const [savingPass, setSavingPass] = useState(false);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.put('/auth/profile', { name: profile.name });
      updateUser(data.user);
      toast.success('Profile updated');
    } catch { toast.error('Failed to update'); }
    setSaving(false);
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirm) return toast.error('Passwords do not match');
    if (passwords.newPassword.length < 6) return toast.error('Min 6 characters');
    setSavingPass(true);
    try {
      await api.put('/auth/change-password', { currentPassword: passwords.currentPassword, newPassword: passwords.newPassword });
      toast.success('Password changed');
      setPasswords({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    setSavingPass(false);
  };

  const themeOptions = [
    { value: 'light', icon: Sun, label: 'Light Mode' },
    { value: 'system', icon: Monitor, label: 'System Default' },
    { value: 'dark', icon: Moon, label: 'Dark Mode' },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="page-title">Settings</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text3)' }}>Manage your account preferences</p>
      </div>

      {/* Theme */}
      <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="glass p-6">
        <div className="flex items-center gap-3 mb-5">
          <Sun size={17} style={{ color: '#f59e0b' }} />
          <h2 className="section-title">Appearance</h2>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {themeOptions.map(({ value, icon: Icon, label }) => (
            <button key={value} onClick={() => changeTheme(value)}
              className="flex flex-col items-center gap-2 p-4 rounded-xl transition-all"
              style={{
                background: theme === value ? 'rgba(99,114,241,0.12)' : 'var(--card)',
                border: `1px solid ${theme === value ? 'rgba(99,114,241,0.4)' : 'var(--border)'}`,
              }}>
              <Icon size={20} style={{ color: theme === value ? 'var(--accent)' : 'var(--text3)' }} />
              <span className="text-xs font-medium" style={{ color: theme === value ? 'var(--accent)' : 'var(--text2)' }}>{label}</span>
              {theme === value && <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--accent)' }} />}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Profile */}
      <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass p-6">
        <div className="flex items-center gap-3 mb-5">
          <User size={17} style={{ color: 'var(--accent)' }} />
          <h2 className="section-title">Profile</h2>
        </div>
        <div className="flex items-center gap-4 mb-6 p-4 rounded-xl" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <div className="w-13 h-13 w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold text-white"
            style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent2))' }}>
            {user?.name?.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <p className="font-display font-semibold" style={{ color: 'var(--text)' }}>{user?.name}</p>
            <p className="text-sm" style={{ color: 'var(--text3)' }}>{user?.email}</p>
            <span className="badge mt-1 capitalize"
              style={{ background: user?.role === 'admin' ? 'rgba(245,158,11,0.1)' : 'rgba(99,114,241,0.1)', color: user?.role === 'admin' ? '#f59e0b' : 'var(--accent)' }}>
              {user?.role === 'admin' ? '👑 Admin' : '🎯 Recruiter'}
            </span>
          </div>
        </div>
        <form onSubmit={handleProfileSave} className="space-y-4">
          <div>
            <label className="label">Display Name</label>
            <input value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} className="input" />
          </div>
          <div>
            <label className="label">Email (read-only)</label>
            <input value={profile.email} disabled className="input opacity-50 cursor-not-allowed" />
          </div>
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Save size={14} /> Save Profile</>}
          </button>
        </form>
      </motion.div>

      {/* Password */}
      <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass p-6">
        <div className="flex items-center gap-3 mb-5">
          <Lock size={17} style={{ color: '#22d3ee' }} />
          <h2 className="section-title">Change Password</h2>
        </div>
        <form onSubmit={handlePasswordChange} className="space-y-4">
          {[['currentPassword','Current Password'],['newPassword','New Password'],['confirm','Confirm Password']].map(([field, label]) => (
            <div key={field}>
              <label className="label">{label}</label>
              <input type="password" value={passwords[field]} onChange={(e) => setPasswords({ ...passwords, [field]: e.target.value })} placeholder="••••••••" className="input" />
            </div>
          ))}
          <button type="submit" disabled={savingPass} className="btn-primary">
            {savingPass ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Lock size={14} /> Update Password</>}
          </button>
        </form>
      </motion.div>

      {/* Info */}
      <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass p-6">
        <div className="flex items-center gap-3 mb-4">
          <Shield size={17} style={{ color: '#f59e0b' }} />
          <h2 className="section-title">Account Info</h2>
        </div>
        <div className="space-y-3 text-sm">
          {[
            ['Account ID', <span className="font-mono text-xs" style={{ color: 'var(--text3)' }}>{user?._id}</span>],
            ['Role', <span style={{ color: 'var(--text)' }} className="capitalize">{user?.role}</span>],
            ['Last Login', <span style={{ color: 'var(--text3)' }}>{user?.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'N/A'}</span>],
          ].map(([label, val]) => (
            <div key={label} className="flex justify-between">
              <span style={{ color: 'var(--text3)' }}>{label}</span>
              {val}
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
