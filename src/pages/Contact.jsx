import { useState } from 'react';
import { useSettings } from '../context/SettingsContext';

function Contact() {
  const { settings } = useSettings();
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });
  const handleSubmit = e => { e.preventDefault(); setSubmitted(true); setForm({ name: '', email: '', message: '' }); };

  return (
    <>
      {/* Page hero */}
      <div style={{
        backgroundImage: 'url(https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=1600&q=80)',
        backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative', padding: '4rem 0'
      }}>
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(171,21,9,0.85)' }}/>
        <div className="container text-center" style={{ position: 'relative', zIndex: 1 }}>
          <h1 className="fw-bold mb-2" style={{ color: '#fff7d3' }}>Contact Us</h1>
          <p style={{ color: 'rgba(255,247,211,0.85)' }}>We're here to help — reach out anytime</p>
        </div>
      </div>

      <div className="container py-5">
        <div className="row g-4 mb-5">
          {[
            { icon: 'fa-envelope', label: 'Email', value: settings.contact_email, color: '#0284c7' },
            { icon: 'fa-phone', label: 'Phone', value: settings.contact_phone, color: '#059669' },
            { icon: 'fa-location-dot', label: 'Address', value: settings.contact_address, color: 'var(--brand-red)' },
            { icon: 'fa-clock', label: 'Hours', value: settings.working_hours, color: '#7c3aed' },
          ].map(item => (
            <div className="col-md-6 col-lg-3" key={item.label}>
              <div className="card card-medical h-100 p-4 text-center">
                <div style={{ width: 56, height: 56, borderRadius: '50%', background: `${item.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                  <i className={`fa-solid ${item.icon} fa-lg`} style={{ color: item.color }}></i>
                </div>
                <h6 className="fw-bold mb-1">{item.label}</h6>
                <small className="text-muted">{item.value}</small>
              </div>
            </div>
          ))}
        </div>

        <div className="row justify-content-center">
          <div className="col-lg-7">
            {submitted && (
              <div className="alert alert-success">
                <i className="fa-solid fa-circle-check me-2"></i>
                Thanks! We'll get back to you soon.
              </div>
            )}
            <div className="card card-medical p-4 p-md-5">
              <h4 className="fw-bold mb-4">
                <i className="fa-solid fa-paper-plane me-2" style={{ color: 'var(--brand-red)' }}></i>
                Send a Message
              </h4>
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label fw-semibold">Full Name</label>
                  <input type="text" name="name" className="form-control" value={form.name} onChange={handleChange} required />
                </div>
                <div className="mb-3">
                  <label className="form-label fw-semibold">Email</label>
                  <input type="email" name="email" className="form-control" value={form.email} onChange={handleChange} required />
                </div>
                <div className="mb-3">
                  <label className="form-label fw-semibold">Message</label>
                  <textarea name="message" rows="4" className="form-control" value={form.message} onChange={handleChange} required />
                </div>
                <button type="submit" className="btn btn-primary w-100">
                  <i className="fa-solid fa-paper-plane me-2"></i>Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Contact;
