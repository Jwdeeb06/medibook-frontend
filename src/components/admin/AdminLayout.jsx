import { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const adminNav = [
  { to: '/admin', label: 'Dashboard', icon: 'fa-gauge', exact: true },
  { to: '/admin/bookings', label: 'Bookings', icon: 'fa-calendar-check' },
  { to: '/admin/patients', label: 'Patients', icon: 'fa-users' },
  { to: '/admin/doctors', label: 'Doctors', icon: 'fa-user-doctor' },
  { to: '/admin/services', label: 'Services', icon: 'fa-stethoscope' },
  { to: '/admin/messages', label: 'Messages', icon: 'fa-envelope', badge: 'messages' },
  { to: '/admin/send-notification', label: 'Send Message', icon: 'fa-paper-plane' },
  { to: '/admin/analytics', label: 'Analytics', icon: 'fa-chart-line' },
  { to: '/admin/settings', label: 'Settings', icon: 'fa-gear' },
  { to: '/admin/export', label: 'Export', icon: 'fa-file-excel' },
];

const doctorNav = [
  { to: '/admin', label: 'Dashboard', icon: 'fa-gauge', exact: true },
  { to: '/admin/my-appointments', label: 'My Appointments', icon: 'fa-calendar-check', badge: 'pending' },
  { to: '/admin/send-notification', label: 'Send Message', icon: 'fa-paper-plane' },
  { to: '/admin/my-profile', label: 'My Profile', icon: 'fa-user' },
  { to: '/admin/my-schedule', label: 'My Schedule', icon: 'fa-calendar-days' },
  { to: '/admin/my-services', label: 'My Services', icon: 'fa-stethoscope' },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);

  const navItems = user?.role === 'admin' ? adminNav : doctorNav;
  const handleLogout = () => { logout(); navigate('/'); };

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        if (user?.role === 'doctor') {
          const res = await api.get('/bookings/doctor?status=pending');
          setPendingCount(res.data.count || 0);
        }
        if (user?.role === 'admin') {
          const res = await api.get('/contact');
          setUnreadMessages(res.data.unread || 0);
        }
      } catch {}
    };
    fetchCounts();
    const interval = setInterval(fetchCounts, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const getBadgeCount = (item) => {
    if (item.badge === 'pending' && user?.role === 'doctor') return pendingCount;
    if (item.badge === 'messages' && user?.role === 'admin') return unreadMessages;
    return 0;
  };

  return (
    <div className="admin-layout">
      <aside className={`admin-sidebar ${collapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          {!collapsed && (
            <div>
              <div className="sidebar-logo">
                <i className="fa-solid fa-hospital-user me-2"></i>MediBook
              </div>
              <div className="sidebar-role">
                {user?.role === 'admin' ? 'Administrator' : 'Doctor Panel'}
              </div>
            </div>
          )}
          <button className="collapse-btn" onClick={() => setCollapsed(!collapsed)}>
            <i className={`fa-solid fa-chevron-${collapsed ? 'right' : 'left'}`}></i>
          </button>
        </div>

        <nav className="sidebar-nav">
          {navItems.map(item => {
            const badge = getBadgeCount(item);
            return (
              <NavLink key={item.to} to={item.to} end={item.exact}
                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                title={collapsed ? item.label : ''}>

                {/* Icon with badge dot */}
                <span style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                  <i className={`fa-solid ${item.icon} sidebar-icon`}></i>
                  {badge > 0 && collapsed && (
                    <span style={{
                      position: 'absolute', top: -5, right: -7,
                      background: '#fff7d3', color: '#AB1509',
                      borderRadius: '50%', width: 15, height: 15,
                      fontSize: '0.58rem', fontWeight: 800,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      border: '1.5px solid rgba(255,247,211,0.5)',
                    }}>{badge > 9 ? '9+' : badge}</span>
                  )}
                </span>

                {!collapsed && (
                  <span className="sidebar-label d-flex align-items-center w-100">
                    <span className="flex-grow-1">{item.label}</span>
                    {badge > 0 && (
                      <span style={{
                        background: '#fff7d3', color: '#AB1509',
                        borderRadius: 10, padding: '1px 7px',
                        fontSize: '0.68rem', fontWeight: 800,
                        marginLeft: 8, flexShrink: 0,
                      }}>{badge}</span>
                    )}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div className={`sidebar-user ${collapsed ? 'justify-content-center' : ''}`}>
            <div className="sidebar-avatar">{user?.name?.charAt(0).toUpperCase()}</div>
            {!collapsed && (
              <div className="sidebar-user-info">
                <div className="sidebar-user-name">{user?.name}</div>
                <div className="sidebar-user-email">{user?.email}</div>
              </div>
            )}
          </div>
          <button className="sidebar-logout" onClick={handleLogout} title="Logout">
            <i className="fa-solid fa-right-from-bracket me-2"></i>
            {!collapsed && 'Logout'}
          </button>
        </div>
      </aside>

      <div className="admin-content">
        <Outlet />
      </div>
    </div>
  );
}
