import { useSettings } from '../context/SettingsContext';

function Footer() {
  const { settings } = useSettings();

  return (
    <footer className="footer-medical">
      <div className="container">
        <div className="row gy-4">
          <div className="col-md-4">
            <h5 className="fw-bold mb-3">⚕ {settings.site_name}</h5>
            <p className="mb-0" style={{ opacity: 0.85 }}>
              {settings.site_tagline}
            </p>
          </div>

          <div className="col-md-4">
            <h6 className="fw-bold mb-3">Contact</h6>
            <div style={{ opacity: 0.85 }}>
              <div>📧 {settings.contact_email}</div>
              <div>📞 {settings.contact_phone}</div>
              <div>📍 {settings.contact_address}</div>
            </div>
          </div>

          <div className="col-md-4">
            <h6 className="fw-bold mb-3">Hours</h6>
            <p style={{ opacity: 0.85, whiteSpace: 'pre-line' }}>
              {settings.working_hours}
            </p>
          </div>
        </div>

        <hr className="my-4" style={{ borderColor: 'rgba(255,247,211,0.2)' }} />

        <div className="text-center" style={{ opacity: 0.7, fontSize: '0.9rem' }}>
          © {new Date().getFullYear()} {settings.site_name}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

export default Footer;
