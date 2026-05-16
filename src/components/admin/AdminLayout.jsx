import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const adminNav = [
  { to: '/admin', label: 'Dashboard', icon: 'fa-gauge', exact: true },
  { to: '/admin/bookings', label: 'Bookings', icon: 'fa-calendar-check' },
  { to: '/admin/patients', label: 'Patients', icon: 'fa-users' },
  { to: '/admin/doctors', label: 'Doctors', icon: 'fa-user-doctor' },
  { to: '/admin/services', label: 'Services', icon: 'fa-stethoscope' },
  { to: '/admin/settings', label: 'Settings', icon: 'fa-gear' },
  { to: '/admin/analytics', label: 'Analytics', icon: 'fa-chart-line' },
];

const doctorNav = [
  { to: '/admin', label: 'Dashboard', icon: 'fa-gauge', exact: true },
  { to: '/admin/my-appointments', label: 'My Appointments', icon: 'fa-calendar-check' },
  { to: '/admin/my-profile', label: 'My Profile', icon: 'fa-user' },
  { to: '/admin/my-schedule', label: 'My Schedule', icon: 'fa-calendar-days' },
  { to: '/admin/my-services', label: 'My Services', icon: 'fa-stethoscope' },
];

function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const navItems = user?.role === 'admin' ? adminNav : doctorNav;
  const handleLogout = () => { logout(); navigate('/'); };

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
          {navItems.map(item => (
            <NavLink key={item.to} to={item.to} end={item.exact}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              title={collapsed ? item.label : ''}>
              <i className={`fa-solid ${item.icon} sidebar-icon`}></i>
              {!collapsed && <span className="sidebar-label">{item.label}</span>}
            </NavLink>
          ))}
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

export default AdminLayout;
