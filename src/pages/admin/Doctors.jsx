import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const DOCTOR_PHOTOS = [
  'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&q=80',
  'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=400&q=80',
  'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&q=80',
  'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&q=80',
];

export default function Doctors() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeSpec, setActiveSpec] = useState('all');

  useEffect(() => {
    api.get('/doctors')
      .then(res => setDoctors(res.data.doctors || []))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  // Get unique specializations
  const specializations = ['all', ...new Set(doctors.map(d => d.specialization).filter(Boolean))];

  // Filter by search + specialization
  const filtered = doctors.filter(d => {
    const matchesSearch = !search ||
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.specialization?.toLowerCase().includes(search.toLowerCase()) ||
      d.bio?.toLowerCase().includes(search.toLowerCase());
    const matchesSpec = activeSpec === 'all' || d.specialization === activeSpec;
    return matchesSearch && matchesSpec;
  });

  return (
    <>
      {/* Hero */}
      <div style={{
        backgroundImage: 'url(https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=1600&q=80)',
        backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative', padding: '5rem 0'
      }}>
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(171,21,9,0.87)' }}/>
        <div className="container text-center" style={{ position: 'relative', zIndex: 1 }}>
          <p className="mb-2 text-uppercase fw-semibold" style={{ color: 'rgba(255,247,211,0.75)', letterSpacing: 3, fontSize: '0.8rem' }}>Our Team</p>
          <h1 className="fw-bold mb-3" style={{ color: '#fff7d3', fontSize: '2.8rem' }}>Meet Our Doctors</h1>
          <p className="mb-4" style={{ color: 'rgba(255,247,211,0.85)', fontSize: '1.1rem' }}>
            Experienced specialists dedicated to your health
          </p>

          {/* Search bar in hero */}
          <div className="mx-auto" style={{ maxWidth: 500 }}>
            <div className="input-group input-group-lg shadow">
              <span className="input-group-text bg-white border-0">
                <i className="fa-solid fa-magnifying-glass text-muted"></i>
              </span>
              <input type="text" className="form-control border-0"
                placeholder="Search by name or specialization..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ borderRadius: '0 12px 12px 0' }} />
              {search && (
                <button className="btn bg-white border-0" onClick={() => setSearch('')}>
                  <i className="fa-solid fa-xmark text-muted"></i>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Specialization filter tabs */}
      <div style={{ background: 'white', borderBottom: '1px solid #e5e7eb', position: 'sticky', top: 68, zIndex: 10 }}>
        <div className="container">
          <div className="d-flex gap-1 overflow-auto py-2" style={{ scrollbarWidth: 'none' }}>
            {specializations.map(spec => (
              <button key={spec} onClick={() => setActiveSpec(spec)}
                className="btn btn-sm text-nowrap px-3 py-2"
                style={{
                  borderRadius: 20,
                  background: activeSpec === spec ? '#AB1509' : 'transparent',
                  color: activeSpec === spec ? '#fff7d3' : '#6b5a58',
                  border: activeSpec === spec ? 'none' : '1px solid #e5e7eb',
                  fontWeight: activeSpec === spec ? 600 : 400,
                  fontSize: '0.85rem',
                  transition: 'all 0.2s',
                }}>
                {spec === 'all' ? 'All Specialties' : spec}
                <span className="ms-2 badge rounded-pill" style={{
                  background: activeSpec === spec ? 'rgba(255,247,211,0.3)' : '#f3f4f6',
                  color: activeSpec === spec ? '#fff7d3' : '#6b7280',
                  fontSize: '0.7rem'
                }}>
                  {spec === 'all' ? doctors.length : doctors.filter(d => d.specialization === spec).length}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container py-5">
        {loading && <div className="text-center py-5"><div className="spinner-border" style={{ color: '#AB1509' }} /></div>}

        {/* Results count */}
        {!loading && (search || activeSpec !== 'all') && (
          <p className="text-muted mb-4">
            <i className="fa-solid fa-filter me-2"></i>
            Showing <strong>{filtered.length}</strong> doctor{filtered.length !== 1 ? 's' : ''}
            {search && <> matching "<strong>{search}</strong>"</>}
            {activeSpec !== 'all' && <> in <strong>{activeSpec}</strong></>}
          </p>
        )}

        <div className="row g-4">
          {filtered.map((doctor, index) => (
            <div className="col-md-6 col-lg-4" key={doctor.id}>
              <div className="card border-0 shadow-sm h-100 overflow-hidden" style={{ borderRadius: 16, transition: 'transform 0.2s, box-shadow 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.1)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = ''; }}>

                {/* Doctor photo */}
                <div style={{ height: 220, overflow: 'hidden', position: 'relative' }}>
                  <img
                    src={doctor.photo_url
                      ? (doctor.photo_url.startsWith('/uploads')
                          ? `http://localhost:5000${doctor.photo_url}`
                          : doctor.photo_url)
                      : DOCTOR_PHOTOS[index % DOCTOR_PHOTOS.length]}
                    alt={doctor.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={e => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(doctor.name)}&background=AB1509&color=fff7d3&size=200`; }}
                  />
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(transparent, rgba(0,0,0,0.6))', padding: '2rem 1rem 0.75rem' }}>
                    <span className="badge" style={{ background: '#AB1509', color: '#fff7d3', fontSize: '0.78rem' }}>
                      <i className="fa-solid fa-stethoscope me-1"></i>{doctor.specialization}
                    </span>
                  </div>
                </div>

                <div className="p-4 d-flex flex-column">
                  <h5 className="fw-bold mb-1">{doctor.name}</h5>

                  {doctor.years_experience > 0 && (
                    <p className="text-muted small mb-2">
                      <i className="fa-solid fa-award me-1" style={{ color: '#AB1509' }}></i>
                      {doctor.years_experience}+ years experience
                    </p>
                  )}

                  {doctor.bio && (
                    <p className="text-muted small mb-3 flex-grow-1">
                      {doctor.bio.length > 100 ? doctor.bio.substring(0, 97) + '...' : doctor.bio}
                    </p>
                  )}

                  {doctor.email && (
                    <p className="text-muted small mb-3">
                      <i className="fa-solid fa-envelope me-2" style={{ color: '#AB1509' }}></i>{doctor.email}
                    </p>
                  )}

                  <Link to={`/booking?doctor_id=${doctor.id}`} className="btn btn-outline-primary w-100 mt-auto"
                    style={{ borderRadius: 10 }}>
                    <i className="fa-solid fa-calendar-plus me-2"></i>Book Appointment
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {!loading && filtered.length === 0 && (
          <div className="text-center py-5">
            <i className="fa-solid fa-user-doctor fa-3x mb-3" style={{ color: '#d1d5db' }}></i>
            <h5 className="text-muted">No doctors found</h5>
            {search && (
              <button className="btn btn-outline-primary mt-2" onClick={() => { setSearch(''); setActiveSpec('all'); }}>
                Clear search
              </button>
            )}
          </div>
        )}
      </div>
    </>
  );
}
