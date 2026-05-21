import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useSettings } from '../context/SettingsContext';
import api from '../services/api';

const DOCTOR_PHOTOS = [
  'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=300&q=80',
  'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=300&q=80',
  'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300&q=80',
  'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=300&q=80',
];

function About() {
  const { settings } = useSettings();
  const [doctors, setDoctors] = useState([]);

  useEffect(() => {
    api.get('/doctors').then(res => setDoctors(res.data.doctors || []));
  }, []);

  const stats = [
    { value: '10+', label: 'Expert Doctors', icon: 'fa-user-doctor' },
    { value: '5,000+', label: 'Patients Served', icon: 'fa-users' },
    { value: '15+', label: 'Years of Service', icon: 'fa-award' },
    { value: '8+', label: 'Specializations', icon: 'fa-stethoscope' },
  ];

  const values = [
    { icon: 'fa-heart-pulse', title: 'Patient-First', text: 'Every decision we make centers on what is best for our patients — their comfort, safety and outcomes.' },
    { icon: 'fa-shield-halved', title: 'Safety & Trust', text: 'We uphold the highest standards of medical ethics, privacy and data protection.' },
    { icon: 'fa-microscope', title: 'Modern Medicine', text: 'Equipped with cutting-edge technology and up-to-date clinical practices.' },
    { icon: 'fa-handshake', title: 'Transparency', text: 'Clear communication and honest pricing — no surprises in billing or treatment.' },
    { icon: 'fa-star', title: 'Excellence', text: 'Board-certified specialists committed to delivering the best possible outcomes.' },
    { icon: 'fa-globe', title: 'Accessibility', text: 'Online booking, flexible hours and multilingual staff to serve our community.' },
  ];

  return (
    <>
      {/* Hero */}
      <div style={{
        backgroundImage: 'url(https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=1600&q=80)',
        backgroundSize: 'cover', backgroundPosition: 'center top', position: 'relative', padding: '5rem 0'
      }}>
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(171,21,9,0.87)' }}/>
        <div className="container text-center" style={{ position: 'relative', zIndex: 1 }}>
          <p className="mb-2 text-uppercase fw-semibold" style={{ color: 'rgba(255,247,211,0.75)', letterSpacing: 3, fontSize: '0.8rem' }}>Our Story</p>
          <h1 className="fw-bold mb-3" style={{ color: '#fff7d3', fontSize: '2.8rem' }}>About {settings.site_name}</h1>
          <p style={{ color: 'rgba(255,247,211,0.85)', fontSize: '1.1rem', maxWidth: 560, margin: '0 auto' }}>
            {settings.site_tagline}
          </p>
        </div>
      </div>

      {/* Stats bar */}
      <div style={{ background: 'white', borderBottom: '1px solid #f3f4f6' }}>
        <div className="container">
          <div className="row text-center py-4 g-3">
            {stats.map(s => (
              <div className="col-6 col-md-3" key={s.label}>
                <i className={`fa-solid ${s.icon} fa-lg mb-2`} style={{ color: '#AB1509' }}></i>
                <div className="fw-bold" style={{ fontSize: '1.8rem', color: '#AB1509' }}>{s.value}</div>
                <small className="text-muted">{s.label}</small>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container py-5">
        {/* Who we are */}
        <div className="row align-items-center g-5 mb-5">
          <div className="col-lg-6">
            <img
              src="https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=800&q=80"
              alt="Our medical team"
              className="w-100 rounded-4 shadow"
              style={{ height: 380, objectFit: 'cover' }}
            />
          </div>
          <div className="col-lg-6">
            <p className="fw-semibold text-uppercase mb-2" style={{ color: '#AB1509', letterSpacing: 2, fontSize: '0.8rem' }}>Who We Are</p>
            <h2 className="fw-bold mb-4" style={{ fontSize: '2rem', lineHeight: 1.3 }}>
              Committed to Your <span style={{ color: '#AB1509' }}>Health</span> and Wellbeing
            </h2>
            <p className="text-muted mb-3" style={{ lineHeight: 1.8 }}>{settings.about_text}</p>
            <p className="text-muted mb-4" style={{ lineHeight: 1.8 }}>
              Our state-of-the-art facility is equipped with the latest medical technology,
              and our team of dedicated specialists is committed to delivering exceptional
              healthcare outcomes for every patient we serve.
            </p>
            <Link to="/booking" className="btn btn-lg px-4 fw-semibold" style={{ background: '#AB1509', color: '#fff7d3', borderRadius: 12 }}>
              <i className="fa-solid fa-calendar-plus me-2"></i>Book an Appointment
            </Link>
          </div>
        </div>

        {/* Mission & Vision */}
        <div className="row g-4 mb-5">
          <div className="col-md-6">
            <div className="h-100 p-4 rounded-4" style={{ background: '#AB1509', color: '#fff7d3' }}>
              <div style={{ width: 56, height: 56, borderRadius: 16, background: 'rgba(255,247,211,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                <i className="fa-solid fa-bullseye fa-lg"></i>
              </div>
              <h4 className="fw-bold mb-3">Our Mission</h4>
              <p style={{ opacity: 0.9, lineHeight: 1.8 }}>
                To deliver exceptional medical care with compassion, accessibility, and respect for every patient.
                We believe healthcare should be straightforward — never stressful.
              </p>
            </div>
          </div>
          <div className="col-md-6">
            <div className="h-100 p-4 rounded-4" style={{ background: '#fff7d3', border: '2px solid #AB1509' }}>
              <div style={{ width: 56, height: 56, borderRadius: 16, background: 'rgba(171,21,9,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                <i className="fa-solid fa-eye fa-lg" style={{ color: '#AB1509' }}></i>
              </div>
              <h4 className="fw-bold mb-3" style={{ color: '#AB1509' }}>Our Vision</h4>
              <p className="text-muted" style={{ lineHeight: 1.8 }}>
                To be the most trusted medical center in the region — where patients feel safe,
                doctors thrive, and innovation drives better health outcomes for our community.
              </p>
            </div>
          </div>
        </div>

        {/* Values */}
        <div className="text-center mb-5">
          <p className="fw-semibold text-uppercase mb-2" style={{ color: '#AB1509', letterSpacing: 2, fontSize: '0.8rem' }}>What We Stand For</p>
          <h2 className="fw-bold" style={{ fontSize: '2rem' }}>Our Core Values</h2>
        </div>
        <div className="row g-4 mb-5">
          {values.map(v => (
            <div className="col-md-6 col-lg-4" key={v.title}>
              <div className="d-flex gap-3 p-4 rounded-4 h-100" style={{ background: 'white', border: '1px solid #f3f4f6', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                <div style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(171,21,9,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <i className={`fa-solid ${v.icon}`} style={{ color: '#AB1509' }}></i>
                </div>
                <div>
                  <h6 className="fw-bold mb-1">{v.title}</h6>
                  <p className="text-muted mb-0" style={{ fontSize: '0.88rem', lineHeight: 1.6 }}>{v.text}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Team from DB */}
        <div className="text-center mb-5">
          <p className="fw-semibold text-uppercase mb-2" style={{ color: '#AB1509', letterSpacing: 2, fontSize: '0.8rem' }}>Meet the Team</p>
          <h2 className="fw-bold mb-2" style={{ fontSize: '2rem' }}>Our Specialists</h2>
          <p className="text-muted">Experienced doctors dedicated to your care</p>
        </div>
        <div className="row g-4 mb-5">
          {doctors.map((doc, index) => {
            const photoSrc = doc.photo_url
              ? (doc.photo_url.startsWith('/uploads') ? `http://localhost:5000${doc.photo_url}` : doc.photo_url)
              : DOCTOR_PHOTOS[index % DOCTOR_PHOTOS.length];
            return (
              <div className="col-6 col-md-3" key={doc.id}>
                <div className="text-center">
                  <img src={photoSrc} alt={doc.name}
                    className="rounded-circle mb-3"
                    style={{ width: 110, height: 110, objectFit: 'cover', border: '4px solid #fff7d3', boxShadow: '0 4px 12px rgba(171,21,9,0.2)' }}
                    onError={e => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(doc.name)}&background=AB1509&color=fff7d3&size=110`; }}
                  />
                  <h6 className="fw-bold mb-0">{doc.name}</h6>
                  <small style={{ color: '#AB1509', fontWeight: 600 }}>{doc.specialization}</small>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="text-center p-5 rounded-4" style={{ background: 'linear-gradient(135deg, #AB1509 0%, #7a0e06 100%)' }}>
          <h4 className="fw-bold mb-2" style={{ color: '#fff7d3' }}>Ready to experience the difference?</h4>
          <p className="mb-4" style={{ color: 'rgba(255,247,211,0.85)' }}>Book your appointment today and meet our team in person.</p>
          <div className="d-flex gap-3 justify-content-center flex-wrap">
            <Link to="/doctors" className="btn btn-lg px-4" style={{ background: 'rgba(255,247,211,0.15)', color: '#fff7d3', border: '2px solid rgba(255,247,211,0.4)', borderRadius: 12 }}>
              <i className="fa-solid fa-user-doctor me-2"></i>View All Doctors
            </Link>
            <Link to="/booking" className="btn btn-lg px-4 fw-semibold" style={{ background: '#fff7d3', color: '#AB1509', borderRadius: 12 }}>
              <i className="fa-solid fa-calendar-plus me-2"></i>Book Now
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

export default About;