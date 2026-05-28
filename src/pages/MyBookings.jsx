import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const statusColor = {
  pending: 'badge-pending', confirmed: 'badge-confirmed',
  cancelled: 'badge-cancelled', completed: 'badge-completed',
};

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [rescheduleModal, setRescheduleModal] = useState(null);
  const [rescheduleForm, setRescheduleForm] = useState({ preferred_date: '', preferred_time: '', reason: '' });
  const [sending, setSending] = useState(false);

  const fetchBookings = () => {
    api.get('/bookings/my')
      .then(res => setBookings(res.data.bookings || []))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchBookings(); }, []);

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this appointment?')) return;
    try { await api.put(`/bookings/${id}`, { status: 'cancelled' }); fetchBookings(); }
    catch (err) { alert(err.response?.data?.error || 'Could not cancel'); }
  };

  const handleApproveReassign = async (id) => {
    try { await api.post(`/bookings/${id}/approve-reassign`); fetchBookings(); }
    catch (err) { alert(err.response?.data?.error || 'Failed'); }
  };

  const handleDeclineReassign = async (id) => {
    if (!window.confirm('Decline this reschedule? Your original time will be kept.')) return;
    try { await api.post(`/bookings/${id}/decline-reassign`); fetchBookings(); }
    catch (err) { alert(err.response?.data?.error || 'Failed'); }
  };

  const handleRescheduleRequest = async () => {
    setSending(true);
    try {
      await api.post(`/bookings/${rescheduleModal.id}/request-reschedule`, rescheduleForm);
      setRescheduleModal(null);
      setRescheduleForm({ preferred_date: '', preferred_time: '', reason: '' });
      alert('Reschedule request sent! The clinic will contact you shortly.');
    } catch (err) { alert(err.response?.data?.error || 'Failed'); }
    finally { setSending(false); }
  };

  const filtered = filter === 'all' ? bookings : bookings.filter(b => b.status === filter);
  const pendingReassign = bookings.filter(b => b.reassign_status === 'pending_approval').length;
  const today = new Date().toISOString().split('T')[0];

  return (
    <>
      <div style={{ background: 'linear-gradient(135deg, #AB1509 0%, #7a0e06 100%)', padding: '3rem 0' }}>
        <div className="container">
          <h1 className="fw-bold mb-1" style={{ color: '#fff7d3' }}>My Appointments</h1>
          <p style={{ color: 'rgba(255,247,211,0.85)' }}>View and manage your bookings</p>
        </div>
      </div>

      <div className="container py-5">
        {pendingReassign > 0 && (
          <div className="alert mb-4 d-flex align-items-center gap-3"
            style={{ background: '#fff7d3', border: '2px solid #f59e0b', borderRadius: 12 }}>
            <i className="fa-solid fa-triangle-exclamation fa-lg" style={{ color: '#d97706' }}></i>
            <div>
              <strong>Action Required:</strong> You have {pendingReassign} pending reschedule request{pendingReassign > 1 ? 's' : ''}. Please review below.
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="d-flex gap-2 mb-4 flex-wrap">
          {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map(s => (
            <button key={s} onClick={() => setFilter(s)} className="btn btn-sm"
              style={{
                borderRadius: 20, fontWeight: filter === s ? 600 : 400,
                background: filter === s ? '#AB1509' : 'white',
                color: filter === s ? '#fff7d3' : '#6b5a58',
                border: `1px solid ${filter === s ? '#AB1509' : '#e5e7eb'}`,
              }}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
              <span className="ms-1 badge rounded-pill" style={{ background: filter === s ? 'rgba(255,247,211,0.3)' : '#f3f4f6', color: filter === s ? '#fff7d3' : '#6b7280', fontSize: '0.7rem' }}>
                {s === 'all' ? bookings.length : bookings.filter(b => b.status === s).length}
              </span>
            </button>
          ))}
        </div>

        {loading && <div className="text-center py-5"><div className="spinner-border" style={{ color: '#AB1509' }} /></div>}

        {!loading && filtered.length === 0 && (
          <div className="text-center py-5">
            <i className="fa-solid fa-calendar-xmark fa-3x mb-3" style={{ color: '#d1d5db' }}></i>
            <h5 className="fw-bold">No appointments found</h5>
            <p className="text-muted mb-4">{filter === 'all' ? "You haven't booked any appointments yet." : `No ${filter} appointments.`}</p>
            <Link to="/booking" className="btn btn-primary px-4">
              <i className="fa-solid fa-calendar-plus me-2"></i>Book Now
            </Link>
          </div>
        )}

        <div className="row g-4">
          {filtered.map(b => (
            <div className="col-md-6 col-lg-4" key={b.id}>
              <div className="card border-0 shadow-sm h-100" style={{ borderRadius: 16, overflow: 'hidden' }}>
                <div style={{
                  height: 5,
                  background: b.reassign_status === 'pending_approval' ? '#f59e0b' :
                    b.status === 'confirmed' ? '#059669' : b.status === 'cancelled' ? '#ef4444' :
                    b.status === 'completed' ? '#6366f1' : '#f59e0b'
                }} />
                <div className="card-body p-4 d-flex flex-column">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <h6 className="fw-bold mb-0">{b.service_name}</h6>
                    <span className={`status-badge ${statusColor[b.status]}`}>{b.status}</span>
                  </div>

                  {/* Reassign pending */}
                  {b.reassign_status === 'pending_approval' && (
                    <div className="mb-3 p-3 rounded-3" style={{ background: '#fff7d3', border: '2px solid #f59e0b' }}>
                      <div className="fw-semibold mb-1" style={{ color: '#92400e', fontSize: '0.88rem' }}>
                        <i className="fa-solid fa-triangle-exclamation me-2"></i>Reschedule Requested
                      </div>
                      <div className="text-muted small mb-3">
                        New time: <strong>{b.pending_date && new Date(b.pending_date).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}</strong> at <strong>{b.pending_time?.slice(0,5)}</strong>
                      </div>
                      <div className="d-flex gap-2">
                        <button className="btn btn-sm btn-success flex-fill fw-semibold" onClick={() => handleApproveReassign(b.id)}>
                          <i className="fa-solid fa-check me-1"></i>Accept
                        </button>
                        <button className="btn btn-sm btn-danger flex-fill fw-semibold" onClick={() => handleDeclineReassign(b.id)}>
                          <i className="fa-solid fa-xmark me-1"></i>Decline
                        </button>
                      </div>
                    </div>
                  )}

                  {b.reassign_status === 'declined' && (
                    <div className="mb-3 p-2 rounded-3 text-center" style={{ background: '#fef2f2', border: '1px solid #fecaca' }}>
                      <small style={{ color: '#991b1b', fontWeight: 600 }}>
                        <i className="fa-solid fa-xmark me-1"></i>You declined the reschedule — original time kept
                      </small>
                    </div>
                  )}

                  {/* Details */}
                  <div className="mb-3">
                    {b.doctor_name && (
                      <div className="d-flex align-items-center gap-2 mb-2">
                        <i className="fa-solid fa-user-doctor" style={{ color: '#AB1509', width: 16 }}></i>
                        <small className="fw-semibold">{b.doctor_name}</small>
                        {b.specialization && <small className="text-muted">· {b.specialization}</small>}
                      </div>
                    )}
                    <div className="d-flex align-items-center gap-2 mb-2">
                      <i className="fa-regular fa-calendar" style={{ color: '#AB1509', width: 16 }}></i>
                      <small className="fw-semibold">
                        {new Date(b.booking_date).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                      </small>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                      <i className="fa-regular fa-clock" style={{ color: '#AB1509', width: 16 }}></i>
                      <small>{b.start_time?.slice(0,5)} – {b.end_time?.slice(0,5)}</small>
                    </div>
                  </div>

                  {b.notes && (
                    <p className="text-muted small fst-italic mb-3 p-2 rounded-2" style={{ background: '#f8f5f0' }}>"{b.notes}"</p>
                  )}
                  {b.doctor_notes && (
                    <div className="mb-3 p-2 rounded-2" style={{ background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                      <small className="fw-semibold d-block" style={{ color: '#059669' }}>
                        <i className="fa-solid fa-note-sticky me-1"></i>Doctor's notes
                      </small>
                      <small className="text-muted">{b.doctor_notes}</small>
                    </div>
                  )}

                  {/* Footer actions */}
                  <div className="d-flex justify-content-between align-items-center mt-auto pt-3" style={{ borderTop: '1px solid #f3f4f6' }}>
                    <span className="fw-bold" style={{ color: '#AB1509', fontSize: '1.1rem' }}>${b.price}</span>
                    <div className="d-flex gap-2 flex-wrap">
                      <Link to={`/booking/receipt/${b.id}`} className="btn btn-sm btn-outline-secondary" title="Print receipt" style={{ borderRadius: 8 }}>
                        <i className="fa-solid fa-print"></i>
                      </Link>
                      {/* Request reschedule */}
                      {['pending', 'confirmed'].includes(b.status) && b.reassign_status !== 'pending_approval' && new Date(b.booking_date) > new Date() && (
                        <button className="btn btn-sm btn-outline-primary" style={{ borderRadius: 8 }} title="Request reschedule"
                          onClick={() => { setRescheduleModal(b); setRescheduleForm({ preferred_date: '', preferred_time: '', reason: '' }); }}>
                          <i className="fa-solid fa-arrows-rotate"></i>
                        </button>
                      )}
                      {/* Cancel */}
                      {b.status === 'pending' && b.reassign_status !== 'pending_approval' && (
                        <button className="btn btn-sm btn-outline-danger" style={{ borderRadius: 8 }} onClick={() => handleCancel(b.id)}>
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Reschedule Request Modal */}
      {rescheduleModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}
          onClick={e => e.target === e.currentTarget && setRescheduleModal(null)}>
          <div style={{ background: 'white', borderRadius: 16, padding: '2rem', width: '100%', maxWidth: 480, boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
            <h5 className="fw-bold mb-1">
              <i className="fa-solid fa-arrows-rotate me-2" style={{ color: '#AB1509' }}></i>
              Request Reschedule
            </h5>
            <p className="text-muted small mb-4">{rescheduleModal.service_name} — #{rescheduleModal.id}</p>

            <div className="mb-3">
              <label className="form-label fw-semibold">Preferred Date (optional)</label>
              <input type="date" className="form-control" min={today}
                value={rescheduleForm.preferred_date}
                onChange={e => setRescheduleForm(f => ({ ...f, preferred_date: e.target.value }))} />
            </div>
            <div className="mb-3">
              <label className="form-label fw-semibold">Preferred Time (optional)</label>
              <input type="time" className="form-control"
                value={rescheduleForm.preferred_time}
                onChange={e => setRescheduleForm(f => ({ ...f, preferred_time: e.target.value }))} />
            </div>
            <div className="mb-4">
              <label className="form-label fw-semibold">Reason *</label>
              <textarea className="form-control" rows="3"
                placeholder="Why do you need to reschedule?"
                value={rescheduleForm.reason}
                onChange={e => setRescheduleForm(f => ({ ...f, reason: e.target.value }))} />
            </div>

            <div className="p-3 rounded-3 mb-4" style={{ background: '#fff7d3', border: '1px solid #f5ecc0' }}>
              <small style={{ color: '#92400e' }}>
                <i className="fa-solid fa-circle-info me-2"></i>
                Your request will be sent to the clinic. They will contact you to confirm the new time.
              </small>
            </div>

            <div className="d-flex gap-2">
              <button className="btn btn-primary flex-fill fw-semibold" style={{ background: '#AB1509', borderColor: '#AB1509', borderRadius: 10 }}
                onClick={handleRescheduleRequest} disabled={sending || !rescheduleForm.reason}>
                {sending ? <><span className="spinner-border spinner-border-sm me-2" />Sending...</> : 'Send Request'}
              </button>
              <button className="btn btn-outline-secondary flex-fill" style={{ borderRadius: 10 }} onClick={() => setRescheduleModal(null)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
