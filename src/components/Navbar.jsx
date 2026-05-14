import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const { settings } = useSettings();
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const linkClass = ({ isActive }) => 'nav-link' + (isActive ? ' active' : '');

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-medical sticky-top">
      <div className="container">
        <Link className="navbar-brand fs-4" to="/">
          <span style={{ fontSize: '1.4rem' }}>⚕</span> {settings.site_name}
        </Link>

        <button className="navbar-toggler" type="button"
          data-bs-toggle="collapse" data-bs-target="#navMenu">
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
                {user?.role === 'admin' && (
                  <li className="nav-item">
                    <NavLink to="/admin" className={linkClass}>Admin</NavLink>
                  </li>
                )}
                <li className="nav-item">
                  <NavLink to="/my-bookings" className={linkClass}>My Bookings</NavLink>
                </li>
                <li className="nav-item ms-lg-2 mt-2 mt-lg-0">
                  <button onClick={handleLogout} className="btn btn-outline-danger btn-sm px-3">
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item ms-lg-2 mt-2 mt-lg-0">
                  <Link to="/login" className="btn btn-outline-primary btn-sm px-3 me-2">Login</Link>
                </li>
                <li className="nav-item mt-1 mt-lg-0">
                  <Link to="/booking" className="btn btn-primary btn-sm px-3">Book Now</Link>
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
