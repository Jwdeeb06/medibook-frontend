import { useState, useEffect } from 'react';
import api from '../../services/api';

const CATEGORY_META = {
  consultation: { icon: 'fa-comment-medical', color: '#0284c7' },
  specialist:   { icon: 'fa-user-doctor',     color: '#7c3aed' },
  diagnostic:   { icon: 'fa-microscope',      color: '#059669' },
  pediatric:    { icon: 'fa-baby',            color: '#d97706' },
  surgical:     { icon: 'fa-scalpel',         color: '#dc2626' },
  emergency:    { icon: 'fa-truck-medical',   color: '#b45309' },
  general:      { icon: 'fa-stethoscope',     color: '#AB1509' },
  premium:      { icon: 'fa-star',            color: '#b45309' },
  quick:        { icon: 'fa-bolt',            color: '#059669' },
};

const EMPTY = { name: '', description: '', price: '', duration_minutes: 30, category: '' };

export default function AdminServices() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editService, setEditService] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [customCategory, setCustomCategory] = useState(false);

  const fetchServices = () => {
    api.get('/services')
      .then(res => setServices(res.data.services || []))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchServices(); }, []);

  const openAdd = () => {
    setEditService(null);
    setForm(EMPTY);
    setCustomCategory(false);
    setError('');
    setShowModal(true);
  };

  const openEdit = (s) => {
    setEditService(s);
    setForm(s);
    // If category not in preset list, show custom input
    setCustomCategory(s.category && !Object.keys(CATEGORY_META).includes(s.category));
    setError('');
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.price) {
      setError('Name and price are required');
      return;
    }
    setError(''); setSaving(true);
    try {
      if (editService) {
        await api.put(`/services/${editService.id}`, form);
      } else {
        await api.post('/services', form);
      }
      setShowModal(false);
      fetchServices();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save');
    } finally { setSaving(false); }
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

  const getMeta = (cat) => CATEGORY_META[cat] || { icon: 'fa-circle-dot', color: '#6b7280' };

  return (
    <div>
      {/* Header */}
      <div className="admin-page-header d-flex justify-content-between align-items-center">
        <div>
          <h1 className="admin-page-title">Services</h1>
          <p className="admin-page-subtitle">
            Manage what your clinic offers ({services.length} active)
          </p>
        </div>
        <button className="btn-admin-primary" onClick={openAdd}>
          <i className="fa-solid fa-plus me-2"></i>Add Service
        </button>
      </div>

      {loading && <div className="text-center py-5"><div className="spinner-border" style={{ color: '#AB1509' }} /></div>}

      {/* Services grouped by category */}
      <div className="d-flex flex-column gap-4">
        {Object.entries(grouped).map(([category, items]) => {
          const meta = getMeta(category);
          return (
            <div key={category} className="admin-card p-0 overflow-hidden">
              {/* Category header */}
              <div className="d-flex align-items-center gap-3 px-4 py-3"
                style={{ borderBottom: '1px solid #f3f4f6', background: '#fafafa' }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: `${meta.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <i className={`fa-solid ${meta.icon}`} style={{ color: meta.color }}></i>
                </div>
                <span className="fw-bold text-capitalize" style={{ fontSize: '0.95rem' }}>{category}</span>
                <span className="badge ms-1" style={{ background: `${meta.color}15`, color: meta.color, fontWeight: 600 }}>
                  {items.length}
                </span>
              </div>

              {/* Services table */}
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0" style={{ tableLayout: 'fixed', width: '100%' }}>
<thead className="table-light" style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: 0.5 }}>
  <colgroup>
    <col style={{ width: '22%' }} />
    <col style={{ width: '42%' }} />
    <col style={{ width: '12%' }} />
    <col style={{ width: '12%' }} />
    <col style={{ width: '12%' }} />
  </colgroup>
  <tr>
    <th className="text-muted fw-semibold border-0 ps-4">Service Name</th>
    <th className="text-muted fw-semibold border-0">Description</th>
    <th className="text-muted fw-semibold border-0">Duration</th>
    <th className="text-muted fw-semibold border-0">Price</th>
    <th className="text-muted fw-semibold border-0">Actions</th>
  </tr>
</thead>
                  <tbody>
                    {items.map(s => (
                      <tr key={s.id}>
                        <td className="ps-4">
                          <span className="fw-semibold">{s.name}</span>
                        </td>
                        <td className="text-muted" style={{ maxWidth: 300 }}>
                          <span style={{ fontSize: '0.88rem' }}>
                            {s.description?.slice(0, 70)}{s.description?.length > 70 ? '...' : ''}
                          </span>
                        </td>
                        <td>
                          <span className="badge bg-light text-dark fw-semibold">
                            <i className="fa-regular fa-clock me-1"></i>{s.duration_minutes} min
                          </span>
                        </td>
                        <td>
                          <span className="fw-bold" style={{ color: '#AB1509', fontSize: '1rem' }}>
                            ${parseFloat(s.price).toFixed(2)}
                          </span>
                        </td>
                        <td>
                          <div className="d-flex gap-2">
                            <button className="btn btn-sm btn-outline-primary"
                              style={{ borderRadius: 8, fontSize: '0.8rem' }}
                              onClick={() => openEdit(s)}>
                              <i className="fa-solid fa-pen me-1"></i>Edit
                            </button>
                            <button className="btn btn-sm btn-outline-danger"
                              style={{ borderRadius: 8, fontSize: '0.8rem' }}
                              onClick={() => handleDelete(s.id)}>
                              <i className="fa-solid fa-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>

      {!loading && services.length === 0 && (
        <div className="text-center py-5">
          <i className="fa-solid fa-stethoscope fa-3x mb-3" style={{ color: '#d1d5db' }}></i>
          <h5 className="text-muted">No services yet</h5>
          <button className="btn btn-primary mt-2" onClick={openAdd}>
            Add your first service
          </button>
        </div>
      )}

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="admin-modal-overlay"
          onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="admin-modal">
            <div className="admin-modal-title">
              <i className={`fa-solid ${editService ? 'fa-pen' : 'fa-plus'} me-2`} style={{ color: '#AB1509' }}></i>
              {editService ? 'Edit Service' : 'Add New Service'}
            </div>

            {error && <div className="alert alert-danger mb-3">{error}</div>}

            <div className="row g-3">
              {/* Name */}
              <div className="col-12">
                <label className="form-label fw-semibold">Service Name *</label>
                <input className="form-control" value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. General Consultation" />
              </div>

              {/* Price + Duration */}
              <div className="col-6">
                <label className="form-label fw-semibold">Price ($) *</label>
                <div className="input-group">
                  <span className="input-group-text">$</span>
                  <input type="number" className="form-control" value={form.price}
                    onChange={e => setForm({ ...form, price: e.target.value })}
                    placeholder="50.00" min="0" step="0.01" />
                </div>
              </div>
              <div className="col-6">
                <label className="form-label fw-semibold">Duration (minutes)</label>
                <div className="input-group">
                  <input type="number" className="form-control" value={form.duration_minutes}
                    onChange={e => setForm({ ...form, duration_minutes: e.target.value })}
                    placeholder="30" min="5" step="5" />
                  <span className="input-group-text">min</span>
                </div>
              </div>

              {/* Category — dropdown + custom option */}
              <div className="col-12">
                <label className="form-label fw-semibold">Category</label>
                {!customCategory ? (
                  <div className="d-flex gap-2">
                    <select className="form-select" value={form.category}
                      onChange={e => setForm({ ...form, category: e.target.value })}>
                      <option value="">Select category...</option>
                      {Object.keys(CATEGORY_META).map(cat => (
                        <option key={cat} value={cat} className="text-capitalize">{cat}</option>
                      ))}
                    </select>
                    <button type="button" className="btn btn-outline-secondary text-nowrap"
                      style={{ borderRadius: 8, fontSize: '0.85rem' }}
                      onClick={() => { setCustomCategory(true); setForm({ ...form, category: '' }); }}>
                      + Custom
                    </button>
                  </div>
                ) : (
                  <div className="d-flex gap-2">
                    <input className="form-control" value={form.category}
                      onChange={e => setForm({ ...form, category: e.target.value.toLowerCase() })}
                      placeholder="Type custom category name..." />
                    <button type="button" className="btn btn-outline-secondary text-nowrap"
                      style={{ borderRadius: 8, fontSize: '0.85rem' }}
                      onClick={() => { setCustomCategory(false); setForm({ ...form, category: '' }); }}>
                      Use Preset
                    </button>
                  </div>
                )}
                <small className="text-muted mt-1 d-block">
                  {customCategory
                    ? 'Enter any category name — it will appear as a new group'
                    : 'Or click "+ Custom" to create your own category'}
                </small>
              </div>

              {/* Description */}
              <div className="col-12">
                <label className="form-label fw-semibold">Description</label>
                <textarea className="form-control" rows="3"
                  value={form.description || ''}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder="Brief description of this service..." />
              </div>
            </div>

            <div className="d-flex gap-2 mt-4">
              <button className="btn-admin-primary flex-fill" onClick={handleSave} disabled={saving}>
                {saving
                  ? <><span className="spinner-border spinner-border-sm me-2" />Saving...</>
                  : editService ? 'Save Changes' : 'Add Service'}
              </button>
              <button className="btn-admin-secondary flex-fill" onClick={() => setShowModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}