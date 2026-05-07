import { useState } from 'react';
import { useSettings } from '../context/SettingsContext';

function Contact() {
  const { settings } = useSettings();
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Contact form:', form);
    setSubmitted(true);
    setForm({ name: '', email: '', message: '' });
  };

  return (
    <div className="container py-5">
      <div className="text-center mb-5">
        <h1 className="section-title">Get in Touch</h1>
        <p className="text-muted mt-3">
          We're here to answer your questions
        </p>
      </div>

      <div className="row g-4 justify-content-center">
        {/* Contact info */}
        <div className="col-md-4">
          <div className="card card-medical h-100 p-4 text-center">
            <div className="display-5 mb-2">📧</div>
            <h6 className="fw-bold">Email</h6>
            <small className="text-muted">{settings.contact_email}</small>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card card-medical h-100 p-4 text-center">
            <div className="display-5 mb-2">📞</div>
            <h6 className="fw-bold">Phone</h6>
            <small className="text-muted">{settings.contact_phone}</small>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card card-medical h-100 p-4 text-center">
            <div className="display-5 mb-2">📍</div>
            <h6 className="fw-bold">Address</h6>
            <small className="text-muted">{settings.contact_address}</small>
          </div>
        </div>
      </div>

      {/* Contact form */}
      <div className="row justify-content-center mt-4">
        <div className="col-lg-7">
          {submitted && (
            <div className="alert alert-success">
              Thanks! We'll get back to you soon.
            </div>
          )}

          <div className="card card-medical p-4">
            <form onSubmit={handleSubmit}>
              <h4 className="fw-bold mb-4">Send us a message</h4>

              <div className="mb-3">
                <label className="form-label fw-semibold">Name</label>
                <input
                  type="text"
                  name="name"
                  className="form-control"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold">Email</label>
                <input
                  type="email"
                  name="email"
                  className="form-control"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold">Message</label>
                <textarea
                  name="message"
                  rows="4"
                  className="form-control"
                  value={form.message}
                  onChange={handleChange}
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary w-100">
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Contact;
