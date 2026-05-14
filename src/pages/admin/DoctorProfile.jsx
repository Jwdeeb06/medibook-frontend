import { useState, useEffect } from 'react';
import api from '../../services/api';

export default function DoctorProfile() {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/doctors/me')
      .then(res => { setProfile(res.data); setForm(res.data); })
      .catch(err => setError('Could not load profile'))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setError(''); setSaving(true);
    try {
      await api.put(`/doctors/${profile.id}`, {
        name: form.name, specialization: form.specialization,
        bio: form.bio, phone: form.phone, years_experience: form.years_experience
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) { setError(err.response?.data?.error || 'Failed'); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="text-center py-5"><div className="spinner-border text-primary" /></div>;

  return (
    <div>
      <div className="admin-page-header">
        <h1 className="admin-page-title">My Profile</h1>
        <p className="admin-page-subtitle">Update your professional information</p>
      </div>

      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="admin-card">
            {error && <div className="alert alert-danger">{error}</div>}
            {success && <div className="alert alert-success">✅ Profile updated successfully!</div>}

            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label fw-semibold">Full Name</label>
                <input className="form-control" value={form.name || ''} onChange={e => setForm({...form, name: e.target.value})} />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold">Specialization</label>
                <input className="form-control" value={form.specialization || ''} onChange={e => setForm({...form, specialization: e.target.value})} />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold">Phone</label>
                <input className="form-control" value={form.phone || ''} onChange={e => setForm({...form, phone: e.target.value})} />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold">Years of Experience</label>
                <input type="number" className="form-control" value={form.years_experience || ''} onChange={e => setForm({...form, years_experience: e.target.value})} />
              </div>
              <div className="col-12">
                <label className="form-label fw-semibold">Bio</label>
                <textarea className="form-control" rows="4" value={form.bio || ''} onChange={e => setForm({...form, bio: e.target.value})} placeholder="Tell patients about your experience..." />
              </div>
            </div>

            <button className="btn-admin-primary mt-4 w-100" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
