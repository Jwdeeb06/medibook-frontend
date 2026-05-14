import { useState, useEffect } from 'react';
import api from '../../services/api';

const statusClass = { pending: 'badge-pending', confirmed: 'badge-confirmed', cancelled: 'badge-cancelled', completed: 'badge-completed' };
const STATUSES = ['pending', 'confirmed', 'completed', 'cancelled'];

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const fetchBookings = () => {
    api.get('/bookings')
      .then(res => setBookings(res.data.bookings || []))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchBookings(); }, []);

  const handleStatus = async (id, status) => {
    try {
      await api.put(`/bookings/${id}`, { status });
      fetchBookings();
    } catch (err) { alert(err.response?.data?.error || 'Failed'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this booking permanently?')) return;
    try {
      await api.delete(`/bookings/${id}`);
      fetchBookings();
    } catch (err) { alert('Failed to delete'); }
  };

  const filtered = filter === 'all' ? bookings : bookings.filter(b => b.status === filter);

  return (
    <div>
      <div className="admin-page-header d-flex justify-content-between align-items-center">
        <div>
          <h1 className="admin-page-title">Bookings</h1>
          <p className="admin-page-subtitle">Manage all appointments</p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="d-flex gap-2 mb-4 flex-wrap">
        {['all', ...STATUSES].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`btn btn-sm ${filter === s ? 'btn-primary' : 'btn-outline-secondary'}`}
            style={filter === s ? { backgroundColor: '#AB1509', borderColor: '#AB1509' } : {}}>
            {s.charAt(0).toUpperCase() + s.slice(1)}
            {s !== 'all' && <span className="ms-1 badge bg-light text-dark">
              {bookings.filter(b => b.status === s).length}
            </span>}
          </button>
        ))}
      </div>

      <div className="admin-card">
        {loading ? <div className="text-center py-4"><div className="spinner-border text-primary" /></div> : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr><th>#</th><th>Patient</th><th>Contact</th><th>Service</th><th>Doctor</th><th>Date & Time</th><th>Price</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan="9" className="text-center text-muted py-4">No bookings found</td></tr>
                ) : filtered.map(b => (
                  <tr key={b.id}>
                    <td className="text-muted">#{b.id}</td>
                    <td className="fw-semibold">{b.customer_name}</td>
                    <td>
                      <small className="d-block">{b.customer_email}</small>
                      <small className="text-muted">{b.customer_phone}</small>
                    </td>
                    <td>{b.service_name}</td>
                    <td>{b.doctor_name || <span className="text-muted">—</span>}</td>
                    <td>
                      <small className="d-block fw-semibold">{new Date(b.booking_date).toLocaleDateString('en-GB')}</small>
                      <small className="text-muted">{b.start_time?.slice(0,5)} – {b.end_time?.slice(0,5)}</small>
                    </td>
                    <td className="fw-semibold" style={{ color: '#AB1509' }}>${b.total_price}</td>
                    <td><span className={`status-badge ${statusClass[b.status]}`}>{b.status}</span></td>
                    <td>
                      <div className="d-flex gap-1 flex-wrap">
                        {b.status === 'pending' && (
                          <button className="btn btn-sm btn-success" onClick={() => handleStatus(b.id, 'confirmed')}>✓ Confirm</button>
                        )}
                        {b.status === 'confirmed' && (
                          <button className="btn btn-sm btn-secondary" onClick={() => handleStatus(b.id, 'completed')}>Complete</button>
                        )}
                        {!['cancelled', 'completed'].includes(b.status) && (
                          <button className="btn btn-sm btn-warning" onClick={() => handleStatus(b.id, 'cancelled')}>Cancel</button>
                        )}
                        <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(b.id)}>🗑</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
