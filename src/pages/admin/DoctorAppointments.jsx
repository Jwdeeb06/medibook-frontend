import { useState, useEffect } from 'react';
import api from '../../services/api';

const statusClass = { pending: 'badge-pending', confirmed: 'badge-confirmed', cancelled: 'badge-cancelled', completed: 'badge-completed' };

export default function DoctorAppointments() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [notesModal, setNotesModal] = useState(null);

  const fetchBookings = () => {
    const params = filter !== 'all' ? `?status=${filter}` : '';
    api.get(`/bookings/doctor${params}`)
      .then(res => setBookings(res.data.bookings || []))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchBookings(); }, [filter]);

  const handleStatus = async (id, status) => {
    try { await api.put(`/bookings/${id}`, { status }); fetchBookings(); }
    catch (err) { alert(err.response?.data?.error || 'Failed'); }
  };

  const handleSaveNotes = async () => {
    try {
      await api.put(`/bookings/${notesModal.id}`, { doctor_notes: notesModal.doctor_notes });
      setNotesModal(null); fetchBookings();
    } catch { alert('Failed'); }
  };

  return (
    <div>
      <div className="admin-page-header">
        <h1 className="admin-page-title">My Appointments</h1>
        <p className="admin-page-subtitle">{bookings.length} total appointments</p>
      </div>

      <div className="d-flex gap-2 mb-4 flex-wrap">
        {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map(s => (
          <button key={s} onClick={() => setFilter(s)} className="btn btn-sm"
            style={{ borderRadius: 20, fontWeight: filter === s ? 600 : 400, background: filter === s ? '#AB1509' : 'transparent',
              color: filter === s ? '#fff7d3' : '#6b5a58', border: filter === s ? 'none' : '1px solid #e5e7eb' }}>
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      <div className="admin-card p-0 overflow-hidden">
        {loading ? <div className="text-center py-5"><div className="spinner-border text-primary" /></div> : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr><th>#</th><th>Patient</th><th>Service</th><th>Date & Time</th><th>Notes</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {bookings.length === 0 ? (
                  <tr><td colSpan="7" className="text-center text-muted py-4">No appointments found</td></tr>
                ) : bookings.map(b => (
                  <tr key={b.id}>
                    <td className="text-muted">#{b.id}</td>
                    <td>
                      <div className="fw-semibold">{b.patient_name}</div>
                      <small className="text-muted">{b.patient_phone || b.patient_email || ''}</small>
                    </td>
                    <td>{b.service_name}</td>
                    <td>
                      <small className="d-block fw-semibold">{new Date(b.booking_date).toLocaleDateString('en-GB')}</small>
                      <small className="text-muted">{b.start_time?.slice(0,5)} – {b.end_time?.slice(0,5)}</small>
                    </td>
                    <td>
                      {b.notes && <small className="text-muted fst-italic d-block">Patient: "{b.notes.slice(0,40)}{b.notes.length > 40 ? '...' : ''}"</small>}
                      {b.doctor_notes && <small style={{ color: '#059669' }}><i className="fa-solid fa-note-sticky me-1"></i>Notes added</small>}
                    </td>
                    <td><span className={`status-badge ${statusClass[b.status]}`}>{b.status}</span></td>
                    <td>
                      <div className="d-flex gap-1">
                        {b.status === 'pending' && <button className="btn btn-sm btn-success" onClick={() => handleStatus(b.id, 'confirmed')}>✓ Confirm</button>}
                        {b.status === 'confirmed' && <button className="btn btn-sm btn-secondary" onClick={() => handleStatus(b.id, 'completed')}>Complete</button>}
                        {!['cancelled','completed'].includes(b.status) && <button className="btn btn-sm btn-warning" onClick={() => handleStatus(b.id, 'cancelled')}>Cancel</button>}
                        <button className="btn btn-sm btn-outline-secondary" title="Add notes"
                          onClick={() => setNotesModal({ id: b.id, doctor_notes: b.doctor_notes || '', patient_name: b.patient_name })}>
                          <i className="fa-solid fa-note-sticky"></i>
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

      {notesModal && (
        <div className="admin-modal-overlay" onClick={e => e.target === e.currentTarget && setNotesModal(null)}>
          <div className="admin-modal">
            <div className="admin-modal-title">Consultation Notes — {notesModal.patient_name}</div>
            <textarea className="form-control mb-4" rows="5"
              placeholder="Add diagnosis, treatment plan, prescriptions..."
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
