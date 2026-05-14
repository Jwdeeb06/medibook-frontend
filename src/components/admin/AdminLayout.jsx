import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const adminNav = [
  { to: '/admin', label: 'Dashboard', icon: '📊', exact: true },
  { to: '/admin/bookings', label: 'Bookings', icon: '📅' },
  { to: '/admin/patients', label: 'Patients', icon: '👥' },
  { to: '/admin/doctors', label: 'Doctors', icon: '🩺' },
  { to: '/admin/services', label: 'Services', icon: '🔬' },
  { to: '/admin/settings', label: 'Settings', icon: '⚙️' },
];

const doctorNav = [
  { to: '/admin', label: 'Dashboard', icon: '📊', exact: true },
  { to: '/admin/my-appointments', label: 'My Appointments', icon: '📅' },
  { to: '/admin/my-profile', label: 'My Profile', icon: '👤' },
  { to: '/admin/my-schedule', label: 'My Schedule', icon: '🗓️' },
  { to: '/admin/my-services', label: 'My Services', icon: '🔬' },
];

function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const navItems = user?.role === 'admin' ? adminNav : doctorNav;

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className={`admin-sidebar ${collapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          {!collapsed && (
            <div>
              <div className="sidebar-logo">⚕ MediBook</div>
              <div className="sidebar-role">{user?.role === 'admin' ? 'Administrator' : 'Doctor Panel'}</div>
            </div>
          )}
          <button className="collapse-btn" onClick={() => setCollapsed(!collapsed)}>
            {collapsed ? '→' : '←'}
          </button>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.exact}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <span className="sidebar-icon">{item.icon}</span>
              {!collapsed && <span className="sidebar-label">{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className={`sidebar-user ${collapsed ? 'justify-content-center' : ''}`}>
            <div className="sidebar-avatar">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            {!collapsed && (
              <div className="sidebar-user-info">
                <div className="sidebar-user-name">{user?.name}</div>
                <div className="sidebar-user-email">{user?.email}</div>
              </div>
            )}
          </div>
          <button className="sidebar-logout" onClick={handleLogout} title="Logout">
            🚪 {!collapsed && 'Logout'}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="admin-content">
        <Outlet />
      </div>
    </div>
  );
}

export default AdminLayout;
