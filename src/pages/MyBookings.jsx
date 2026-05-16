import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const statusColor = {
  pending: 'badge-pending',
  confirmed: 'badge-confirmed',
  cancelled: 'badge-cancelled',
  completed: 'badge-completed',
};

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

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

  const filtered = filter === 'all' ? bookings : bookings.filter(b => b.status === filter);

  return (
    <>
      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, #AB1509 0%, #7a0e06 100%)', padding: '3rem 0' }}>
        <div className="container">
          <h1 className="fw-bold mb-1" style={{ color: '#fff7d3' }}>My Appointments</h1>
          <p style={{ color: 'rgba(255,247,211,0.85)' }}>View and manage your bookings</p>
        </div>
      </div>

      <div className="container py-5">
        {/* Filter */}
        <div className="d-flex gap-2 mb-4 flex-wrap">
          {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className="btn btn-sm"
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
            <p className="text-muted mb-4">
              {filter === 'all' ? "You haven't booked any appointments yet." : `No ${filter} appointments.`}
            </p>
            <Link to="/booking" className="btn btn-primary px-4">
              <i className="fa-solid fa-calendar-plus me-2"></i>Book Now
            </Link>
          </div>
        )}

        <div className="row g-4">
          {filtered.map(b => (
            <div className="col-md-6 col-lg-4" key={b.id}>
              <div className="card border-0 shadow-sm h-100" style={{ borderRadius: 16, overflow: 'hidden' }}>
                {/* Status bar */}
                <div style={{ height: 5, background: b.status === 'confirmed' ? '#059669' : b.status === 'cancelled' ? '#ef4444' : b.status === 'completed' ? '#6366f1' : '#f59e0b' }} />

                <div className="card-body p-4 d-flex flex-column">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <h6 className="fw-bold mb-0">{b.service_name}</h6>
                    <span className={`status-badge ${statusColor[b.status]}`}>{b.status}</span>
                  </div>

                  <div className="mb-3">
                    {b.doctor_name && (
                      <div className="d-flex align-items-center gap-2 mb-2">
                        <i className="fa-solid fa-user-doctor" style={{ color: '#AB1509', width: 16 }}></i>
                        <small>{b.doctor_name}</small>
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
                    <p className="text-muted small fst-italic mb-3 p-2 rounded-2" style={{ background: '#f8f5f0' }}>
                      "{b.notes}"
                    </p>
                  )}

                  {b.doctor_notes && (
                    <div className="mb-3 p-2 rounded-2" style={{ background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                      <small className="fw-semibold d-block" style={{ color: '#059669' }}>
                        <i className="fa-solid fa-note-sticky me-1"></i>Doctor's notes
                      </small>
                      <small className="text-muted">{b.doctor_notes}</small>
                    </div>
                  )}

                  <div className="d-flex justify-content-between align-items-center mt-auto pt-3" style={{ borderTop: '1px solid #f3f4f6' }}>
                    <span className="fw-bold" style={{ color: '#AB1509', fontSize: '1.1rem' }}>${b.price}</span>
                    <div className="d-flex gap-2">
                      <Link to={`/booking/receipt/${b.id}`} className="btn btn-sm btn-outline-secondary" title="Print receipt">
                        <i className="fa-solid fa-print"></i>
                      </Link>
                      {b.status === 'pending' && (
                        <button className="btn btn-sm btn-outline-danger" onClick={() => handleCancel(b.id)}>
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
    </>
  );
}
