import { useState, useEffect } from 'react';
import api from '../../services/api';

const statusClass = { pending: 'badge-pending', confirmed: 'badge-confirmed', cancelled: 'badge-cancelled', completed: 'badge-completed' };

export default function AdminPatients() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [historyModal, setHistoryModal] = useState(null);
  const [historyLoading, setHistoryLoading] = useState(false);

  const fetchPatients = () => {
    const params = search ? `?search=${search}` : '';
    api.get(`/patients${params}`)
      .then(res => setPatients(res.data.patients || []))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchPatients(); }, [search]);

  const toggleStatus = async (id) => {
    try { await api.put(`/admins/patients/${id}/toggle`); fetchPatients(); }
    catch { alert('Failed'); }
  };

  const openHistory = async (patient) => {
    setHistoryLoading(true);
    setHistoryModal({ patient, data: null });
    try {
      const res = await api.get(`/patients/${patient.id}/history`);
      setHistoryModal({ patient, data: res.data });
    } catch { setHistoryModal(null); }
    finally { setHistoryLoading(false); }
  };

  return (
    <div>
      <div className="admin-page-header d-flex justify-content-between align-items-center flex-wrap gap-3">
        <div>
          <h1 className="admin-page-title">Patients</h1>
          <p className="admin-page-subtitle">{patients.length} registered patients</p>
        </div>
        <input className="form-control" style={{ maxWidth: 280 }} placeholder="🔍 Search name, email, phone..."
          value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="admin-card p-0 overflow-hidden">
        {loading ? <div className="text-center py-5"><div className="spinner-border text-primary" /></div> : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr><th>#</th><th>Patient</th><th>Contact</th><th>Gender</th><th>Bookings</th><th>Total Spent</th><th>Joined</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {patients.length === 0 ? (
                  <tr><td colSpan="9" className="text-center text-muted py-4">No patients found</td></tr>
                ) : patients.map(p => (
                  <tr key={p.id}>
                    <td className="text-muted">#{p.id}</td>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#AB150918', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#AB1509', flexShrink: 0, fontSize: '0.85rem' }}>
                          {p.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="fw-semibold">{p.name}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <small className="d-block">{p.email}</small>
                      <small className="text-muted">{p.phone || '—'}</small>
                    </td>
                    <td className="text-capitalize">{p.gender || '—'}</td>
                    <td><span className="badge bg-light text-dark">{p.total_bookings}</span></td>
                    <td className="fw-semibold" style={{ color: '#059669' }}>${parseFloat(p.total_spent).toFixed(2)}</td>
                    <td><small>{new Date(p.created_at).toLocaleDateString('en-GB')}</small></td>
                    <td>
                      <span className={`status-badge ${p.is_active ? 'badge-confirmed' : 'badge-cancelled'}`}>
                        {p.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div className="d-flex gap-1">
                        <button className="btn btn-sm btn-outline-primary" title="Medical history"
                          onClick={() => openHistory(p)}>
                          <i className="fa-solid fa-file-medical"></i>
                        </button>
                        <button className={`btn btn-sm ${p.is_active ? 'btn-outline-warning' : 'btn-outline-success'}`}
                          onClick={() => toggleStatus(p.id)}>
                          {p.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Medical History Modal */}
      {historyModal && (
        <div className="admin-modal-overlay" onClick={e => e.target === e.currentTarget && setHistoryModal(null)}>
          <div className="admin-modal" style={{ maxWidth: 700 }}>
            <div className="admin-modal-title">
              <i className="fa-solid fa-file-medical me-2" style={{ color: '#AB1509' }}></i>
              Medical History — {historyModal.patient.name}
            </div>

            {historyLoading ? (
              <div className="text-center py-4"><div className="spinner-border" style={{ color: '#AB1509' }} /></div>
            ) : historyModal.data && (
              <>
                {/* Patient info */}
                <div className="row g-3 mb-4 p-3 rounded-3" style={{ background: '#f8f5f0' }}>
                  <div className="col-6">
                    <small className="text-muted d-block">Email</small>
                    <span className="fw-semibold">{historyModal.data.patient.email}</span>
                  </div>
                  <div className="col-6">
                    <small className="text-muted d-block">Phone</small>
                    <span className="fw-semibold">{historyModal.data.patient.phone || '—'}</span>
                  </div>
                  <div className="col-6">
                    <small className="text-muted d-block">Gender</small>
                    <span className="fw-semibold text-capitalize">{historyModal.data.patient.gender || '—'}</span>
                  </div>
                  <div className="col-6">
                    <small className="text-muted d-block">Member Since</small>
                    <span className="fw-semibold">{new Date(historyModal.data.patient.created_at).toLocaleDateString('en-GB')}</span>
                  </div>
                </div>

                {/* Stats */}
                <div className="row g-2 mb-4">
                  {[
                    { label: 'Total Visits', value: historyModal.data.stats.total_appointments, color: '#AB1509' },
                    { label: 'Completed', value: historyModal.data.stats.completed, color: '#059669' },
                    { label: 'Cancelled', value: historyModal.data.stats.cancelled, color: '#ef4444' },
                    { label: 'Total Spent', value: `$${historyModal.data.stats.total_spent}`, color: '#0284c7' },
                  ].map(s => (
                    <div className="col-6 col-md-3" key={s.label}>
                      <div className="text-center p-3 rounded-3" style={{ background: '#f8f5f0' }}>
                        <div className="fw-bold" style={{ color: s.color, fontSize: '1.4rem' }}>{s.value}</div>
                        <small className="text-muted">{s.label}</small>
                      </div>
                    </div>
                  ))}
                </div>

                {historyModal.data.stats.top_doctor && (
                  <div className="mb-3 p-3 rounded-3" style={{ background: '#fff7d3', border: '1px solid #f5ecc0' }}>
                    <small className="text-muted">Most visited doctor</small>
                    <div className="fw-bold" style={{ color: '#AB1509' }}>
                      <i className="fa-solid fa-user-doctor me-2"></i>{historyModal.data.stats.top_doctor}
                    </div>
                  </div>
                )}

                {/* Booking history */}
                <div className="admin-card-title mt-4">Appointment History</div>
                <div style={{ maxHeight: 300, overflowY: 'auto' }}>
                  {historyModal.data.bookings.length === 0 ? (
                    <p className="text-muted text-center py-3">No appointments yet</p>
                  ) : historyModal.data.bookings.map(b => (
                    <div key={b.id} className="p-3 mb-2 rounded-3" style={{ background: '#f9f6f0', border: '1px solid #e5e7eb' }}>
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <div>
                          <span className="fw-semibold">{b.service_name}</span>
                          {b.doctor_name && <small className="text-muted ms-2">with {b.doctor_name}</small>}
                        </div>
                        <span className={`status-badge ${statusClass[b.status]}`}>{b.status}</span>
                      </div>
                      <div className="d-flex gap-3 flex-wrap">
                        <small className="text-muted"><i className="fa-regular fa-calendar me-1"></i>{new Date(b.booking_date).toLocaleDateString('en-GB')}</small>
                        <small className="text-muted"><i className="fa-regular fa-clock me-1"></i>{b.start_time?.slice(0,5)}</small>
                        <small className="fw-semibold" style={{ color: '#AB1509' }}>${b.total_price}</small>
                      </div>
                      {b.notes && <small className="text-muted fst-italic d-block mt-1">Patient: "{b.notes}"</small>}
                      {b.doctor_notes && (
                        <div className="mt-2 p-2 rounded-2" style={{ background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                          <small className="fw-semibold" style={{ color: '#059669' }}>
                            <i className="fa-solid fa-note-sticky me-1"></i>Doctor notes:
                          </small>
                          <small className="d-block text-muted">{b.doctor_notes}</small>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}

            <button className="btn-admin-secondary w-100 mt-3" onClick={() => setHistoryModal(null)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
