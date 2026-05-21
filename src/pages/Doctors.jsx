import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const DOCTOR_PHOTOS = [
  'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&q=80',
  'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=400&q=80',
  'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&q=80',
  'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&q=80',
];

function Doctors() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get('/doctors')
      .then(res => setDoctors(res.data.doctors || []))
      .catch(err => { console.error(err); setError('Could not load doctors.'); })
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      {/* Page hero */}
      <div style={{
        backgroundImage: 'url(https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=1600&q=80)',
        backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative', padding: '4rem 0'
      }}>
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(171,21,9,0.85)' }}/>
        <div className="container text-center" style={{ position: 'relative', zIndex: 1 }}>
          <h1 className="fw-bold mb-2" style={{ color: '#fff7d3' }}>Our Medical Team</h1>
          <p style={{ color: 'rgba(255,247,211,0.85)' }}>Meet our experienced specialists dedicated to your health</p>
        </div>
      </div>

      <div className="container py-5">
        {loading && <div className="text-center py-5"><div className="spinner-border text-primary" /></div>}
        {error && <div className="alert alert-warning">{error}</div>}

        <div className="row g-4">
          {doctors.map((doctor, index) => (
            <div className="col-md-6 col-lg-4" key={doctor.id}>
              <div className="card card-medical h-100 overflow-hidden p-0">
                {/* Doctor photo */}
                <div style={{ height: 220, overflow: 'hidden', position: 'relative' }}>
                  <img
                    src={
  doctor.photo_url
    ? doctor.photo_url.startsWith('/uploads')
      ? `http://localhost:5000${doctor.photo_url}`
      : doctor.photo_url
    : DOCTOR_PHOTOS[index % DOCTOR_PHOTOS.length]
}
                    alt={doctor.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={e => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(doctor.name)}&background=AB1509&color=fff7d3&size=200`; }}
                  />
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(transparent, rgba(0,0,0,0.6))', padding: '2rem 1rem 0.75rem' }}>
                    <span className="badge" style={{ background: 'var(--brand-red)', color: '#fff7d3', fontSize: '0.78rem' }}>
                      <i className="fa-solid fa-stethoscope me-1"></i>{doctor.specialization}
                    </span>
                  </div>
                </div>

                <div className="p-4">
                  <h5 className="fw-bold mb-1">{doctor.name}</h5>

                  {doctor.years_experience > 0 && (
                    <p className="text-muted small mb-2">
                      <i className="fa-solid fa-award me-1" style={{ color: 'var(--brand-red)' }}></i>
                      {doctor.years_experience}+ years experience
                    </p>
                  )}

                  {doctor.bio && (
                    <p className="text-muted small mb-3">
                      {doctor.bio.length > 100 ? doctor.bio.substring(0, 97) + '...' : doctor.bio}
                    </p>
                  )}

                  {doctor.email && (
                    <p className="text-muted small mb-3">
                      <i className="fa-solid fa-envelope me-2" style={{ color: 'var(--brand-red)' }}></i>{doctor.email}
                    </p>
                  )}

                  <Link to="/booking" className="btn btn-outline-primary w-100 mt-auto">
                    <i className="fa-solid fa-calendar-plus me-2"></i>Book Appointment
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {!loading && !error && doctors.length === 0 && (
          <div className="text-center py-5">
            <i className="fa-solid fa-user-doctor fa-3x mb-3" style={{ color: 'var(--brand-red)', opacity: 0.4 }}></i>
            <h5>No doctors available yet</h5>
          </div>
        )}
      </div>
    </>
  );
}

export default Doctors;
