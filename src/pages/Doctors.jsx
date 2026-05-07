import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

// Get initials from a name like "Dr. Sarah Khoury" -> "SK"
const getInitials = (name) => {
  const parts = name.replace(/^Dr\.?\s*/i, '').trim().split(/\s+/);
  return parts.slice(0, 2).map(p => p[0]).join('').toUpperCase();
};

function Doctors() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get('/doctors')
      .then((res) => setDoctors(res.data.doctors || []))
      .catch((err) => {
        console.error(err);
        setError('Could not load doctors. Make sure the backend is running.');
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="container py-5">
      <div className="text-center mb-5">
        <h1 className="section-title">Our Doctors</h1>
        <p className="text-muted mt-3">
          Meet our team of experienced medical specialists
        </p>
      </div>

      {loading && (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status" />
        </div>
      )}

      {error && <div className="alert alert-warning">{error}</div>}

      {!loading && !error && doctors.length === 0 && (
        <div className="alert alert-info text-center">
          No doctors available yet.
        </div>
      )}

      <div className="row g-4">
        {doctors.map((doctor) => (
          <div className="col-md-6 col-lg-4" key={doctor.id}>
            <div className="card card-medical h-100 p-4 text-center">
              {doctor.photo_url ? (
                <img
                  src={doctor.photo_url}
                  alt={doctor.name}
                  className="rounded-circle mx-auto mb-3"
                  style={{ width: 100, height: 100, objectFit: 'cover' }}
                />
              ) : (
                <div className="doctor-avatar">{getInitials(doctor.name)}</div>
              )}

              <h5 className="fw-bold mb-1">{doctor.name}</h5>
              <span className="doctor-specialization mb-3">
                {doctor.specialization}
              </span>

              {doctor.bio && (
                <p className="text-muted small mb-3" style={{ minHeight: '3.5rem' }}>
                  {doctor.bio.length > 120
                    ? doctor.bio.substring(0, 117) + '...'
                    : doctor.bio}
                </p>
              )}

              {doctor.years_experience > 0 && (
                <small className="text-muted mb-3">
                  {doctor.years_experience}+ years of experience
                </small>
              )}

              <Link to="/booking" className="btn btn-outline-primary mt-auto">
                Book with {doctor.name.split(' ').slice(0, 2).join(' ')}
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Doctors;
