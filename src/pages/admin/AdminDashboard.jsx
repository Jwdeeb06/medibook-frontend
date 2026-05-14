import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const statusClass = { pending: 'badge-pending', confirmed: 'badge-confirmed', cancelled: 'badge-cancelled', completed: 'badge-completed' };

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

useEffect(() => {
  if (user?.role === 'doctor') {
    api.get('/bookings/doctor')
      .then(res => setStats({
        total_bookings: res.data.count,
        pending_bookings: res.data.bookings.filter(b => b.status === 'pending').length,
        confirmed_bookings: res.data.bookings.filter(b => b.status === 'confirmed').length,
        completed_bookings: res.data.bookings.filter(b => b.status === 'completed').length,
        total_doctors: '—',
        total_patients: '—',
        recent_bookings: res.data.bookings.slice(0, 8).map(b => ({
          ...b, customer_name: b.patient_name, doctor_name: 'You'
        })),
      }))
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  } else {
    api.get('/admins/stats')
      .then(res => setStats(res.data))
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  }
}, [user]);

  if (loading) return <div className="text-center py-5"><div className="spinner-border text-primary" /></div>;
  if (!stats) return <div className="alert alert-danger">Could not load dashboard</div>;

  const cards = [
    { label: 'Total Bookings', value: stats.total_bookings, icon: '📅', color: '#AB1509' },
    { label: 'Pending', value: stats.pending_bookings, icon: '⏳', color: '#d97706' },
    { label: 'Confirmed', value: stats.confirmed_bookings, icon: '✅', color: '#059669' },
    { label: 'Completed', value: stats.completed_bookings, icon: '🏁', color: '#6366f1' },
    { label: 'Doctors', value: stats.total_doctors, icon: '🩺', color: '#0284c7' },
    { label: 'Patients', value: stats.total_patients, icon: '👥', color: '#7c3aed' },
  ];

  return (
    <div>
      <div className="admin-page-header">
        <h1 className="admin-page-title">Dashboard</h1>
        <p className="admin-page-subtitle">Welcome back, {user?.name} · {new Date().toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>

      <div className="row g-3 mb-4">
        {cards.map(card => (
          <div className="col-6 col-md-4 col-lg-2" key={card.label}>
            <div className="stat-card">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <div className="stat-card-value" style={{ color: card.color }}>{card.value}</div>
                  <div className="stat-card-label">{card.label}</div>
                </div>
                <div className="stat-card-icon">{card.icon}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="admin-card">
        <div className="admin-card-title">Recent Bookings</div>
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr><th>#</th><th>Patient</th><th>Service</th><th>Doctor</th><th>Date</th><th>Time</th><th>Status</th></tr>
            </thead>
            <tbody>
              {stats.recent_bookings.map(b => (
                <tr key={b.id}>
                  <td className="text-muted">#{b.id}</td>
                  <td className="fw-semibold">{b.customer_name}</td>
                  <td>{b.service_name}</td>
                  <td>{b.doctor_name || '—'}</td>
                  <td>{new Date(b.booking_date).toLocaleDateString('en-GB')}</td>
                  <td>{b.start_time?.slice(0,5)}</td>
                  <td><span className={`status-badge ${statusClass[b.status]}`}>{b.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
