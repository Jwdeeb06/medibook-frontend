import { useState, useEffect } from 'react';
import api from '../../services/api';

const EMPTY = { name: '', description: '', price: '', duration_minutes: 30, category: '' };

export default function AdminServices() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editService, setEditService] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchServices = () => {
    api.get('/services')
      .then(res => setServices(res.data.services || []))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchServices(); }, []);

  const openAdd = () => { setEditService(null); setForm(EMPTY); setError(''); setShowModal(true); };
  const openEdit = (s) => { setEditService(s); setForm(s); setError(''); setShowModal(true); };

  const handleSave = async () => {
    setError(''); setSaving(true);
    try {
      if (editService) { await api.put(`/services/${editService.id}`, form); }
      else { await api.post('/services', form); }
      setShowModal(false);
      fetchServices();
    } catch (err) { setError(err.response?.data?.error || 'Failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Deactivate this service?')) return;
    try { await api.delete(`/services/${id}`); fetchServices(); }
    catch { alert('Failed'); }
  };

  const grouped = services.reduce((acc, s) => {
    const cat = s.category || 'general';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(s);
    return acc;
  }, {});

  return (
    <div>
      <div className="admin-page-header d-flex justify-content-between align-items-center">
        <div>
          <h1 className="admin-page-title">Services</h1>
          <p className="admin-page-subtitle">Manage what your clinic offers ({services.length} active)</p>
        </div>
        <button className="btn-admin-primary" onClick={openAdd}>+ Add Service</button>
      </div>

      {loading ? <div className="text-center py-5"><div className="spinner-border text-primary" /></div> : (
        Object.entries(grouped).map(([category, items]) => (
          <div key={category} className="mb-4">
            <h5 className="fw-bold text-capitalize mb-3" style={{ color: '#AB1509' }}>{category}</h5>
            <div className="admin-card p-0 overflow-hidden">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr><th>Service</th><th>Description</th><th>Duration</th><th>Price</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {items.map(s => (
                    <tr key={s.id}>
                      <td className="fw-semibold">{s.name}</td>
                      <td className="text-muted small">{s.description?.slice(0, 60)}{s.description?.length > 60 ? '...' : ''}</td>
                      <td><span className="badge bg-light text-dark">{s.duration_minutes} min</span></td>
                      <td className="fw-bold" style={{ color: '#AB1509' }}>${s.price}</td>
                      <td>
                        <div className="d-flex gap-2">
                          <button className="btn btn-sm btn-outline-primary" onClick={() => openEdit(s)}>✏️ Edit</button>
                          <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(s.id)}>🗑</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))
      )}

      {showModal && (
        <div className="admin-modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="admin-modal">
            <div className="admin-modal-title">{editService ? 'Edit Service' : 'Add New Service'}</div>
            {error && <div className="alert alert-danger mb-3">{error}</div>}
            <div className="row g-3">
              <div className="col-12">
                <label className="form-label fw-semibold">Service Name *</label>
                <input className="form-control" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold">Price ($) *</label>
                <input type="number" className="form-control" value={form.price} onChange={e => setForm({...form, price: e.target.value})} />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold">Duration (minutes)</label>
                <input type="number" className="form-control" value={form.duration_minutes} onChange={e => setForm({...form, duration_minutes: e.target.value})} />
              </div>
<div className="col-12">
  <label className="form-label fw-semibold">Category</label>
  <select className="form-select" value={form.category || ''} onChange={e => setForm({...form, category: e.target.value})}>
    <option value="">Select category...</option>
    <option value="consultation">Consultation</option>
    <option value="specialist">Specialist</option>
    <option value="diagnostic">Diagnostic</option>
    <option value="pediatric">Pediatric</option>
    <option value="surgical">Surgical</option>
    <option value="emergency">Emergency</option>
    <option value="follow-up">Follow-up</option>
    <option value="general">General</option>
  </select>
</div>
              <div className="col-12">
                <label className="form-label fw-semibold">Description</label>
                <textarea className="form-control" rows="3" value={form.description || ''} onChange={e => setForm({...form, description: e.target.value})} />
              </div>
            </div>
            <div className="d-flex gap-2 mt-4">
              <button className="btn-admin-primary flex-fill" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : editService ? 'Save Changes' : 'Add Service'}</button>
              <button className="btn-admin-secondary flex-fill" onClick={() => setShowModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
