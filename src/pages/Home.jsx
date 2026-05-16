import { Link } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext';

function Home() {
  const { settings } = useSettings();

  return (
    <>
      {/* Hero */}
      <section className="hero-medical" style={{
        backgroundImage: 'url(https://images.unsplash.com/photo-1551190822-a9333d879b1f?w=1600&q=80)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        position: 'relative'
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(135deg, rgba(171,21,9,0.90) 0%, rgba(122,14,6,0.85) 100%)'
        }}/>
        <div className="container text-center" style={{ position: 'relative', zIndex: 1, padding: '5rem 1rem' }}>
          <p className="mb-2 text-uppercase fw-semibold" style={{ color: 'rgba(255,247,211,0.8)', letterSpacing: 3, fontSize: '0.85rem' }}>
            Welcome to
          </p>
          <h1 className="display-3 fw-bold mb-3" style={{ color: '#fff7d3' }}>{settings.site_name}</h1>
          <p className="lead mb-4" style={{ color: 'rgba(255,247,211,0.9)', fontSize: '1.2rem', maxWidth: 600, margin: '0 auto 2rem' }}>
            {settings.site_tagline}
          </p>
          <div className="d-flex gap-3 justify-content-center flex-wrap">
            <Link to="/booking" className="btn hero-btn btn-lg px-4">
              <i className="fa-solid fa-calendar-plus me-2"></i>Book Appointment
            </Link>
            <Link to="/doctors" className="btn btn-lg px-4" style={{ border: '2px solid rgba(255,247,211,0.6)', color: '#fff7d3', background: 'transparent' }}>
              <i className="fa-solid fa-user-doctor me-2"></i>Meet Our Doctors
            </Link>
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <section style={{ background: 'var(--brand-red)', color: '#fff7d3', padding: '1.5rem 0' }}>
        <div className="container">
          <div className="row text-center g-3">
            {[
              { value: '10+', label: 'Specialist Doctors', icon: 'fa-user-doctor' },
              { value: '5000+', label: 'Patients Served', icon: 'fa-users' },
              { value: '15+', label: 'Years Experience', icon: 'fa-award' },
              { value: '24/7', label: 'Emergency Care', icon: 'fa-truck-medical' },
            ].map(s => (
              <div className="col-6 col-md-3" key={s.label}>
                <i className={`fa-solid ${s.icon} fa-lg mb-1`} style={{ opacity: 0.8 }}></i>
                <div className="fw-bold fs-4">{s.value}</div>
                <small style={{ opacity: 0.8 }}>{s.label}</small>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container py-5 my-3">
        <div className="text-center mb-5">
          <h2 className="section-title">Why Choose Us</h2>
          <p className="text-muted mt-3">Quality healthcare with the convenience of online booking</p>
        </div>
        <div className="row g-4">
          {[
            { icon: 'fa-stethoscope', title: 'Expert Doctors', text: 'Board-certified specialists across multiple medical disciplines with years of experience.' },
            { icon: 'fa-calendar-check', title: 'Easy Booking', text: 'Schedule appointments online in seconds. No phone calls, no waiting in queues.' },
            { icon: 'fa-heart-pulse', title: 'Patient-First Care', text: 'Compassionate care tailored to your individual health needs and comfort.' },
            { icon: 'fa-shield-halved', title: 'Secure & Private', text: 'Your medical data is fully encrypted and protected with industry standards.' },
            { icon: 'fa-clock', title: 'Flexible Hours', text: 'We offer morning and evening slots so you can book around your schedule.' },
            { icon: 'fa-mobile-screen', title: 'Mobile Friendly', text: 'Book, manage and track your appointments from any device, anywhere.' },
          ].map(f => (
            <div className="col-md-4" key={f.title}>
              <div className="card card-medical h-100 p-4 text-center">
                <i className={`fa-solid ${f.icon} fa-2x mb-3`} style={{ color: 'var(--brand-red)' }}></i>
                <h5 className="fw-bold mt-1">{f.title}</h5>
                <p className="text-muted mb-0">{f.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: 'var(--brand-cream-dark)', padding: '4rem 0' }}>
        <div className="container text-center">
          <h3 className="fw-bold mb-3">Ready to schedule your visit?</h3>
          <p className="text-muted mb-4">Browse our doctors and book the time that works best for you.</p>
          <div className="d-flex gap-3 justify-content-center flex-wrap">
            <Link to="/doctors" className="btn btn-outline-primary px-4">
              <i className="fa-solid fa-user-doctor me-2"></i>Meet Our Doctors
            </Link>
            <Link to="/booking" className="btn btn-primary px-4">
              <i className="fa-solid fa-calendar-plus me-2"></i>Book Now
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

export default Home;
