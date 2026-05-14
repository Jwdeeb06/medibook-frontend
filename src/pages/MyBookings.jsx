import { useState, useEffect } from 'react';
import api from '../services/api';

const statusColor = {
  pending: 'warning',
  confirmed: 'success',
  cancelled: 'danger',
  completed: 'secondary',
};

function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = () => {
    api.get('/bookings/my')
      .then((res) => setBookings(res.data.bookings || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchBookings(); }, []);

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this appointment?')) return;
    try {
      await api.put(`/bookings/${id}`, { status: 'cancelled' });
      fetchBookings();
    } catch (err) {
      alert(err.response?.data?.error || 'Could not cancel booking');
    }
  };

  return (
    <div className="container py-5">
      <div className="text-center mb-5">
        <h1 className="section-title">My Appointments</h1>
        <p className="text-muted mt-3">View and manage your bookings</p>
      </div>

      {loading && (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status" />
        </div>
      )}

      {!loading && bookings.length === 0 && (
        <div className="text-center py-5">
          <div style={{ fontSize: '3rem' }}>📅</div>
          <h5 className="mt-3">No appointments yet</h5>
          <p className="text-muted">Book your first appointment today.</p>
          <a href="/booking" className="btn btn-primary">Book Now</a>
        </div>
      )}

      <div className="row g-4">
        {bookings.map((b) => (
          <div className="col-md-6 col-lg-4" key={b.id}>
            <div className="card card-medical h-100 p-4">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <h6 className="fw-bold mb-0">{b.service_name}</h6>
                <span className={`badge bg-${statusColor[b.status] || 'secondary'}`}>
                  {b.status}
                </span>
              </div>

              {b.doctor_name && (
                <p className="text-muted small mb-1">🩺 {b.doctor_name}</p>
              )}
              <p className="text-muted small mb-1">
                📅 {new Date(b.booking_date).toLocaleDateString('en-GB', {
                  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                })}
              </p>
              <p className="text-muted small mb-3">
                🕐 {b.start_time?.slice(0, 5)} – {b.end_time?.slice(0, 5)}
              </p>

              {b.notes && (
                <p className="text-muted small fst-italic mb-3">"{b.notes}"</p>
              )}

              <div className="mt-auto">
                <strong style={{ color: 'var(--brand-red)' }}>${b.price}</strong>
                {b.status === 'pending' && (
                  <button
                    className="btn btn-outline-danger btn-sm float-end"
                    onClick={() => handleCancel(b.id)}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MyBookings;
