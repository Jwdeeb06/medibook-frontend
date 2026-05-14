import { useState, useEffect } from 'react';
import api from '../../services/api';

export default function DoctorServices() {
  const [doctorId, setDoctorId] = useState(null);
  const [allServices, setAllServices] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    Promise.all([api.get('/doctors/me'), api.get('/services')])
      .then(([docRes, svcRes]) => {
        setDoctorId(docRes.data.id);
        setAllServices(svcRes.data.services || []);
        setSelectedIds(docRes.data.services?.map(s => s.id) || []);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const toggle = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put(`/doctors/${doctorId}/services`, { service_ids: selectedIds });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) { alert('Failed to save'); }
    finally { setSaving(false); }
  };

  const grouped = allServices.reduce((acc, s) => {
    const cat = s.category || 'general';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(s);
    return acc;
  }, {});

  if (loading) return <div className="text-center py-5"><div className="spinner-border text-primary" /></div>;

  return (
    <div>
      <div className="admin-page-header">
        <h1 className="admin-page-title">My Services</h1>
        <p className="admin-page-subtitle">Select which services you offer — {selectedIds.length} selected</p>
      </div>

      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="admin-card">
            {success && <div className="alert alert-success mb-4">✅ Services saved!</div>}

            {Object.entries(grouped).map(([category, items]) => (
              <div key={category} className="mb-4">
                <h6 className="fw-bold text-capitalize mb-3" style={{ color: '#AB1509' }}>{category}</h6>
                <div className="row g-2">
                  {items.map(s => (
                    <div className="col-md-6" key={s.id}>
                      <div
                        className="p-3 rounded-3 border d-flex align-items-center gap-3 cursor-pointer"
                        style={{
                          cursor: 'pointer',
                          background: selectedIds.includes(s.id) ? '#fff7d3' : '#f9f6f0',
                          borderColor: selectedIds.includes(s.id) ? '#AB1509' : '#e0d8cc',
                          borderWidth: selectedIds.includes(s.id) ? '2px' : '1px',
                          transition: 'all 0.2s'
                        }}
                        onClick={() => toggle(s.id)}
                      >
                        <input type="checkbox" className="form-check-input mt-0"
                          checked={selectedIds.includes(s.id)} onChange={() => toggle(s.id)} />
                        <div>
                          <div className="fw-semibold">{s.name}</div>
                          <small className="text-muted">${s.price} · {s.duration_minutes} min</small>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <button className="btn-admin-primary w-100 mt-2" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save My Services'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
