import { Link } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext';

function Footer() {
  const { settings } = useSettings();

  return (
    <footer className="footer-medical">
      <div className="container">
        <div className="row gy-4">
          <div className="col-md-4">
            <h5 className="fw-bold mb-3">
              <i className="fa-solid fa-hospital-user me-2"></i>{settings.site_name}
            </h5>
            <p style={{ opacity: 0.8 }}>{settings.site_tagline}</p>
            <div className="d-flex gap-3 mt-3">
              {[
                { icon: 'fa-facebook', href: '#' },
                { icon: 'fa-instagram', href: '#' },
                { icon: 'fa-twitter', href: '#' },
                { icon: 'fa-linkedin', href: '#' },
              ].map(s => (
                <a key={s.icon} href={s.href} style={{ color: 'rgba(255,247,211,0.7)', fontSize: '1.1rem', transition: 'color 0.2s' }}
                  onMouseEnter={e => e.target.style.color = '#fff7d3'}
                  onMouseLeave={e => e.target.style.color = 'rgba(255,247,211,0.7)'}>
                  <i className={`fa-brands ${s.icon}`}></i>
                </a>
              ))}
            </div>
          </div>

          <div className="col-md-4">
            <h6 className="fw-bold mb-3">Quick Links</h6>
            <ul className="list-unstyled" style={{ opacity: 0.8 }}>
              {[
                { to: '/', label: 'Home' },
                { to: '/about', label: 'About Us' },
                { to: '/services', label: 'Services' },
                { to: '/doctors', label: 'Doctors' },
                { to: '/booking', label: 'Book Appointment' },
              ].map(l => (
                <li key={l.to} className="mb-1">
                  <Link to={l.to} style={{ color: 'rgba(255,247,211,0.8)', textDecoration: 'none' }}>
                    <i className="fa-solid fa-chevron-right me-2" style={{ fontSize: '0.7rem' }}></i>{l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="col-md-4">
            <h6 className="fw-bold mb-3">Contact</h6>
            <div style={{ opacity: 0.8 }}>
              <div className="mb-2"><i className="fa-solid fa-envelope me-2"></i>{settings.contact_email}</div>
              <div className="mb-2"><i className="fa-solid fa-phone me-2"></i>{settings.contact_phone}</div>
              <div className="mb-2"><i className="fa-solid fa-location-dot me-2"></i>{settings.contact_address}</div>
              <div><i className="fa-solid fa-clock me-2"></i>{settings.working_hours}</div>
            </div>
          </div>
        </div>

        <hr className="my-4" style={{ borderColor: 'rgba(255,247,211,0.15)' }} />

        <div className="text-center" style={{ opacity: 0.6, fontSize: '0.85rem' }}>
          © {new Date().getFullYear()} {settings.site_name}. All rights reserved.
          <span className="mx-2">·</span>
          Built with <i className="fa-solid fa-heart" style={{ color: '#ff6b6b' }}></i> using React + Node.js + MySQL
        </div>
      </div>
    </footer>
  );
}

export default Footer;
