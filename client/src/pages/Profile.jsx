import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../api';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user, updateUser, logout } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [saving, setSaving] = useState(false);

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await authAPI.updateProfile({ name });
      updateUser(res.data);
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2>⚙️ Profile</h2>
          <p>Manage your account settings</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, maxWidth: 800 }}>
        <div className="card">
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div className="user-avatar" style={{ width: 72, height: 72, fontSize: 24, margin: '0 auto 12px' }}>
              {initials}
            </div>
            <div style={{ fontWeight: 700, fontSize: 18 }}>{user?.name}</div>
            <div style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{user?.email}</div>
            <span className={`badge ${user?.role === 'admin' ? 'badge-admin' : 'badge-member'}`} style={{ marginTop: 8 }}>
              {user?.role}
            </span>
          </div>

          <form onSubmit={handleSave}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input className="form-input" value={name} onChange={e => setName(e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-input" value={user?.email} disabled style={{ opacity: 0.6 }} />
            </div>
            <button className="btn btn-primary" type="submit" disabled={saving} style={{ width: '100%', justifyContent: 'center' }}>
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </form>
        </div>

        <div className="card">
          <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Account Info</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              { label: 'Role', value: user?.role },
              { label: 'Member Since', value: user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—' },
              { label: 'User ID', value: user?._id?.slice(-8) + '…' },
            ].map(({ label, value }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{label}</span>
                <span style={{ fontWeight: 600, fontSize: 13, textTransform: 'capitalize' }}>{value}</span>
              </div>
            ))}
          </div>

          <button className="btn btn-danger" style={{ width: '100%', justifyContent: 'center', marginTop: 24 }}
            onClick={() => { if (confirm('Sign out?')) logout(); }}>
            🚪 Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
