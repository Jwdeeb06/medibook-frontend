import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const CATEGORY_META = {
  consultation: { icon: 'fa-comment-medical', color: '#0284c7', bg: '#eff6ff', label: 'Consultation' },
  specialist:   { icon: 'fa-user-doctor',     color: '#7c3aed', bg: '#f5f3ff', label: 'Specialist' },
  diagnostic:   { icon: 'fa-microscope',      color: '#059669', bg: '#f0fdf4', label: 'Diagnostic' },
  pediatric:    { icon: 'fa-baby',            color: '#d97706', bg: '#fffbeb', label: 'Pediatric' },
  surgical:     { icon: 'fa-scalpel',         color: '#dc2626', bg: '#fef2f2', label: 'Surgical' },
  emergency:    { icon: 'fa-truck-medical',   color: '#b45309', bg: '#fff7ed', label: 'Emergency' },
  'follow-up':  { icon: 'fa-rotate',          color: '#0891b2', bg: '#ecfeff', label: 'Follow-up' },
  general:      { icon: 'fa-stethoscope',     color: '#AB1509', bg: '#fff7d3', label: 'General' },
  premium:      { icon: 'fa-star',            color: '#b45309', bg: '#fff7ed', label: 'Premium' },
  quick:        { icon: 'fa-bolt',            color: '#059669', bg: '#f0fdf4', label: 'Quick' },
};

function Services() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    api.get('/services')
      .then(res => setServices(res.data.services || []))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const categories = ['all', ...new Set(services.map(s => s.category || 'general'))];
  const filtered = activeTab === 'all' ? services : services.filter(s => (s.category || 'general') === activeTab);

  return (
    <>
      {/* Hero */}
      <div style={{
        backgroundImage: 'url(https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1600&q=80)',
        backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative', padding: '5rem 0'
      }}>
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(171,21,9,0.88)' }}/>
        <div className="container text-center" style={{ position: 'relative', zIndex: 1 }}>
          <p className="mb-2 text-uppercase fw-semibold" style={{ color: 'rgba(255,247,211,0.75)', letterSpacing: 3, fontSize: '0.8rem' }}>What We Offer</p>
          <h1 className="fw-bold mb-3" style={{ color: '#fff7d3', fontSize: '2.8rem' }}>Our Medical Services</h1>
          <p style={{ color: 'rgba(255,247,211,0.85)', fontSize: '1.1rem', maxWidth: 500, margin: '0 auto' }}>
            Comprehensive care across multiple specialties — all in one place
          </p>
        </div>
      </div>

      {/* Category tabs */}
      <div style={{ background: 'white', borderBottom: '1px solid #e5e7eb', position: 'sticky', top: 68, zIndex: 10 }}>
        <div className="container">
          <div className="d-flex gap-1 overflow-auto py-2" style={{ scrollbarWidth: 'none' }}>
            {categories.map(cat => {
              const meta = CATEGORY_META[cat] || CATEGORY_META.general;
              return (
                <button key={cat} onClick={() => setActiveTab(cat)}
                  className="btn btn-sm text-nowrap px-3 py-2"
                  style={{
                    borderRadius: 20,
                    background: activeTab === cat ? '#AB1509' : 'transparent',
                    color: activeTab === cat ? '#fff7d3' : '#6b5a58',
                    border: activeTab === cat ? 'none' : '1px solid #e5e7eb',
                    fontWeight: activeTab === cat ? 600 : 400,
                    transition: 'all 0.2s',
                    fontSize: '0.85rem',
                  }}>
                  {cat !== 'all' && <i className={`fa-solid ${meta.icon} me-2`}></i>}
                  {cat === 'all' ? 'All Services' : meta.label || cat}
                  <span className="ms-2 badge rounded-pill" style={{ background: activeTab === cat ? 'rgba(255,247,211,0.3)' : '#f3f4f6', color: activeTab === cat ? '#fff7d3' : '#6b7280', fontSize: '0.7rem' }}>
                    {cat === 'all' ? services.length : services.filter(s => (s.category || 'general') === cat).length}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="container py-5">
        {loading && <div className="text-center py-5"><div className="spinner-border" style={{ color: '#AB1509' }} /></div>}

        <div className="row g-4">
          {filtered.map(service => {
            const meta = CATEGORY_META[service.category || 'general'] || CATEGORY_META.general;
            return (
              <div className="col-md-6 col-lg-4" key={service.id}>
                <div className="card h-100 border-0 shadow-sm" style={{ borderRadius: 16, overflow: 'hidden', transition: 'transform 0.2s, box-shadow 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.1)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = ''; }}>
                  <div style={{ height: 6, background: meta.color }} />
                  <div className="card-body p-4 d-flex flex-column">
                    <div className="d-flex align-items-center justify-content-between mb-3">
                      <div style={{ width: 52, height: 52, borderRadius: 14, background: meta.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <i className={`fa-solid ${meta.icon} fa-lg`} style={{ color: meta.color }}></i>
                      </div>
                      <span className="badge" style={{ background: meta.bg, color: meta.color, fontWeight: 600, fontSize: '0.75rem', padding: '0.4rem 0.8rem', borderRadius: 20 }}>
                        {meta.label || service.category}
                      </span>
                    </div>
                    <h5 className="fw-bold mb-2" style={{ fontSize: '1.05rem' }}>{service.name}</h5>
                    <p className="text-muted mb-3 flex-grow-1" style={{ fontSize: '0.88rem', lineHeight: 1.6 }}>
                      {service.description || 'Professional medical service by our experienced team.'}
                    </p>
                    <div className="d-flex align-items-center gap-2 mb-3">
                      <i className="fa-regular fa-clock" style={{ color: meta.color, fontSize: '0.85rem' }}></i>
                      <small className="text-muted">{service.duration_minutes} minutes session</small>
                    </div>
                    <div className="d-flex align-items-center justify-content-between mt-auto pt-3" style={{ borderTop: '1px solid #f3f4f6' }}>
                      <div>
                        <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#AB1509' }}>${service.price}</span>
                        <small className="text-muted ms-1">/ session</small>
                      </div>
                      <Link to="/booking" className="btn btn-sm px-3 py-2 fw-semibold" style={{ background: '#AB1509', color: '#fff7d3', borderRadius: 10, fontSize: '0.85rem' }}>
                        <i className="fa-solid fa-calendar-plus me-1"></i>Book Now
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {!loading && filtered.length === 0 && (
          <div className="text-center py-5">
            <i className="fa-solid fa-magnifying-glass fa-2x mb-3" style={{ color: '#d1d5db' }}></i>
            <p className="text-muted">No services found in this category.</p>
          </div>
        )}

        <div className="text-center mt-5 p-5 rounded-4" style={{ background: 'linear-gradient(135deg, #AB1509 0%, #7a0e06 100%)' }}>
          <h4 className="fw-bold mb-2" style={{ color: '#fff7d3' }}>Not sure which service you need?</h4>
          <p className="mb-4" style={{ color: 'rgba(255,247,211,0.85)' }}>Book a General Consultation and our doctors will guide you.</p>
          <Link to="/booking" className="btn btn-lg px-5 fw-semibold" style={{ background: '#fff7d3', color: '#AB1509', borderRadius: 12 }}>
            <i className="fa-solid fa-calendar-plus me-2"></i>Book a Consultation
          </Link>
        </div>
      </div>
    </>
  );
}

export default Services;