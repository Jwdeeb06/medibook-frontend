import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

function Services() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get('/services')
      .then((res) => setServices(res.data.services || []))
      .catch((err) => {
        console.error(err);
        setError('Could not load services. Make sure the backend is running.');
      })
      .finally(() => setLoading(false));
  }, []);

  // Group services by category for cleaner display
  const grouped = services.reduce((acc, s) => {
    const cat = s.category || 'general';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(s);
    return acc;
  }, {});

  return (
    <div className="container py-5">
      <div className="text-center mb-5">
        <h1 className="section-title">Our Services</h1>
        <p className="text-muted mt-3">
          Comprehensive medical services to support your health
        </p>
      </div>

      {loading && (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status" />
        </div>
      )}

      {error && <div className="alert alert-warning">{error}</div>}

      {Object.entries(grouped).map(([category, items]) => (
        <div key={category} className="mb-5">
          <h4 className="fw-bold mb-3 text-capitalize" style={{ color: 'var(--brand-red)' }}>
            {category}
          </h4>
          <div className="row g-4">
            {items.map((service) => (
              <div className="col-md-6 col-lg-4" key={service.id}>
                <div className="card card-medical h-100 p-4">
                  <h5 className="fw-bold mb-2">{service.name}</h5>
                  <p className="text-muted small mb-3">{service.description}</p>
                  <div className="d-flex justify-content-between align-items-end mt-auto">
                    <div>
                      <div className="price-tag">${service.price}</div>
                      <small className="text-muted">{service.duration_minutes} min</small>
                    </div>
                    <Link to="/booking" className="btn btn-primary btn-sm">
                      Book
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default Services;
