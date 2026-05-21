import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './NotificationBell';

function Navbar() {
  const { settings } = useSettings();
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const linkClass = ({ isActive }) => 'nav-link' + (isActive ? ' active' : '');
  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <nav className="navbar navbar-expand-lg navbar-medical sticky-top">
      <div className="container">
        <Link className="navbar-brand fs-5 fw-bold" to="/">
          <i className="fa-solid fa-hospital-user me-2" style={{ color: 'var(--brand-red)' }}></i>
          {settings.site_name}
        </Link>

        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navMenu">
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navMenu">
          <ul className="navbar-nav ms-auto align-items-lg-center">
            <li className="nav-item"><NavLink to="/" className={linkClass} end>Home</NavLink></li>
            <li className="nav-item"><NavLink to="/about" className={linkClass}>About</NavLink></li>
            <li className="nav-item"><NavLink to="/services" className={linkClass}>Services</NavLink></li>
            <li className="nav-item"><NavLink to="/doctors" className={linkClass}>Doctors</NavLink></li>
            <li className="nav-item"><NavLink to="/contact" className={linkClass}>Contact</NavLink></li>

            {isAuthenticated ? (
              <>
                {['admin', 'doctor'].includes(user?.role) && (
                  <li className="nav-item">
                    <NavLink to="/admin" className={linkClass}>
                      <i className="fa-solid fa-gauge me-1"></i>Dashboard
                    </NavLink>
                  </li>
                )}
                {user?.role === 'patient' && (
                  <li className="nav-item">
                    <NavLink to="/my-bookings" className={linkClass}>
                      <i className="fa-solid fa-calendar-check me-1"></i>My Bookings
                    </NavLink>
                  </li>
                )}
                <li className="nav-item ms-lg-1">
                  <NotificationBell />
                </li>

                {/* User dropdown */}
                <li className="nav-item dropdown ms-lg-1">
                  <button className="btn btn-sm d-flex align-items-center gap-2 px-2 py-1"
                    style={{ background: 'var(--brand-cream)', border: '1px solid var(--brand-cream-dark)', borderRadius: 20 }}
                    data-bs-toggle="dropdown">
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--brand-red)', color: '#fff7d3', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700 }}>
                      {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <span className="fw-semibold d-none d-lg-block" style={{ fontSize: '0.85rem', color: 'var(--brand-red)', maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {user?.name?.split(' ')[0]}
                    </span>
                    <i className="fa-solid fa-chevron-down" style={{ fontSize: '0.65rem', color: 'var(--brand-red)' }}></i>
                  </button>
                  <ul className="dropdown-menu dropdown-menu-end shadow border-0" style={{ borderRadius: 12, padding: '0.5rem' }}>
                    {user?.role === 'patient' && (
                      <li>
                        <Link to="/profile" className="dropdown-item rounded-2">
                          <i className="fa-solid fa-user me-2 text-muted"></i>My Profile
                        </Link>
                      </li>
                    )}
                    {user?.role === 'patient' && (
                      <li>
                        <Link to="/my-bookings" className="dropdown-item rounded-2">
                          <i className="fa-solid fa-calendar-check me-2 text-muted"></i>My Bookings
                        </Link>
                      </li>
                    )}
                    <li><hr className="dropdown-divider my-1" /></li>
                    <li>
                      <button onClick={handleLogout} className="dropdown-item rounded-2 text-danger">
                        <i className="fa-solid fa-right-from-bracket me-2"></i>Logout
                      </button>
                    </li>
                  </ul>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item ms-lg-2 mt-2 mt-lg-0">
                  <Link to="/login" className="btn btn-outline-primary btn-sm px-3 me-2">
                    <i className="fa-solid fa-right-to-bracket me-1"></i>Login
                  </Link>
                </li>
                <li className="nav-item mt-1 mt-lg-0">
                  <Link to="/booking" className="btn btn-primary btn-sm px-3">
                    <i className="fa-solid fa-calendar-plus me-1"></i>Book Now
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
