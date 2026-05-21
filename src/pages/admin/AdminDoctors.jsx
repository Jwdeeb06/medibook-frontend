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
  const [modal, setModal] = useState(null); // 'add' | 'edit' | 'schedule' | 'photo'
  const [selectedDoctor, setSelectedDoctor] = useState(null);
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

  const closeModal = () => { setModal(null); setSelectedDoctor(null); setError(''); };

  const openAdd = () => {
    setForm(EMPTY_FORM);
    setError('');
    setModal('add');
  };

  const openEdit = (doc) => {
    setSelectedDoctor(doc);
    setForm({ ...doc, password: '' });
    setError('');
    setModal('edit');
  };

  const openSchedule = async (doc) => {
    setSelectedDoctor(doc);
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
      setModal('schedule');
    } catch { alert('Could not load schedule'); }
  };

  const openPhoto = (doc) => {
    setSelectedDoctor(doc);
    setPhotoFile(null);
    setPhotoPreview(
      doc.photo_url
        ? (doc.photo_url.startsWith('/uploads') ? `http://localhost:5000${doc.photo_url}` : doc.photo_url)
        : null
    );
    setModal('photo');
  };

  const handleSave = async () => {
    if (!form.name || !form.email) { setError('Name and email are required'); return; }
    if (modal === 'add' && !form.password) { setError('Password is required'); return; }
    setError(''); setSaving(true);
    try {
      if (modal === 'edit') { await api.put(`/doctors/${selectedDoctor.id}`, form); }
      else { await api.post('/doctors', form); }
      closeModal();
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
      await api.put(`/doctors/${selectedDoctor.id}/schedule`, { schedules: schedule.filter(s => s.is_available) });
      closeModal();
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
      await api.post(`/doctors/${selectedDoctor.id}/photo`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      closeModal();
      fetchDoctors();
    } catch (err) { alert(err.response?.data?.error || 'Upload failed'); }
    finally { setSaving(false); }
  };

  const updateDay = (dayIndex, field, value) => {
    setSchedule(prev => prev.map(s => s.day_of_week === dayIndex ? { ...s, [field]: value } : s));
  };

  const getInitials = (name) =>
    name.replace(/^Dr\.?\s*/i, '').trim().split(' ').slice(0, 2).map(p => p[0]).join('').toUpperCase();

  const getPhotoSrc = (doc) => {
    if (!doc.photo_url) return null;
    return doc.photo_url.startsWith('/uploads') ? `http://localhost:5000${doc.photo_url}` : doc.photo_url;
  };

  return (
    <div>
      {/* Header */}
      <div className="admin-page-header d-flex justify-content-between align-items-center">
        <div>
          <h1 className="admin-page-title">Doctors</h1>
          <p className="admin-page-subtitle">Manage medical staff ({doctors.length} active)</p>
        </div>
        <button className="btn-admin-primary" onClick={openAdd}>
          <i className="fa-solid fa-plus me-2"></i>Add Doctor
        </button>
      </div>

      {loading && <div className="text-center py-5"><div className="spinner-border" style={{ color: '#AB1509' }} /></div>}

      {/* Doctor cards */}
      <div className="row g-4">
        {doctors.map(doc => (
          <div className="col-md-6 col-lg-4" key={doc.id}>
            <div className="card border-0 shadow-sm h-100" style={{ borderRadius: 16, overflow: 'hidden' }}>

              {/* Photo banner */}
              <div style={{ height: 100, background: 'linear-gradient(135deg, #AB1509, #7a0e06)', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {/* Upload photo button */}
                <button onClick={() => openPhoto(doc)}
                  title="Upload photo"
                  style={{ position: 'absolute', top: 10, right: 10, width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,247,211,0.2)', border: '1px solid rgba(255,247,211,0.4)', color: '#fff7d3', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2 }}>
                  <i className="fa-solid fa-camera" style={{ fontSize: '0.75rem' }}></i>
                </button>

                {/* Schedule button */}
                <button onClick={() => openSchedule(doc)}
                  title="Set schedule"
                  style={{ position: 'absolute', top: 10, left: 10, borderRadius: 8, background: 'rgba(255,247,211,0.2)', border: '1px solid rgba(255,247,211,0.4)', color: '#fff7d3', cursor: 'pointer', padding: '4px 10px', fontSize: '0.75rem', fontWeight: 600 }}>
                  <i className="fa-solid fa-calendar-days me-1"></i>Schedule
                </button>
              </div>

              {/* Avatar overlapping banner */}
              <div style={{ position: 'relative', marginTop: -40, paddingLeft: 20 }}>
                {getPhotoSrc(doc) ? (
                  <img src={getPhotoSrc(doc)} alt={doc.name}
                    style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', border: '3px solid white', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}
                    onError={e => { e.target.style.display = 'none'; }} />
                ) : (
                  <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg, #AB1509, #c93428)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 700, color: '#fff7d3', border: '3px solid white', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
                    {getInitials(doc.name)}
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-3 pt-2">
                {/* Clickable name → edit */}
                <button onClick={() => openEdit(doc)}
                  className="text-start p-0 border-0 bg-transparent d-block mb-1 w-100"
                  style={{ cursor: 'pointer' }}>
                  <span className="fw-bold d-block" style={{ fontSize: '1rem', color: '#2a1a18' }}>{doc.name}</span>
                  <small style={{ color: '#AB1509', fontWeight: 600 }}>{doc.specialization}</small>
                </button>

                {doc.bio && (
                  <p className="text-muted mb-2" style={{ fontSize: '0.82rem', lineHeight: 1.5 }}>
                    {doc.bio.length > 80 ? doc.bio.slice(0, 77) + '...' : doc.bio}
                  </p>
                )}

                <div className="text-muted mb-3" style={{ fontSize: '0.8rem' }}>
                  {doc.email && <div><i className="fa-solid fa-envelope me-1" style={{ color: '#AB1509', width: 14 }}></i>{doc.email}</div>}
                  {doc.phone && <div><i className="fa-solid fa-phone me-1" style={{ color: '#AB1509', width: 14 }}></i>{doc.phone}</div>}
                  {doc.years_experience > 0 && <div><i className="fa-solid fa-award me-1" style={{ color: '#AB1509', width: 14 }}></i>{doc.years_experience}+ years experience</div>}
                </div>

                <div className="d-flex gap-2">
                  <button className="btn btn-sm btn-outline-primary flex-fill" style={{ borderRadius: 8, fontSize: '0.82rem' }} onClick={() => openEdit(doc)}>
                    <i className="fa-solid fa-pen me-1"></i>Edit Profile
                  </button>
                  <button className="btn btn-sm btn-outline-secondary" style={{ borderRadius: 8, fontSize: '0.82rem' }} onClick={() => openPhoto(doc)}>
                    <i className="fa-solid fa-camera me-1"></i>Photo
                  </button>
                  <button className="btn btn-sm btn-outline-danger" style={{ borderRadius: 8 }} onClick={() => handleDelete(doc.id)}>
                    <i className="fa-solid fa-trash"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {!loading && doctors.length === 0 && (
          <div className="col-12 text-center py-5 text-muted">
            <i className="fa-solid fa-user-doctor fa-3x mb-3" style={{ color: '#d1d5db' }}></i>
            <p>No doctors yet. Add your first doctor.</p>
          </div>
        )}
      </div>

      {/* ====== ADD / EDIT MODAL ====== */}
      {(modal === 'add' || modal === 'edit') && (
        <div className="admin-modal-overlay" onClick={e => e.target === e.currentTarget && closeModal()}>
          <div className="admin-modal">
            <div className="admin-modal-title">
              <i className={`fa-solid ${modal === 'edit' ? 'fa-pen' : 'fa-plus'} me-2`} style={{ color: '#AB1509' }}></i>
              {modal === 'edit' ? `Edit — ${selectedDoctor?.name}` : 'Add New Doctor'}
            </div>
            {error && <div className="alert alert-danger mb-3"><i className="fa-solid fa-circle-exclamation me-2"></i>{error}</div>}
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
                <input className="form-control" value={form.phone || ''} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+961 xx xxx xxx" />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold">Years Experience</label>
                <input type="number" className="form-control" value={form.years_experience || ''} onChange={e => setForm({ ...form, years_experience: e.target.value })} min="0" />
              </div>
              {modal === 'add' && (
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Login Password *</label>
                  <input type="password" className="form-control" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="Min 6 characters" />
                </div>
              )}
              <div className="col-12">
                <label className="form-label fw-semibold">Bio</label>
                <textarea className="form-control" rows="3" value={form.bio || ''} onChange={e => setForm({ ...form, bio: e.target.value })} placeholder="Brief professional bio..." />
              </div>
            </div>
            <div className="d-flex gap-2 mt-4">
              <button className="btn-admin-primary flex-fill" onClick={handleSave} disabled={saving}>
                {saving ? <><span className="spinner-border spinner-border-sm me-2" />Saving...</> : modal === 'edit' ? 'Save Changes' : 'Add Doctor'}
              </button>
              <button className="btn-admin-secondary flex-fill" onClick={closeModal}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* ====== SCHEDULE MODAL ====== */}
      {modal === 'schedule' && (
        <div className="admin-modal-overlay" onClick={e => e.target === e.currentTarget && closeModal()}>
          <div className="admin-modal" style={{ maxWidth: 580 }}>
            <div className="admin-modal-title">
              <i className="fa-solid fa-calendar-days me-2" style={{ color: '#AB1509' }}></i>
              Schedule — {selectedDoctor?.name}
            </div>
            <p className="text-muted small mb-4">Check the days the doctor works and set their hours.</p>

            <div className="mb-4">
              <div style={{ display: 'grid', gridTemplateColumns: '110px 1fr 1fr 50px', gap: '0.5rem', padding: '0 0.5rem', marginBottom: '0.5rem' }}>
                <small className="fw-bold text-muted text-uppercase" style={{ fontSize: '0.7rem', letterSpacing: 0.5 }}>Day</small>
                <small className="fw-bold text-muted text-uppercase" style={{ fontSize: '0.7rem', letterSpacing: 0.5 }}>Start</small>
                <small className="fw-bold text-muted text-uppercase" style={{ fontSize: '0.7rem', letterSpacing: 0.5 }}>End</small>
                <small className="fw-bold text-muted text-uppercase" style={{ fontSize: '0.7rem', letterSpacing: 0.5 }}>On</small>
              </div>
              {schedule.map(s => (
                <div key={s.day_of_week} className="schedule-row" style={{ opacity: s.is_available ? 1 : 0.45, transition: 'opacity 0.2s' }}>
                  <div className="schedule-day" style={{ fontSize: '0.88rem' }}>{DAYS[s.day_of_week]}</div>
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
              <button className="btn-admin-secondary flex-fill" onClick={closeModal}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* ====== PHOTO UPLOAD MODAL ====== */}
      {modal === 'photo' && (
        <div className="admin-modal-overlay" onClick={e => e.target === e.currentTarget && closeModal()}>
          <div className="admin-modal" style={{ maxWidth: 400 }}>
            <div className="admin-modal-title">
              <i className="fa-solid fa-camera me-2" style={{ color: '#AB1509' }}></i>
              Photo — {selectedDoctor?.name}
            </div>

            {/* Current / preview */}
            <div className="text-center mb-4">
              {photoPreview ? (
                <img src={photoPreview} alt="Preview"
                  style={{ width: 130, height: 130, borderRadius: '50%', objectFit: 'cover', border: '4px solid #fff7d3', boxShadow: '0 4px 16px rgba(171,21,9,0.2)' }} />
              ) : (
                <div style={{ width: 130, height: 130, borderRadius: '50%', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', border: '4px dashed #e5e7eb' }}>
                  <i className="fa-solid fa-user-doctor fa-2x" style={{ color: '#d1d5db' }}></i>
                </div>
              )}
              {photoPreview && !photoFile && (
                <small className="text-muted d-block mt-2">Current photo</small>
              )}
              {photoFile && (
                <small className="text-success d-block mt-2">
                  <i className="fa-solid fa-check me-1"></i>New photo selected — ready to upload
                </small>
              )}
            </div>

            {/* Drop zone / file input */}
            <label style={{ display: 'block', border: '2px dashed #e5e7eb', borderRadius: 12, padding: '1.5rem', textAlign: 'center', cursor: 'pointer', background: '#fafafa', transition: 'border-color 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = '#AB1509'}
              onMouseLeave={e => e.currentTarget.style.borderColor = '#e5e7eb'}>
              <i className="fa-solid fa-cloud-arrow-up fa-lg mb-2 d-block" style={{ color: '#AB1509' }}></i>
              <span className="fw-semibold d-block mb-1">Click to choose photo</span>
              <small className="text-muted">JPEG, PNG or WebP · Max 5MB</small>
              <input type="file" accept="image/jpeg,image/png,image/webp" className="d-none" onChange={handlePhotoChange} />
            </label>

            <div className="d-flex gap-2 mt-4">
              <button className="btn-admin-primary flex-fill" onClick={handleUploadPhoto} disabled={saving || !photoFile}>
                {saving
                  ? <><span className="spinner-border spinner-border-sm me-2" />Uploading...</>
                  : <><i className="fa-solid fa-cloud-arrow-up me-2"></i>Upload Photo</>}
              </button>
              <button className="btn-admin-secondary flex-fill" onClick={closeModal}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
