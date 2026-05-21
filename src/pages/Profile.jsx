import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function Profile() {
  const { user, login } = useAuth();
  const [tab, setTab] = useState('profile');
  const [form, setForm] = useState({ name: '', phone: '', gender: '', date_of_birth: '' });
  const [passwords, setPasswords] = useState({ current_password: '', new_password: '', confirm_password: '' });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/auth/me').then(res => {
      const u = res.data;
      setForm({
        name: u.name || '',
        phone: u.phone || '',
        gender: u.gender || '',
        date_of_birth: u.date_of_birth ? u.date_of_birth.split('T')[0] : '',
      });
    });
  }, []);

  const handleSaveProfile = async () => {
    setError(''); setSuccess(''); setSaving(true);
    try {
      const res = await api.put('/auth/profile', form);
      // Update stored user
      const token = localStorage.getItem('token');
      login(res.data.user, token);
      setSuccess('Profile updated successfully!');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update profile');
    } finally { setSaving(false); }
  };

  const handleChangePassword = async () => {
    setError(''); setSuccess('');
    if (passwords.new_password !== passwords.confirm_password) {
      setError('New passwords do not match');
      return;
    }
    if (passwords.new_password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setSaving(true);
    try {
      await api.put('/auth/change-password', {
        current_password: passwords.current_password,
        new_password: passwords.new_password,
      });
      setSuccess('Password changed successfully!');
      setPasswords({ current_password: '', new_password: '', confirm_password: '' });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to change password');
    } finally { setSaving(false); }
  };

  return (
    <>
      <div style={{ background: 'linear-gradient(135deg, #AB1509 0%, #7a0e06 100%)', padding: '3rem 0' }}>
        <div className="container">
          <div className="d-flex align-items-center gap-4">
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(255,247,211,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 700, color: '#fff7d3', flexShrink: 0 }}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="fw-bold mb-0" style={{ color: '#fff7d3' }}>{user?.name}</h2>
              <p className="mb-0" style={{ color: 'rgba(255,247,211,0.8)' }}>{user?.email}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-8">

            {/* Tabs */}
            <div className="d-flex gap-2 mb-4">
              {[
                { key: 'profile', icon: 'fa-user', label: 'Personal Info' },
                { key: 'password', icon: 'fa-lock', label: 'Change Password' },
              ].map(t => (
                <button key={t.key} onClick={() => { setTab(t.key); setError(''); setSuccess(''); }}
                  className="btn px-4 py-2 fw-semibold"
                  style={{
                    borderRadius: 12,
                    background: tab === t.key ? '#AB1509' : 'white',
                    color: tab === t.key ? '#fff7d3' : '#6b5a58',
                    border: `1px solid ${tab === t.key ? '#AB1509' : '#e5e7eb'}`,
                    transition: 'all 0.2s',
                  }}>
                  <i className={`fa-solid ${t.icon} me-2`}></i>{t.label}
                </button>
              ))}
            </div>

            <div className="card border-0 shadow-sm" style={{ borderRadius: 16 }}>
              <div className="card-body p-4 p-md-5">
                {error && <div className="alert alert-danger"><i className="fa-solid fa-circle-exclamation me-2"></i>{error}</div>}
                {success && <div className="alert alert-success"><i className="fa-solid fa-circle-check me-2"></i>{success}</div>}

                {tab === 'profile' && (
                  <>
                    <h5 className="fw-bold mb-4">Personal Information</h5>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label fw-semibold">Full Name</label>
                        <input className="form-control" value={form.name}
                          onChange={e => setForm({ ...form, name: e.target.value })} />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-semibold">Phone</label>
                        <input className="form-control" value={form.phone}
                          onChange={e => setForm({ ...form, phone: e.target.value })}
                          placeholder="+961 xx xxx xxx" />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-semibold">Gender</label>
                        <select className="form-select" value={form.gender}
                          onChange={e => setForm({ ...form, gender: e.target.value })}>
                          <option value="">Prefer not to say</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-semibold">Date of Birth</label>
                        <input type="date" className="form-control" value={form.date_of_birth}
                          onChange={e => setForm({ ...form, date_of_birth: e.target.value })} />
                      </div>
                      <div className="col-12">
                        <label className="form-label fw-semibold">Email</label>
                        <input className="form-control" value={user?.email} disabled
                          style={{ background: '#f9f6f0', color: '#9ca3af' }} />
                        <small className="text-muted">Email cannot be changed</small>
                      </div>
                    </div>
                    <button className="btn btn-primary w-100 mt-4 py-3 fw-semibold"
                      style={{ borderRadius: 12 }} onClick={handleSaveProfile} disabled={saving}>
                      {saving
                        ? <><span className="spinner-border spinner-border-sm me-2" />Saving...</>
                        : <><i className="fa-solid fa-floppy-disk me-2"></i>Save Changes</>}
                    </button>
                  </>
                )}

                {tab === 'password' && (
                  <>
                    <h5 className="fw-bold mb-4">Change Password</h5>
                    <div className="d-flex flex-column gap-3">
                      <div>
                        <label className="form-label fw-semibold">Current Password</label>
                        <input type="password" className="form-control"
                          value={passwords.current_password}
                          onChange={e => setPasswords({ ...passwords, current_password: e.target.value })}
                          placeholder="Enter current password" />
                      </div>
                      <div>
                        <label className="form-label fw-semibold">New Password</label>
                        <input type="password" className="form-control"
                          value={passwords.new_password}
                          onChange={e => setPasswords({ ...passwords, new_password: e.target.value })}
                          placeholder="Min. 6 characters" />
                      </div>
                      <div>
                        <label className="form-label fw-semibold">Confirm New Password</label>
                        <input type="password" className="form-control"
                          value={passwords.confirm_password}
                          onChange={e => setPasswords({ ...passwords, confirm_password: e.target.value })}
                          placeholder="Repeat new password" />
                        {passwords.new_password && passwords.confirm_password && (
                          <small className={passwords.new_password === passwords.confirm_password ? 'text-success' : 'text-danger'}>
                            <i className={`fa-solid ${passwords.new_password === passwords.confirm_password ? 'fa-check' : 'fa-xmark'} me-1`}></i>
                            {passwords.new_password === passwords.confirm_password ? 'Passwords match' : 'Passwords do not match'}
                          </small>
                        )}
                      </div>
                    </div>
                    <button className="btn btn-primary w-100 mt-4 py-3 fw-semibold"
                      style={{ borderRadius: 12 }} onClick={handleChangePassword} disabled={saving}>
                      {saving
                        ? <><span className="spinner-border spinner-border-sm me-2" />Saving...</>
                        : <><i className="fa-solid fa-lock me-2"></i>Change Password</>}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
