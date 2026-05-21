import { useState, useEffect } from 'react';
import api from '../../services/api';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const DEFAULT_SCHEDULE = DAYS.map((_, i) => ({
  day_of_week: i, start_time: '09:00', end_time: '17:00', is_available: i >= 1 && i <= 5
}));

export default function DoctorProfile() {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({});
  const [schedule, setSchedule] = useState(DEFAULT_SCHEDULE);
  const [tab, setTab] = useState('profile');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [passwords, setPasswords] = useState({ current_password: '', new_password: '', confirm_password: '' });

  useEffect(() => {
    api.get('/doctors/me')
      .then(res => {
        setProfile(res.data);
        setForm({
          name: res.data.name || '',
          specialization: res.data.specialization || '',
          bio: res.data.bio || '',
          phone: res.data.phone || '',
          years_experience: res.data.years_experience || '',
        });
        setPhotoPreview(
          res.data.photo_url
            ? (res.data.photo_url.startsWith('/uploads') ? `http://localhost:5000${res.data.photo_url}` : res.data.photo_url)
            : null
        );
        // Merge schedule
        if (res.data.schedules?.length > 0) {
          const merged = DEFAULT_SCHEDULE.map(def => {
            const found = res.data.schedules.find(s => s.day_of_week === def.day_of_week);
            return found
              ? { ...def, start_time: found.start_time.slice(0, 5), end_time: found.end_time.slice(0, 5), is_available: !!found.is_available }
              : def;
          });
          setSchedule(merged);
        }
      })
      .catch(() => setError('Could not load profile'))
      .finally(() => setLoading(false));
  }, []);

  const showSuccess = (msg) => {
    setSuccess(msg); setError('');
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleSaveProfile = async () => {
    setError(''); setSaving(true);
    try {
      await api.put(`/doctors/${profile.id}`, form);
      showSuccess('Profile updated successfully!');
    } catch (err) { setError(err.response?.data?.error || 'Failed to update'); }
    finally { setSaving(false); }
  };

  const handleSaveSchedule = async () => {
    setError(''); setSaving(true);
    try {
      await api.put(`/doctors/${profile.id}/schedule`, { schedules: schedule.filter(s => s.is_available) });
      showSuccess('Schedule saved!');
    } catch { setError('Failed to save schedule'); }
    finally { setSaving(false); }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleUploadPhoto = async () => {
    if (!photoFile) return;
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('photo', photoFile);
      await api.post(`/doctors/${profile.id}/photo`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setPhotoFile(null);
      showSuccess('Photo uploaded!');
    } catch (err) { setError(err.response?.data?.error || 'Upload failed'); }
    finally { setSaving(false); }
  };

  const handleChangePassword = async () => {
    setError('');
    if (passwords.new_password !== passwords.confirm_password) { setError('Passwords do not match'); return; }
    if (passwords.new_password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setSaving(true);
    try {
      await api.put('/auth/change-password', {
        current_password: passwords.current_password,
        new_password: passwords.new_password,
      });
      setPasswords({ current_password: '', new_password: '', confirm_password: '' });
      showSuccess('Password changed!');
    } catch (err) { setError(err.response?.data?.error || 'Failed'); }
    finally { setSaving(false); }
  };

  const updateDay = (dayIndex, field, value) => {
    setSchedule(prev => prev.map(s => s.day_of_week === dayIndex ? { ...s, [field]: value } : s));
  };

  if (loading) return <div className="text-center py-5"><div className="spinner-border" style={{ color: '#AB1509' }} /></div>;

  const tabs = [
    { key: 'profile', icon: 'fa-user', label: 'Profile' },
    { key: 'photo', icon: 'fa-camera', label: 'Photo' },
    { key: 'schedule', icon: 'fa-calendar-days', label: 'Schedule' },
    { key: 'password', icon: 'fa-lock', label: 'Password' },
  ];

  return (
    <div>
      <div className="admin-page-header">
        <h1 className="admin-page-title">My Profile</h1>
        <p className="admin-page-subtitle">Manage your professional information</p>
      </div>

      {/* Profile header card */}
      <div className="admin-card mb-4 p-4">
        <div className="d-flex align-items-center gap-4 flex-wrap">
          {/* Avatar */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            {photoPreview ? (
              <img src={photoPreview} alt={profile?.name}
                style={{ width: 90, height: 90, borderRadius: '50%', objectFit: 'cover', border: '4px solid #fff7d3', boxShadow: '0 4px 12px rgba(171,21,9,0.2)' }} />
            ) : (
              <div style={{ width: 90, height: 90, borderRadius: '50%', background: 'linear-gradient(135deg, #AB1509, #c93428)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 700, color: '#fff7d3', border: '4px solid #fff7d3', boxShadow: '0 4px 12px rgba(171,21,9,0.2)' }}>
                {profile?.name?.charAt(0).toUpperCase()}
              </div>
            )}
            <button onClick={() => setTab('photo')}
              title="Change photo"
              style={{ position: 'absolute', bottom: 0, right: 0, width: 28, height: 28, borderRadius: '50%', background: '#AB1509', border: '2px solid white', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <i className="fa-solid fa-camera" style={{ fontSize: '0.65rem' }}></i>
            </button>
          </div>
          <div>
            <h4 className="fw-bold mb-0">{profile?.name}</h4>
            <p className="mb-1" style={{ color: '#AB1509', fontWeight: 600 }}>{profile?.specialization}</p>
            <small className="text-muted">{profile?.email}</small>
          </div>
        </div>
      </div>

      {/* Tab buttons */}
      <div className="d-flex gap-2 mb-4 flex-wrap">
        {tabs.map(t => (
          <button key={t.key} onClick={() => { setTab(t.key); setError(''); setSuccess(''); }}
            className="btn px-3 py-2 fw-semibold"
            style={{
              borderRadius: 10, fontSize: '0.88rem',
              background: tab === t.key ? '#AB1509' : 'white',
              color: tab === t.key ? '#fff7d3' : '#6b5a58',
              border: `1px solid ${tab === t.key ? '#AB1509' : '#e5e7eb'}`,
              transition: 'all 0.2s',
            }}>
            <i className={`fa-solid ${t.icon} me-2`}></i>{t.label}
          </button>
        ))}
      </div>

      <div className="admin-card">
        {error && <div className="alert alert-danger mb-4"><i className="fa-solid fa-circle-exclamation me-2"></i>{error}</div>}
        {success && <div className="alert alert-success mb-4"><i className="fa-solid fa-circle-check me-2"></i>{success}</div>}

        {/* ===== PROFILE TAB ===== */}
        {tab === 'profile' && (
          <>
            <h6 className="fw-bold mb-4">Professional Information</h6>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label fw-semibold">Full Name</label>
                <input className="form-control" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold">Specialization</label>
                <input className="form-control" value={form.specialization} onChange={e => setForm({ ...form, specialization: e.target.value })} />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold">Phone</label>
                <input className="form-control" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+961 xx xxx xxx" />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold">Years of Experience</label>
                <input type="number" className="form-control" value={form.years_experience} onChange={e => setForm({ ...form, years_experience: e.target.value })} min="0" />
              </div>
              <div className="col-12">
                <label className="form-label fw-semibold">Bio</label>
                <textarea className="form-control" rows="4" value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} placeholder="Tell patients about your background and expertise..." />
              </div>
            </div>
            <button className="btn-admin-primary mt-4 w-100" onClick={handleSaveProfile} disabled={saving}>
              {saving ? <><span className="spinner-border spinner-border-sm me-2" />Saving...</> : <><i className="fa-solid fa-floppy-disk me-2"></i>Save Profile</>}
            </button>
          </>
        )}

        {/* ===== PHOTO TAB ===== */}
        {tab === 'photo' && (
          <>
            <h6 className="fw-bold mb-4">Profile Photo</h6>
            <div className="text-center mb-4">
              {photoPreview ? (
                <img src={photoPreview} alt="Preview"
                  style={{ width: 150, height: 150, borderRadius: '50%', objectFit: 'cover', border: '4px solid #fff7d3', boxShadow: '0 4px 16px rgba(171,21,9,0.2)' }} />
              ) : (
                <div style={{ width: 150, height: 150, borderRadius: '50%', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', border: '4px dashed #e5e7eb' }}>
                  <i className="fa-solid fa-user-doctor fa-2x" style={{ color: '#d1d5db' }}></i>
                </div>
              )}
              {photoFile && <small className="text-success d-block mt-2"><i className="fa-solid fa-check me-1"></i>Ready to upload</small>}
            </div>

            <label style={{ display: 'block', border: '2px dashed #e5e7eb', borderRadius: 12, padding: '2rem', textAlign: 'center', cursor: 'pointer', marginBottom: '1rem', transition: 'border-color 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = '#AB1509'}
              onMouseLeave={e => e.currentTarget.style.borderColor = '#e5e7eb'}>
              <i className="fa-solid fa-cloud-arrow-up fa-2x mb-2 d-block" style={{ color: '#AB1509' }}></i>
              <span className="fw-semibold d-block">Click to choose a photo</span>
              <small className="text-muted">JPEG, PNG or WebP · Max 5MB</small>
              <input type="file" accept="image/jpeg,image/png,image/webp" className="d-none" onChange={handlePhotoChange} />
            </label>

            <button className="btn-admin-primary w-100" onClick={handleUploadPhoto} disabled={saving || !photoFile}>
              {saving ? <><span className="spinner-border spinner-border-sm me-2" />Uploading...</> : <><i className="fa-solid fa-cloud-arrow-up me-2"></i>Upload Photo</>}
            </button>
          </>
        )}

        {/* ===== SCHEDULE TAB ===== */}
        {tab === 'schedule' && (
          <>
            <h6 className="fw-bold mb-2">Working Hours</h6>
            <p className="text-muted small mb-4">Check the days you work and set your start and end times.</p>
            <div style={{ display: 'grid', gridTemplateColumns: '110px 1fr 1fr 50px', gap: '0.5rem', padding: '0 0.5rem', marginBottom: '0.5rem' }}>
              <small className="fw-bold text-muted text-uppercase" style={{ fontSize: '0.7rem' }}>Day</small>
              <small className="fw-bold text-muted text-uppercase" style={{ fontSize: '0.7rem' }}>Start</small>
              <small className="fw-bold text-muted text-uppercase" style={{ fontSize: '0.7rem' }}>End</small>
              <small className="fw-bold text-muted text-uppercase" style={{ fontSize: '0.7rem' }}>On</small>
            </div>
            {schedule.map(s => (
              <div key={s.day_of_week} className="schedule-row mb-2" style={{ opacity: s.is_available ? 1 : 0.45, transition: 'opacity 0.2s' }}>
                <div className="schedule-day">{DAYS[s.day_of_week]}</div>
                <input type="time" className="form-control form-control-sm" value={s.start_time} disabled={!s.is_available}
                  onChange={e => updateDay(s.day_of_week, 'start_time', e.target.value)} />
                <input type="time" className="form-control form-control-sm" value={s.end_time} disabled={!s.is_available}
                  onChange={e => updateDay(s.day_of_week, 'end_time', e.target.value)} />
                <div className="text-center">
                  <input type="checkbox" className="form-check-input" checked={s.is_available}
                    onChange={e => updateDay(s.day_of_week, 'is_available', e.target.checked)} />
                </div>
              </div>
            ))}
            <button className="btn-admin-primary w-100 mt-3" onClick={handleSaveSchedule} disabled={saving}>
              {saving ? 'Saving...' : <><i className="fa-solid fa-floppy-disk me-2"></i>Save Schedule</>}
            </button>
          </>
        )}

        {/* ===== PASSWORD TAB ===== */}
        {tab === 'password' && (
          <>
            <h6 className="fw-bold mb-4">Change Password</h6>
            <div className="d-flex flex-column gap-3">
              <div>
                <label className="form-label fw-semibold">Current Password</label>
                <input type="password" className="form-control" value={passwords.current_password}
                  onChange={e => setPasswords({ ...passwords, current_password: e.target.value })} placeholder="Enter current password" />
              </div>
              <div>
                <label className="form-label fw-semibold">New Password</label>
                <input type="password" className="form-control" value={passwords.new_password}
                  onChange={e => setPasswords({ ...passwords, new_password: e.target.value })} placeholder="Min. 6 characters" />
              </div>
              <div>
                <label className="form-label fw-semibold">Confirm New Password</label>
                <input type="password" className="form-control" value={passwords.confirm_password}
                  onChange={e => setPasswords({ ...passwords, confirm_password: e.target.value })} placeholder="Repeat new password" />
                {passwords.new_password && passwords.confirm_password && (
                  <small className={passwords.new_password === passwords.confirm_password ? 'text-success' : 'text-danger'}>
                    <i className={`fa-solid ${passwords.new_password === passwords.confirm_password ? 'fa-check' : 'fa-xmark'} me-1`}></i>
                    {passwords.new_password === passwords.confirm_password ? 'Passwords match' : 'Do not match'}
                  </small>
                )}
              </div>
            </div>
            <button className="btn-admin-primary w-100 mt-4" onClick={handleChangePassword} disabled={saving}>
              {saving ? 'Saving...' : <><i className="fa-solid fa-lock me-2"></i>Change Password</>}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
