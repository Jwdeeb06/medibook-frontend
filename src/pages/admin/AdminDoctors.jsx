import { useState, useEffect } from 'react';
import api from '../../services/api';

const EMPTY_FORM = { name: '', specialization: '', bio: '', email: '', phone: '', years_experience: '', password: '' };

export default function AdminDoctors() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editDoctor, setEditDoctor] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
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

  const handleSave = async () => {
    setError(''); setSaving(true);
    try {
      if (editDoctor) {
        await api.put(`/doctors/${editDoctor.id}`, form);
      } else {
        await api.post('/doctors', form);
      }
      setShowModal(false);
      fetchDoctors();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Deactivate this doctor?')) return;
    try {
      await api.delete(`/doctors/${id}`);
      fetchDoctors();
    } catch (err) { alert('Failed'); }
  };

  const getInitials = (name) => name.replace(/^Dr\.?\s*/i, '').trim().split(' ').slice(0,2).map(p => p[0]).join('').toUpperCase();

  return (
    <div>
      <div className="admin-page-header d-flex justify-content-between align-items-center">
        <div>
          <h1 className="admin-page-title">Doctors</h1>
          <p className="admin-page-subtitle">Manage medical staff ({doctors.length} active)</p>
        </div>
        <button className="btn-admin-primary" onClick={openAdd}>+ Add Doctor</button>
      </div>

      {loading ? <div className="text-center py-5"><div className="spinner-border text-primary" /></div> : (
        <div className="row g-3">
          {doctors.map(doc => (
            <div className="col-md-6 col-lg-4" key={doc.id}>
              <div className="admin-card h-100">
                <div className="d-flex align-items-center gap-3 mb-3">
                  <div style={{ width: 54, height: 54, borderRadius: '50%', background: 'linear-gradient(135deg, #AB1509, #c93428)', color: '#fff7d3', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1.1rem', flexShrink: 0 }}>
                    {getInitials(doc.name)}
                  </div>
                  <div>
                    <div className="fw-bold">{doc.name}</div>
                    <small style={{ color: '#AB1509', fontWeight: 600 }}>{doc.specialization}</small>
                  </div>
                </div>
                {doc.bio && <p className="text-muted small mb-3" style={{ minHeight: '2.5rem' }}>{doc.bio.slice(0, 100)}{doc.bio.length > 100 ? '...' : ''}</p>}
                <div className="text-muted small mb-3">
                  {doc.email && <div>📧 {doc.email}</div>}
                  {doc.phone && <div>📞 {doc.phone}</div>}
                  {doc.years_experience > 0 && <div>⭐ {doc.years_experience} years experience</div>}
                </div>
                <div className="d-flex gap-2">
                  <button className="btn-admin-secondary flex-fill" style={{ fontSize: '0.85rem' }} onClick={() => openEdit(doc)}>✏️ Edit</button>
                  <button className="btn btn-outline-danger btn-sm flex-fill" onClick={() => handleDelete(doc.id)}>🗑 Remove</button>
                </div>
              </div>
            </div>
          ))}
          {doctors.length === 0 && <div className="col-12 text-center text-muted py-5">No doctors yet. Add your first doctor.</div>}
        </div>
      )}

      {showModal && (
        <div className="admin-modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="admin-modal">
            <div className="admin-modal-title">{editDoctor ? 'Edit Doctor' : 'Add New Doctor'}</div>
            {error && <div className="alert alert-danger mb-3">{error}</div>}
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label fw-semibold">Full Name *</label>
                <input className="form-control" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Dr. Sarah Khoury" />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold">Specialization *</label>
                <input className="form-control" value={form.specialization} onChange={e => setForm({...form, specialization: e.target.value})} placeholder="Cardiology" />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold">Email *</label>
                <input type="email" className="form-control" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold">Phone</label>
                <input className="form-control" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold">Years Experience</label>
                <input type="number" className="form-control" value={form.years_experience} onChange={e => setForm({...form, years_experience: e.target.value})} />
              </div>
              {!editDoctor && (
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Login Password *</label>
                  <input type="password" className="form-control" value={form.password} onChange={e => setForm({...form, password: e.target.value})} placeholder="Min 6 characters" />
                </div>
              )}
              <div className="col-12">
                <label className="form-label fw-semibold">Bio</label>
                <textarea className="form-control" rows="3" value={form.bio} onChange={e => setForm({...form, bio: e.target.value})} placeholder="Brief professional bio..." />
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
    </div>
  );
}
