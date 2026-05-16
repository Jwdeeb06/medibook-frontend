import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const statusClass = {
  pending: 'badge-pending',
  confirmed: 'badge-confirmed',
  cancelled: 'badge-cancelled',
  completed: 'badge-completed',
};

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
          total_services: '—',
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

  const handleStatus = async (id, status) => {
    try {
      await api.put(`/bookings/${id}`, { status });
      // Refresh stats
      const res = await api.get('/admins/stats');
      setStats(res.data);
    } catch (err) { alert('Failed'); }
  };

  if (loading) return (
    <div className="text-center py-5">
      <div className="spinner-border" style={{ color: '#AB1509' }} />
    </div>
  );

  if (!stats) return (
    <div className="alert alert-danger">Could not load dashboard</div>
  );

  const cards = user?.role === 'admin' ? [
    { label: 'Total Bookings', value: stats.total_bookings, icon: 'fa-calendar-check', color: '#AB1509', bg: '#fff0ef' },
    { label: 'Pending', value: stats.pending_bookings, icon: 'fa-hourglass-half', color: '#d97706', bg: '#fffbeb' },
    { label: 'Confirmed', value: stats.confirmed_bookings, icon: 'fa-circle-check', color: '#059669', bg: '#f0fdf4' },
    { label: 'Completed', value: stats.completed_bookings, icon: 'fa-flag-checkered', color: '#6366f1', bg: '#f5f3ff' },
    { label: 'Doctors', value: stats.total_doctors, icon: 'fa-user-doctor', color: '#0284c7', bg: '#eff6ff' },
    { label: 'Patients', value: stats.total_patients, icon: 'fa-users', color: '#7c3aed', bg: '#faf5ff' },
  ] : [
    { label: 'My Bookings', value: stats.total_bookings, icon: 'fa-calendar-check', color: '#AB1509', bg: '#fff0ef' },
    { label: 'Pending', value: stats.pending_bookings, icon: 'fa-hourglass-half', color: '#d97706', bg: '#fffbeb' },
    { label: 'Confirmed', value: stats.confirmed_bookings, icon: 'fa-circle-check', color: '#059669', bg: '#f0fdf4' },
    { label: 'Completed', value: stats.completed_bookings, icon: 'fa-flag-checkered', color: '#6366f1', bg: '#f5f3ff' },
  ];

  const today = new Date().toLocaleDateString('en-GB', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  return (
    <div>
      {/* Header */}
      <div className="admin-page-header d-flex justify-content-between align-items-start flex-wrap gap-3 mb-4">
        <div>
          <h1 className="admin-page-title">Dashboard</h1>
          <p className="admin-page-subtitle">
            Welcome back, <strong>{user?.name}</strong> · {today}
          </p>
        </div>
        {user?.role === 'admin' && (
          <Link to="/admin/analytics" className="btn btn-sm px-3 py-2 fw-semibold"
            style={{ background: '#AB1509', color: '#fff7d3', borderRadius: 10, border: 'none' }}>
            <i className="fa-solid fa-chart-line me-2"></i>View Analytics
          </Link>
        )}
      </div>

      {/* Stat cards */}
      <div className="row g-3 mb-4">
        {cards.map(card => (
          <div className={`col-6 col-md-4 col-lg-${user?.role === 'admin' ? '2' : '3'}`} key={card.label}>
            <div style={{
              background: 'white', borderRadius: 16, padding: '1.25rem',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              borderTop: `4px solid ${card.color}`,
              transition: 'transform 0.2s',
            }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <div style={{ fontSize: '2rem', fontWeight: 800, color: card.color, lineHeight: 1 }}>
                    {card.value}
                  </div>
                  <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 4 }}>
                    {card.label}
                  </div>
                </div>
                <div style={{ width: 42, height: 42, borderRadius: 12, background: card.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <i className={`fa-solid ${card.icon}`} style={{ color: card.color }}></i>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick actions - admin only */}
      {user?.role === 'admin' && (
        <div className="row g-3 mb-4">
          {[
            { to: '/admin/bookings', icon: 'fa-calendar-check', label: 'Manage Bookings', color: '#AB1509' },
            { to: '/admin/doctors', icon: 'fa-user-doctor', label: 'Manage Doctors', color: '#0284c7' },
            { to: '/admin/services', icon: 'fa-stethoscope', label: 'Manage Services', color: '#059669' },
            { to: '/admin/patients', icon: 'fa-users', label: 'View Patients', color: '#7c3aed' },
          ].map(action => (
            <div className="col-6 col-lg-3" key={action.to}>
              <Link to={action.to} className="d-flex align-items-center gap-3 p-3 rounded-3 text-decoration-none"
                style={{ background: 'white', border: '1px solid #f3f4f6', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', transition: 'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = action.color; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#f3f4f6'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: `${action.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <i className={`fa-solid ${action.icon}`} style={{ color: action.color }}></i>
                </div>
                <span className="fw-semibold" style={{ color: '#2a1a18', fontSize: '0.9rem' }}>{action.label}</span>
                <i className="fa-solid fa-chevron-right ms-auto" style={{ color: '#d1d5db', fontSize: '0.75rem' }}></i>
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* Recent bookings */}
      <div style={{ background: 'white', borderRadius: 16, padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h6 className="fw-bold mb-0">
            <i className="fa-solid fa-clock-rotate-left me-2" style={{ color: '#AB1509' }}></i>
            Recent Bookings
          </h6>
          <Link to="/admin/bookings" className="btn btn-sm btn-outline-secondary" style={{ borderRadius: 8, fontSize: '0.8rem' }}>
            View All <i className="fa-solid fa-arrow-right ms-1"></i>
          </Link>
        </div>

        {stats.recent_bookings.length === 0 ? (
          <div className="text-center py-4">
            <i className="fa-solid fa-calendar-xmark fa-2x mb-3" style={{ color: '#d1d5db' }}></i>
            <p className="text-muted mb-0">No bookings yet</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0" style={{ fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #f3f4f6' }}>
                  <th className="text-muted fw-semibold border-0" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: 0.5 }}>#</th>
                  <th className="text-muted fw-semibold border-0" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: 0.5 }}>Patient</th>
                  <th className="text-muted fw-semibold border-0" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: 0.5 }}>Service</th>
                  <th className="text-muted fw-semibold border-0" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: 0.5 }}>Doctor</th>
                  <th className="text-muted fw-semibold border-0" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: 0.5 }}>Date</th>
                  <th className="text-muted fw-semibold border-0" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: 0.5 }}>Time</th>
                  <th className="text-muted fw-semibold border-0" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: 0.5 }}>Status</th>
                  {user?.role === 'admin' && <th className="text-muted fw-semibold border-0" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: 0.5 }}>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {stats.recent_bookings.map(b => (
                  <tr key={b.id} style={{ borderBottom: '1px solid #f9fafb' }}>
                    <td className="text-muted">#{b.id}</td>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <div style={{ width: 30, height: 30, borderRadius: '50%', background: '#AB150918', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, color: '#AB1509', flexShrink: 0 }}>
                          {b.customer_name?.charAt(0).toUpperCase()}
                        </div>
                        <span className="fw-semibold">{b.customer_name}</span>
                      </div>
                    </td>
                    <td className="text-muted">{b.service_name}</td>
                    <td className="text-muted">{b.doctor_name || '—'}</td>
                    <td className="text-muted">{new Date(b.booking_date).toLocaleDateString('en-GB')}</td>
                    <td className="text-muted">{b.start_time?.slice(0, 5)}</td>
                    <td>
                      <span className={`status-badge ${statusClass[b.status]}`}>{b.status}</span>
                    </td>
                    {user?.role === 'admin' && (
                      <td>
                        <div className="d-flex gap-1">
                          {b.status === 'pending' && (
                            <button className="btn btn-sm btn-success py-0 px-2" style={{ fontSize: '0.75rem', borderRadius: 6 }}
                              onClick={() => handleStatus(b.id, 'confirmed')}>
                              <i className="fa-solid fa-check"></i>
                            </button>
                          )}
                          {b.status === 'confirmed' && (
                            <button className="btn btn-sm btn-secondary py-0 px-2" style={{ fontSize: '0.75rem', borderRadius: 6 }}
                              onClick={() => handleStatus(b.id, 'completed')}>
                              Done
                            </button>
                          )}
                          {!['cancelled', 'completed'].includes(b.status) && (
                            <button className="btn btn-sm btn-warning py-0 px-2" style={{ fontSize: '0.75rem', borderRadius: 6 }}
                              onClick={() => handleStatus(b.id, 'cancelled')}>
                              <i className="fa-solid fa-xmark"></i>
                            </button>
                          )}
                        </div>
                      </td>
                    )}
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