import { Link } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext';

function Home() {
  const { settings } = useSettings();

  return (
    <>
      {/* Hero */}
      <section className="hero-medical text-center">
        <div className="container">
          <h1 className="display-4 mb-3">{settings.site_name}</h1>
          <p className="lead mb-4" style={{ opacity: 0.95, fontSize: '1.25rem' }}>
            {settings.site_tagline}
          </p>
          <Link to="/booking" className="btn hero-btn btn-lg">
            Book Your Appointment
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="container py-5 my-3">
        <div className="text-center mb-5">
          <h2 className="section-title">Why Choose Us</h2>
          <p className="text-muted mt-3">
            Quality healthcare with the convenience of online booking
          </p>
        </div>

        <div className="row g-4">
          <div className="col-md-4">
            <div className="card card-medical h-100 p-4 text-center">
              <div className="display-3 mb-2" style={{ color: 'var(--brand-red)' }}>🩺</div>
              <h5 className="fw-bold mt-2">Expert Doctors</h5>
              <p className="text-muted mb-0">
                Board-certified specialists across multiple medical disciplines.
              </p>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card card-medical h-100 p-4 text-center">
              <div className="display-3 mb-2" style={{ color: 'var(--brand-red)' }}>📅</div>
              <h5 className="fw-bold mt-2">Easy Booking</h5>
              <p className="text-muted mb-0">
                Schedule appointments online in seconds. No phone calls needed.
              </p>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card card-medical h-100 p-4 text-center">
              <div className="display-3 mb-2" style={{ color: 'var(--brand-red)' }}>💙</div>
              <h5 className="fw-bold mt-2">Patient-First Care</h5>
              <p className="text-muted mb-0">
                Compassionate care tailored to your individual health needs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA strip */}
      <section className="py-5" style={{ backgroundColor: 'var(--brand-cream-dark)' }}>
        <div className="container text-center">
          <h3 className="fw-bold mb-3">Ready to schedule your visit?</h3>
          <p className="text-muted mb-4">
            Browse our doctors and book the time that works best for you.
          </p>
          <div className="d-flex gap-2 justify-content-center flex-wrap">
            <Link to="/doctors" className="btn btn-outline-primary px-4">
              Meet Our Doctors
            </Link>
            <Link to="/booking" className="btn btn-primary px-4">
              Book Now
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

export default Home;
