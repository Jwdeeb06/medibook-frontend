import { useState, useEffect } from 'react';
import api from '../../services/api';

const statusClass = { pending: 'badge-pending', confirmed: 'badge-confirmed', cancelled: 'badge-cancelled', completed: 'badge-completed' };

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [reassignModal, setReassignModal] = useState(null);
  const [notesModal, setNotesModal] = useState(null);
  const [reassignForm, setReassignForm] = useState({ doctor_id: '', booking_date: '', start_time: '' });
  const [slots, setSlots] = useState([]);
  const [saving, setSaving] = useState(false);

  const fetchBookings = () => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (filter !== 'all') params.append('status', filter);
    api.get(`/bookings?${params}`)
      .then(res => setBookings(res.data.bookings || []))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchBookings(); }, [filter, search]);
  useEffect(() => { api.get('/doctors').then(res => setDoctors(res.data.doctors || [])); }, []);

  // Load slots for reassign
  useEffect(() => {
    if (!reassignModal || !reassignForm.doctor_id || !reassignForm.booking_date) { setSlots([]); return; }
    api.get(`/slots?doctor_id=${reassignForm.doctor_id}&service_id=${reassignModal.service_id}&date=${reassignForm.booking_date}`)
      .then(res => setSlots(res.data.slots?.filter(s => s.is_available) || []))
      .catch(() => setSlots([]));
  }, [reassignForm.doctor_id, reassignForm.booking_date, reassignModal]);

  const handleStatus = async (id, status) => {
    try { await api.put(`/bookings/${id}`, { status }); fetchBookings(); }
    catch (err) { alert(err.response?.data?.error || 'Failed'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this booking permanently?')) return;
    try { await api.delete(`/bookings/${id}`); fetchBookings(); }
    catch { alert('Failed'); }
  };

  const handleReassign = async () => {
    setSaving(true);
    try {
      await api.put(`/bookings/${reassignModal.id}`, {
        doctor_id: parseInt(reassignForm.doctor_id),
        booking_date: reassignForm.booking_date,
        start_time: reassignForm.start_time,
      });
      setReassignModal(null);
      setReassignForm({ doctor_id: '', booking_date: '', start_time: '' });
      fetchBookings();
    } catch (err) { alert(err.response?.data?.error || 'Failed to reassign'); }
    finally { setSaving(false); }
  };

  const handleSaveNotes = async () => {
    try {
      await api.put(`/bookings/${notesModal.id}`, { doctor_notes: notesModal.doctor_notes });
      setNotesModal(null);
      fetchBookings();
    } catch { alert('Failed'); }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div>
      <div className="admin-page-header">
        <div className="d-flex justify-content-between align-items-start flex-wrap gap-3">
          <div>
            <h1 className="admin-page-title">Bookings</h1>
            <p className="admin-page-subtitle">Manage all appointments</p>
          </div>
          <input className="form-control" style={{ maxWidth: 280 }} placeholder="🔍 Search patient, email..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      {/* Filter tabs */}
      <div className="d-flex gap-2 mb-4 flex-wrap">
        {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className="btn btn-sm"
            style={{
              borderRadius: 20, fontWeight: filter === s ? 600 : 400,
              background: filter === s ? '#AB1509' : 'transparent',
              color: filter === s ? '#fff7d3' : '#6b5a58',
              border: filter === s ? 'none' : '1px solid #e5e7eb',
            }}>
            {s.charAt(0).toUpperCase() + s.slice(1)}
            <span className="ms-1 badge rounded-pill" style={{ background: filter === s ? 'rgba(255,247,211,0.3)' : '#f3f4f6', color: filter === s ? '#fff7d3' : '#6b7280', fontSize: '0.7rem' }}>
              {s === 'all' ? bookings.length : bookings.filter(b => b.status === s).length}
            </span>
          </button>
        ))}
      </div>

      <div className="admin-card p-0 overflow-hidden">
        {loading ? <div className="text-center py-5"><div className="spinner-border text-primary" /></div> : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>#</th><th>Patient</th><th>Service</th><th>Doctor</th>
                  <th>Date & Time</th><th>Price</th><th>Status</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.length === 0 ? (
                  <tr><td colSpan="8" className="text-center text-muted py-4">No bookings found</td></tr>
                ) : bookings.map(b => (
                  <tr key={b.id}>
                    <td className="text-muted">#{b.id}</td>
                    <td>
                      <div className="fw-semibold">{b.customer_name}</div>
                      <small className="text-muted">{b.customer_email}</small>
                    </td>
                    <td>{b.service_name}</td>
                    <td>{b.doctor_name || <span className="text-muted">—</span>}</td>
                    <td>
                      <small className="d-block fw-semibold">{new Date(b.booking_date).toLocaleDateString('en-GB')}</small>
                      <small className="text-muted">{b.start_time?.slice(0,5)} – {b.end_time?.slice(0,5)}</small>
                    </td>
                    <td className="fw-bold" style={{ color: '#AB1509' }}>${b.total_price}</td>
                    <td><span className={`status-badge ${statusClass[b.status]}`}>{b.status}</span></td>
                    <td>
                      <div className="d-flex gap-1 flex-wrap">
                        {b.status === 'pending' && (
                          <button className="btn btn-sm btn-success" onClick={() => handleStatus(b.id, 'confirmed')}>✓</button>
                        )}
                        {b.status === 'confirmed' && (
                          <button className="btn btn-sm btn-secondary" onClick={() => handleStatus(b.id, 'completed')}>Done</button>
                        )}
                        {!['cancelled','completed'].includes(b.status) && (
                          <button className="btn btn-sm btn-warning" onClick={() => handleStatus(b.id, 'cancelled')}>Cancel</button>
                        )}
                        {/* Reassign */}
                        {!['cancelled','completed'].includes(b.status) && (
                          <button className="btn btn-sm btn-outline-primary" title="Reassign"
                            onClick={() => { setReassignModal(b); setReassignForm({ doctor_id: b.doctor_id || '', booking_date: b.booking_date?.split('T')[0] || today, start_time: '' }); }}>
                            <i className="fa-solid fa-arrows-rotate"></i>
                          </button>
                        )}
                        {/* Notes */}
                        <button className="btn btn-sm btn-outline-secondary" title="Doctor notes"
                          onClick={() => setNotesModal({ id: b.id, doctor_notes: b.doctor_notes || '', patient_name: b.customer_name })}>
                          <i className="fa-solid fa-note-sticky"></i>
                        </button>
                        <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(b.id)}>
                          <i className="fa-solid fa-trash"></i>
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

      {/* Reassign Modal */}
      {reassignModal && (
        <div className="admin-modal-overlay" onClick={e => e.target === e.currentTarget && setReassignModal(null)}>
          <div className="admin-modal">
            <div className="admin-modal-title">
              <i className="fa-solid fa-arrows-rotate me-2" style={{ color: '#AB1509' }}></i>
              Reassign Booking #{reassignModal.id}
            </div>
            <p className="text-muted mb-4">
              Current: <strong>{reassignModal.doctor_name}</strong> on <strong>{new Date(reassignModal.booking_date).toLocaleDateString('en-GB')}</strong> at <strong>{reassignModal.start_time?.slice(0,5)}</strong>
            </p>

            <div className="row g-3 mb-4">
              <div className="col-12">
                <label className="form-label fw-semibold">New Doctor</label>
                <select className="form-select" value={reassignForm.doctor_id}
                  onChange={e => setReassignForm({...reassignForm, doctor_id: e.target.value, start_time: ''})}>
                  <option value="">Select doctor...</option>
                  {doctors.map(d => <option key={d.id} value={d.id}>{d.name} — {d.specialization}</option>)}
                </select>
              </div>
              <div className="col-12">
                <label className="form-label fw-semibold">New Date</label>
                <input type="date" className="form-control" min={today}
                  value={reassignForm.booking_date}
                  onChange={e => setReassignForm({...reassignForm, booking_date: e.target.value, start_time: ''})} />
              </div>
              {reassignForm.doctor_id && reassignForm.booking_date && (
                <div className="col-12">
                  <label className="form-label fw-semibold">New Time Slot</label>
                  {slots.length === 0
                    ? <p className="text-muted small">No available slots for this date.</p>
                    : <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: 8 }}>
                        {slots.map(slot => (
                          <button key={slot.start_time} onClick={() => setReassignForm({...reassignForm, start_time: slot.start_time})}
                            style={{ padding: '0.5rem', borderRadius: 8, border: '2px solid', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer',
                              borderColor: reassignForm.start_time === slot.start_time ? '#AB1509' : '#e5e7eb',
                              background: reassignForm.start_time === slot.start_time ? '#AB1509' : 'white',
                              color: reassignForm.start_time === slot.start_time ? '#fff7d3' : '#374151' }}>
                            {slot.start_time}
                          </button>
                        ))}
                      </div>
                  }
                </div>
              )}
            </div>

            <div className="d-flex gap-2">
              <button className="btn-admin-primary flex-fill" onClick={handleReassign}
                disabled={saving || !reassignForm.doctor_id || !reassignForm.booking_date || !reassignForm.start_time}>
                {saving ? 'Saving...' : 'Confirm Reassignment'}
              </button>
              <button className="btn-admin-secondary flex-fill" onClick={() => setReassignModal(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Doctor Notes Modal */}
      {notesModal && (
        <div className="admin-modal-overlay" onClick={e => e.target === e.currentTarget && setNotesModal(null)}>
          <div className="admin-modal">
            <div className="admin-modal-title">
              <i className="fa-solid fa-note-sticky me-2" style={{ color: '#AB1509' }}></i>
              Doctor Notes — {notesModal.patient_name}
            </div>
            <label className="form-label fw-semibold">Consultation notes</label>
            <textarea className="form-control mb-4" rows="5"
              placeholder="Add diagnosis, treatment notes, prescriptions..."
              value={notesModal.doctor_notes}
              onChange={e => setNotesModal({...notesModal, doctor_notes: e.target.value})} />
            <div className="d-flex gap-2">
              <button className="btn-admin-primary flex-fill" onClick={handleSaveNotes}>Save Notes</button>
              <button className="btn-admin-secondary flex-fill" onClick={() => setNotesModal(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
