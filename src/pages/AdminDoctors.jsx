import { useState, useEffect } from 'react';
import api from '../../services/api';

const EMPTY_FORM = { name: '', specialization: '', bio: '', email: '', phone: '', years_experience: '', password: '' };
const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const DEFAULT_SCHEDULE = DAYS.map((_, i) => ({
  day_of_week: i, start_time: '09:00', end_time: '17:00', is_available: i >= 1 && i <= 5
}));

export default function AdminDoctors() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [scheduleModal, setScheduleModal] = useState(null);
  const [photoModal, setPhotoModal] = useState(null);
  const [editDoctor, setEditDoctor] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [schedule, setSchedule] = useState(DEFAULT_SCHEDULE);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchDoctors = () => {
    api.get('/doctors')
      .then(res => setDoctors(res.data.doctors || []))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchDoctors(); }, []);

  const openAdd = () => { setEditDoctor(null); setForm(EMPTY_FORM); setError(''); setShowModal(true); };
  const openEdit = (doc) => { setEditDoctor(doc); setForm({ ...doc, password: '' }); setError(''); setShowModal(true); };

  const openSchedule = async (doc) => {
    try {
      const res = await api.get(`/doctors/${doc.id}`);
      const existing = res.data.schedules || [];
      const merged = DEFAULT_SCHEDULE.map(def => {
        const found = existing.find(s => s.day_of_week === def.day_of_week);
        return found
          ? { ...def, start_time: found.start_time.slice(0, 5), end_time: found.end_time.slice(0, 5), is_available: !!found.is_available }
          : def;
      });
      setSchedule(merged);
      setScheduleModal(doc);
    } catch { alert('Could not load schedule'); }
  };

  const openPhoto = (doc) => {
    setPhotoModal(doc);
    setPhotoFile(null);
    setPhotoPreview(doc.photo_url
      ? (doc.photo_url.startsWith('/uploads') ? `http://localhost:5000${doc.photo_url}` : doc.photo_url)
      : null);
  };

  const handleSave = async () => {
    setError(''); setSaving(true);
    try {
      if (editDoctor) { await api.put(`/doctors/${editDoctor.id}`, form); }
      else { await api.post('/doctors', form); }
      setShowModal(false);
      fetchDoctors();
    } catch (err) { setError(err.response?.data?.error || 'Failed to save'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Deactivate this doctor?')) return;
    try { await api.delete(`/doctors/${id}`); fetchDoctors(); }
    catch { alert('Failed'); }
  };

  const handleSaveSchedule = async () => {
    setSaving(true);
    try {
      const toSave = schedule.filter(s => s.is_available);
      await api.put(`/doctors/${scheduleModal.id}/schedule`, { schedules: toSave });
      setScheduleModal(null);
    } catch { alert('Failed to save schedule'); }
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
      await api.post(`/doctors/${photoModal.id}/photo`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setPhotoModal(null);
      fetchDoctors();
    } catch (err) { alert(err.response?.data?.error || 'Upload failed'); }
    finally { setSaving(false); }
  };

  const updateDay = (dayIndex, field, value) => {
    setSchedule(prev => prev.map(s => s.day_of_week === dayIndex ? { ...s, [field]: value } : s));
  };

  const getInitials = (name) => name.replace(/^Dr\.?\s*/i, '').trim().split(' ').slice(0, 2).map(p => p[0]).join('').toUpperCase();

  return (
    <div>
      <div className="admin-page-header d-flex justify-content-between align-items-center">
        <div>
          <h1 className="admin-page-title">Doctors</h1>
          <p className="admin-page-subtitle">Manage medical staff ({doctors.length} active)</p>
        </div>
        <button className="btn-admin-primary" onClick={openAdd}>
          <i className="fa-solid fa-plus me-2"></i>Add Doctor
        </button>
      </div>

      {loading ? <div className="text-center py-5"><div className="spinner-border" style={{ color: '#AB1509' }} /></div> : (
        <div className="row g-3">
          {doctors.map(doc => (
            <div className="col-md-6 col-lg-4" key={doc.id}>
              <div className="admin-card h-100 p-0 overflow-hidden">
                {/* Photo section */}
                <div style={{ height: 140, background: 'linear-gradient(135deg, #AB1509, #7a0e06)', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {doc.photo_url ? (
                    <img src={doc.photo_url.startsWith('/uploads') ? `http://localhost:5000${doc.photo_url}` : doc.photo_url}
                      alt={doc.name} style={{ width: 90, height: 90, borderRadius: '50%', objectFit: 'cover', border: '3px solid rgba(255,247,211,0.4)' }}
                      onError={e => { e.target.style.display = 'none'; }} />
                  ) : (
                    <div style={{ width: 90, height: 90, borderRadius: '50%', background: 'rgba(255,247,211,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 700, color: '#fff7d3', border: '3px solid rgba(255,247,211,0.3)' }}>
                      {getInitials(doc.name)}
                    </div>
                  )}
                  <button onClick={() => openPhoto(doc)}
                    style={{ position: 'absolute', bottom: 8, right: 8, width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,247,211,0.2)', border: '1px solid rgba(255,247,211,0.3)', color: '#fff7d3', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    title="Change photo">
                    <i className="fa-solid fa-camera" style={{ fontSize: '0.75rem' }}></i>
                  </button>
                </div>

                <div className="p-3">
                  <h6 className="fw-bold mb-0">{doc.name}</h6>
                  <small style={{ color: '#AB1509', fontWeight: 600 }}>{doc.specialization}</small>

                  <div className="text-muted small mt-2 mb-3">
                    {doc.email && <div><i className="fa-solid fa-envelope me-1"></i>{doc.email}</div>}
                    {doc.years_experience > 0 && <div><i className="fa-solid fa-award me-1"></i>{doc.years_experience}+ years</div>}
                  </div>

                  <div className="d-flex gap-2">
                    <button className="btn btn-sm btn-outline-primary flex-fill" onClick={() => openEdit(doc)}>
                      <i className="fa-solid fa-pen me-1"></i>Edit
                    </button>
                    <button className="btn btn-sm btn-outline-secondary flex-fill" onClick={() => openSchedule(doc)}>
                      <i className="fa-solid fa-calendar-days me-1"></i>Schedule
                    </button>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(doc.id)}>
                      <i className="fa-solid fa-trash"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {doctors.length === 0 && <div className="col-12 text-center text-muted py-5">No doctors yet.</div>}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="admin-modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="admin-modal">
            <div className="admin-modal-title">
              <i className={`fa-solid ${editDoctor ? 'fa-pen' : 'fa-plus'} me-2`} style={{ color: '#AB1509' }}></i>
              {editDoctor ? 'Edit Doctor' : 'Add New Doctor'}
            </div>
            {error && <div className="alert alert-danger mb-3">{error}</div>}
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label fw-semibold">Full Name *</label>
                <input className="form-control" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Dr. Sarah Khoury" />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold">Specialization *</label>
                <input className="form-control" value={form.specialization} onChange={e => setForm({ ...form, specialization: e.target.value })} placeholder="Cardiology" />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold">Email *</label>
                <input type="email" className="form-control" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold">Phone</label>
                <input className="form-control" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold">Years Experience</label>
                <input type="number" className="form-control" value={form.years_experience} onChange={e => setForm({ ...form, years_experience: e.target.value })} />
              </div>
              {!editDoctor && (
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Login Password *</label>
                  <input type="password" className="form-control" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="Min 6 characters" />
                </div>
              )}
              <div className="col-12">
                <label className="form-label fw-semibold">Bio</label>
                <textarea className="form-control" rows="3" value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} placeholder="Brief professional bio..." />
              </div>
            </div>
            <div className="d-flex gap-2 mt-4">
              <button className="btn-admin-primary flex-fill" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : editDoctor ? 'Save Changes' : 'Add Doctor'}
              </button>
              <button className="btn-admin-secondary flex-fill" onClick={() => setShowModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Modal */}
      {scheduleModal && (
        <div className="admin-modal-overlay" onClick={e => e.target === e.currentTarget && setScheduleModal(null)}>
          <div className="admin-modal" style={{ maxWidth: 600 }}>
            <div className="admin-modal-title">
              <i className="fa-solid fa-calendar-days me-2" style={{ color: '#AB1509' }}></i>
              Schedule — {scheduleModal.name}
            </div>
            <div className="schedule-grid mb-4">
              <div style={{ display: 'grid', gridTemplateColumns: '110px 1fr 1fr 60px', gap: '0.5rem', padding: '0 0.75rem', marginBottom: '0.5rem' }}>
                <small className="fw-bold text-muted">Day</small>
                <small className="fw-bold text-muted">Start</small>
                <small className="fw-bold text-muted">End</small>
                <small className="fw-bold text-muted">On</small>
              </div>
              {schedule.map(s => (
                <div key={s.day_of_week} className="schedule-row" style={{ opacity: s.is_available ? 1 : 0.5 }}>
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
            </div>
            <div className="d-flex gap-2">
              <button className="btn-admin-primary flex-fill" onClick={handleSaveSchedule} disabled={saving}>
                {saving ? 'Saving...' : 'Save Schedule'}
              </button>
              <button className="btn-admin-secondary flex-fill" onClick={() => setScheduleModal(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Photo Upload Modal */}
      {photoModal && (
        <div className="admin-modal-overlay" onClick={e => e.target === e.currentTarget && setPhotoModal(null)}>
          <div className="admin-modal" style={{ maxWidth: 420 }}>
            <div className="admin-modal-title">
              <i className="fa-solid fa-camera me-2" style={{ color: '#AB1509' }}></i>
              Photo — {photoModal.name}
            </div>

            {/* Preview */}
            <div className="text-center mb-4">
              {photoPreview ? (
                <img src={photoPreview} alt="Preview"
                  style={{ width: 120, height: 120, borderRadius: '50%', objectFit: 'cover', border: '4px solid #fff7d3', boxShadow: '0 4px 12px rgba(171,21,9,0.2)' }} />
              ) : (
                <div style={{ width: 120, height: 120, borderRadius: '50%', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
                  <i className="fa-solid fa-user-doctor fa-2x" style={{ color: '#d1d5db' }}></i>
                </div>
              )}
            </div>

            {/* File input */}
            <div className="mb-4">
              <label className="form-label fw-semibold">Choose Photo</label>
              <input type="file" className="form-control" accept="image/jpeg,image/png,image/webp"
                onChange={handlePhotoChange} />
              <small className="text-muted">JPEG, PNG or WebP · Max 5MB</small>
            </div>

            <div className="d-flex gap-2">
              <button className="btn-admin-primary flex-fill" onClick={handleUploadPhoto}
                disabled={saving || !photoFile}>
                {saving ? 'Uploading...' : 'Upload Photo'}
              </button>
              <button className="btn-admin-secondary flex-fill" onClick={() => setPhotoModal(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
